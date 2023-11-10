import ContractService from '@services/contracts.service';
import ContractMonitorService from '@services/contracts-monitor.service';
import TokenService from '@services/tokens.service';
import TokenApiService from '@services/token-apis.service';
import { mapGeckoNetwork } from '@interfaces/contracts.interface';
import { Job } from '@/jobs/job.manager';
import { logger } from '@/config/logger';

export class StablecoinContractsImport implements Job {
  private tokenService = new TokenService();
  private tokenApiService = new TokenApiService();
  private contractService = new ContractService();
  private contractMonitorService = new ContractMonitorService();

  constructor() {
    logger.info('Executing PoolsCompositionNotificationsJob');
    this.executeJob().catch(e => {
      logger.error('Exception while executing PoolsCompositionNotificationsJob', e);
    });
  }

  public async executeJob(): Promise<void> {
    logger.info('Importing stablecoin contracts...');
    await this.importData();
    logger.info('Importing stablecoin contracts finished.');

    logger.info('Synchronizing stablecoin contract hooks...');
    await this.contractMonitorService.synchronizeContractWebhooks();
    logger.info('Synchronizing stablecoin contract hooks finished.');
  }

  private async importData() {
    const tokens = await this.tokenService.findAllStablecoins();
    for await (const token of tokens.filter(token => token.contracts.length == 0)) {
      try {
        const geckoToken = await this.tokenApiService.getGeckoToken(token.gecko_id);
        if (!geckoToken.data.platforms) {
          continue;
        }

        const geckoPlatforms = new Map<string, string>(Object.entries(geckoToken.data.platforms));
        for await (const [geckoNetwork, contractAddress] of geckoPlatforms) {
          const contractNetwork = mapGeckoNetwork(geckoNetwork);
          if (contractNetwork === undefined) {
            continue;
          }

          let contract = await this.contractService.findContract(contractAddress, contractNetwork);
          if (!contract) {
            const contractData = await this.contractService.fetchContractDetails(contractAddress, contractNetwork);
            contract = await this.contractService.createContract(contractData);
            logger.info('Imported contract %s (%s) for stablecoin %s', contract.address, contract.network, token.symbol);
          }
          token.contracts.push(contract);
          await this.sleep(2000);
        }

        if (token.contracts.length > 0) {
          await this.tokenService.createOrUpdateToken(token);
        }
        await this.sleep(5000);
      } catch (error) {
        logger.error(error);
      }
    }
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
