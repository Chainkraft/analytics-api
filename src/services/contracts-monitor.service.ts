import { Contract, ContractMonitorType, ContractNetwork } from '@interfaces/contracts.interface';
import ContractWebhookService from '@services/contracts-webhook.service';
import ContractService from '@services/contracts.service';
import { WebhookAddressActivity, WebhookAddressActivityTx, WebhookType } from '@interfaces/alchemy-webhook.interface';
import { HOST, providers } from '@config';
import { getFulfilled, isRejected } from '@utils/typeguard';
import { NotificationContractChangeDataSchema, NotificationSeverity, NotificationType } from '@interfaces/notifications.interface';
import TokenService from '@services/tokens.service';
import NotificationService from '@services/notifications.service';
import ProtocolService from '@services/protocols.service';

class ContractMonitorService {
  public tokenService = new TokenService();
  public contractService = new ContractService();
  public protocolService = new ProtocolService();
  public notificationService = new NotificationService();
  public webhookService = new ContractWebhookService();
  private processedWebhooks: string[] = [];

  private readonly CALLBACK_URL = HOST + '/contracts/callback/address-activity';

  public async processAddressActivity(callbackData: WebhookAddressActivity) {
    if (this.processedWebhooks.includes(callbackData.id)) {
      return;
    }
    console.log('Alchemy activity webhook', callbackData);
    this.processedWebhooks.push(callbackData.id);

    const network = ContractNetwork[callbackData.event.network];
    const provider = providers.get(network);
    const addresses = callbackData.event.activity.map(tx => tx.toAddress);

    const contracts = await this.contractService.findContractsByNetwork(addresses, network);

    for await (const contract of contracts) {
      console.debug('Proxy contract interaction detected. %s (%s)', contract.address, contract.network);

      const getProxyImpl = provider.core.getStorageAt(contract.address, contract.proxy.implSlot);
      const getProxyAdmin = provider.core.getStorageAt(contract.address, contract.proxy.adminSlot);
      const [proxyImpl, proxyAdmin] = await Promise.allSettled([getProxyImpl, getProxyAdmin]);

      // this is not the exact transaction since we do not have args data
      // TODO: fetch transaction details and decode msg data
      const transaction: WebhookAddressActivityTx = callbackData.event.activity.find(tx => tx.toAddress === contract.address);
      const hasImplChanged = await this.updateHistory(contract, proxyImpl, transaction, 'impl');
      const hasAdminChanged = await this.updateHistory(contract, proxyAdmin, transaction, 'admin');

      if (hasImplChanged) {
        await this.sendNotification(contract, 'impl');
      }

      if (hasAdminChanged) {
        await this.sendNotification(contract, 'admin');
      }

      if (hasImplChanged || hasAdminChanged) {
        await this.contractService.contracts.updateOne(contract);
      }
    }
  }

  private async updateHistory(
    contract: Contract,
    request: PromiseSettledResult<string>,
    tx: WebhookAddressActivityTx,
    type: 'impl' | 'admin',
  ): Promise<boolean> {
    if (isRejected(request)) {
      console.log('Could not retrieve %s details of proxy=%s (%s)', type, contract.address, contract.network);
      return false;
    }

    const newAddress = getFulfilled(request).value;
    const currentAddress = type === 'impl' ? contract.proxy.implHistory.at(-1) : contract.proxy.adminHistory.at(-1);

    if (currentAddress?.address !== newAddress) {
      contract.proxy[type + 'History'].push({
        createdByArgs: '',
        createdByBlock: parseInt(tx.blockNum, 16),
        createdByBlockAt: new Date(),
        createdByTxHash: tx.hash,
        createdByAddress: tx.fromAddress,
        address: newAddress,
      });

      console.log('Proxy=%s %s changed %s => %s', contract.address, type, currentAddress.address, newAddress);
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
        block: contract.proxy[type + 'History'].at(-1).createdByBlock,
        txHash: contract.proxy[type + 'History'].at(-1).createdByTxHash,
        oldAddress: contract.proxy[type + 'History'].at(-2)?.address,
        newAddress: contract.proxy[type + 'History'].at(-1).address,
      },
    });
  }

  public async synchronizeContractWebhooks() {
    const webhooks = (await this.webhookService.getAllWebhooks()).data;

    for (const network in ContractNetwork) {
      const contracts = (await this.contractService.findAllContractsByNetwork(ContractNetwork[network])).filter(
        contract => contract.monitorType == ContractMonitorType.WEBHOOK,
      );
      const webhook = webhooks.data.find(wh => wh.network == network.valueOf() && wh.webhook_url == this.CALLBACK_URL);

      if (webhook) {
        const newAddresses = contracts.map(contract => contract.address).filter(address => !webhook.addresses?.includes(address));
        const deleteAddresses = webhook.addresses?.filter(address => !contracts.some(contract => contract.address === address));

        if (newAddresses?.length > 0 || deleteAddresses?.length > 0) {
          this.webhookService
            .updateWebhook(webhook.id, newAddresses, deleteAddresses)
            .then(() => {
              console.debug('Webhook updated', newAddresses, deleteAddresses);
            })
            .catch(error => {
              console.error('Cannot update webhook', webhook, error);
            });
        }
      } else if (contracts.length > 0) {
        this.webhookService
          .createWebhook({
            network: network,
            webhook_type: WebhookType.ADDRESS_ACTIVITY,
            webhook_url: this.CALLBACK_URL,
            addresses: contracts.map(contract => contract.address),
          })
          .then(response => {
            console.debug('Webhook created', response.data);
          })
          .catch(error => {
            console.error('Cannot create webhook', webhook, error);
          });
      }
    }
  }
}

export default ContractMonitorService;
