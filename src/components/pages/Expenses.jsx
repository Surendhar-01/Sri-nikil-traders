import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Expenses({ db, erp, user }) {
  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({ category: 'Transport', desc: '', amount: '' });

  const handleAddExpense = () => {
    if (!newExp.amount) return;
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

  // Profit Analysis Logic
  const months = [];
  const salesData = [];
  const expenseData = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7);
    months.push(d.toLocaleDateString('en-IN', { month: 'short' }));
    
    const monthlySales = db.bills
      .filter(b => b.date.startsWith(monthKey))
      .reduce((sum, b) => sum + b.grand, 0);
    
    const monthlyExpenses = db.expenses
      .filter(e => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + e.amount, 0);
    
    salesData.push(monthlySales);
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title" style={{ margin: 0 }}>💸 Business Expenses</h2>
        <button className="btn btn-danger" onClick={() => setShowExpModal(true)}>➕ Record Expense</button>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">📊 Revenue vs Expenses</div>
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">🧾 Expense Log</div>
          <div className="table-wrap" style={{ maxHeight: '300px' }}>
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>By</th></tr></thead>
              <tbody>
                {db.expenses.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td><span className="badge badge-orange">{e.category}</span></td>
                    <td className="text-red fw-bold">₹{e.amount.toFixed(2)}</td>
                    <td className="text-muted text-xs">{e.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showExpModal && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: '400px' }}>
            <div className="modal-header"><h3>Add Expense</h3><button onClick={() => setShowExpModal(false)}>✕</button></div>
            <div className="form-group mb-3">
              <label>Category</label>
              <select value={newExp.category} onChange={e=>setNewExp({...newExp, category: e.target.value})}>
                <option>Transport</option><option>Rent</option><option>Electricity</option><option>Labour</option><option>Purchase</option><option>Maintenance</option><option>Other</option>
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Description</label><input value={newExp.desc} onChange={e=>setNewExp({...newExp, desc: e.target.value})} placeholder="What was it for?" />
            </div>
            <div className="form-group mb-4">
              <label>Amount (₹)</label><input type="number" value={newExp.amount} onChange={e=>setNewExp({...newExp, amount: e.target.value})} placeholder="0.00" />
            </div>
            <button className="btn btn-danger btn-full" onClick={handleAddExpense}>Save Expense</button>
          </div>
        </div>
      )}
    </div>
  );
}
