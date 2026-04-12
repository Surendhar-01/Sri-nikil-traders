import React from 'react';
import './Topbar.css';

export default function Topbar({ title, user, db }) {
  const normalizedTitle = title.replace('-', ' ');

  const downloadStockCSV = () => {
    if (!db || !db.products) return;

    const today = new Date().toLocaleDateString('en-GB');

    // Headers
    let csv = 'Product,Opening Stock,Total Sold,Current Stock,Status\n';

    // Data rows
    csv += db.products.map(product => {
      const totalSold = (db.bills || []).reduce((sum, bill) => {
        const item = (bill.items || []).find(i => i.id === product.id);
        return sum + (item ? Number(item.qty || 0) : 0);
      }, 0);

      const openingStock = (product.stock || 0) + totalSold;
      const status = product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'Healthy';

      return `${product.name},${openingStock},${totalSold},${product.stock},${status}`;
    }).join('\n');

    const filename = `StockReport_ShiftEnd_${today.replace(/\//g, '-')}.csv`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = () => {
    downloadStockCSV();
  };

  return (
    <div className="topbar">
      <div className="topbar-title gold-text">
        {normalizedTitle}
      </div>

      <div className="topbar-right">
        <button className="overall-report-btn" onClick={handleDownloadReport}>
          <span>End shift</span>
          <span className="icon">📊</span>
        </button>

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
