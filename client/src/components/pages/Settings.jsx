import React, { useState } from 'react';

export default function Settings({ db, erp }) {
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ user: '', pass: '', role: 'Staff' });
  const [shopSettings, setShopSettings] = useState(() => db.settings);
  const [gstValue, setGstValue] = useState(() => String(db.settings?.gst ?? 0));

  const saveSettings = async (nextSettings, successMessage) => {
    try {
      await erp.updateSettings(nextSettings);
      setShopSettings(nextSettings);
      setGstValue(String(nextSettings?.gst ?? 0));
      alert(successMessage);
    } catch (error) {
      alert(error.message || 'Failed to update settings');
    }
  };

  const handleSaveSettings = async () => {
    await saveSettings(
      {
        ...db.settings,
        ...shopSettings,
        gst: Number(gstValue) || 0
      },
      'Settings updated successfully!'
    );
  };

  const handleUpdateGst = async () => {
    const parsedGst = Number(gstValue);

    if (Number.isNaN(parsedGst) || parsedGst < 0) {
      alert('Enter a valid GST percentage.');
      return;
    }

    await saveSettings(
      {
        ...db.settings,
        ...shopSettings,
        gst: parsedGst
      },
      'GST updated successfully!'
    );
  };

  const updateShopField = (key, value) => {
    setShopSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addStaff = async () => {
    const username = newStaff.user.trim();

    if (!username || !newStaff.pass.trim()) {
      return;
    }

    if (db.accounts.some(account => account.user.toLowerCase() === username.toLowerCase())) {
      alert('Username already exists.');
      return;
    }

    try {
      await erp.addStaff({ ...newStaff, user: username });
      setShowStaffModal(false);
      setNewStaff({ user: '', pass: '', role: 'Staff' });
    } catch (error) {
      alert(error.message || 'Failed to add staff');
    }
  };

  const deleteStaff = async (username) => {
    if (username === 'admin') {
      return;
    }

    if (db.accounts.length <= 1) {
      alert('At least one account is required.');
      return;
    }

    try {
      await erp.deleteStaff(username);
    } catch (error) {
      alert(error.message || 'Failed to delete staff');
    }
  };

  const backupDB = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `snt_backup_${new Date().toISOString().split('T')[0]}.json`;
    anchor.click();
  };

  const restoreDB = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = event => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = loadEvent => {
        try {
          const data = JSON.parse(loadEvent.target.result);
          erp.restoreDatabase(data);
          alert('Database restored successfully! Refreshing...');
          window.location.reload();
        } catch {
          alert('Invalid backup file!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="grid grid-2">
      <div>
        <div className="card mb-4">
          <div className="section-title">Shop Details</div>
          <div className="form-group mb-2">
            <label>Shop Name</label>
            <input
              value={shopSettings.shop || ''}
              onChange={event => updateShopField('shop', event.target.value)}
            />
          </div>
          <div className="form-group mb-2">
            <label>Address</label>
            <textarea
              rows="2"
              value={shopSettings.addr || ''}
              onChange={event => updateShopField('addr', event.target.value)}
            />
          </div>
          <div className="form-group mb-2">
            <label>GSTIN</label>
            <input
              value={shopSettings.gstin || ''}
              onChange={event => updateShopField('gstin', event.target.value)}
            />
          </div>
          <div className="form-group mb-3">
            <label>Phone</label>
            <input
              value={shopSettings.phone || ''}
              onChange={event => updateShopField('phone', event.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSaveSettings}>Save Settings</button>
        </div>

        <div className="card">
          <div className="section-title">Database Tools</div>
          <div className="flex gap-2">
            <button className="btn btn-blue flex-1" onClick={backupDB}>Download Backup</button>
            <button className="btn btn-secondary flex-1" onClick={restoreDB}>Restore Database</button>
          </div>
          <p className="text-muted text-xs mt-3">Restore will overwrite all current data.</p>
        </div>
      </div>

      <div>
        <div className="card mb-4">
          <div className="section-title">Staff Accounts</div>
          <div className="table-wrap mb-3">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {db.accounts.map(account => (
                  <tr key={account.user}>
                    <td>{account.user}</td>
                    <td>
                      <span className={`badge ${account.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>
                        {account.role}
                      </span>
                    </td>
                    <td>
                      {account.user !== 'admin' && (
                        <button className="text-red" onClick={() => deleteStaff(account.user)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowStaffModal(true)}>Add Staff</button>
        </div>

        <div className="card">
          <div className="section-title">GST Context</div>
          <div className="form-group mb-3">
            <label>GST % (Global)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={gstValue}
              onChange={event => setGstValue(event.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleUpdateGst}>Update GST</button>
        </div>
      </div>

      {showStaffModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Staff</h3>
              <button type="button" onClick={() => setShowStaffModal(false)}>X</button>
            </div>
            <div className="form-group mb-3">
              <label>Username</label>
              <input
                value={newStaff.user}
                onChange={event => setNewStaff(prev => ({ ...prev, user: event.target.value }))}
              />
            </div>
            <div className="form-group mb-3">
              <label>Password</label>
              <input
                type="password"
                value={newStaff.pass}
                onChange={event => setNewStaff(prev => ({ ...prev, pass: event.target.value }))}
              />
            </div>
            <div className="form-group mb-4">
              <label>Role</label>
              <select
                value={newStaff.role}
                onChange={event => setNewStaff(prev => ({ ...prev, role: event.target.value }))}
              >
                <option>Staff</option>
                <option>Admin</option>
              </select>
            </div>
            <button className="btn btn-primary btn-full" onClick={addStaff}>Save Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
