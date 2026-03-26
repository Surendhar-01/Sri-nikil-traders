import React from 'react';

export default function LoginActivity({ db }) {
  return (
    <div className="card">
      <div className="section-title">🕐 Audit Logs: Login Activity</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>User</th><th>Role</th><th>Login</th><th>Logout</th><th>Duration</th><th>Device</th><th>Status</th></tr>
          </thead>
          <tbody>
            {db.loginLogs.map(l => {
              const duration = l.logoutTime ? Math.floor((new Date(l.logoutTime) - new Date(l.loginTime)) / 60000) + 'm' : '—';
              return (
                <tr key={l.id}>
                  <td><b>{l.user}</b></td>
                  <td><span className={`badge ${l.role==='Admin'?'badge-purple':'badge-blue'}`}>{l.role}</span></td>
                  <td className="text-xs">{new Date(l.loginTime).toLocaleString()}</td>
                  <td className="text-xs">{l.logoutTime ? new Date(l.logoutTime).toLocaleString() : '—'}</td>
                  <td>{duration}</td>
                  <td className="text-muted text-xs">{l.device}</td>
                  <td>{l.logoutTime ? <span className="badge badge-gray">Ended</span> : <span className="badge badge-green">Online</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
