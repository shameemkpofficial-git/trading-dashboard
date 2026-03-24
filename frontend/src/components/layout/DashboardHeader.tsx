import React from 'react';
import { User, LogOut } from 'lucide-react';
import { APP_TITLE, BTN_LOGOUT } from '../../constants/strings';

interface DashboardHeaderProps {
  username?: string;
  onLogout: () => void;
}

/**
 * DashboardHeader — top navigation bar with app title, user info, and logout.
 * Extracted from App.tsx to keep the root component lean.
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>{APP_TITLE}</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <User size={16} />
          <span>{username}</span>
        </div>
        <button
          className="icon-button logout-btn"
          onClick={onLogout}
          title={BTN_LOGOUT}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
