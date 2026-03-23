import React, { useState } from 'react';

export default function Settings({ db, erp, user }) {
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ user: '', pass: '', role: 'Staff' });

  const handleSaveSettings = () => {
    alert('Settings saved to database!');
  };

  const addStaff = () => {
    if (!newStaff.user || !newStaff.pass) return;
    const accounts = [...db.accounts, newStaff];
    erp.updateDb('accounts', accounts);
    setShowStaffModal(false);
    setNewStaff({ user: '', pass: '', role: 'Staff' });
  };

  const deleteStaff = (username) => {
    if (username === 'admin') return;
    const accounts = db.accounts.filter(a => a.user !== username);
    erp.updateDb('accounts', accounts);
  };

  const backupDB = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `snt_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const restoreDB = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          erp.restoreDatabase(data);
          alert('Database restored successfully! Refreshing...');
          window.location.reload();
        } catch { alert('Invalid backup file!'); }
      };
      r.readAsText(f);
    };
    input.click();
  };

  return (
    <div className="grid grid-2">
      <div>
        <div className="card mb-4">
          <div className="section-title">🏪 Shop Details</div>
          <div className="form-group mb-2"><label>Shop Name</label><input defaultValue={db.settings.shop} /></div>
          <div className="form-group mb-2"><label>Address</label><textarea defaultValue={db.settings.addr} rows="2" /></div>
          <div className="form-group mb-2"><label>GSTIN</label><input defaultValue={db.settings.gstin} /></div>
          <div className="form-group mb-3"><label>Phone</label><input defaultValue={db.settings.phone} /></div>
          <button className="btn btn-primary" onClick={handleSaveSettings}>💾 Save Settings</button>
        </div>
        <div className="card">
          <div className="section-title">🗄️ Database Tools</div>
          <div className="flex gap-2">
            <button className="btn btn-blue flex-1" onClick={backupDB}>⬇️ Download Backup</button>
            <button className="btn btn-secondary flex-1" onClick={restoreDB}>🔄 Restore Database</button>
          </div>
          <p className="text-muted text-xs mt-3">⚠️ Restore will overwrite all current data.</p>
        </div>
      </div>
      <div>
        <div className="card mb-4">
          <div className="section-title">👤 Staff Accounts</div>
          <div className="table-wrap mb-3">
            <table>
              <thead><tr><th>User</th><th>Role</th><th>Action</th></tr></thead>
              <tbody>
                {db.accounts.map(a => (
                  <tr key={a.user}>
                    <td>{a.user}</td>
                    <td><span className={`badge ${a.role==='Admin'?'badge-purple':'badge-blue'}`}>{a.role}</span></td>
                    <td>{a.user !== 'admin' && <button className="text-red" onClick={() => deleteStaff(a.user)}>Delete</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>➕ Add Staff</button>
        </div>
        <div className="card">
          <div className="section-title">💰 GST Context</div>
          <div className="form-group mb-3"><label>GST % (Global)</label><input type="number" defaultValue={db.settings.gst} /></div>
          <button className="btn btn-primary">Update GST</button>
        </div>
      </div>

      {showStaffModal && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: '400px' }}>
            <div className="modal-header"><h3>Add Staff</h3><button onClick={() => setShowStaffModal(false)}>✕</button></div>
            <div className="form-group mb-3"><label>Username</label><input value={newStaff.user} onChange={e=>setNewStaff({...newStaff, user:e.target.value})} /></div>
            <div className="form-group mb-3"><label>Password</label><input type="password" value={newStaff.pass} onChange={e=>setNewStaff({...newStaff, pass:e.target.value})} /></div>
            <div className="form-group mb-4"><label>Role</label><select value={newStaff.role} onChange={e=>setNewStaff({...newStaff, role:e.target.value})}><option>Staff</option><option>Admin</option></select></div>
            <button className="btn btn-primary btn-full" onClick={addStaff}>Save Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
