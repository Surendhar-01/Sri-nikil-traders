import React from 'react';
import './Sales.css';

export default function Sales({ db }) {
  return (
    <div className="card sales-page">
      <div className="section-title sales-title">{'\u{1F4CB}'} Sales History (All Bills)</div>
      <div className="table-wrap sales-table">
        <table>
          <thead>
            <tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Issued By</th></tr>
          </thead>
          <tbody>
            {db.bills.map((bill) => (
              <tr key={bill.id}>
                <td className="fw-bold text-accent">{bill.billNo}</td>
                <td>{new Date(bill.date).toLocaleDateString()}</td>
                <td>{bill.customer}</td>
                <td className="fw-bold">{`\u20B9${bill.grand.toFixed(2)}`}</td>
                <td><span className="badge badge-blue">{bill.payment}</span></td>
                <td className="text-muted text-xs">{bill.by}</td>
              </tr>
            ))}
            {db.bills.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No sales yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
