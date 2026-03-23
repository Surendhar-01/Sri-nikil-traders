import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sri_nikil_erp_db';

const defaultProducts = [
  { id: 1, code: 'GNR-15K', name: 'Groundnut Oil (Refined) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 2920, stock: 15, sold: 0 },
  { id: 2, code: 'GNP-15K', name: 'Groundnut Oil (Pure) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 3000, stock: 8, sold: 0 },
  { id: 3, code: 'SFR-15K', name: 'Sunflower Oil (Refined) 15kg Tin', cat: 'Sunflower', unit: 'tins', price: 2950, stock: 12, sold: 0 },
  { id: 4, code: 'PAL-15K', name: 'Palm Oil 15kg Tin', cat: 'Palm', unit: 'tins', price: 2445, stock: 24, sold: 0 },
  { id: 5, code: 'VAN-15K', name: 'Vanaspati 15kg Tin', cat: 'Vanaspati', unit: 'tins', price: 2700, stock: 5, sold: 0 },
  { id: 6, code: 'SEC-15K', name: 'Sesame Oil (Karmegam) 15kg Tin', cat: 'Sesame', unit: 'tins', price: 4560, stock: 5, sold: 0 },
  { id: 7, code: 'GNR-01P', name: 'Groundnut Oil (Refined) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 184, stock: 120, sold: 0 },
  { id: 8, code: 'SFR-01P', name: 'Sunflower Oil (Refined) 1L Packet', cat: 'Sunflower', unit: 'pkts', price: 186, stock: 85, sold: 0 },
  { id: 9, code: 'CON-01B', name: 'Coconut Oil 1L Bottle', cat: 'Coconut', unit: 'bottles', price: 370, stock: 12, sold: 0 }
];

export function useERPData() {
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaults = {
      products: defaultProducts,
      bills: [],
      customers: [],
      suppliers: [
        { id: 1, name: 'Sri Bhavani Oils', contact: '9876543210', products: 'Sunflower, Palm', addr: 'Erode', total: 0 },
        { id: 2, name: 'Coimbatore Oil Traders', contact: '9988776655', products: 'Groundnut, Sesame', addr: 'Coimbatore', total: 0 }
      ],
      expenses: [],
      purchases: [],
      refills: [],
      priceHistory: [],
      loginLogs: [],
      accounts: [
        { user: 'admin', pass: 'admin123', role: 'Admin' },
        { user: 'staff', pass: 'staff123', role: 'Staff' }
      ],
      settings: { 
        gst: 5, 
        shop: 'Sri Nikil Tradings', 
        addr: '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode – 638004', 
        gstin: '33AMCPD1118L1ZK', 
        fssai: '12424007000946', 
        phone: '94875 81302, 0424 2901803' 
      },
      billSeq: 1000
    };
    try {
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaults, ...parsed };
        }
      }
    } catch (e) {
      console.error("Failed to load ERP data, resetting to defaults", e);
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const updateDb = (key, value) => {
    setDb(prev => ({ ...prev, [key]: value }));
  };

  const addBill = (bill) => {
    const newBills = [bill, ...db.bills];
    const newProducts = db.products.map(p => {
      const item = bill.items.find(i => i.id === p.id);
      if (item) {
        return { ...p, stock: Math.max(0, p.stock - item.qty), sold: (p.sold || 0) + item.qty };
      }
      return p;
    });

    // Update customer
    const newCustomers = [...db.customers];
    let c = newCustomers.find(x => x.phone === bill.phone || x.name === bill.customer);
    if (c && bill.customer !== 'Walk-in') {
      c.visits++;
      c.total += bill.grand;
      c.lastVisit = bill.date;
    } else if (bill.customer !== 'Walk-in') {
      newCustomers.push({
        id: Date.now(),
        name: bill.customer,
        phone: bill.phone,
        visits: 1,
        total: bill.grand,
        firstVisit: bill.date,
        lastVisit: bill.date
      });
    }

    setDb(prev => ({
      ...prev,
      bills: newBills,
      products: newProducts,
      customers: newCustomers,
      billSeq: prev.billSeq + 1
    }));
  };

  const addPurchase = (purchase) => {
    const newPurchases = [purchase, ...db.purchases];
    const newProducts = db.products.map(p => {
      if (p.name === purchase.product) return { ...p, stock: p.stock + purchase.qty };
      return p;
    });
    const newSuppliers = db.suppliers.map(s => {
      if (s.name === purchase.supplier) return { ...s, total: (s.total || 0) + purchase.amount };
      return s;
    });

    setDb(prev => ({
      ...prev,
      purchases: newPurchases,
      products: newProducts,
      suppliers: newSuppliers
    }));
  };

  const addExpense = (expense) => {
    setDb(prev => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  };

  const updateProductPrice = (id, newPrice, userName) => {
    const prods = [...db.products];
    const idx = prods.findIndex(p => p.id === id);
    if (idx < 0) return;
    const oldPrice = prods[idx].price;
    prods[idx].price = newPrice;
    
    const history = [{
      id: Date.now(),
      date: new Date().toISOString(),
      product: prods[idx].name,
      old: oldPrice,
      new: newPrice,
      by: userName
    }, ...db.priceHistory];

    setDb(prev => ({ ...prev, products: prods, priceHistory: history }));
  };

  const addRefill = (refill) => {
    const newProducts = db.products.map(p => {
      if (p.name === refill.product) return { ...p, stock: p.stock + refill.qty };
      return p;
    });
    setDb(prev => ({ ...prev, refills: [refill, ...prev.refills], products: newProducts }));
  };

  const addLoginLog = (log) => {
    setDb(prev => ({ ...prev, loginLogs: [log, ...prev.loginLogs] }));
  };

  const updateLoginLog = (id, logoutTime) => {
    setDb(prev => ({
      ...prev,
      loginLogs: prev.loginLogs.map(l => l.id === id ? { ...l, logoutTime } : l)
    }));
  };

  const restoreDatabase = (data) => {
    setDb(data);
  };

  return {
    db,
    updateDb,
    addBill,
    addPurchase,
    addExpense,
    updateProductPrice,
    addRefill,
    addLoginLog,
    updateLoginLog,
    restoreDatabase
  };
}
