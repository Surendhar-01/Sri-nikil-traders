import React from 'react';

export default function Stock({ db, erp }) {
  const handleRefill = (productName) => {
    const qty = prompt(`Enter quantity to add for ${productName}:`);
    if (qty && !isNaN(qty)) {
      erp.addRefill({
        id: Date.now(),
        date: new Date().toISOString(),
        product: productName,
        qty: parseInt(qty),
        by: 'Admin'
      });
      alert('Stock refilled!');
    }
  };

  return (
    <div className="card">
      <div className="section-title">📈 Stock Management</div>
      <div className="table-wrap mb-6">
        <table>
          <thead><tr><th>Product</th><th>Opening</th><th>Sold</th><th>Current</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {db.products.map(p => (
              <tr key={p.id}>
                <td><b>{p.name}</b></td>
                <td>{p.stock + (p.sold || 0)}</td>
                <td className="text-red">{p.sold || 0}</td>
                <td className="fw-bold">{p.stock}</td>
                <td>{p.stock <= 5 ? <span className="badge badge-red">Refill Due</span> : <span className="badge badge-green">Healthy</span>}</td>
                <td><button className="btn btn-sm btn-secondary" onClick={() => handleRefill(p.name)}>➕ Refill</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-title">📜 Refill History</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>By</th></tr></thead>
          <tbody>
            {db.refills.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.product}</td>
                <td className="text-green fw-bold">+{r.qty}</td>
                <td>{r.by}</td>
              </tr>
            ))}
            {db.refills.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No refill history</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
