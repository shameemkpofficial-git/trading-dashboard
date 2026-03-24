import { memo } from 'react';
import { motion } from 'framer-motion';
import { usePriceFlash } from '../../hooks/usePriceFlash';
import { formatPrice } from '../../utils/formatters';
import { TICKER_LOADING } from '../../constants/strings';

interface TickerItemProps {
  ticker: string;
  price: number;
  isActive: boolean;
  onSelect: (ticker: string) => void;
}

const TickerItem = memo(({ ticker, price, isActive, onSelect }: TickerItemProps) => {
  const flash = usePriceFlash(price);

  let flashClass = '';
  if (flash === 'up') flashClass = 'flash-up';
  if (flash === 'down') flashClass = 'flash-down';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(ticker);
    }
  };

  const currentPriceFormatted = price ? formatPrice(price) : TICKER_LOADING;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${isActive ? 'active' : ''} ${flashClass}`}
      onClick={() => onSelect(ticker)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="option"
      aria-selected={isActive}
      aria-label={`${ticker} ticker, current price ${currentPriceFormatted}`}
      whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-tertiary)' }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="ticker-name" aria-hidden="true">{ticker}</span>
      <motion.span
        key={price}
        initial={{ opacity: 0.5, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        className={`ticker-price ${flash === 'up' ? 'text-green-500' : flash === 'down' ? 'text-red-500' : ''}`}
        aria-hidden="true"
        style={{
          color:
            flash === 'up'
              ? 'var(--accent-green)'
              : flash === 'down'
              ? 'var(--accent-red)'
              : 'inherit',
        }}
      >
        {currentPriceFormatted}
      </motion.span>
    </motion.li>
  );
});

TickerItem.displayName = 'TickerItem';

interface Props {
  tickers: string[];
  prices: Record<string, number>;
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

const TickerList = ({ tickers, prices, selectedTicker, onSelectTicker }: Props) => {
  return (
    <div className="ticker-list">
      <ul role="listbox" aria-label="Available trading tickers">
        {tickers.map((ticker) => (
          <TickerItem
            key={ticker}
            ticker={ticker}
            price={prices[ticker]}
            isActive={selectedTicker === ticker}
            onSelect={onSelectTicker}
          />
        ))}
      </ul>
    </div>
  );
};

export default TickerList;
