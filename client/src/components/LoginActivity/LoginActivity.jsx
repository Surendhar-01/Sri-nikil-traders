import React, { useState } from 'react';
import ClearConfirmModal from '../ClearConfirmModal';
import './LoginActivity.css';

export default function LoginActivity({ db, erp }) {
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const loginLogs = (Array.isArray(db?.loginLogs) ? db.loginLogs : []).filter(
    (log) => String(log.role || '').toLowerCase() !== 'admin'
  );

  const handleDeleteLog = async (id) => {
    if (!id || deletingId === id) {
      return;
    }
    setDeletingId(id);

    try {
      await erp.deleteLoginLog(id);
    } catch (error) {
      alert(error.message || 'Failed to delete login log');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearLogs = async () => {
    if (!loginLogs.length || isClearing) {
      return;
    }

    setIsClearing(true);
    try {
      await erp.clearLoginLogs();
      setShowClearConfirm(false);
    } catch (error) {
      alert(error.message || 'Failed to clear login activity');
    } finally {
      setIsClearing(false);
    }
  };

  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="card login-activity-page">
      <div className="flex items-center justify-between gap-3 mb-3 login-activity-header">
        <div className="section-title login-activity-title">Login Activity</div>
        <button
          className="btn btn-danger btn-sm"
          type="button"
          onClick={() => setShowClearConfirm(true)}
          disabled={!loginLogs.length || isClearing}
        >
          {isClearing ? 'Clearing...' : 'Clear All'}
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
              <tr><th>User</th><th>Role</th><th>Login</th><th>Logout</th><th>Duration</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loginLogs.map((log) => {
                const duration = log.logoutTime
                  ? formatDuration(log.loginTime, log.logoutTime)
                  : '-';

                return (
                  <tr key={log.id}>
                    <td><b>{log.user}</b></td>
                    <td><span className={`badge ${log.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>{log.role}</span></td>
                    <td className="text-xs">{new Date(log.loginTime).toLocaleString()}</td>
                    <td className="text-xs">{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : '-'}</td>
                    <td>{duration}</td>
                    <td>{log.logoutTime ? <span className="badge badge-gray">Ended</span> : <span className="badge badge-green">Online</span>}</td>
                    <td>
                      <button
                        className="del-btn"
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingId === log.id}
                      >
                        {deletingId === log.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ClearConfirmModal
        open={showClearConfirm}
        loading={isClearing}
        title="Clear Login Activity"
        message="Clear all login activity records permanently?"
        confirmLabel="Clear All"
        onConfirm={handleClearLogs}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
