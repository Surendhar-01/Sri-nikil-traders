import React, { useMemo, useState } from 'react';
import './Customers.css';

export default function Customers({ db }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('revenue-desc');

  const filteredAndSortedCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const customers = Array.isArray(db.customers) ? [...db.customers] : [];

    // 1. Filter
    const filtered = customers.filter((customer) => {
      // Search term (Name/Phone)
      const matchesSearch = 
        String(customer.name || '').toLowerCase().includes(normalizedSearch) ||
        String(customer.phone || '').includes(normalizedSearch);
      
      if (!matchesSearch) return false;

      // Date Range (Last Visit)
      const lastVisitStr = customer.lastVisit;
      if (!startDate && !endDate) return true; // No date filter applied

      if (!lastVisitStr) return false; // Date filter applied but no visit date exists
      
      const lastVisit = new Date(lastVisitStr);
      const afterStart = !startDate || lastVisit >= new Date(startDate);
      const beforeEnd = !endDate || lastVisit <= new Date(endDate + 'T23:59:59');

      return afterStart && beforeEnd;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'revenue-desc') return Number(b.total || 0) - Number(a.total || 0);
      if (sortBy === 'revenue-asc') return Number(a.total || 0) - Number(b.total || 0);
      
      const dateA = new Date(a.lastVisit || 0);
      const dateB = new Date(b.lastVisit || 0);
      if (sortBy === 'visit-newest') return dateB - dateA;
      if (sortBy === 'visit-oldest') return dateA - dateB;
      
      return 0;
    });

  }, [db.customers, searchTerm, startDate, endDate, sortBy]);

  return (
    <div className="card customers-page">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between gap-3 customers-header">
          <div className="section-title customers-title" style={{ margin: 0, border: 'none' }}>Customer Database</div>
          <div className="search-bar customers-search" style={{ flex: 1, maxWidth: '400px' }}>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or mobile number"
            />
          </div>
        </div>

        {/* New Filtration & Sorting Bar */}
        <div className="flex flex-wrap items-end gap-3 no-print customers-filters">
          <div className="control-group">
            <label>Last Visit From</label>
            <input 
              type="date" 
              className="form-control"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="control-group">
            <label>Last Visit To</label>
            <input 
              type="date" 
              className="form-control"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className="control-group" style={{ minWidth: '180px' }}>
            <label>Sort By</label>
            <select 
              className="form-control"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="revenue-desc">Total Revenue (High to Low)</option>
              <option value="revenue-asc">Total Revenue (Low to High)</option>
              <option value="visit-newest">Last Visit (Newest First)</option>
              <option value="visit-oldest">Last Visit (Oldest First)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrap customers-table">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Visits</th><th>Total Revenue</th><th>Last Visit</th><th>Type</th></tr>
          </thead>
          <tbody>
            {filteredAndSortedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td><b>{customer.name}</b></td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.visits}</td>
                <td className="fw-bold text-green">Rs {Number(customer.total || 0).toFixed(2)}</td>
                <td className="text-muted text-xs">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}</td>
                <td>{customer.visits > 1 ? <span className="badge badge-green">Returning</span> : <span className="badge badge-blue">New</span>}</td>
              </tr>
            ))}
            {filteredAndSortedCustomers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  No customers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
