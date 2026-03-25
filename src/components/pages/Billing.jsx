import React, { useEffect, useState } from 'react';

export default function Billing({ erp, user }) {
  const [items, setItems] = useState([]);
  const [viewBill, setViewBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('Cash');

  const { db, addBill } = erp;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setViewBill(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredProducts = db.products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product) => {
    const parsedQty = parseInt(qty, 10) || 1;
    const newItem = {
      id: product.id,
      name: product.name,
      qty: parsedQty,
      price: product.price,
      total: product.price * parsedQty
    };

    setItems([...items, newItem]);
    setSearchTerm('');
    setQty(1);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, currentIndex) => currentIndex !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstRate = db.settings.gst / 100;
  const netSubtotal = subtotal / (1 + gstRate || 1);
  const gstAmt = subtotal - netSubtotal;
  const grandTotal = subtotal;

  const handleSaveBill = () => {
    if (items.length === 0) return alert('Cart is empty!');
    if (!customer.trim()) return alert('Please enter Customer Name!');
    if (!phone.trim() || phone.length < 10) return alert('Valid 10-digit Mobile Number is required!');

    const bill = {
      id: db.billSeq,
      billNo: `SNT-${String(db.billSeq).padStart(4, '0')}`,
      date: new Date().toISOString(),
      customer,
      phone,
      payment,
      items,
      subtotal: netSubtotal,
      cgst: gstAmt / 2,
      sgst: gstAmt / 2,
      grand: grandTotal,
      by: user.user
    };

    addBill(bill);
    alert('Bill Saved Successfully!');
    setItems([]);
  };

  const printBill = () => {
    if (items.length === 0) return alert('No items to print!');
    if (!customer.trim()) return alert('Please enter Customer Name!');
    if (!phone.trim() || phone.length < 10) return alert('Valid 10-digit Mobile Number is required!');

    const settings = db.settings;
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Ubuntu', sans-serif; width: 300px; margin: 0 auto; padding: 10px; color: #000; font-size: 13px; line-height: 1.4; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .title { font-size: 18px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; }
    th, td { padding: 4px 0; border-bottom: 1px dashed #ccc; font-size: 12px; }
    th { text-align: left; }
    .right { text-align: right; border-bottom: none; }
    td.right, th.right { border-bottom: 1px dashed #ccc; }
    .totals { border-top: 2px dashed #000; padding-top: 5px; margin-top: 10px; }
    .grand { font-size: 15px; font-weight: bold; margin-top: 4px; }
    .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
    @media print {
      body { width: 100%; margin: 0; padding: 0; }
      @page { margin: 0; }
    }
  </style>
</head>
<body onload="setTimeout(() => { window.print(); window.close(); }, 300)">
  <div class="center bold title">${settings.shop}</div>
  <div class="center">${settings.addr}</div>
  <div class="center">Ph: ${settings.phone}</div>
  <div class="divider"></div>
  <div><b>Bill No:</b> SNT-${String(db.billSeq).padStart(4, '0')}</div>
  <div><b>Date:</b> ${new Date().toLocaleString()}</div>
  <div><b>Customer:</b> ${customer}</div>
  <div class="divider"></div>
  <table>
    <tr><th>Item</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amt</th></tr>
    ${items.map(item => `<tr><td>${item.name.split(' ').slice(0, 3).join(' ')}</td><td class="right">${item.qty}</td><td class="right">${item.price}</td><td class="right">${item.total}</td></tr>`).join('')}
  </table>
  <div class="totals">
    <div style="display:flex; justify-content:space-between"><span>Subtotal:</span><span>₹${netSubtotal.toFixed(2)}</span></div>
    <div style="display:flex; justify-content:space-between"><span>CGST:</span><span>₹${(gstAmt / 2).toFixed(2)}</span></div>
    <div style="display:flex; justify-content:space-between"><span>SGST:</span><span>₹${(gstAmt / 2).toFixed(2)}</span></div>
    <div style="display:flex; justify-content:space-between" class="grand"><span>TOTAL:</span><span>₹${grandTotal.toFixed(2)}</span></div>
  </div>
  <div class="divider"></div>
  <div class="center bold">Thank You! Visit Again</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="card mb-4 no-print">
          <div className="bill-header">
            <div className="bill-shop-name gold-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <img src="/logo.svg" alt="Logo" style={{ height: '32px' }} />
              {db.settings.shop}
            </div>
            <div className="bill-address">{db.settings.addr}<br />Ph: {db.settings.phone}</div>
          </div>
          <div className="form-row mb-3">
            <div className="form-group"><label>Bill No</label><input readOnly value={`SNT-${String(db.billSeq).padStart(4, '0')}`} style={{ color: 'var(--accent)', fontWeight: 700 }} /></div>
            <div className="form-group"><label>Date</label><input readOnly value={new Date().toLocaleString()} /></div>
            <div className="form-group"><label>Payment</label>
              <select value={payment} onChange={event => setPayment(event.target.value)}>
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Customer Name <span className="text-red" title="Required">*</span></label><input value={customer} onChange={event => setCustomer(event.target.value)} placeholder="Required" /></div>
            <div className="form-group"><label>Mobile No <span className="text-red" title="Required">*</span></label><input value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} maxLength="10" placeholder="10 Digits Required" /></div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Add Product</div>
          <div className="form-group mb-3" style={{ position: 'relative' }}>
            <div className="flex gap-2">
              <input
                placeholder="Search products..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                style={{ flex: 1 }}
              />
              <input type="number" value={qty} onChange={event => setQty(event.target.value)} min="1" style={{ width: '90px' }} />
            </div>
            {searchTerm && (
              <div className="card shadow" style={{ position: 'absolute', width: '100%', zIndex: 10, marginTop: '2px', padding: '0', maxHeight: '200px', overflowY: 'auto' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} className="nav-item" onClick={() => addItem(product)} style={{ padding: '10px 15px', borderBottom: '1px solid var(--border)' }}>
                    {product.name} <span style={{ marginLeft: 'auto' }}>₹{product.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
            <div className="text-muted text-sm mb-2">Quick Add</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {db.products.slice(0, 8).map(product => (
                <div key={product.id} className="chip" onClick={() => addItem(product)} style={{ fontSize: '.85rem' }}>
                  {product.name.split(' ')[0]} {product.name.split(' ').slice(-1)}
                </div>
              ))}
            </div>
          </div>

          <div className="table-wrap mb-3">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: '.8rem' }}>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.total}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="del-btn" onClick={() => removeItem(index)} title="Remove Item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 01 2-2h4a2 2 0 01 2 2v2M10 11v6M14 11v6"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">No cart items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="totals-box">
            <div className="total-row"><span>Subtotal:</span><span>₹{netSubtotal.toFixed(2)}</span></div>
            <div className="total-row"><span>CGST @{(db.settings.gst / 2).toFixed(1)}%:</span><span>₹{(gstAmt / 2).toFixed(2)}</span></div>
            <div className="total-row"><span>SGST @{(db.settings.gst / 2).toFixed(1)}%:</span><span>₹{(gstAmt / 2).toFixed(2)}</span></div>
            <div className="total-row grand"><span>Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary" onClick={handleSaveBill}>Save Bill</button>
            <button className="btn btn-blue" onClick={printBill}>Print</button>
            <button className="btn btn-danger" onClick={() => setItems([])}>Clear</button>
          </div>
        </div>
      </div>

      <div className="card no-print" style={{ width: '380px', minWidth: '380px' }}>
        <div className="section-title">Recent Bills</div>
        <div className="flex flex-column gap-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {db.bills.slice(0, 10).map(bill => (
            <div key={bill.id} className="card bg3 border-radius mb-1" style={{ padding: '10px', cursor: 'pointer', transition: '0.2s', border: '1px solid var(--border)' }} onClick={() => setViewBill(bill)} title="Click to view details">
              <div className="flex justify-between items-center mb-1">
                <b className="text-accent text-sm">{bill.billNo}</b>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <button className="del-btn" style={{ padding: '2px', color: 'var(--red)', width: 'auto', height: 'auto' }} onClick={(event) => { event.stopPropagation(); if (confirm('Are you sure you want to completely delete this bill? Stock quantities will be reverted.')) erp.deleteBill(bill.id); }} title="Delete Bill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 01 2-2h4a2 2 0 01 2 2v2M10 11v6M14 11v6"></path></svg>
                  </button>
                </div>
              </div>
              <div className="text-sm fw-600">{bill.customer}</div>
              <div className="flex justify-between mt-2">
                <span className="badge badge-green text-xs" style={{ padding: '1px 6px' }}>{bill.payment}</span>
                <b className="text-sm">₹{bill.grand.toFixed(2)}</b>
              </div>
            </div>
          ))}
          {db.bills.length === 0 && <div className="text-center text-muted text-sm mt-4">No recent bills</div>}
        </div>
      </div>

      {viewBill && (
        <div className="modal-overlay open" onClick={() => setViewBill(null)} style={{ padding: '20px' }}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, color: 'var(--text)' }}>Bill Details</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>{viewBill.billNo}</div>
              </div>
              <button className="modal-close" onClick={() => setViewBill(null)}>×</button>
            </div>

            <div style={{ paddingBottom: '15px', borderBottom: '1px solid var(--border)', marginBottom: '15px' }}>
              <div className="grid grid-2 text-sm" style={{ gap: '8px' }}>
                <div><span className="text-muted">Date:</span> <b>{new Date(viewBill.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</b></div>
                <div><span className="text-muted">Customer:</span> <b>{viewBill.customer}</b></div>
                <div><span className="text-muted">Phone:</span> <b>{viewBill.phone || 'N/A'}</b></div>
                <div><span className="text-muted">Payment:</span> <span className="badge badge-green">{viewBill.payment}</span></div>
                <div><span className="text-muted">Billed By:</span> <b>{viewBill.by || 'System'}</b></div>
              </div>
            </div>

            <div className="table-wrap mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewBill.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="totals-box mb-4">
              <div className="total-row"><span>Subtotal:</span><span>₹{viewBill.subtotal.toFixed(2)}</span></div>
              <div className="total-row"><span>CGST:</span><span>₹{viewBill.cgst.toFixed(2)}</span></div>
              <div className="total-row"><span>SGST:</span><span>₹{viewBill.sgst.toFixed(2)}</span></div>
              <div className="total-row grand"><span>Total:</span><span>₹{viewBill.grand.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-end items-center mt-2">
              <button className="btn btn-secondary" onClick={() => setViewBill(null)} style={{ padding: '8px 24px' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
