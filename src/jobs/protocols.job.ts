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
      const protocol = pc.protocol;
      for await (const contractAddress of pc.contracts) {
        try {
          let contract = await this.contractService.findContract(contractAddress.address, contractAddress.network);
          if (!contract) {
            contract = await this.contractService.fetchContractDetails(contractAddress.address, contractAddress.network);
            contract.monitorType = contractAddress.monitorType;
            contract = await this.contractService.createContract(contract);

            console.log('Imported protocol contract %s (%s)', contract.address, contract.network);
            await this.sleep(2000);
          }
          protocol.contracts.push(contract);
        } catch (error) {
          console.error(error);
        }
      }
      await this.protocolService.createOrUpdateProtocol(protocol);
      console.log('Imported protocol %s', protocol.name);
    }
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
