import React, { useEffect, useState } from 'react';

const REMEMBER_KEY = 'sri_nikil_remembered_user';

export default function Login({ onLogin, onSignUp, accounts }) {
  const [username, setUsername] = useState(() => localStorage.getItem(REMEMBER_KEY) || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem(REMEMBER_KEY)));
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({ user: '', pass: '', confirmPass: '' });
  const [signUpError, setSignUpError] = useState('');

  useEffect(() => {
    if (!showSignUp) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSignUp(false);
        setSignUpError('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSignUp]);

  const doLogin = () => {
    const found = accounts.find(account => account.user === username && account.pass === password);
    if (found) {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, username);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      onLogin(found);
    } else {
      setError(true);
    }
  };

  const fillDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError(false);
  };

  const handleForgotPassword = () => {
    alert('Use the Sign Up button to create a new staff account or reset the password from Staff Accounts in Settings.');
  };

  const handleSignUp = () => {
    if (!signUpData.user.trim() || !signUpData.pass) {
      setSignUpError('Username and password are required.');
      return;
    }

    if (signUpData.pass.length < 4) {
      setSignUpError('Password must be at least 4 characters.');
      return;
    }

    if (signUpData.pass !== signUpData.confirmPass) {
      setSignUpError('Passwords do not match.');
      return;
    }

    const created = onSignUp({
      user: signUpData.user.trim(),
      pass: signUpData.pass,
      role: 'Staff'
    });

    if (!created) {
      setSignUpError('Username already exists.');
      return;
    }

    setUsername(signUpData.user.trim());
    setPassword(signUpData.pass);
    setShowSignUp(false);
    setSignUpData({ user: '', pass: '', confirmPass: '' });
    setSignUpError('');
    setError(false);
  };

  return (
    <div id="loginPage">
      <div className="login-logo gold-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <img src="/logo.svg" alt="Logo" style={{ height: '40px' }} />
        Sri Nikil Tradings
      </div>
      <div className="login-sub">
        058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004<br />
        GSTIN: 33AMCPD1118L1ZK | FSSAI: 12424007000946<br />
        94875 81302 / 0424 2901803
      </div>
      <div className="login-box">
        <h2>Staff Login</h2>
        <div className="field">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            autoComplete="off"
            value={username}
            onChange={event => setUsername(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') doLogin();
            }}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <div className="login-password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') doLogin();
              }}
            />
            <button className="login-eye-btn" type="button" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {error && (
          <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '10px' }}>
            Invalid credentials
          </div>
        )}
        <div className="login-options-row">
          <label className="login-check">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={event => setRememberMe(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button className="login-link-btn" type="button" onClick={handleForgotPassword}>Forgot Password?</button>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={doLogin}>
            Login
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSignUp(true)}>
            Sign Up
          </button>
        </div>
        <div style={{ marginTop: '14px', fontSize: '.78rem', color: 'var(--text3)' }}>
          Quick Fill:
        </div>
        <div className="demo-chips">
          <div className="chip" onClick={() => fillDemo('staff', 'staff123')}>Staff</div>
          <div className="chip" onClick={() => fillDemo('cashier', 'cashier123')}>Cashier</div>
        </div>
      </div>

      {showSignUp && (
        <div className="modal-overlay open" onClick={() => setShowSignUp(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Account</h3>
              <button className="modal-close" type="button" onClick={() => setShowSignUp(false)}>×</button>
            </div>
            <div className="form-group mb-3">
              <label>Username</label>
              <input value={signUpData.user} onChange={event => setSignUpData({ ...signUpData, user: event.target.value })} />
            </div>
            <div className="form-group mb-3">
              <label>Password</label>
              <input type="password" value={signUpData.pass} onChange={event => setSignUpData({ ...signUpData, pass: event.target.value })} />
            </div>
            <div className="form-group mb-4">
              <label>Confirm Password</label>
              <input type="password" value={signUpData.confirmPass} onChange={event => setSignUpData({ ...signUpData, confirmPass: event.target.value })} />
            </div>
            {signUpError ? (
              <div style={{ color: 'var(--red)', fontSize: '.82rem', marginBottom: '12px' }}>
                {signUpError}
              </div>
            ) : null}
            <button className="btn btn-primary btn-full" type="button" onClick={handleSignUp}>Create Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
