import React from 'react';
import './Sidebar.css';

function NavItem({ id, icon, label, currentPage, setCurrentPage }) {
  return (
    <div
      className={`nav-item ${currentPage === id ? 'active' : ''}`}
      onClick={() => setCurrentPage(id)}
    >
      {icon ? <span className="icon">{icon}</span> : null}
      <span>{label}</span>
    </div>
  );
}

export default function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="shop-name gold-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.svg" alt="Logo" style={{ height: '32px' }} />
          <div>
            Sri Nikil
            <br />
            Tradings
          </div>
        </div>
        <div className="user-role">{isAdmin ? 'ADMIN' : 'STAFF'}</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-group-label">Main</div>
        <NavItem id="dashboard" icon="📊" label="Dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {!isAdmin && (
          <NavItem id="billing" icon="🧾" label="Billing" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        <div className="nav-group-label">Inventory</div>
        <NavItem id="products" icon="📦" label="Products" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="stock" icon="📈" label="Stock" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {isAdmin ? (
          <NavItem id="pricing" icon="💰" label="Pricing" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        ) : null}
        <NavItem id="priceboard" icon="🪧" label="Price Board" currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {isAdmin && (
          <>
            <div className="nav-group-label">Business</div>
            <NavItem id="sales" icon="📉" label="Sales" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem id="customers" icon="👥" label="Customers" currentPage={currentPage} setCurrentPage={setCurrentPage} />

            <div className="nav-group-label">Reports</div>
            <NavItem id="reports" icon="📁" label="Reports" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </>
        )}

        {isAdmin ? (
          <>
            <div className="nav-group-label">Admin</div>
            <NavItem id="loginlog" icon="🕐" label="Login Activity" currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <NavItem id="settings" icon="⚙️" label="Settings" currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </>
        ) : null}
      </div>

      <div className="sidebar-footer">
        <button className="btn btn-secondary btn-full btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
