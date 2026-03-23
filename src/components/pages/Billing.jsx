import React, { useState } from 'react';

export default function Billing({ erp, user }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [qty, setQty] = useState(1);
  const [customer, setCustomer] = useState('Walk-in');
  const [phone, setPhone] = useState('');
  const [payment, setPayment] = useState('Cash');

  const { db, addBill } = erp;

  const filteredProducts = db.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product) => {
    const newItem = {
       id: product.id,
       name: product.name,
       qty: parseInt(qty),
       price: product.price,
       total: product.price * parseInt(qty)
    };
    setItems([...items, newItem]);
    setSearchTerm('');
    setQty(1);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstRate = db.settings.gst / 100;
  const netSubtotal = subtotal / (1 + gstRate);
  const gstAmt = subtotal - netSubtotal;
  const grandTotal = subtotal;

  const handleSaveBill = () => {
    if (items.length === 0) return alert('Cart is empty!');
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

  const downloadPDF = () => {
    if (items.length === 0) return alert('No items to print!');
    const s = db.settings;
    const html = `<!DOCTYPE html><html><head><style>body{font-family:Arial;margin:20px}h2{text-align:center;color:#f97316}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;font-size:12px}th{background:#f5f5f5}.total{text-align:right}.grand{font-weight:bold;font-size:14px}</style></head><body>
    <h2>${s.shop}</h2><p style="text-align:center">${s.addr}<br>GSTIN: ${s.gstin} | FSSAI: ${s.fssai} | Ph: ${s.phone}</p>
    <hr><table style="width:100%;border:none;margin-bottom:10px"><tr><td><b>Bill No:</b> SNT-${db.billSeq}</td><td style="text-align:right"><b>Date:</b> ${new Date().toLocaleString()}</td></tr>
    <tr><td><b>Customer:</b> ${customer}</td><td style="text-align:right"><b>Payment:</b> ${payment}</td></tr></table>
    <table><tr><th>#</th><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
    ${items.map((i, n) => `<tr><td>${n + 1}</td><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.total}</td></tr>`).join('')}
    <tr><td colspan="4" class="total">Subtotal</td><td>₹${netSubtotal.toFixed(2)}</td></tr>
    <tr><td colspan="4" class="total">CGST @2.5%</td><td>₹${(gstAmt/2).toFixed(2)}</td></tr>
    <tr><td colspan="4" class="total">SGST @2.5%</td><td>₹${(gstAmt/2).toFixed(2)}</td></tr>
    <tr class="grand"><td colspan="4" class="total">GRAND TOTAL</td><td>₹${grandTotal.toFixed(2)}</td></tr>
    </table><br><p style="text-align:center">Thank you for your purchase!</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Bill_${db.billSeq}.html`;
    a.click();
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="card mb-4 no-print">
          <div className="bill-header">
            <div className="bill-shop-name">🛢️ {db.settings.shop}</div>
            <div className="bill-address">{db.settings.addr}<br/>Ph: {db.settings.phone}</div>
          </div>
          <div className="form-row mb-3">
            <div className="form-group"><label>Bill No</label><input readOnly value={`SNT-${String(db.billSeq).padStart(4, '0')}`} style={{ color: 'var(--accent)', fontWeight: 700 }} /></div>
            <div className="form-group"><label>Date</label><input readOnly value={new Date().toLocaleString()} /></div>
            <div className="form-group"><label>Payment</label>
              <select value={payment} onChange={e=>setPayment(e.target.value)}>
                <option>Cash</option><option>UPI</option><option>Card</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Customer Name</label><input value={customer} onChange={e=>setCustomer(e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input value={phone} onChange={e=>setPhone(e.target.value)} maxLength="10" /></div>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="card shadow-sm">
            <div className="section-title">📦 Add Product</div>
            <div className="form-group mb-3" style={{ position: 'relative' }}>
              <div className="flex gap-2">
                <input 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: 2 }}
                />
                <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min="1" style={{ width: '70px' }} />
              </div>
              {searchTerm && (
                <div className="card shadow" style={{ position: 'absolute', width: '100%', zIndex: 10, marginTop: '2px', padding: '0', maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredProducts.map(p => (
                    <div key={p.id} className="nav-item" onClick={() => addItem(p)} style={{ padding: '10px 15px', borderBottom: '1px solid var(--border)' }}>
                      {p.name} <span className="text3" style={{ marginLeft: 'auto' }}>₹{p.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span className="text-muted text-xs w-full mb-1">⚡ Quick Add</span>
              {db.products.slice(0, 10).map(p => (
                <div key={p.id} className="chip" onClick={() => addItem(p)} style={{ fontSize: '.75rem' }}>
                  {p.name.split(' ')[0]} {p.name.split(' ').slice(-1)}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
             <div className="section-title">🛒 Cart Items</div>
             <div className="table-wrap mb-3" style={{ maxHeight: '250px' }}>
               <table>
                 <thead><tr><th>Item</th><th>Qty</th><th>Total</th><th></th></tr></thead>
                 <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontSize: '.8rem' }}>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>₹{item.total}</td>
                        <td><button className="text-red" onClick={() => removeItem(idx)}>✕</button></td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
             <div className="totals-box">
                <div className="total-row"><span>Subtotal:</span><span>₹{netSubtotal.toFixed(2)}</span></div>
                <div className="total-row"><span>GST @{db.settings.gst}%:</span><span>₹{gstAmt.toFixed(2)}</span></div>
                <div className="total-row grand"><span>Total:</span><span>₹{grandTotal.toFixed(2)}</span></div>
             </div>
             <div className="mt-4 flex gap-2">
                <button className="btn btn-primary flex-1" onClick={handleSaveBill}>💾 Save Bill</button>
                <button className="btn btn-blue" onClick={downloadPDF}>⬇️ PDF</button>
                <button className="btn btn-danger" onClick={() => setItems([])}>🗑️</button>
             </div>
          </div>
        </div>
      </div>

      <div className="card no-print" style={{ width: '280px' }}>
        <div className="section-title">🕒 Recent Bills</div>
        <div className="flex flex-column gap-2" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {db.bills.slice(0, 10).map(bill => (
            <div key={bill.id} className="card bg3 border-radius mb-1" style={{ padding: '10px' }}>
              <div className="flex justify-between mb-1">
                <b className="text-accent text-sm">{bill.billNo}</b>
                <span className="text-xs text-muted">{new Date(bill.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
    </div>
  );
}
