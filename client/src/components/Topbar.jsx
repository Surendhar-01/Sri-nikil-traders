import React from 'react';
import './Topbar.css';

export default function Topbar({ title, user }) {
  const normalizedTitle = title.replace('-', ' ');

  return (
    <div className="topbar">
      <div className="topbar-title gold-text">
        {normalizedTitle}
      </div>

      <div className="topbar-right">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search products, bills..." />
        </div>

        <div className="user-pill">
          <div className="dot"></div>
          <span>{user?.role === 'Admin' ? 'Admin User' : 'Staff User'}</span>
        </div>

        <div style={{ cursor: 'pointer', fontSize: '1.3rem' }} title="Notifications">
          🔔
        </div>
      </div>
    </div>
  );
}
