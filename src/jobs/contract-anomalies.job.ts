import { RecurringJob } from './recurring.job';
import NotificationService from '@services/notifications.service';
import * as schedule from 'node-schedule';
import { NotificationContractChangeDataSchema, NotificationSeverity, NotificationType } from '@interfaces/notifications.interface';
import ContractService from '@services/contracts.service';
import { providers } from '@config';
import { getFulfilled } from '@utils/typeguard';
import BlockchainService from '@services/blockchain.service';

export class ContractAnomaliesJob implements RecurringJob {
  public contractService = new ContractService();
  public blockchainService = new BlockchainService();
  public notificationService = new NotificationService();

  doIt(): any {
    console.log('Scheduling ContractAnomaliesJob');
    schedule.scheduleJob('0 */5 * * *', () => this.generateNotifications());
  }

  async generateNotifications() {
    const contracts = (await this.contractService.findAllContracts()).filter(this.contractService.isProxyContract);
    console.log('ContractAnomaliesJob will check %d contracts', contracts.length);

    // TODO: inaccurate temp solution to bypass alchemy api limits regarding notify api
    let detectedChanges = 0;
    for await (const contract of contracts) {
      const provider = providers.get(contract.network);

      const getProxyImpl = provider.core.getStorageAt(contract.address, contract.proxy.implSlot);
      const getProxyAdmin = provider.core.getStorageAt(contract.address, contract.proxy.adminSlot);
      const [proxyImpl, proxyAdmin] = await Promise.allSettled([getProxyImpl, getProxyAdmin]);
      const newProxyImpl = getFulfilled(proxyImpl).value;
      const newProxyAdmin = getFulfilled(proxyAdmin).value;

      const currentProxyImpl = contract.proxy.implHistory.at(-1);
      const currentProxyAdmin = contract.proxy.adminHistory.at(-1);

      if (currentProxyImpl?.address != newProxyImpl) {
        console.log('Proxy=%s (%s) implementation changed %s => %s', contract.address, contract.network, currentProxyImpl.address, newProxyImpl);

        contract.proxy.implHistory.push({
          createdByBlock: await this.blockchainService.getBlockNumber(contract.network),
          createdByBlockAt: new Date(),
          address: newProxyImpl,
        });
      }
      if (currentProxyAdmin?.address != newProxyAdmin) {
        console.log('Proxy=%s (%s) admin changed %s => %s', contract.address, contract.network, currentProxyAdmin.address, newProxyAdmin);

        contract.proxy.adminHistory.push({
          createdByBlock: await this.blockchainService.getBlockNumber(contract.network),
          createdByBlockAt: new Date(),
          address: newProxyAdmin,
        });
      }

      if (currentProxyImpl.address != newProxyImpl || currentProxyAdmin.address != newProxyAdmin) {
        detectedChanges++;
        await this.contractService.contracts.updateOne(contract);

        if (currentProxyImpl.address != newProxyImpl) {
          await this.notificationService.createNotification({
            type: NotificationType.CONTRACT_PROXY_IMPL_CHANGE,
            severity: NotificationSeverity.CRITICAL,
            contract: contract,
            data: <NotificationContractChangeDataSchema>{
              oldAddress: currentProxyImpl.address,
              newAddress: newProxyImpl,
            },
          });
        }

        if (currentProxyAdmin?.address != newProxyAdmin) {
          await this.notificationService.createNotification({
            type: NotificationType.CONTRACT_PROXY_ADMIN_CHANGE,
            severity: NotificationSeverity.CRITICAL,
            contract: contract,
            data: <NotificationContractChangeDataSchema>{
              oldAddress: currentProxyAdmin.address,
              newAddress: newProxyAdmin,
            },
          });
        }
      }
    }

    console.log('ContractAnomaliesJob finished. Changes detected: %d', detectedChanges);
  }
}
