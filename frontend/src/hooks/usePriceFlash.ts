import { useEffect, useState } from 'react';
import { usePrevious } from './usePrevious';

type FlashState = 'up' | 'down' | null;

export function usePriceFlash(price: number | undefined): FlashState {
  const prevPrice = usePrevious(price);
  const [flash, setFlash] = useState<FlashState>(null);

  useEffect(() => {
    if (price === undefined || prevPrice === undefined) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    if (price > prevPrice) {
      setFlash('up');
      timeoutId = setTimeout(() => setFlash(null), 500); // clear after 500ms
    } else if (price < prevPrice) {
      setFlash('down');
      timeoutId = setTimeout(() => setFlash(null), 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [price, prevPrice]);

  return flash;
}
