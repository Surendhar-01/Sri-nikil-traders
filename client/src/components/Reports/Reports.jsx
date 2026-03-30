import React from 'react';
import './Reports.css';

export default function Reports({ db, user }) {
  const bills = (db.bills || []).filter((bill) => {
    if (user?.role === 'Admin') return true;
    return (bill.by || bill.by_user) === user?.user;
  });

  const downloadCSV = (type) => {
    let csv = '';
    let filename = '';
    const today = new Date().toISOString().split('T')[0];

    if (type === 'sales') {
      csv = 'Bill No,Date,Customer,Phone,Payment,Items,Subtotal,CGST,SGST,Grand Total,By\n';
      csv += bills.map((bill) => `${bill.billNo},${new Date(bill.date).toLocaleString()},${bill.customer},${bill.phone || ''},${bill.payment},${bill.items.length},${bill.subtotal.toFixed(2)},${bill.cgst.toFixed(2)},${bill.sgst.toFixed(2)},${bill.grand.toFixed(2)},${bill.by}`).join('\n');
      filename = user?.role === 'Admin' ? `FullSalesReport_${today}.csv` : `MySalesReport_${user?.user}_${today}.csv`;
    } else if (type === 'stock') {
      csv = 'Product,Category,Unit,Price,Opening Stock,Sold,Current Stock,Status\n';
      csv += db.products.map((product) => `${product.name},${product.cat},${product.unit},${product.price},${(product.stock || 0) + (product.sold || 0)},${product.sold || 0},${product.stock},${product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'OK'}`).join('\n');
      filename = `StockReport_${today}.csv`;
    } else if (type === 'price') {
      csv = 'Date,Product,Old Price,New Price,Changed By\n';
      csv += db.priceHistory.map((history) => `${new Date(history.date).toLocaleDateString()},${history.product},${history.old},${history.new},${history.by}`).join('\n');
      filename = `PriceHistory_${today}.csv`;
    } else if (type === 'login') {
      csv = '#,User,Role,Login Time,Logout Time,Duration,Device,Status\n';
      csv += db.loginLogs.map((log, index) => {
        const duration = log.logoutTime ? `${Math.floor((new Date(log.logoutTime) - new Date(log.loginTime)) / 60000)}m` : 'Active';
        return `${index + 1},${log.user},${log.role},${new Date(log.loginTime).toLocaleString()},${log.logoutTime ? new Date(log.logoutTime).toLocaleString() : 'Online'},${duration},${log.device},${log.logoutTime ? 'Ended' : 'Online'}`;
      }).join('\n');
      filename = `LoginActivity_${today}.csv`;
    } else if (type === 'customer') {
      csv = 'Name,Phone,Visits,Total Purchased,First Visit,Last Visit\n';
      csv += db.customers.map((customer) => `${customer.name},${customer.phone || ''},${customer.visits},${customer.total.toFixed(2)},${new Date(customer.firstVisit).toLocaleDateString()},${new Date(customer.lastVisit).toLocaleDateString()}`).join('\n');
      filename = `CustomerReport_${today}.csv`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
  };

  return (
    <div className="grid grid-3 reports-page">
      <div className="card reports-card reports-card-sales" onClick={() => downloadCSV('sales')}>
        <div className="section-title">{user?.role === 'Admin' ? 'Sales Report (All)' : 'My Sales Report'}</div>
        <p className="text-muted text-sm mb-3">Total Bills: {bills.length}</p>
        <button className="btn btn-primary btn-sm btn-full">Download CSV</button>
      </div>

      <div className="card reports-card reports-card-stock" onClick={() => downloadCSV('stock')}>
        <div className="section-title">Stock Report</div>
        <p className="text-muted text-sm mb-3">Low Stock: {db.products.filter((product) => product.stock <= 5).length}</p>
        <button className="btn btn-blue btn-sm btn-full">Download CSV</button>
      </div>

      <div className="card reports-card reports-card-price" onClick={() => downloadCSV('price')}>
        <div className="section-title">Price History</div>
        <p className="text-muted text-sm mb-3">Changes: {db.priceHistory.length}</p>
        <button className="btn btn-success btn-sm btn-full">Download CSV</button>
      </div>

      <div className="card reports-card reports-card-login" onClick={() => downloadCSV('login')}>
        <div className="section-title">Login Activity</div>
        <p className="text-muted text-sm mb-3">Sessions: {db.loginLogs.length}</p>
        <button className="btn btn-purple btn-sm btn-full">Download CSV</button>
      </div>

      <div className="card reports-card reports-card-customer" onClick={() => downloadCSV('customer')}>
        <div className="section-title">Customer Report</div>
        <p className="text-muted text-sm mb-3">Customers: {db.customers.length}</p>
        <button className="btn btn-secondary btn-sm btn-full">Download CSV</button>
      </div>
    </div>
  );
}
