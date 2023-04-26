import ContractMonitorService from '../../services/contracts-monitor.service';
import { ContractNetwork } from '../../interfaces/contracts.interface';
import { WebhookType } from '../../interfaces/alchemy-webhook.interface';

describe('ContractMonitorService', () => {
  const service = new ContractMonitorService();

  test('create new webhook', async () => {
    service.webhookService.createWebhook = jest.fn().mockResolvedValue({});
    service.webhookService.getAllWebhooks = jest.fn().mockResolvedValue({
      data: {
        data: [],
      },
    });
    service.contractService.findAllContractsByNetwork = jest.fn().mockResolvedValue([
      { address: 'eth1', network: ContractNetwork.ETH_MAINNET },
      { address: 'eth2', network: ContractNetwork.ETH_MAINNET },
    ]);

    await service.synchronizeContractWebhooks();

    expect(service.webhookService.createWebhook).toBeCalledTimes(1);
    expect(service.webhookService.createWebhook).toBeCalledWith({
      network: 'ETH_MAINNET',
      webhook_type: WebhookType.ADDRESS_ACTIVITY,
      webhook_url: 'https://chainkraft.com/callback',
      addresses: ['eth1', 'eth2'],
    });
  });

  test('update existing webhook', async () => {
    service.webhookService.updateWebhook = jest.fn().mockResolvedValue({});
    service.webhookService.getAllWebhooks = jest.fn().mockResolvedValue({
      data: {
        data: [{ id: 'wh1', network: 'ETH_MAINNET', addresses: ['eth1', 'eth2', 'eth3', 'eth4'] }],
      },
    });
    service.contractService.findAllContractsByNetwork = jest.fn().mockResolvedValue([
      { address: 'eth1', network: ContractNetwork.ETH_MAINNET },
      { address: 'eth2', network: ContractNetwork.ETH_MAINNET },
      { address: 'eth5', network: ContractNetwork.ETH_MAINNET },
    ]);

    await service.synchronizeContractWebhooks();

    expect(service.webhookService.updateWebhook).toBeCalledTimes(1);
    expect(service.webhookService.updateWebhook).toBeCalledWith('wh1', ['eth5'], ['eth3', 'eth4']);
  });
});
