import React from 'react';

export default function Pricing({ db, erp, user }) {
  const handleUpdate = (id, currentPrice) => {
    const newPrice = prompt(`Update price for this product:`, currentPrice);
    if (newPrice && !isNaN(newPrice)) {
      erp.updateProductPrice(id, parseFloat(newPrice), user.user);
      alert('Price updated!');
    }
  };

  return (
    <div className="card">
      <div className="section-title">💰 Price Control & History</div>
      <div className="table-wrap mb-6">
        <table>
          <thead><tr><th>Product</th><th>Previous</th><th>Current</th><th>Trend</th><th>Action</th></tr></thead>
          <tbody>
            {db.products.map(p => {
              const hist = db.priceHistory.find(h => h.product === p.name);
              const prev = hist ? hist.old : p.price;
              const trend = p.price > prev ? '↑' : p.price < prev ? '↓' : '-';
              return (
                <tr key={p.id}>
                  <td><b>{p.name}</b></td>
                  <td className="text-muted">₹{prev.toFixed(2)}</td>
                  <td className="fw-bold text-accent">₹{p.price.toFixed(2)}</td>
                  <td className={p.price > prev ? 'text-red' : 'text-green'}>{trend}</td>
                  <td><button className="btn btn-sm btn-primary" onClick={() => handleUpdate(p.id, p.price)}>Update</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="section-title">📜 Price Change Log</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Product</th><th>Old</th><th>New</th><th>By</th></tr></thead>
          <tbody>
            {db.priceHistory.map(h => (
              <tr key={h.id}>
                <td className="text-xs">{new Date(h.date).toLocaleDateString()}</td>
                <td>{h.product}</td>
                <td className="text-muted">₹{h.old.toFixed(2)}</td>
                <td className="text-accent fw-bold">₹{h.new.toFixed(2)}</td>
                <td className="text-xs">{h.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
