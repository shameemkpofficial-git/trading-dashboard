import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import Panel from './Panel';
import TickerList from '../market/TickerList';
import Chart from '../market/Chart';
import MarketStats from '../market/MarketStats';
import AlertManager from '../alerts/AlertManager';
import AlertToast from '../alerts/AlertToast';
import { useTradingStore } from '../../store/useTradingStore';
import {
  DEFAULT_LAYOUT,
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_ROW_HEIGHT,
  saveLayout,
} from '../../utils/layoutUtils';
import {
  PANEL_MARKETS,
  PANEL_ALERTS,
  PANEL_STATS,
} from '../../constants/strings';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardLayout: React.FC = () => {
  const { tickers, prices, selectedTicker, setSelectedTicker, history, fetchAlerts } =
    useTradingStore();

  // Fetch existing alerts on mount
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const [layouts, setLayouts] = useState(DEFAULT_LAYOUT);

  const onLayoutChange = (_: any, allLayouts: any) => {
    setLayouts(allLayouts);
    saveLayout(allLayouts);
  };

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={GRID_BREAKPOINTS}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        draggableHandle=".panel-header"
        onLayoutChange={onLayoutChange}
      >
        <div key="markets">
          <Panel title={PANEL_MARKETS}>
            <TickerList
              tickers={tickers}
              prices={prices}
              selectedTicker={selectedTicker}
              onSelectTicker={setSelectedTicker}
            />
          </Panel>
        </div>

        <div key="alerts">
          <Panel title={PANEL_ALERTS}>
            <AlertManager />
          </Panel>
        </div>

        <div key="chart">
          <Panel title={`${selectedTicker} Chart`}>
            <Chart
              data={history[selectedTicker] || []}
              ticker={selectedTicker}
            />
          </Panel>
        </div>

        <div key="stats">
          <Panel title={PANEL_STATS}>
            <MarketStats ticker={selectedTicker} prices={prices} />
          </Panel>
        </div>
      </ResponsiveGridLayout>

      {/* Toast stack is rendered outside the grid so it overlays everything */}
      <AlertToast />
    </>
  );
};

export default DashboardLayout;
