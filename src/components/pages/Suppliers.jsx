import React, { useEffect, useState } from 'react';

export default function Suppliers({ db, erp, user }) {
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ supplier: '', product: '', qty: 0, amount: 0 });
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', products: '', addr: '' });
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSupplierModal(false);
        setShowPurchaseModal(false);
        setShowEditModal(false);
      }
    };

    const hasOpenModal = showSupplierModal || showPurchaseModal || showEditModal;
    if (!hasOpenModal) {
      return undefined;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSupplierModal, showPurchaseModal, showEditModal]);

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim()) {
      return;
    }

    const createdSupplier = {
      id: Date.now(),
      name: newSupplier.name.trim(),
      contact: newSupplier.contact.trim(),
      products: newSupplier.products.trim(),
      addr: newSupplier.addr.trim(),
      total: 0
    };

    erp.updateDb('suppliers', [...db.suppliers, createdSupplier]);
    setShowSupplierModal(false);
    setNewSupplier({ name: '', contact: '', products: '', addr: '' });
  };

  const handleRecordPurchase = () => {
    if (!newPurchase.supplier || !newPurchase.product || !newPurchase.qty || !newPurchase.amount) {
      return;
    }

    erp.addPurchase({
      id: Date.now(),
      date: new Date().toISOString(),
      ...newPurchase,
      qty: parseInt(newPurchase.qty, 10),
      amount: parseFloat(newPurchase.amount),
      by: user.user
    });

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

  const openEditModal = (supplier) => {
    setEditingSupplier({ ...supplier });
    setShowEditModal(true);
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier?.name?.trim()) {
      return;
    }

    const updatedSuppliers = db.suppliers.map((supplier) => (
      supplier.id === editingSupplier.id
        ? {
            ...supplier,
            name: editingSupplier.name.trim(),
            contact: editingSupplier.contact.trim(),
            products: editingSupplier.products.trim(),
            addr: editingSupplier.addr.trim()
          }
        : supplier
    ));

    erp.updateDb('suppliers', updatedSuppliers);
    setShowEditModal(false);
    setEditingSupplier(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title" style={{ margin: 0 }}>Supplier Management</h2>
        <div className="flex gap-2">
          <button className="btn btn-blue" onClick={() => setShowPurchaseModal(true)}>Record Purchase</button>
          <button className="btn btn-primary" onClick={() => setShowSupplierModal(true)}>Add Supplier</button>
        </div>
      </div>

      <div className="grid grid-2 mb-6">
        <div className="card">
          <div className="section-title">Supplier List</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Products</th>
                  <th>Total Paid</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {db.suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <b>{supplier.name}</b>
                      <br />
                      <span className="text-xs text-muted">{supplier.addr}</span>
                    </td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.products}</td>
                    <td className="fw-bold">₹{supplier.total.toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(supplier)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Purchase History</div>
          <div className="table-wrap" style={{ maxHeight: '380px' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Product</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {db.purchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.date).toLocaleDateString()}</td>
                    <td>{purchase.supplier}</td>
                    <td>{purchase.qty} {purchase.product}</td>
                    <td>₹{purchase.amount.toFixed(2)}</td>
                  </tr>
                ))}
                {db.purchases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No history</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showSupplierModal && (
        <div className="modal-overlay open" onClick={() => setShowSupplierModal(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Supplier</h3>
              <button className="modal-close" type="button" onClick={() => setShowSupplierModal(false)}>×</button>
            </div>

            <div className="form-group mb-3">
              <label>Supplier Name</label>
              <input
                value={newSupplier.name}
                onChange={event => setNewSupplier({ ...newSupplier, name: event.target.value })}
              />
            </div>

            <div className="form-row mb-3">
              <div className="form-group">
                <label>Contact</label>
                <input
                  value={newSupplier.contact}
                  onChange={event => setNewSupplier({ ...newSupplier, contact: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Products</label>
                <input
                  value={newSupplier.products}
                  onChange={event => setNewSupplier({ ...newSupplier, products: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label>Address</label>
              <textarea
                rows="3"
                value={newSupplier.addr}
                onChange={event => setNewSupplier({ ...newSupplier, addr: event.target.value })}
              />
            </div>

            <button className="btn btn-primary btn-full" type="button" onClick={handleAddSupplier}>Save Supplier</button>
          </div>
        </div>
      )}

      {showPurchaseModal && (
        <div className="modal-overlay open" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Purchase</h3>
              <button className="modal-close" type="button" onClick={() => setShowPurchaseModal(false)}>×</button>
            </div>
            <div className="form-group mb-3">
              <label>Supplier</label>
              <select value={newPurchase.supplier} onChange={event => setNewPurchase({ ...newPurchase, supplier: event.target.value })}>
                <option value="">-- Select --</option>
                {db.suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group mb-3">
              <label>Product</label>
              <select value={newPurchase.product} onChange={event => setNewPurchase({ ...newPurchase, product: event.target.value })}>
                <option value="">-- Select --</option>
                {db.products.map((product) => (
                  <option key={product.id} value={product.name}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="form-row mb-4">
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" value={newPurchase.qty} onChange={event => setNewPurchase({ ...newPurchase, qty: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Total Amount Paid</label>
                <input type="number" value={newPurchase.amount} onChange={event => setNewPurchase({ ...newPurchase, amount: event.target.value })} />
              </div>
            </div>
            <button className="btn btn-blue btn-full" type="button" onClick={handleRecordPurchase}>Confirm & Update Stock</button>
          </div>
        </div>
      )}

      {showEditModal && editingSupplier && (
        <div className="modal-overlay open" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Supplier</h3>
              <button className="modal-close" type="button" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <div className="form-group mb-3">
              <label>Supplier Name</label>
              <input
                value={editingSupplier.name}
                onChange={event => setEditingSupplier({ ...editingSupplier, name: event.target.value })}
              />
            </div>

            <div className="form-row mb-3">
              <div className="form-group">
                <label>Contact</label>
                <input
                  value={editingSupplier.contact}
                  onChange={event => setEditingSupplier({ ...editingSupplier, contact: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Products</label>
                <input
                  value={editingSupplier.products}
                  onChange={event => setEditingSupplier({ ...editingSupplier, products: event.target.value })}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label>Address</label>
              <textarea
                rows="3"
                value={editingSupplier.addr}
                onChange={event => setEditingSupplier({ ...editingSupplier, addr: event.target.value })}
              />
            </div>

            <button className="btn btn-primary btn-full" type="button" onClick={handleUpdateSupplier}>Update Supplier</button>
          </div>
        </div>
      )}
    </div>
  );
}
