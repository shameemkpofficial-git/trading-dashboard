import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { GripHorizontal, Maximize2, X } from 'lucide-react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  onMaximize?: () => void;
  handleProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * Panel — reusable draggable dashboard panel with header and content area.
 */
const Panel = forwardRef<HTMLDivElement, PanelProps>(({
  title,
  children,
  className = '',
  onClose,
  onMaximize,
  handleProps,
  ...props
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={`panel-container ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <div className="panel-header" {...handleProps}>
        <GripHorizontal
          size={14}
          className="text-secondary"
          style={{ marginRight: 8, opacity: 0.5, cursor: 'grab' }}
        />
        <span className="panel-title">{title}</span>
        <div style={{ flex: 1 }} />
        <div className="panel-actions">
          {onMaximize && (
            <button className="panel-action-btn" onClick={onMaximize}>
              <Maximize2 size={14} />
            </button>
          )}
          {onClose && (
            <button className="panel-action-btn" onClick={onClose}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="panel-content">
        {children}
      </div>
    </motion.div>
  );
});

Panel.displayName = 'Panel';

export default Panel;
