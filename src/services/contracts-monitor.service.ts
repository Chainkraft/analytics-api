import { ContractNetwork } from '@interfaces/contracts.interface';
import ContractWebhookService from '@services/contracts-webhook.service';
import ContractService from '@services/contracts.service';
import { WebhookAddressActivity, WebhookType } from '@interfaces/alchemy-webhook.interface';
import { HOST } from '@config';
import contractsMonitorLogModel from '@models/contracts-monitor-log.model';
import { ContractMonitorLog } from '@interfaces/contracts-monitor-log.interface';

class ContractMonitorService {
  private contractMonitorLogs = contractsMonitorLogModel;
  public contractService = new ContractService();
  public webhookService = new ContractWebhookService();

  public async processAddressActivity(callbackData: WebhookAddressActivity) {
    console.debug('Alchemy webhook notify', callbackData);
    const logs = callbackData?.event?.activity.map(event => ({
      hash: event.hash,
      fromAddress: event.fromAddress,
      toAddress: event.toAddress,
      blockNum: parseInt(event.blockNum, 16),
      network: ContractNetwork[callbackData.event.network],
      raw: callbackData,
    } as ContractMonitorLog));
    if(logs) {
      await this.contractMonitorLogs.insertMany(logs);
    }

  }

  public async synchronizeContractWebhooks() {
    const webhooks = (await this.webhookService.getAllWebhooks()).data;

    for (let network in ContractNetwork) {
      this.contractService.findAllContractsByNetwork(ContractNetwork[network]).then(contracts => {
        const webhook = webhooks.data.find(wh => wh.network == network.valueOf());

        if (webhook) {
          const newAddresses = contracts?.map(contract => contract.address).filter(address => !webhook.addresses?.includes(address));
          const deleteAddresses = webhook.addresses?.filter(address => !contracts.some(contract => contract.address === address));

          if (newAddresses?.length > 0 || deleteAddresses?.length > 0) {
            this.webhookService
              .updateWebhook(webhook.id, newAddresses, deleteAddresses)
              .then(() => {
                console.debug('Webhook updated', newAddresses, deleteAddresses);
              })
              .catch(error => {
                console.error('Cannot update webhook', error);
              });
          }
        } else {
          this.webhookService
            .createWebhook({
              network: network,
              webhook_type: WebhookType.ADDRESS_ACTIVITY,
              webhook_url: HOST + '/contracts/callback/address-activity',
              addresses: contracts.map(contract => contract.address),
            })
            .then(response => {
              console.debug('Webhook created', response.data);
            })
            .catch(error => {
              console.error('Cannot create webhook', error);
            });
        }
      });
    }
  }
}

export default ContractMonitorService;
