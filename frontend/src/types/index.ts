export interface PriceUpdate {
    ticker: string;
    price: number;
    time: number;
}

export interface ChartPoint {
    price: number;
    time: string | number;
}