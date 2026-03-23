import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import Panel from './Panel';
import TickerList from './TickerList';
import Chart from './Chart';
import { useTradingStore } from '../store/useTradingStore';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardLayout: React.FC = () => {
  const { tickers, prices, selectedTicker, setSelectedTicker, history } = useTradingStore();
  
  const initialLayout = {
    lg: [
      { i: 'markets', x: 0, y: 0, w: 3, h: 10 },
      { i: 'chart', x: 3, y: 0, w: 9, h: 7 },
      { i: 'stats', x: 3, y: 7, w: 9, h: 3 },
    ]
  };

  const [layouts, setLayouts] = useState(initialLayout);

  const onLayoutChange = (_: any, allLayouts: any) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboard-layout', JSON.stringify(allLayouts));
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={60}
      draggableHandle=".panel-header"
      onLayoutChange={onLayoutChange}
    >
      <div key="markets">
        <Panel title="Markets">
          <TickerList 
            tickers={tickers} 
            prices={prices} 
            selectedTicker={selectedTicker} 
            onSelectTicker={setSelectedTicker} 
          />
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
        <Panel title="Market Stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Price</span>
              <span className="stat-value">
                {prices[selectedTicker] ? `$${prices[selectedTicker].toFixed(2)}` : '---'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">24h Change</span>
              <span className="stat-value positive">+2.45%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Volume</span>
              <span className="stat-value">$1.2B</span>
            </div>
          </div>
        </Panel>
      </div>
    </ResponsiveGridLayout>
  );
};

export default DashboardLayout;
