import { ContractNetwork } from '@interfaces/contracts.interface';
import ContractWebhookService from '@services/contracts-webhook.service';
import ContractService from '@services/contracts.service';
import { WebhookAddressActivity, WebhookType } from '@interfaces/alchemy-webhook.interface';
import { HOST, providers } from '@config';
import { getFulfilled } from '@utils/typeguard';

class ContractMonitorService {
  public contractService = new ContractService();
  public webhookService = new ContractWebhookService();
  private processedWebhooks: string[] = [];

  public async processAddressActivity(callbackData: WebhookAddressActivity) {
    console.log('Alchemy activity webhook', callbackData);
    if (this.processedWebhooks.includes(callbackData.id)) {
      return;
    }
    this.processedWebhooks.push(callbackData.id);

    const network = ContractNetwork[callbackData.event.network];
    const provider = providers.get(network);
    const addresses = callbackData.event.activity.map(tx => tx.toAddress);

    const contracts = (await this.contractService.findContractsByNetwork(addresses, network));

    for await (const contract of contracts) {
      console.log('Proxy contract interaction detected. %s (%s)', contract.address, contract.network);

      const getProxyImpl = provider.core.getStorageAt(contract.address, contract.proxy.implSlot);
      const getProxyAdmin = provider.core.getStorageAt(contract.address, contract.proxy.adminSlot);
      const [proxyImpl, proxyAdmin] = await Promise.allSettled([getProxyImpl, getProxyAdmin]);
      const newProxyImpl = getFulfilled(proxyImpl).value;
      const newProxyAdmin = getFulfilled(proxyAdmin).value;

      // this is not the exact transaction since we do not have args data
      // TODO: fetch transaction details and decode msg data
      const transaction = callbackData.event.activity.find(tx => tx.toAddress === contract.address);
      const currentProxyImpl = contract.proxy.implHistory.at(-1);
      const currentProxyAdmin = contract.proxy.adminHistory.at(-1);

      if (currentProxyImpl?.address != newProxyImpl) {
        console.log('Proxy=%s (%s) implementation changed %s => %s', contract.address, contract.network,
          currentProxyImpl.address, newProxyImpl);

        contract.proxy.implHistory.push({
          createdByArgs: '',
          createdByBlock: parseInt(transaction.blockNum, 16),
          createdByTxHash: transaction.hash,
          createdByAddress: transaction.fromAddress,
          address: newProxyImpl,
        });
      }
      if (currentProxyAdmin?.address != newProxyAdmin) {
        console.log('Proxy=%s (%s) admin changed %s => %s', contract.address, contract.network,
          currentProxyAdmin.address, newProxyAdmin);

        contract.proxy.adminHistory.push({
          createdByArgs: '',
          createdByBlock: parseInt(transaction.blockNum, 16),
          createdByTxHash: transaction.hash,
          createdByAddress: transaction.fromAddress,
          address: newProxyAdmin,
        });
      }

      if (currentProxyImpl.address != newProxyImpl || currentProxyAdmin.address != newProxyAdmin) {
        await this.contractService.contracts.updateOne(contract);
      }
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
