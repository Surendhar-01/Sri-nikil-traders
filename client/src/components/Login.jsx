import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const doLogin = async () => {
    try {
      await onLogin(username, password);
      setError(false);
    } catch {
      setError(true);
    }
  };

  const fillDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(false);
  };

  return (
    <div id="loginPage">
      <div
        className="login-logo gold-text"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
        Sri Nikil Tradings
      </div>
      <div className="login-sub">
        058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004
        <br />
        GSTIN: 33AMCPD1118L1ZK | FSSAI: 12424007000946
        <br />
        94875 81302 / 0424 2901803
      </div>
      <div className="login-box">
        <h2>Login</h2>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            autoComplete="off"
            value={username}
            onChange={event => setUsername(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                doLogin();
              }
            }}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                doLogin();
              }
            }}
          />
        </div>
        {error ? (
          <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '10px' }}>
            Invalid credentials
          </div>
        ) : null}
        <button className="btn btn-primary btn-full" onClick={doLogin}>
          Login
        </button>
        <div style={{ marginTop: '14px', fontSize: '.78rem', color: 'var(--text3)' }}>
          Quick Fill:
        </div>
        <div className="demo-chips">
          <div className="chip" onClick={() => fillDemo('admin', 'admin123')}>Admin</div>
          <div className="chip" onClick={() => fillDemo('staff1', 'staff1')}>Staff 1</div>
          <div className="chip" onClick={() => fillDemo('staff2', 'staff2')}>Staff 2</div>
          <div className="chip" onClick={() => fillDemo('staff5', 'staff5')}>Staff 5</div>
        </div>
      </div>
    </div>
  );
}
