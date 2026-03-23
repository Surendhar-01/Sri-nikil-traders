import React from 'react';

const NavItem = ({ id, icon, label, currentPage, setCurrentPage }) => (
  <div 
    className={`nav-item ${currentPage === id ? 'active' : ''}`} 
    onClick={() => setCurrentPage(id)}
  >
    <span className="icon">{icon}</span> {label}
  </div>
);

export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="shop-name">🛢️ Sri Nikil<br />Tradings</div>
        <div className="user-role">Admin</div>
      </div>
      <div className="sidebar-nav">
        <div className="nav-group-label">Main</div>
        <NavItem id="dashboard" icon="📊" label="Dashboard" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="billing" icon="🧾" label="Billing" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <div className="nav-group-label">Inventory</div>
        <NavItem id="products" icon="📦" label="Products" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="stock" icon="📈" label="Stock" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="pricing" icon="💰" label="Pricing" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="priceboard" icon="📺" label="Price Board" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <div className="nav-group-label">Business</div>
        <NavItem id="sales" icon="📉" label="Sales" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="customers" icon="👥" label="Customers" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="suppliers" icon="🚚" label="Suppliers" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="expenses" icon="💸" label="Expenses" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        
        <div className="nav-group-label">Admin</div>
        <NavItem id="reports" icon="📂" label="Reports" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="loginlog" icon="🕐" label="Login Activity" currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <NavItem id="settings" icon="⚙️" label="Settings" currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
      <div className="sidebar-footer">
        <button className="btn btn-secondary btn-full btn-sm" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
