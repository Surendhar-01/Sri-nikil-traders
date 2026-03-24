import React, { useState } from 'react';

export default function Stock({ db, erp, user }) {
  const [refillProduct, setRefillProduct] = useState(null);
  const [refillQty, setRefillQty] = useState('');

  const submitRefill = () => {
    if (!refillQty || isNaN(refillQty) || parseInt(refillQty) <= 0) {
      return alert('Enter a valid positive quantity');
    }
    erp.addRefill({
      id: Date.now(),
      date: new Date().toISOString(),
      product: refillProduct,
      qty: parseInt(refillQty),
      by: user ? user.user : 'Admin'
    });
    setRefillProduct(null);
    setRefillQty('');
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
                <td><button className="btn btn-sm btn-secondary" onClick={() => setRefillProduct(p.name)}>➕ Refill</button></td>
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
      {refillProduct && (
        <div className="modal-overlay open" onClick={() => { setRefillProduct(null); setRefillQty(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="section-title">📦 Refill Stock</div>
            <p className="text-sm mb-3">Add new stock inventory for <b>{refillProduct}</b></p>
            <div className="form-group mb-4">
              <label>Refill Quantity</label>
              <input 
                type="number" 
                value={refillQty} 
                onChange={(e) => setRefillQty(e.target.value)} 
                min="1" 
                placeholder="Enter quantity"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRefill();
                  if (e.key === 'Escape') { setRefillProduct(null); setRefillQty(''); }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary flex-1" onClick={submitRefill}>💾 Save Refill</button>
              <button className="btn btn-secondary" onClick={() => { setRefillProduct(null); setRefillQty(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
