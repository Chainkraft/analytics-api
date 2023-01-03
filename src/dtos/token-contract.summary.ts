export interface TokenContractSummary {
  slug: string;
  status: TokenContractSummaryStatus;
}

export enum TokenContractSummaryStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  ALARM = 'ALARM'
}
