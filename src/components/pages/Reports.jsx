import React, { useState } from 'react';

export default function Reports({ db }) {
  const downloadCSV = (type) => {
    let csv = '';
    let filename = '';
    const today = new Date().toISOString().split('T')[0];

    if (type === 'sales') {
      csv = 'Bill No,Date,Customer,Phone,Payment,Items,Subtotal,CGST,SGST,Grand Total,By\n';
      csv += db.bills.map(b => `${b.billNo},${new Date(b.date).toLocaleString()},${b.customer},${b.phone || ''},${b.payment},${b.items.length},${b.subtotal.toFixed(2)},${b.cgst.toFixed(2)},${b.sgst.toFixed(2)},${b.grand.toFixed(2)},${b.by}`).join('\n');
      filename = `SalesReport_${today}.csv`;
    } else if (type === 'stock') {
      csv = 'Product,Category,Unit,Price,Opening Stock,Sold,Current Stock,Status\n';
      csv += db.products.map(p => `${p.name},${p.cat},${p.unit},${p.price},${(p.stock || 0) + (p.sold || 0)},${p.sold || 0},${p.stock},${p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'OK'}`).join('\n');
      filename = `StockReport_${today}.csv`;
    } else if (type === 'price') {
      csv = 'Date,Product,Old Price,New Price,Changed By\n';
      csv += db.priceHistory.map(h => `${new Date(h.date).toLocaleDateString()},${h.product},${h.old},${h.new},${h.by}`).join('\n');
      filename = `PriceHistory_${today}.csv`;
    } else if (type === 'login') {
      csv = '#,User,Role,Login Time,Logout Time,Duration,Device,Status\n';
      csv += db.loginLogs.map((l, i) => {
        const duration = l.logoutTime ? Math.floor((new Date(l.logoutTime) - new Date(l.loginTime)) / 60000) + 'm' : 'Active';
        return `${i + 1},${l.user},${l.role},${new Date(l.loginTime).toLocaleString()},${l.logoutTime ? new Date(l.logoutTime).toLocaleString() : 'Online'},${duration},${l.device},${l.logoutTime ? 'Ended' : 'Online'}`;
      }).join('\n');
      filename = `LoginActivity_${today}.csv`;
    } else if (type === 'customer') {
      csv = 'Name,Phone,Visits,Total Purchased,First Visit,Last Visit\n';
      csv += db.customers.map(c => `${c.name},${c.phone || ''},${c.visits},${c.total.toFixed(2)},${new Date(c.firstVisit).toLocaleDateString()},${new Date(c.lastVisit).toLocaleDateString()}`).join('\n');
      filename = `CustomerReport_${today}.csv`;
    } else if (type === 'expense') {
      csv = 'Date,Category,Description,Amount,By\n';
      csv += db.expenses.map(e => `${new Date(e.date).toLocaleDateString()},${e.category},${e.desc},${e.amount},${e.by}`).join('\n');
      filename = `ExpenseReport_${today}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="grid grid-3">
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('sales')}>
        <div className="section-title">📊 Sales Report</div>
        <p className="text-muted text-sm mb-3">Total Bills: {db.bills.length}</p>
        <button className="btn btn-primary btn-sm btn-full">⬇️ Download CSV</button>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('stock')}>
        <div className="section-title">📦 Stock Report</div>
        <p className="text-muted text-sm mb-3">Low Stock: {db.products.filter(p => p.stock <= 5).length}</p>
        <button className="btn btn-blue btn-sm btn-full">⬇️ Download CSV</button>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('price')}>
        <div className="section-title">💰 Price History</div>
        <p className="text-muted text-sm mb-3">Changes: {db.priceHistory.length}</p>
        <button className="btn btn-success btn-sm btn-full">⬇️ Download CSV</button>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('login')}>
        <div className="section-title">🔐 Login Activity</div>
        <p className="text-muted text-sm mb-3">Sessions: {db.loginLogs.length}</p>
        <button className="btn btn-purple btn-sm btn-full">⬇️ Download CSV</button>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('customer')}>
        <div className="section-title">👥 Customer Report</div>
        <p className="text-muted text-sm mb-3">Customers: {db.customers.length}</p>
        <button className="btn btn-secondary btn-sm btn-full">⬇️ Download CSV</button>
      </div>
      <div className="card" style={{ cursor: 'pointer' }} onClick={() => downloadCSV('expense')}>
        <div className="section-title">💸 Expense Report</div>
        <p className="text-muted text-sm mb-3">Expenses: {db.expenses.length}</p>
        <button className="btn btn-danger btn-sm btn-full">⬇️ Download CSV</button>
      </div>
    </div>
  );
}
