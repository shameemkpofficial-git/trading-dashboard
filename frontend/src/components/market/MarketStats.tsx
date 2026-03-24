import React from 'react';
import {
  STAT_LABEL_PRICE,
  STAT_LABEL_CHANGE,
  STAT_LABEL_VOLUME,
  STAT_PLACEHOLDER,
  STAT_CHANGE_VALUE,
  STAT_VOLUME_VALUE,
} from '../../constants/strings';
import { formatPrice } from '../../utils/formatters';

interface MarketStatsProps {
  ticker: string;
  prices: Record<string, number>;
}

/**
 * MarketStats — displays a row of market statistics for the selected ticker.
 * Extracted from DashboardLayout to keep it reusable and focused.
 */
const MarketStats: React.FC<MarketStatsProps> = ({ ticker, prices }) => {
  const currentPrice = prices[ticker];

  return (
    <div className="stats-grid" role="group" aria-label={`Market statistics for ${ticker}`}>
      <div className="stat-item">
        <span className="stat-label" aria-hidden="true">{STAT_LABEL_PRICE}</span>
        <span className="stat-value" aria-label={`${STAT_LABEL_PRICE}: ${currentPrice ? formatPrice(currentPrice) : STAT_PLACEHOLDER}`}>
          {currentPrice ? formatPrice(currentPrice) : STAT_PLACEHOLDER}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label" aria-hidden="true">{STAT_LABEL_CHANGE}</span>
        <span className="stat-value positive" aria-label={`${STAT_LABEL_CHANGE}: ${STAT_CHANGE_VALUE}`}>
          {STAT_CHANGE_VALUE}
        </span>
      </div>
      <div className="stat-item">
        <span className="stat-label" aria-hidden="true">{STAT_LABEL_VOLUME}</span>
        <span className="stat-value" aria-label={`${STAT_LABEL_VOLUME}: ${STAT_VOLUME_VALUE}`}>
          {STAT_VOLUME_VALUE}
        </span>
      </div>
    </div>
  );

};

export default MarketStats;
