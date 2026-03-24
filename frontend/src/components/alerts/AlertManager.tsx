import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';
import {
  ALERT_ABOVE_LABEL,
  ALERT_BELOW_LABEL,
  ALERT_ABOVE_ARROW,
  ALERT_BELOW_ARROW,
  ALERT_BTN_ADD,
  ALERT_BTN_LOADING,
  ALERT_PLACEHOLDER_PRICE,
  ALERT_SECTION_ACTIVE,
  ALERT_SECTION_TRIGGERED,
  ALERT_SECTION_FIRED,
  ALERT_EMPTY,
  ERR_INVALID_PRICE,
  ERR_CREATE_ALERT,
} from '../../constants/strings';
import { formatLocaleNumber } from '../../utils/formatters';

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
      setError(ERR_INVALID_PRICE);
      return;
    }
    setError('');
    setLoading(true);
    const result = await addAlert(ticker, condition, val);
    setLoading(false);
    if (!result) {
      setError(ERR_CREATE_ALERT);
    } else {
      setThreshold('');
    }
  };

  const activeAlerts  = alerts.filter((a) => !a.triggered);
  const firedAlerts   = alerts.filter((a) => a.triggered);

  return (
    <div className="alert-manager">
      {/* ── Create form ────────────────────────────────────────────────────────── */}
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
              {ALERT_ABOVE_LABEL}
            </button>
            <button
              className={`toggle-btn ${condition === 'below' ? 'active-below' : ''}`}
              onClick={() => setCondition('below')}
            >
              {ALERT_BELOW_LABEL}
            </button>
          </div>

          <input
            type="number"
            className="alert-input"
            placeholder={ALERT_PLACEHOLDER_PRICE}
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
            {loading ? ALERT_BTN_LOADING : ALERT_BTN_ADD}
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

      {/* ── Active alerts ──────────────────────────────────────────────────────── */}
      <div className="alert-list-section">
        <div className="alert-section-header">
          <Bell size={12} />
          <span>{ALERT_SECTION_ACTIVE} ({activeAlerts.length})</span>
        </div>

        <AnimatePresence>
          {activeAlerts.length === 0 && (
            <motion.p
              className="alert-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {ALERT_EMPTY}
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
                {alert.condition === 'above' ? ALERT_ABOVE_ARROW : ALERT_BELOW_ARROW} ${formatLocaleNumber(alert.threshold)}
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

      {/* ── Fired alerts ───────────────────────────────────────────────────────── */}
      {firedAlerts.length > 0 && (
        <div className="alert-list-section">
          <div className="alert-section-header fired">
            <AlertTriangle size={12} />
            <span>{ALERT_SECTION_TRIGGERED} ({firedAlerts.length})</span>
          </div>
          {firedAlerts.map((alert) => (
            <div key={alert.id} className="alert-item triggered">
              <span className="alert-item-ticker">{alert.ticker}</span>
              <span className={`alert-item-condition ${alert.condition}`}>
                {alert.condition === 'above' ? ALERT_ABOVE_ARROW : ALERT_BELOW_ARROW} ${formatLocaleNumber(alert.threshold)}
              </span>
              <span className="alert-item-badge">{ALERT_SECTION_FIRED}</span>
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
