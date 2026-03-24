import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sri_nikil_erp_db';

const defaultProducts = [
  // Groundnut Refined
  { id: 1, code: 'GNR-15K', name: 'Groundnut Oil (Refined) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 2920, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 2, code: 'GNR-05C', name: 'Groundnut Oil (Refined) 5L Can', cat: 'Groundnut', unit: 'cans', price: 930, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 3, code: 'GNR-02C', name: 'Groundnut Oil (Refined) 2L Can', cat: 'Groundnut', unit: 'cans', price: 383, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=2L+Can' },
  { id: 4, code: 'GNR-01B', name: 'Groundnut Oil (Refined) 1L Bottle', cat: 'Groundnut', unit: 'bottles', price: 188, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 5, code: 'GNR-01P', name: 'Groundnut Oil (Refined) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 184, stock: 50, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 6, code: 'GNR-HFP', name: 'Groundnut Oil (Refined) 1/2L Packet', cat: 'Groundnut', unit: 'pkts', price: 92, stock: 0, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  // Groundnut Pure
  { id: 7, code: 'GNP-15K', name: 'Groundnut Oil (Pure) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 3000, stock: 8, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 8, code: 'GNP-05C', name: 'Groundnut Oil (Pure) 5L Can', cat: 'Groundnut', unit: 'cans', price: 955, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 9, code: 'GNP-01P', name: 'Groundnut Oil (Pure) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 193, stock: 40, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  // Sunflower Refined
  { id: 10, code: 'SFR-15K', name: 'Sunflower Oil (Refined) 15kg Tin', cat: 'Sunflower', unit: 'tins', price: 2950, stock: 12, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 11, code: 'SFR-05C', name: 'Sunflower Oil (Refined) 5L Can', cat: 'Sunflower', unit: 'cans', price: 940, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 12, code: 'SFR-01P', name: 'Sunflower Oil (Refined) 1L Packet', cat: 'Sunflower', unit: 'pkts', price: 186, stock: 85, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  // Palm Oil
  { id: 13, code: 'PAL-15K', name: 'Palm Oil 15kg Tin', cat: 'Palm', unit: 'tins', price: 2445, stock: 24, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 14, code: 'PAL-05C', name: 'Palm Oil 5L Can', cat: 'Palm', unit: 'cans', price: 780, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 15, code: 'PAL-01P', name: 'Palm Oil 1L Packet', cat: 'Palm', unit: 'pkts', price: 154, stock: 60, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  // Vanaspati
  { id: 16, code: 'VAN-15K', name: 'Vanaspati 15kg Tin', cat: 'Vanaspati', unit: 'tins', price: 2700, stock: 5, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  // Sesame / Gingelly Oil
  { id: 17, code: 'SEM-01P', name: 'Sesame Oil (Mayil) 1L Packet', cat: 'Sesame', unit: 'pkts', price: 320, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 18, code: 'SEM-HFP', name: 'Sesame Oil (Mayil) 1/2L Packet', cat: 'Sesame', unit: 'pkts', price: 160, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 19, code: 'SEU-15K', name: 'Sesame Oil (Mukil) 15kg Tin', cat: 'Sesame', unit: 'tins', price: 4050, stock: 4, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 20, code: 'SEK-15K', name: 'Sesame Oil (Karmegam Premium) 15kg Tin', cat: 'Sesame', unit: 'tins', price: 4560, stock: 5, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 21, code: 'SEK-05C', name: 'Sesame Oil (Karmegam) 5L Can', cat: 'Sesame', unit: 'cans', price: 1575, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 22, code: 'SEK-01B', name: 'Sesame Oil (Karmegam) 1L Bottle', cat: 'Sesame', unit: 'bottles', price: 340, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 23, code: 'SEK-01P', name: 'Sesame Oil (Karmegam) 1L Packet', cat: 'Sesame', unit: 'pkts', price: 330, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 24, code: 'SEK-HFB', name: 'Sesame Oil (Karmegam) 1/2L Bottle', cat: 'Sesame', unit: 'bottles', price: 170, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 25, code: 'SEK-HFP', name: 'Sesame Oil (Karmegam) 1/2L Packet', cat: 'Sesame', unit: 'pkts', price: 165, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 26, code: 'SEK-200B', name: 'Sesame Oil (Karmegam) 200ml Bottle', cat: 'Sesame', unit: 'bottles', price: 70, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=200ml+Bottle' },
  // Castor Oil 
  { id: 27, code: 'CAS-01B', name: 'Castor Oil 1L Bottle', cat: 'Castor', unit: 'bottles', price: 220, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 28, code: 'CAS-HFB', name: 'Castor Oil 1/2L Bottle', cat: 'Castor', unit: 'bottles', price: 110, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  // Coconut Oil
  { id: 29, code: 'CON-01P', name: 'Coconut Oil 1L Packet', cat: 'Coconut', unit: 'pkts', price: 370, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 30, code: 'CON-01B', name: 'Coconut Oil 1L Bottle', cat: 'Coconut', unit: 'bottles', price: 370, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 31, code: 'CON-HFP', name: 'Coconut Oil 1/2L Packet', cat: 'Coconut', unit: 'pkts', price: 185, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 32, code: 'CON-HFB', name: 'Coconut Oil 1/2L Bottle', cat: 'Coconut', unit: 'bottles', price: 185, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 33, code: 'CON-200B', name: 'Coconut Oil 200g Bottle', cat: 'Coconut', unit: 'bottles', price: 100, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=200g+Bottle' },
  { id: 34, code: 'CON-100B', name: 'Coconut Oil 100g Bottle', cat: 'Coconut', unit: 'bottles', price: 50, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=100g+Bottle' }
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
          if (parsed.products && parsed.products.length < 34) {
            parsed.products = defaultProducts;
          } else if (parsed.products) {
            parsed.products = parsed.products.map((p, idx) => ({
              ...p,
              image: p.image || (defaultProducts[idx] ? defaultProducts[idx].image : 'https://placehold.co/150x150?text=Product')
            }));
          }
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

  const deleteBill = (id) => {
    const billToDelete = db.bills.find(b => b.id === id);
    if (!billToDelete) return;

    // Revert stock
    let newProducts = [...db.products];
    billToDelete.items.forEach(item => {
      const idx = newProducts.findIndex(p => p.id === item.id);
      if (idx >= 0) {
        newProducts[idx] = { 
          ...newProducts[idx], 
          stock: newProducts[idx].stock + item.qty,
          sold: Math.max(0, (newProducts[idx].sold || 0) - item.qty)
        };
      }
    });

    // Revert customer totals
    let newCustomers = [...db.customers];
    if (billToDelete.customer !== 'Walk-in') {
      const cIdx = newCustomers.findIndex(c => c.phone === billToDelete.phone || c.name === billToDelete.customer);
      if (cIdx >= 0) {
         newCustomers[cIdx] = {
           ...newCustomers[cIdx],
           visits: Math.max(0, newCustomers[cIdx].visits - 1),
           total: Math.max(0, newCustomers[cIdx].total - billToDelete.grand)
         };
      }
    }

    setDb(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id),
      products: newProducts,
      customers: newCustomers
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
    deleteBill,
    addPurchase,
    addExpense,
    updateProductPrice,
    addRefill,
    addLoginLog,
    updateLoginLog,
    restoreDatabase
  };
}
