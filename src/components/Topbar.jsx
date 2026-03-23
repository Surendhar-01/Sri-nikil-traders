import React from 'react';

export default function Topbar({ title }) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        {title.replace('-', ' ')}
      </div>
      <div className="topbar-right">
        <div className="search-bar">
          <span>🔍</span>
          <input placeholder="Search products, bills…" />
        </div>
        <div className="user-pill">
          <div className="dot"></div>
          <span>Admin User</span>
        </div>
        <div id="notification-btn" style={{ cursor: 'pointer', fontSize: '1.3rem' }} title="Notifications">
          🔔
        </div>
      </div>
    </div>
  );
}
