import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useTradingStore } from '../store/useTradingStore';
import type { AlertEvent } from '../types';

interface ToastProps {
  alert: AlertEvent;
  onDismiss: (toastId: string) => void;
}

const DURATION_MS = 6000;

const Toast: React.FC<ToastProps> = ({ alert, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(pct);
      if (pct > 0) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isAbove = alert.condition === 'above';
  const color = isAbove ? 'var(--accent-green)' : 'var(--accent-red)';

  return (
    <motion.div
      className="alert-toast"
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      layout
    >
      {/* header */}
      <div className="toast-header">
        <div className="toast-icon" style={{ color }}>
          <Bell size={14} />
        </div>
        <div className="toast-title">
          <span className="toast-ticker" style={{ color }}>{alert.ticker}</span>
          <span className="toast-label">Price Alert Triggered</span>
        </div>
        <button className="toast-close" onClick={() => onDismiss(alert.toastId)}>
          <X size={13} />
        </button>
      </div>

      {/* body */}
      <div className="toast-body">
        <span className="toast-condition" style={{ color }}>
          {isAbove ? '↑ Above' : '↓ Below'} ${alert.threshold.toLocaleString()}
        </span>
        <span className="toast-price">
          Now: <strong>${alert.price.toFixed(2)}</strong>
        </span>
      </div>

      {/* progress bar */}
      <div className="toast-progress-track">
        <motion.div
          className="toast-progress-bar"
          style={{ background: color, width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

const AlertToast: React.FC = () => {
  const { triggeredAlerts, dismissTriggeredAlert } = useTradingStore();

  return (
    <div className="toast-stack">
      <AnimatePresence mode="sync">
        {triggeredAlerts.map((alert) => (
          <Toast
            key={alert.toastId}
            alert={alert}
            onDismiss={dismissTriggeredAlert}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertToast;
