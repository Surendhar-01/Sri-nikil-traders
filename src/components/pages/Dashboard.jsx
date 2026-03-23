import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard({ db }) {
  const bills = db.bills || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date.startsWith(todayStr));
  const todaySales = todayBills.reduce((sum, b) => sum + b.grand, 0);

  const lowStock = db.products.filter(p => p.stock <= 5);

  const totalInventoryValue = db.products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalSalesVolume = bills.reduce((sum, b) => sum + b.grand, 0);
  
  // Estimate margin (assuming average 15% for now, logic can be refined)
  const estimatedProfit = totalSalesVolume * 0.15;

  const salesTrendData = {
    labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
    datasets: [{
      label: 'Sales (₹)',
      data: [12000, 15000, 8000, 19000, 22000, 17000, todaySales],
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const topProductsData = {
    labels: db.products.slice(0, 5).map(p => p.name.split(' ')[0]),
    datasets: [{
      label: 'Units Sold',
      data: db.products.slice(0, 5).map(p => p.sold || 0),
      backgroundColor: ['#f97316', '#22c55e', '#2363eb', '#7c3aed', '#dc2626']
    }]
  };

  return (
    <div>
      <div className="grid grid-4 mb-4">
        <div className="stat-card orange">
          <div className="stat-label">Today's Sales</div>
          <div className="stat-value">₹{todaySales.toFixed(2)}</div>
          <div className="stat-sub">{todayBills.length} Bills Issued</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Est. Profit</div>
          <div className="stat-value text-green">₹{estimatedProfit.toFixed(0)}</div>
          <div className="stat-sub">Across All Sales</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Stock Value</div>
          <div className="stat-value">₹{totalInventoryValue.toLocaleString()}</div>
          <div className="stat-sub">Current On-Hand</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value text-red">{lowStock.length}</div>
          <div className="stat-sub">Items for Refill</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="section-title">📈 Sales Trend</div>
          <div style={{ height: '220px' }}>
            <Line data={salesTrendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">🏆 Top Products</div>
          <div style={{ height: '220px' }}>
            <Bar data={topProductsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">🕒 Recent Transactions</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Bill No</th><th>Customer</th><th>Amount</th><th>Method</th><th>Time</th></tr></thead>
            <tbody>
              {bills.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td><b>{b.billNo}</b></td>
                  <td>{b.customer}</td>
                  <td className="fw-bold">₹{b.grand.toFixed(2)}</td>
                  <td><span className="badge badge-blue">{b.payment}</span></td>
                  <td className="text-muted text-xs">{new Date(b.date).toLocaleTimeString()}</td>
                </tr>
              ))}
              {bills.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
