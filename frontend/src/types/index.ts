export interface PriceUpdate {
    ticker: string;
    price: number;
    time: number;
}

export interface ChartPoint {
    price: number;
    time: string | number;
}

export interface Alert {
    id: string;
    ticker: string;
    condition: 'above' | 'below';
    threshold: number;
    createdAt: string;
    triggered: boolean;
}

export interface AlertEvent {
    id: string;           // alert id (used as react key)
    ticker: string;
    condition: 'above' | 'below';
    threshold: number;
    price: number;        // actual price that triggered it
    time: string;
    toastId: string;      // unique id for the toast (so multiple can stack)
}