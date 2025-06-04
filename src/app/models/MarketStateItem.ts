export interface MarketStateItem {
  market: string;
  marketStatus: string;
  tradeDate: string;
  index: string;
  last: number | string;
  variation: number | string;
  percentChange: number | string;
  marketStatusMessage: string;
  expiryDate?: string;
  underlying?: string;
  updated_time?: string;
  tradeDateFormatted?: string;
  slickclass?: string;
}
