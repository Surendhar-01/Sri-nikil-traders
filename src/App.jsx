import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/pages/Dashboard';
import Billing from './components/pages/Billing';
import Products from './components/pages/Products';
import Stock from './components/pages/Stock';
import Pricing from './components/pages/Pricing';
import PriceBoard from './components/pages/PriceBoard';
import Sales from './components/pages/Sales';
import Customers from './components/pages/Customers';
import Suppliers from './components/pages/Suppliers';
import Expenses from './components/pages/Expenses';
import Reports from './components/pages/Reports';
import LoginActivity from './components/pages/LoginActivity';
import Settings from './components/pages/Settings';
import Login from './components/Login';
import { useERPData } from './hooks/useERPData';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sri_nikil_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('sri_nikil_user') !== null;
  });
  const [session, setSession] = useState(null);
  
  const erp = useERPData();

  useEffect(() => {
    const preventNumberScrollChange = (event) => {
      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLInputElement &&
        activeElement.type === 'number' &&
        activeElement.contains(event.target)
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener('wheel', preventNumberScrollChange, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventNumberScrollChange);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    localStorage.setItem('sri_nikil_user', JSON.stringify(userData));
    
    const newSession = {
      id: erp.db.loginLogs.length > 0 ? Math.max(...erp.db.loginLogs.map(item => item.id)) + 1 : 1,
      user: userData.user,
      role: userData.role,
      loginTime: new Date().toISOString(),
      logoutTime: null,
      device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
    };
    setSession(newSession);
    erp.addLoginLog(newSession);
  };

  const handleLogout = () => {
    if (session) {
      erp.updateLoginLog(session.id, new Date().toISOString());
    }
    setUser(null);
    setIsLoggedIn(false);
    setSession(null);
    localStorage.removeItem('sri_nikil_user');
  };

  if (!erp || erp.loading || !erp.db) {
    return <div className="loading">Initializing System...</div>;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} accounts={erp.db.accounts || []} />;
  }

  const renderPage = () => {
    const isAdmin = user?.role === 'Admin';
    switch (currentPage) {
      case 'dashboard': return <Dashboard db={erp.db} />;
      case 'billing': return <Billing erp={erp} user={user} />;
      case 'products': return <Products db={erp.db} erp={erp} />;
      case 'stock': return <Stock db={erp.db} erp={erp} user={user} />;
      case 'pricing': return isAdmin ? <Pricing db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} />;
      case 'priceboard': return <PriceBoard db={erp.db} />;
      case 'sales': return isAdmin ? <Sales db={erp.db} /> : <Dashboard db={erp.db} />;
      case 'customers': return <Customers db={erp.db} />;
      case 'suppliers': return isAdmin ? <Suppliers db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} />;
      case 'expenses': return isAdmin ? <Expenses db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} />;
      case 'reports': return isAdmin ? <Reports db={erp.db} /> : <Dashboard db={erp.db} />;
      case 'loginlog': return isAdmin ? <LoginActivity db={erp.db} /> : <Dashboard db={erp.db} />;
      case 'settings': return isAdmin ? <Settings db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} />;
      default: return <Dashboard db={erp.db} />;
    }
  };

  return (
    <div className="flex bg">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
        onLogout={handleLogout} 
      />
      <div className="main flex-1">
        <Topbar 
          title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} 
          user={user} 
          db={erp.db}
        />
        <div className="content">
          {erp.error ? <div className="card" style={{ marginBottom: 16, color: '#b91c1c' }}>{erp.error}</div> : null}
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
