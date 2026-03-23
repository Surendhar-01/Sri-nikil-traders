import React from 'react';

export default function Sales({ db }) {
  return (
    <div className="card">
      <div className="section-title">📋 Sales History (All Bills)</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Issued By</th></tr>
          </thead>
          <tbody>
            {db.bills.map(b => (
              <tr key={b.id}>
                <td className="fw-bold text-accent">{b.billNo}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.customer}</td>
                <td className="fw-bold">₹{b.grand.toFixed(2)}</td>
                <td><span className="badge badge-blue">{b.payment}</span></td>
                <td className="text-muted text-xs">{b.by}</td>
              </tr>
            ))}
            {db.bills.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No sales yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
