import {ContractNetwork} from "@interfaces/contracts.interface";
import ContractWebhookService from "@services/contracts-webhook.service";
import ContractService from "@services/contracts.service";
import {WebhookType} from "@interfaces/alchemy-webhook.interface";

class ContractMonitorService {
  public contractService = new ContractService();
  public webhookService = new ContractWebhookService();

  public async synchronizeContractWebhooks() {
    const webhooks = (await this.webhookService.getAllWebhooks()).data;

    for (let network in ContractNetwork) {
      this.contractService.findAllContractsByNetwork(ContractNetwork[network]).then(contracts => {
        const webhook = webhooks.data.find(wh => wh.network == network.valueOf());

        if (webhook) {
          const newAddresses = contracts?.map(contract => contract.address).filter(address => !webhook.addresses?.includes(address));
          const deleteAddresses = webhook.addresses?.filter(address => !contracts.some(contract => contract.address === address));

          if (newAddresses?.length > 0 || deleteAddresses?.length > 0) {
            this.webhookService.updateWebhook(webhook.id, newAddresses, deleteAddresses).then(() => {
              console.debug("Webhook updated", newAddresses, deleteAddresses);
            }).catch(error => {
              console.error("Cannot update webhook", error);
            });
          }
        } else {
          this.webhookService.createWebhook({
            network: network,
            webhook_type: WebhookType.ADDRESS_ACTIVITY,
            webhook_url: "https://chainkraft.com/callback",
            addresses: contracts.map(contract => contract.address)
          }).then(response => {
            console.debug("Webhook created", response.data);
          }).catch(error => {
            console.error("Cannot create webhook", error);
          });
        }
      });
    }
  }
}

export default ContractMonitorService;
