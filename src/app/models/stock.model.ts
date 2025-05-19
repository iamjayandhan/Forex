export interface Stock {
    id?: number;
    name: string;
    symbol: string;
    imageUrl: string;
    currentPrice: number;
    sector: string;
    description: string;
    ipoQty: number;
    exchange: string;
}