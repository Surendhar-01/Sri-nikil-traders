import React, { useState } from 'react';

export default function Products({ db, erp }) {
  const [showModal, setShowModal] = useState(false);
  const [newProd, setNewProd] = useState({ code: '', name: '', cat: 'Groundnut', unit: 'tins', price: '', stock: '' });

  const handleAdd = () => {
    if (!newProd.name || !newProd.price) return;
    const products = [...db.products, {
      ...newProd,
      id: Date.now(),
      price: parseFloat(newProd.price),
      stock: parseInt(newProd.stock) || 0,
      sold: 0
    }];
    erp.updateDb('products', products);
    setShowModal(false);
  };

  const deleteProd = (id) => {
    if (confirm('Delete product?')) {
      erp.updateDb('products', db.products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title" style={{ margin: 0 }}>📦 Product Catalog</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Product +</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Code</th><th>Name</th><th>Category</th><th>Price (₹)</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {db.products.map(p => (
              <tr key={p.id}>
                <td className="fw-bold text-accent">{p.code}</td>
                <td className="text-sm">{p.name}</td>
                <td>{p.cat}</td>
                <td className="fw-bold">{p.price.toFixed(2)}</td>
                <td>{p.stock} {p.unit}</td>
                <td>
                  {p.stock === 0 ? <span className="badge badge-red">Out</span> : 
                   p.stock <= 5 ? <span className="badge badge-orange">Low</span> : 
                   <span className="badge badge-green">OK</span>}
                </td>
                <td>
                  <button className="text-red" onClick={() => deleteProd(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header"><h3>Add New Product</h3><button onClick={() => setShowModal(false)}>✕</button></div>
            <div className="form-group mb-3"><label>Product Name</label><input value={newProd.name} onChange={e=>setNewProd({...newProd, name: e.target.value})} /></div>
            <div className="form-row mb-3">
              <div className="form-group"><label>Code</label><input value={newProd.code} onChange={e=>setNewProd({...newProd, code: e.target.value})} /></div>
              <div className="form-group"><label>Category</label><select value={newProd.cat} onChange={e=>setNewProd({...newProd, cat: e.target.value})}><option>Groundnut</option><option>Sunflower</option><option>Palm</option><option>Sesame</option><option>Coconut</option></select></div>
            </div>
            <div className="form-row mb-4">
              <div className="form-group"><label>Price</label><input type="number" value={newProd.price} onChange={e=>setNewProd({...newProd, price: e.target.value})} /></div>
              <div className="form-group"><label>Initial Stock</label><input type="number" value={newProd.stock} onChange={e=>setNewProd({...newProd, stock: e.target.value})} /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleAdd}>Save Product</button>
          </div>
        </div>
      )}
    </div>
  );
}
