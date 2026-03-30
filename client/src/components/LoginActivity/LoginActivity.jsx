import React, { useState } from 'react';
import './LoginActivity.css';

export default function LoginActivity({ db, erp }) {
  const [isClearing, setIsClearing] = useState(false);
  const loginLogs = (Array.isArray(db?.loginLogs) ? db.loginLogs : []).filter(
    (log) => String(log.role || '').toLowerCase() !== 'admin'
  );

  const handleClearLogs = async () => {
    if (loginLogs.length === 0 || isClearing) {
      return;
    }

    const confirmed = window.confirm('Clear all login activity records? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setIsClearing(true);

    try {
      await erp.clearLoginLogs();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="card login-activity-page">
      <div className="flex items-center justify-between gap-3 mb-3 login-activity-header">
        <div className="section-title login-activity-title">Login Activity</div>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleClearLogs}
          disabled={loginLogs.length === 0 || isClearing}
        >
          {isClearing ? 'Clearing...' : 'Clear Activity'}
        </button>
      </div>

      {loginLogs.length === 0 ? (
        <div className="empty-state login-activity-empty">
          <div className="icon login-activity-empty-icon">No staff activity yet</div>
          <div>No staff login records are available.</div>
        </div>
      ) : (
        <div className="table-wrap login-activity-table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Login</th><th>Logout</th><th>Duration</th><th>Device</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loginLogs.map((log) => {
                const duration = log.logoutTime
                  ? `${Math.floor((new Date(log.logoutTime) - new Date(log.loginTime)) / 60000)}m`
                  : '-';

                return (
                  <tr key={log.id}>
                    <td><b>{log.user}</b></td>
                    <td><span className={`badge ${log.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{log.role}</span></td>
                    <td className="text-xs">{new Date(log.loginTime).toLocaleString()}</td>
                    <td className="text-xs">{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : '-'}</td>
                    <td>{duration}</td>
                    <td className="text-muted text-xs">{log.device}</td>
                    <td>{log.logoutTime ? <span className="badge badge-gray">Ended</span> : <span className="badge badge-green">Online</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
