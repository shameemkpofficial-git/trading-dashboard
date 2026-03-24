import { useEffect } from 'react';
import { useTradingStore } from '../store/useTradingStore';
import { clearLayout } from '../utils/layoutUtils';

export function useKeyboardShortcuts() {
  const { tickers, selectedTicker, setSelectedTicker } = useTradingStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // ArrowUp / ArrowDown — navigate tickers
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = tickers.indexOf(selectedTicker);
        if (currentIndex === -1) return;

        let newIndex = currentIndex;
        if (e.key === 'ArrowDown') {
          newIndex = currentIndex + 1 < tickers.length ? currentIndex + 1 : 0;
        } else {
          newIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : tickers.length - 1;
        }

        setSelectedTicker(tickers[newIndex]);
      }

      // Escape — reset layout
      if (e.key === 'Escape') {
        clearLayout();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tickers, selectedTicker, setSelectedTicker]);
}
