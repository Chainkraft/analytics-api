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
  webhookId: string,
  id: string,
  createdAt: Date,
  type: string,
  event: {
    network: string,
    activity: [
      {
        category: "token",
        fromAddress: string,
        toAddress: string,
        erc721TokenId: "0x1",
        rawContract: {
          rawValue: "0x",
          address: "0x93C46aA4DdfD0413d95D0eF3c478982997cE9861"
        },
        log: {
          removed: false,
          address: "0x93C46aA4DdfD0413d95D0eF3c478982997cE9861",
          data: "0x",
          topics: string[]
        }
      }
    ]
  }
}

export enum WebhookType {
  MINED_TRANSACTION = "MINED_TRANSACTION",
  DROPPED_TRANSACTION = "DROPPED_TRANSACTION",
  ADDRESS_ACTIVITY = "ADDRESS_ACTIVITY",
  NFT_ACTIVITY = "NFT_ACTIVITY"
}
