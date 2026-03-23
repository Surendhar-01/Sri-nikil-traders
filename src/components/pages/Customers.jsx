import React from 'react';

export default function Customers({ db }) {
  return (
    <div className="card">
      <div className="section-title">👥 Customer Database</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Visits</th><th>Total Revenue</th><th>Last Visit</th><th>Type</th></tr>
          </thead>
          <tbody>
            {db.customers.sort((a,b)=>b.total-a.total).map(c => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td>
                <td>{c.phone || '—'}</td>
                <td>{c.visits}</td>
                <td className="fw-bold text-green">₹{c.total.toFixed(2)}</td>
                <td className="text-muted text-xs">{new Date(c.lastVisit).toLocaleDateString()}</td>
                <td>{c.visits > 1 ? <span className="badge badge-green">Returning</span> : <span className="badge badge-blue">New</span>}</td>
              </tr>
            ))}
            {db.customers.length === 0 && <tr><td colSpan="6" className="text-center text-muted">No customers recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
