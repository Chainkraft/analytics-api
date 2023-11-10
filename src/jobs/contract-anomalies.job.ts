import NotificationService from '@services/notifications.service';
import { NotificationContractChangeDataSchema, NotificationSeverity, NotificationType } from '@interfaces/notifications.interface';
import ContractService from '@services/contracts.service';
import { providers } from '@config';
import { getFulfilled, isRejected } from '@utils/typeguard';
import BlockchainService from '@services/blockchain.service';
import { Contract } from '@interfaces/contracts.interface';
import promClient from 'prom-client';
import TokenService from '@services/tokens.service';
import * as schedule from 'node-schedule';
import ProtocolService from '@services/protocols.service';
import { RecurringJob } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

const anomaliesCounter = new promClient.Counter({
  name: 'api_contract_anomalies_job_count',
  help: 'number of modified smart contracts',
});

export class ContractAnomaliesJob implements RecurringJob {
  private readonly job: schedule.Job;
  public tokenService = new TokenService();
  public contractService = new ContractService();
  public protocolService = new ProtocolService();
  public blockchainService = new BlockchainService();
  public notificationService = new NotificationService();

  constructor() {
    logger.info('Scheduling ContractAnomaliesJob');
    this.job = schedule.scheduleJob('0 */5 * * *', () => {
      logger.info('Executing ContractAnomaliesJob');
      this.executeJob().catch(e => {
        logger.error('Exception while executing ContractAnomaliesJob', e);
      });
    });
  }

  public cancelJob(): void {
    if (this.job) {
      this.job.cancel();
    }
  }

  public async executeJob(): Promise<void> {
    const contracts = (await this.contractService.findAllContracts()).filter(this.contractService.isProxyContract);
    logger.info('ContractAnomaliesJob will check %d contracts', contracts.length);

    // TODO: inaccurate temp solution to bypass alchemy api limits regarding notify api
    let detectedChanges = 0;
    for await (const contract of contracts) {
      const provider = providers.get(contract.network);

      const getProxyImpl = provider.core.getStorageAt(contract.address, contract.proxy.implSlot);
      const getProxyAdmin = provider.core.getStorageAt(contract.address, contract.proxy.adminSlot);
      const [proxyImpl, proxyAdmin] = await Promise.allSettled([getProxyImpl, getProxyAdmin]);

      const hasImplChanged = await this.updateHistory(contract, proxyImpl, 'impl');
      const hasAdminChanged = await this.updateHistory(contract, proxyAdmin, 'admin');

      if (hasImplChanged) {
        await this.sendNotification(contract, 'impl');
      }

      if (hasAdminChanged) {
        await this.sendNotification(contract, 'admin');
      }

      if (hasImplChanged || hasAdminChanged) {
        await this.contractService.contracts.findByIdAndUpdate(contract._id, { proxy: contract.proxy });
        detectedChanges++;
      }
    }

    anomaliesCounter.inc(detectedChanges);
    logger.info('ContractAnomaliesJob finished. Smart contracts modified: %d of %d', detectedChanges, contracts.length);
  }

  private async updateHistory(contract: Contract, request: PromiseSettledResult<string>, type: 'impl' | 'admin'): Promise<boolean> {
    if (isRejected(request)) {
      logger.info('Could not retrieve %s details of proxy=%s (%s)', type, contract.address, contract.network);
      return false;
    }

    const newAddress = getFulfilled(request).value;
    const currentAddress = type === 'impl' ? contract.proxy.implHistory.at(-1) : contract.proxy.adminHistory.at(-1);

    if (currentAddress?.address !== newAddress) {
      contract.proxy[type + 'History'].push({
        createdByBlock: await this.blockchainService.getBlockNumber(contract.network),
        createdByBlockAt: new Date(),
        address: newAddress,
      });

      logger.info('Proxy=%s %s changed %s => %s', contract.address, type, currentAddress.address, newAddress);
      return true;
    }
    return false;
  }

  private async sendNotification(contract: Contract, type: 'impl' | 'admin') {
    const token = await this.tokenService.findTokenByContract(contract);
    const protocol = await this.protocolService.findProtocolByContract(contract);
    await this.notificationService.createNotification({
      type: type === 'impl' ? NotificationType.CONTRACT_PROXY_IMPL_CHANGE : NotificationType.CONTRACT_PROXY_ADMIN_CHANGE,
      severity: NotificationSeverity.CRITICAL,
      contract: contract,
      token: token,
      protocol: protocol,
      data: <NotificationContractChangeDataSchema>{
        network: contract.network,
        oldAddress: contract.proxy[type + 'History'].at(-2)?.address,
        newAddress: contract.proxy[type + 'History'].at(-1).address,
      },
    });
  }
}
