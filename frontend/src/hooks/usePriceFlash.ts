import { useEffect, useState } from 'react';

type FlashState = 'up' | 'down' | null;

export function usePriceFlash(price: number | undefined): FlashState {
  const [flash, setFlash] = useState<{ direction: FlashState; priceKey: number | undefined }>({
    direction: null,
    priceKey: price,
  });
  const [tick, setTick] = useState(0);

  if (price !== flash.priceKey) {
    const dir =
      price !== undefined && flash.priceKey !== undefined
        ? price > flash.priceKey
          ? 'up'
          : 'down'
        : null;
    setFlash({ direction: dir, priceKey: price });
    setTick((t) => t + 1);
  }

  useEffect(() => {
    if (flash.direction !== null) {
      const timer = setTimeout(() => {
        setFlash((f) => (f.priceKey === price ? { ...f, direction: null } : f));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tick, price, flash.direction]);

  return flash.direction;
}
