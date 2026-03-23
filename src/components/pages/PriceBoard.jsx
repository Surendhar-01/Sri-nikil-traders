import React from 'react';

export default function PriceBoard({ db }) {
  return (
    <div className="price-board">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 style={{ margin: 0 }}>🛢️ Today's Oil Prices</h2>
          <div style={{ color: 'var(--accent)', fontSize: '.9rem' }}>Market rates updated live</div>
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{new Date().toLocaleString()}</div>
      </div>
      <div className="price-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {db.products.map(p => {
          const hist = db.priceHistory.find(h => h.product === p.name);
          const prev = hist ? hist.old : p.price;
          return (
            <div key={p.id} className="price-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="flex justify-between w-full">
                <div className="pname text-sm">{p.name}</div>
                <span className={`badge ${p.price > prev ? 'badge-red' : 'badge-green'}`} style={{ fontSize: '.6rem' }}>
                  {p.price > prev ? 'UP' : p.price < prev ? 'DOWN' : 'STABLE'}
                </span>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <div className="pprice" style={{ fontSize: '1.8rem' }}>₹{p.price.toFixed(0)}</div>
                {p.price !== prev && <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '.8rem', marginBottom: '4px' }}>₹{prev.toFixed(0)}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg3 border-radius text-center text-sm">
        Premium Quality Oil. Direct from Manufacturer.
      </div>
    </div>
  );
}
