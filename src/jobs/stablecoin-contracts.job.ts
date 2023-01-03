import { RecurringJob } from './recurring.job';
import ContractService from '@services/contracts.service';
import ContractMonitorService from '@services/contracts-monitor.service';
import TokenService from '@services/tokens.service';
import TokenApiService from '@services/token-apis.service';
import { mapGeckoNetwork } from '@interfaces/contracts.interface';

export class StablecoinContractsImport implements RecurringJob {
  private tokenService = new TokenService();
  private tokenApiService = new TokenApiService();
  private contractService = new ContractService();
  private contractMonitorService = new ContractMonitorService();

  async doIt() {
    console.log('Importing stablecoin contracts...');
    await this.importData();
    console.log('Importing stablecoin contracts finished.');

    console.log('Synchronizing stablecoin contract hooks...');
    await this.contractMonitorService.synchronizeContractWebhooks();
    console.log('Synchronizing stablecoin contract hooks finished.');
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
            console.log('Imported contract %s (%s) for stablecoin %s', contract.address, contract.network, token.symbol);
          }
          token.contracts.push(contract);
          await this.sleep(2000);
        }

        if (token.contracts.length > 0) {
          await this.tokenService.createOrUpdateToken(token);
        }
        await this.sleep(5000);
      } catch (error) {
        console.error(error);
      }
    }
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
