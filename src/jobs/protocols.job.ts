import { RecurringJob } from './recurring.job';
import ProtocolsService from '@services/protocols.service';
import ContractService from '@services/contracts.service';
import { PROXY_CONTRACTS } from '@/config/contracts-proxy';
import ContractMonitorService from '@services/contracts-monitor.service';

export class ProtocolsImport implements RecurringJob {
  private protocolService = new ProtocolsService();
  private contractService = new ContractService();
  private contractMonitorService = new ContractMonitorService();

  async doIt() {
    console.log('Importing protocols...');
    await this.importData();
    console.log('Importing protocols finished.');

    console.log('Synchronizing protocol contract hooks...');
    await this.contractMonitorService.synchronizeContractWebhooks();
    console.log('Synchronizing protocol contract hooks finished.');
  }

  private async importData() {
    for await (const pc of PROXY_CONTRACTS) {
      const protocol = await this.protocolService.createOrUpdateProtocol(pc.protocol);
      for await (const contractAddress of pc.contracts) {
        try {
          const contract = await this.contractService.findContract(contractAddress.address, contractAddress.network);
          if (!contract) {
            const contract = await this.contractService.fetchContractDetails(contractAddress.address, contractAddress.network);
            await this.contractService.createContract(contract);

            console.log('Imported protocol contract %s (%s)', contract.address, contract.network);
            await this.sleep(2000);
          }
        } catch (error) {
          console.error(error);
        }
      }
      console.log('Imported protocol %s', protocol.name);
    }
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
