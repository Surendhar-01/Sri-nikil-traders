import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

function getWeekStart(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatCurrency(value) {
  return `\u20B9${Number(value || 0).toFixed(2)}`;
}

export default function Dashboard({ db }) {
  const bills = db.bills || [];
  const products = db.products || [];
  const expenses = db.expenses || [];
  const revenueEntries = db.revenueEntries || [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const weekStart = getWeekStart(now);

  const todayBills = bills.filter(bill => bill.date.startsWith(todayStr));
  const weeklyBills = bills.filter(bill => new Date(bill.date) >= weekStart);
  const monthlyBills = bills.filter(bill => {
    const date = new Date(bill.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const yearlyBills = bills.filter(bill => new Date(bill.date).getFullYear() === currentYear);

  const todayRevenueEntries = revenueEntries.filter(entry => entry.date.startsWith(todayStr));
  const weeklyRevenueEntries = revenueEntries.filter(entry => new Date(entry.date) >= weekStart);
  const monthlyRevenueEntries = revenueEntries.filter(entry => {
    const date = new Date(entry.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const yearlyRevenueEntries = revenueEntries.filter(entry => new Date(entry.date).getFullYear() === currentYear);
  const monthlyExpenses = expenses.filter(expense => {
    const date = new Date(expense.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const todaySales = todayBills.reduce((sum, bill) => sum + bill.grand, 0)
    + todayRevenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const weeklyRevenue = weeklyBills.reduce((sum, bill) => sum + bill.grand, 0)
    + weeklyRevenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.grand, 0)
    + monthlyRevenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const yearlyRevenue = yearlyBills.reduce((sum, bill) => sum + bill.grand, 0)
    + yearlyRevenueEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const lowStock = products.filter(product => product.stock <= 5);
  const soldProducts = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
  const topProduct = soldProducts[0] || null;
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
  const monthlyExpenseTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const estimatedProfit = (monthlyRevenue * 0.12) - monthlyExpenseTotal;

  const salesTrendData = {
    labels: ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'Sales (\u20B9)',
        data: [12000, 15000, 8000, 19000, 22000, 17000, todaySales],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const topProductsData = {
    labels: products.slice(0, 5).map(product => product.name.split(' ')[0]),
    datasets: [
      {
        label: 'Units Sold',
        data: products.slice(0, 5).map(product => product.sold || 0),
        backgroundColor: ['#f97316', '#22c55e', '#2363eb', '#7c3aed', '#dc2626']
      }
    ]
  };

  return (
    <div>
      <div className="grid grid-4 mb-4">
        <div className="stat-card dashboard-summary-card orange">
          <div className="stat-label">Today Sales</div>
          <div className="stat-value">{formatCurrency(todaySales)}</div>
          <div className="stat-sub">{todayBills.length} bills today</div>
          <div className="stat-icon">💰</div>
        </div>
        <div className="stat-card dashboard-summary-card green">
          <div className="stat-label">Bills Today</div>
          <div className="stat-value">{todayBills.length}</div>
          <div className="stat-sub">Total {bills.length} all time</div>
          <div className="stat-icon">🧾</div>
        </div>
        <div className="stat-card dashboard-summary-card blue">
          <div className="stat-label">Top Product</div>
          <div className="stat-value dashboard-text-stat">{topProduct ? topProduct.name : 'No sales yet'}</div>
          <div className="stat-sub">{topProduct ? `${topProduct.sold || 0} units sold` : 'Waiting for sales data'}</div>
          <div className="stat-icon">🏆</div>
        </div>
        <div className="stat-card dashboard-summary-card red">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-sub">{products.filter(product => product.stock === 0).length} out of stock</div>
          <div className="stat-icon">⚠️</div>
        </div>
      </div>

      <div className="grid grid-4 mb-4">
        <div className="stat-card dashboard-summary-card purple">
          <div className="stat-label">Weekly Revenue</div>
          <div className="stat-value">{formatCurrency(weeklyRevenue)}</div>
          <div className="stat-sub">{weeklyBills.length} bills</div>
          <div className="stat-icon">🗓️</div>
        </div>
        <div className="stat-card dashboard-summary-card orange">
          <div className="stat-label">Monthly Revenue</div>
          <div className="stat-value">{formatCurrency(monthlyRevenue)}</div>
          <div className="stat-sub">This month</div>
          <div className="stat-icon">🗓️</div>
        </div>
        <div className="stat-card dashboard-summary-card green">
          <div className="stat-label">Yearly Revenue</div>
          <div className="stat-value">{formatCurrency(yearlyRevenue)}</div>
          <div className="stat-sub">This year</div>
          <div className="stat-icon">🗓️</div>
        </div>
        <div className="stat-card dashboard-summary-card orange">
          <div className="stat-label">Profit Est.</div>
          <div className="stat-value">{formatCurrency(estimatedProfit)}</div>
          <div className="stat-sub">-12% margin est.</div>
          <div className="stat-icon">📊</div>
        </div>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="section-title">Sales Trend</div>
          <div style={{ height: '220px' }}>
            <Line data={salesTrendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">Top Products</div>
          <div style={{ height: '220px' }}>
            <Bar data={topProductsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="grid grid-3 mb-4">
        <div className="stat-card blue">
          <div className="stat-label">Stock Value</div>
          <div className="stat-value">{formatCurrency(totalInventoryValue)}</div>
          <div className="stat-sub">Current on-hand</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Revenue Entries</div>
          <div className="stat-value">{revenueEntries.length}</div>
          <div className="stat-sub">Manual revenue rows saved</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value">{formatCurrency(monthlyExpenseTotal)}</div>
          <div className="stat-sub">Tracked this month</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Recent Transactions</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {bills.slice(0, 5).map(bill => (
                <tr key={bill.id}>
                  <td><b>{bill.billNo}</b></td>
                  <td>{bill.customer}</td>
                  <td className="fw-bold">{formatCurrency(bill.grand)}</td>
                  <td><span className="badge badge-blue">{bill.payment}</span></td>
                  <td className="text-muted text-xs">{new Date(bill.date).toLocaleTimeString()}</td>
                </tr>
              ))}
              {bills.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted">No transactions yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
