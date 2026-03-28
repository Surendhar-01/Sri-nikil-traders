import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './Expenses.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const demoExpenses = [
  { id: 1, date: '2026-03-10T09:15:00.000Z', category: 'Transport', desc: 'Delivery van diesel refill', amount: 2450, by: 'admin' },
  { id: 2, date: '2026-03-14T12:30:00.000Z', category: 'Shop', desc: 'Packing covers and carry bags', amount: 1180, by: 'staff' },
  { id: 3, date: '2026-03-21T16:45:00.000Z', category: 'Maintenance', desc: 'Billing printer service', amount: 900, by: 'admin' }
];

function formatCurrency(amount) {
  return `\u20B9${Number(amount || 0).toFixed(2)}`;
}

export default function Expenses({ db, erp, user }) {
  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({ category: 'Transport', desc: '', amount: '' });

  const revenueEntries = db.revenueEntries || [];
  const expenses = db.expenses && db.expenses.length > 0 ? db.expenses : demoExpenses;

  useEffect(() => {
    if (!showExpModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowExpModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showExpModal]);

  const handleAddExpense = () => {
    if (!newExp.amount) {
      return;
    }

    erp.addExpense({
      id: Date.now(),
      date: new Date().toISOString(),
      ...newExp,
      amount: parseFloat(newExp.amount),
      by: user.user
    });

    setShowExpModal(false);
    setNewExp({ category: 'Transport', desc: '', amount: '' });
  };

  const months = [];
  const salesData = [];
  const expenseData = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    months.push(date.toLocaleDateString('en-IN', { month: 'short' }));

    const monthlySales = db.bills
      .filter((bill) => bill.date.startsWith(monthKey))
      .reduce((sum, bill) => sum + bill.grand, 0);

    const monthlyRevenueEntries = revenueEntries
      .filter((entry) => entry.date.startsWith(monthKey))
      .reduce((sum, entry) => sum + entry.amount, 0);

    const monthlyExpenses = expenses
      .filter((expense) => expense.date.startsWith(monthKey))
      .reduce((sum, expense) => sum + expense.amount, 0);

    salesData.push(monthlySales + monthlyRevenueEntries);
    expenseData.push(monthlyExpenses);
  }

  const chartData = {
    labels: months,
    datasets: [
      { label: 'Revenue', data: salesData, backgroundColor: '#22c55e' },
      { label: 'Expenses', data: expenseData, backgroundColor: '#dc2626' }
    ]
  };

  return (
    <div className="expenses-page">
      <div className="flex justify-between items-center expenses-header">
        <h2 className="section-title expenses-title">Business Expenses</h2>
        <button className="btn btn-danger" onClick={() => setShowExpModal(true)}>Record Expense</button>
      </div>

      <div className="grid grid-2">
        <div className="card expenses-card">
          <div className="section-title">Revenue vs Expenses</div>
          <div className="expenses-chart">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card expenses-card">
          <div className="section-title">Expense Log</div>
          <div className="table-wrap expenses-log-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td><span className="badge badge-orange">{expense.category}</span></td>
                    <td className="text-red fw-bold">{formatCurrency(expense.amount)}</td>
                    <td className="text-muted text-xs">{expense.by}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No expenses recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showExpModal && (
        <div className="modal-overlay open">
          <div className="modal expenses-modal">
            <div className="modal-header">
              <h3>Add Expense</h3>
              <button className="modal-close" onClick={() => setShowExpModal(false)}>x</button>
            </div>
            <div className="form-group mb-3">
              <label>Category</label>
              <select value={newExp.category} onChange={(event) => setNewExp({ ...newExp, category: event.target.value })}>
                <option>Transport</option>
                <option>Rent</option>
                <option>Electricity</option>
                <option>Labour</option>
                <option>Purchase</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Description</label>
              <input
                value={newExp.desc}
                onChange={(event) => setNewExp({ ...newExp, desc: event.target.value })}
                placeholder="What was it for?"
              />
            </div>
            <div className="form-group mb-4">
              <label>Amount (\u20B9)</label>
              <input
                type="number"
                value={newExp.amount}
                onChange={(event) => setNewExp({ ...newExp, amount: event.target.value })}
                placeholder="0.00"
              />
            </div>
            <button className="btn btn-danger btn-full" onClick={handleAddExpense}>Save Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}
