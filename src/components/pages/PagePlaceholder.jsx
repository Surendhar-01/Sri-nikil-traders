import React from 'react';

export default function PagePlaceholder({ title }) {
  return (
    <div className="card">
      <div className="empty-state">
        <div className="icon">🚧</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
          {title} Page
        </div>
        <div>This section is currently under development.</div>
        <div className="mt-4">
          <button className="btn btn-secondary btn-sm">Refresh Status</button>
        </div>
      </div>
    </div>
  );
}
