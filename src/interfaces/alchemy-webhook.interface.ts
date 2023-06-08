export interface AlchemyData<T> {
  data: T[];
}

export interface Webhook {
  id: string;
  network: string;
  webhook_type: WebhookType;
  webhook_url: string;
  is_active: boolean;
  time_created: Date;
  addresses: string[];
  version: string;
  signing_key: string;
}

export interface CreateWebhook {
  network: string;
  webhook_type: WebhookType;
  webhook_url: string;
  addresses: string[];
}

export interface WebhookAddressActivity {
  webhookId: string;
  id: string;
  createdAt: Date;
  type: string;
  event: {
    network: string;
    activity: WebhookAddressActivityTx[];
  };
}

export interface WebhookAddressActivityTx {
  fromAddress: string;
  toAddress: string;
  blockNum: string;
  hash: string;
  category: string;
  value: string;
  typeTraceAddress: string;
  rawContract: {
    rawValue: string;
    address: string;
    decimal;
  };
  log: any;
}

export enum WebhookType {
  MINED_TRANSACTION = 'MINED_TRANSACTION',
  DROPPED_TRANSACTION = 'DROPPED_TRANSACTION',
  ADDRESS_ACTIVITY = 'ADDRESS_ACTIVITY',
  NFT_ACTIVITY = 'NFT_ACTIVITY',
}
