import React, { useState } from 'react';

export default function Suppliers({ db, erp, user }) {
  const [showSuppModal, setShowSuppModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ supplier: '', product: '', qty: 0, amount: 0 });

  const handleRecordPurchase = () => {
    if (!newPurchase.supplier || !newPurchase.product || !newPurchase.qty || !newPurchase.amount) return;
    erp.addPurchase({
      id: Date.now(),
      date: new Date().toISOString(),
      ...newPurchase,
      qty: parseInt(newPurchase.qty),
      amount: parseFloat(newPurchase.amount),
      by: user.user
    });
    // Also record as expense automatically
    erp.addExpense({
      id: Date.now() + 1,
      date: new Date().toISOString(),
      category: 'Purchase',
      desc: `Paid to ${newPurchase.supplier} for ${newPurchase.product}`,
      amount: parseFloat(newPurchase.amount),
      by: user.user
    });
    alert('Purchase recorded and stock updated!');
    setShowPurchaseModal(false);
    setNewPurchase({ supplier: '', product: '', qty: 0, amount: 0 });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title" style={{ margin: 0 }}>🚚 Supplier Management</h2>
        <div className="flex gap-2">
          <button className="btn btn-blue" onClick={() => setShowPurchaseModal(true)}>📦 Record Purchase</button>
          <button className="btn btn-primary" onClick={() => setShowSuppModal(true)}>➕ Add Supplier</button>
        </div>
      </div>

      <div className="grid grid-2 mb-6">
        <div className="card">
          <div className="section-title">📜 Supplier List</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Supplier</th><th>Contact</th><th>Products</th><th>Total Paid</th><th>Action</th></tr></thead>
              <tbody>
                {db.suppliers.map(s => (
                  <tr key={s.id}>
                    <td><b>{s.name}</b><br/><span className="text-xs text-muted">{s.addr}</span></td>
                    <td>{s.contact}</td>
                    <td>{s.products}</td>
                    <td className="fw-bold">₹{s.total.toFixed(2)}</td>
                    <td><button className="btn btn-sm btn-secondary">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="section-title">🛒 Purchase History</div>
          <div className="table-wrap" style={{ maxHeight: '380px' }}>
            <table>
              <thead><tr><th>Date</th><th>Supplier</th><th>Product</th><th>Amount</th></tr></thead>
              <tbody>
                {db.purchases.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.supplier}</td>
                    <td>{p.qty} {p.product}</td>
                    <td>₹{p.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {db.purchases.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No history</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPurchaseModal && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: '450px' }}>
            <div className="modal-header"><h3>Record Purchase</h3><button onClick={() => setShowPurchaseModal(false)}>✕</button></div>
            <div className="form-group mb-3">
              <label>Supplier</label>
              <select value={newPurchase.supplier} onChange={e=>setNewPurchase({...newPurchase, supplier: e.target.value})}>
                <option value="">-- Select --</option>
                {db.suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Product</label>
              <select value={newPurchase.product} onChange={e=>setNewPurchase({...newPurchase, product: e.target.value})}>
                <option value="">-- Select --</option>
                {db.products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-row mb-4">
              <div className="form-group"><label>Quantity</label><input type="number" value={newPurchase.qty} onChange={e=>setNewPurchase({...newPurchase, qty: e.target.value})} /></div>
              <div className="form-group"><label>Total Amount Paid</label><input type="number" value={newPurchase.amount} onChange={e=>setNewPurchase({...newPurchase, amount: e.target.value})} /></div>
            </div>
            <button className="btn btn-blue btn-full" onClick={handleRecordPurchase}>Confirm & Update Stock</button>
          </div>
        </div>
      )}
    </div>
  );
}
