import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard/Dashboard';
import Billing from './components/Billing/Billing';
import Products from './components/Products/Products';
import Stock from './components/Stock/Stock';
import Pricing from './components/Pricing/Pricing';
import PriceBoard from './components/PriceBoard/PriceBoard';
import Sales from './components/Sales/Sales';
import Customers from './components/Customers/Customers';
import Reports from './components/Reports/Reports';
import LoginActivity from './components/LoginActivity/LoginActivity';
import Settings from './components/Settings/Settings';
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

  const handleLogin = async (username, password) => {
    try {
      const userData = await erp.login(username, password);
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
      
      try {
        const createdLog = await erp.addLoginLog(newSession);
        setSession({ ...newSession, id: createdLog.id });
      } catch (logError) {
        console.warn('Login logged locally only', logError);
        setSession(newSession);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error; 
    }
  };

  const handleLogout = async () => {
    if (session) {
      await erp.updateLoginLog(session.id);
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
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    const isAdmin = user?.role === 'Admin';
    switch (currentPage) {
      case 'dashboard': return <Dashboard db={erp.db} user={user} />;
      case 'billing': return isAdmin ? <Dashboard db={erp.db} user={user} /> : <Billing erp={erp} user={user} />;
      case 'products': return <Products db={erp.db} erp={erp} />;
      case 'stock': return <Stock db={erp.db} erp={erp} user={user} />;
      case 'pricing': return isAdmin ? <Pricing db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} user={user} />;
      case 'priceboard': return <PriceBoard db={erp.db} />;
      case 'sales': return <Sales db={erp.db} user={user} />;
      case 'customers': return <Customers db={erp.db} />;
      case 'reports': return <Reports db={erp.db} user={user} />;
      case 'loginlog': return isAdmin ? <LoginActivity db={erp.db} erp={erp} /> : <Dashboard db={erp.db} user={user} />;
      case 'settings': return isAdmin ? <Settings db={erp.db} erp={erp} user={user} /> : <Dashboard db={erp.db} user={user} />;
      default: return <Dashboard db={erp.db} user={user} />;
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
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
