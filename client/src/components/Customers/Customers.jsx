import React, { useMemo, useState } from 'react';
import './Customers.css';

export default function Customers({ db }) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedCustomers = useMemo(() => (
    [...(Array.isArray(db.customers) ? db.customers : [])].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))
  ), [db.customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return sortedCustomers;
    }

    return sortedCustomers.filter((customer) => (
      String(customer.name || '').toLowerCase().includes(normalizedSearch)
      || String(customer.phone || '').includes(normalizedSearch)
    ));
  }, [searchTerm, sortedCustomers]);

  return (
    <div className="card customers-page">
      <div className="flex items-center justify-between gap-3 mb-3 customers-header">
        <div className="section-title customers-title">Customer Database</div>
        <div className="search-bar customers-search">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by customer name or mobile number"
          />
        </div>
      </div>

      <div className="table-wrap customers-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Visits</th><th>Total Revenue</th><th>Last Visit</th><th>Type</th></tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td><b>{customer.name}</b></td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.visits}</td>
                <td className="fw-bold text-green">Rs {Number(customer.total || 0).toFixed(2)}</td>
                <td className="text-muted text-xs">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}</td>
                <td>{customer.visits > 1 ? <span className="badge badge-green">Returning</span> : <span className="badge badge-blue">New</span>}</td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  {searchTerm.trim() ? 'No customers match your search' : 'No customers recorded'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
