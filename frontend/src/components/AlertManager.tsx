import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';

const AlertManager: React.FC = () => {
  const { tickers, alerts, addAlert, removeAlert } = useTradingStore();

  const [ticker, setTicker] = useState(tickers[0] || 'AAPL');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const val = parseFloat(threshold);
    if (isNaN(val) || val <= 0) {
      setError('Enter a valid positive price.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await addAlert(ticker, condition, val);
    setLoading(false);
    if (!result) {
      setError('Failed to create alert. Check the server.');
    } else {
      setThreshold('');
    }
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const firedAlerts = alerts.filter((a) => a.triggered);

  return (
    <div className="alert-manager">
      {/* ── Create form ─────────────────────────────────────────────────────── */}
      <div className="alert-form">
        <div className="alert-form-row">
          <select
            className="alert-select"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          >
            {tickers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div className="alert-condition-toggle">
            <button
              className={`toggle-btn ${condition === 'above' ? 'active-above' : ''}`}
              onClick={() => setCondition('above')}
            >
              ↑ Above
            </button>
            <button
              className={`toggle-btn ${condition === 'below' ? 'active-below' : ''}`}
              onClick={() => setCondition('below')}
            >
              ↓ Below
            </button>
          </div>

          <input
            type="number"
            className="alert-input"
            placeholder="Price"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            min="0"
            step="any"
          />

          <motion.button
            className="alert-add-btn"
            onClick={handleAdd}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={14} />
            {loading ? '…' : 'Add'}
          </motion.button>
        </div>

        {error && (
          <motion.p
            className="alert-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertTriangle size={12} /> {error}
          </motion.p>
        )}
      </div>

      {/* ── Active alerts ─────────────────────────────────────────────────── */}
      <div className="alert-list-section">
        <div className="alert-section-header">
          <Bell size={12} />
          <span>Active ({activeAlerts.length})</span>
        </div>

        <AnimatePresence>
          {activeAlerts.length === 0 && (
            <motion.p
              className="alert-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              No active alerts
            </motion.p>
          )}
          {activeAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              className="alert-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              layout
            >
              <span className="alert-item-ticker">{alert.ticker}</span>
              <span className={`alert-item-condition ${alert.condition}`}>
                {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold.toLocaleString()}
              </span>
              <motion.button
                className="alert-delete-btn"
                onClick={() => removeAlert(alert.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Delete alert"
              >
                <Trash2 size={12} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Fired alerts ─────────────────────────────────────────────────── */}
      {firedAlerts.length > 0 && (
        <div className="alert-list-section">
          <div className="alert-section-header fired">
            <AlertTriangle size={12} />
            <span>Triggered ({firedAlerts.length})</span>
          </div>
          {firedAlerts.map((alert) => (
            <div key={alert.id} className="alert-item triggered">
              <span className="alert-item-ticker">{alert.ticker}</span>
              <span className={`alert-item-condition ${alert.condition}`}>
                {alert.condition === 'above' ? '↑' : '↓'} ${alert.threshold.toLocaleString()}
              </span>
              <span className="alert-item-badge">fired</span>
              <motion.button
                className="alert-delete-btn"
                onClick={() => removeAlert(alert.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={12} />
              </motion.button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertManager;
