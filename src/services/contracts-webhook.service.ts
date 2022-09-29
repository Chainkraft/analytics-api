import axios, { AxiosResponse } from 'axios';
import { ALCHEMY_NOTIFY_API_KEY } from '@config';
import { AlchemyData, CreateWebhook, Webhook } from '@interfaces/alchemy-webhook.interface';

class ContractWebhookService {
  private httpClient = axios.create({
    baseURL: 'https://dashboard.alchemyapi.io/api/',
    headers: {
      'x-alchemy-token': ALCHEMY_NOTIFY_API_KEY,
      'content-type': 'application/json',
    },
  });

  public async getAllWebhooks(): Promise<AxiosResponse<AlchemyData<Webhook>>> {
    return this.httpClient.get('dashboard-team-webhooks');
  }

  public async createWebhook(webhook: CreateWebhook): Promise<AxiosResponse<Webhook>> {
    return this.httpClient.post('create-webhook', webhook);
  }

  public async deleteWebhook(webhookId: string): Promise<AxiosResponse> {
    return this.httpClient.delete('delete-webhook', {
      params: {
        webhook_id: webhookId,
      },
    });
  }

  public async updateWebhook(webhookId: string, addAddresses: string[], deleteAddresses: string[]): Promise<AxiosResponse> {
    return this.httpClient.patch('update-webhook-addresses', {
      webhook_id: webhookId,
      addresses_to_add: addAddresses ?? [],
      addresses_to_remove: deleteAddresses ?? [],
    });
  }
}

export default ContractWebhookService;
