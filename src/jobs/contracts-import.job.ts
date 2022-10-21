import { RecurringJob } from './recurring.job';
import ProjectService from '@services/project.service';
import ContractService from '@services/contracts.service';
import { PROXY_CONTRACTS } from '@/config/contracts-proxy';
import ContractMonitorService from '@services/contracts-monitor.service';

export class ContractImport implements RecurringJob {
  private projectService = new ProjectService();
  private contractService = new ContractService();
  private contractMonitorService = new ContractMonitorService();

  async doIt() {
    console.log('Importing contracts...');
    await this.importData();
    console.log('Importing contracts finished.');

    console.log('Synchronizing contract hooks...');
    await this.contractMonitorService.synchronizeContractWebhooks();
    console.log('Synchronizing contract hooks finished.');
  }

  private async importData() {
    for await (const pc of PROXY_CONTRACTS) {
      const project = await this.projectService.createOrUpdateProject(pc.project);
      for await (const contractAddress of pc.contracts) {
        try {
          const contract = await this.contractService.findContract(contractAddress.address, contractAddress.network);
          if (!contract) {
            const contract = await this.contractService.fetchContractDetails(contractAddress.address, contractAddress.network);
            contract.project = project;
            await this.contractService.createContract(contract);

            console.log('Imported contract %s (%s)', contract.address, contract.network);
            await this.sleep(2000);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
