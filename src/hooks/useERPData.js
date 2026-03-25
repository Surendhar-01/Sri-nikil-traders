import { useEffect, useState } from 'react';

const STORAGE_KEY = 'sri_nikil_erp_db';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const defaultProducts = [
  { id: 1, code: 'GNR-15K', name: 'Groundnut Oil (Refined) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 2920, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 2, code: 'GNR-05C', name: 'Groundnut Oil (Refined) 5L Can', cat: 'Groundnut', unit: 'cans', price: 930, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 3, code: 'GNR-02C', name: 'Groundnut Oil (Refined) 2L Can', cat: 'Groundnut', unit: 'cans', price: 383, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=2L+Can' },
  { id: 4, code: 'GNR-01B', name: 'Groundnut Oil (Refined) 1L Bottle', cat: 'Groundnut', unit: 'bottles', price: 188, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 5, code: 'GNR-01P', name: 'Groundnut Oil (Refined) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 184, stock: 50, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 6, code: 'GNR-HFP', name: 'Groundnut Oil (Refined) 1/2L Packet', cat: 'Groundnut', unit: 'pkts', price: 92, stock: 0, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 7, code: 'GNP-15K', name: 'Groundnut Oil (Pure) 15kg Tin', cat: 'Groundnut', unit: 'tins', price: 3000, stock: 8, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 8, code: 'GNP-05C', name: 'Groundnut Oil (Pure) 5L Can', cat: 'Groundnut', unit: 'cans', price: 955, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 9, code: 'GNP-01P', name: 'Groundnut Oil (Pure) 1L Packet', cat: 'Groundnut', unit: 'pkts', price: 193, stock: 40, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 10, code: 'SFR-15K', name: 'Sunflower Oil (Refined) 15kg Tin', cat: 'Sunflower', unit: 'tins', price: 2950, stock: 12, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 11, code: 'SFR-05C', name: 'Sunflower Oil (Refined) 5L Can', cat: 'Sunflower', unit: 'cans', price: 940, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 12, code: 'SFR-01P', name: 'Sunflower Oil (Refined) 1L Packet', cat: 'Sunflower', unit: 'pkts', price: 186, stock: 85, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 13, code: 'PAL-15K', name: 'Palm Oil 15kg Tin', cat: 'Palm', unit: 'tins', price: 2445, stock: 24, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
  { id: 14, code: 'PAL-05C', name: 'Palm Oil 5L Can', cat: 'Palm', unit: 'cans', price: 780, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=5L+Can' },
  { id: 15, code: 'PAL-01P', name: 'Palm Oil 1L Packet', cat: 'Palm', unit: 'pkts', price: 154, stock: 60, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 16, code: 'VAN-15K', name: 'Vanaspati 15kg Tin', cat: 'Vanaspati', unit: 'tins', price: 2700, stock: 5, sold: 0, image: 'https://placehold.co/150x150?text=15kg+Tin' },
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
  { id: 27, code: 'CAS-01B', name: 'Castor Oil 1L Bottle', cat: 'Castor', unit: 'bottles', price: 220, stock: 10, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 28, code: 'CAS-HFB', name: 'Castor Oil 1/2L Bottle', cat: 'Castor', unit: 'bottles', price: 110, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 29, code: 'CON-01P', name: 'Coconut Oil 1L Packet', cat: 'Coconut', unit: 'pkts', price: 370, stock: 30, sold: 0, image: 'https://placehold.co/150x150?text=1L+Packet' },
  { id: 30, code: 'CON-01B', name: 'Coconut Oil 1L Bottle', cat: 'Coconut', unit: 'bottles', price: 370, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=1L+Bottle' },
  { id: 31, code: 'CON-HFP', name: 'Coconut Oil 1/2L Packet', cat: 'Coconut', unit: 'pkts', price: 185, stock: 25, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Pkt' },
  { id: 32, code: 'CON-HFB', name: 'Coconut Oil 1/2L Bottle', cat: 'Coconut', unit: 'bottles', price: 185, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=Half+L+Btl' },
  { id: 33, code: 'CON-200B', name: 'Coconut Oil 200g Bottle', cat: 'Coconut', unit: 'bottles', price: 100, stock: 15, sold: 0, image: 'https://placehold.co/150x150?text=200g+Bottle' },
  { id: 34, code: 'CON-100B', name: 'Coconut Oil 100g Bottle', cat: 'Coconut', unit: 'bottles', price: 50, stock: 20, sold: 0, image: 'https://placehold.co/150x150?text=100g+Bottle' }
];

const defaultDb = {
  products: defaultProducts,
  bills: [],
  customers: [],
  suppliers: [
    { id: 1, name: 'Sri Bhavani Oils', contact: '9876543210', products: 'Sunflower, Palm', addr: 'Erode', total: 0 },
    { id: 2, name: 'Coimbatore Oil Traders', contact: '9988776655', products: 'Groundnut, Sesame', addr: 'Coimbatore', total: 0 }
  ],
  expenses: [],
  revenueEntries: [],
  purchases: [],
  refills: [],
  priceHistory: [],
  loginLogs: [],
  accounts: [
    { user: 'staff', pass: 'staff123', role: 'Staff' }
  ],
  settings: {
    gst: 5,
    shop: 'Sri Nikil Tradings',
    addr: '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004',
    gstin: '33AMCPD1118L1ZK',
    fssai: '12424007000946',
    phone: '94875 81302, 0424 2901803'
  },
  billSeq: 1000
};

function normalizeDb(data) {
  const merged = { ...defaultDb, ...(data || {}) };
  const incomingProducts = Array.isArray(merged.products) ? merged.products : defaultProducts;
  const incomingAccounts = Array.isArray(merged.accounts) ? merged.accounts : defaultDb.accounts;

  merged.products = incomingProducts.map((product, index) => ({
    ...product,
    image: product.image || defaultProducts[index]?.image || 'https://placehold.co/150x150?text=Product',
    sold: product.sold || 0
  }));

  merged.accounts = incomingAccounts
    .filter(account => account && account.user && account.user.toLowerCase() !== 'admin')
    .map(account => ({
      ...account,
      role: 'Staff'
    }));

  if (merged.accounts.length === 0) {
    merged.accounts = defaultDb.accounts;
  }

  if (merged.products.length < defaultProducts.length) {
    merged.products = defaultProducts;
  }

  return merged;
}

function loadStoredDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || saved === 'undefined') {
      return defaultDb;
    }

    return normalizeDb(JSON.parse(saved));
  } catch (error) {
    console.error('Failed to load ERP data, resetting to defaults', error);
    return defaultDb;
  }
}

async function fetchRemoteDb() {
  if (!API_BASE_URL) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/erp-data`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ERP data: ${response.status}`);
  }

  return normalizeDb(await response.json());
}

export function useERPData() {
  const [db, setDb] = useState(() => loadStoredDb());
  const [loading, setLoading] = useState(Boolean(API_BASE_URL));
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!API_BASE_URL) {
        setLoading(false);
        return;
      }

      try {
        const remoteDb = await fetchRemoteDb();
        if (!ignore && remoteDb) {
          setDb(remoteDb);
          setError('');
        }
      } catch (loadError) {
        if (!ignore) {
          console.error('Failed to fetch ERP data from API, using local data', loadError);
          setError('Backend data unavailable. Showing local data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const updateDb = (key, value) => {
    setDb(prev => ({ ...prev, [key]: value }));
  };

  const addBill = (bill) => {
    setDb(prev => {
      const newBills = [bill, ...prev.bills];
      const newProducts = prev.products.map(product => {
        const item = bill.items.find(entry => entry.id === product.id);
        if (!item) {
          return product;
        }

        return {
          ...product,
          stock: Math.max(0, product.stock - item.qty),
          sold: (product.sold || 0) + item.qty
        };
      });

      const newCustomers = [...prev.customers];
      const existingCustomer = newCustomers.find(customer => customer.phone === bill.phone || customer.name === bill.customer);

      if (existingCustomer && bill.customer !== 'Walk-in') {
        existingCustomer.visits += 1;
        existingCustomer.total += bill.grand;
        existingCustomer.lastVisit = bill.date;
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

      return {
        ...prev,
        bills: newBills,
        products: newProducts,
        customers: newCustomers,
        billSeq: prev.billSeq + 1
      };
    });
  };

  const deleteBill = (id) => {
    setDb(prev => {
      const billToDelete = prev.bills.find(bill => bill.id === id);
      if (!billToDelete) {
        return prev;
      }

      const newProducts = [...prev.products];
      billToDelete.items.forEach(item => {
        const index = newProducts.findIndex(product => product.id === item.id);
        if (index >= 0) {
          newProducts[index] = {
            ...newProducts[index],
            stock: newProducts[index].stock + item.qty,
            sold: Math.max(0, (newProducts[index].sold || 0) - item.qty)
          };
        }
      });

      const newCustomers = [...prev.customers];
      if (billToDelete.customer !== 'Walk-in') {
        const customerIndex = newCustomers.findIndex(
          customer => customer.phone === billToDelete.phone || customer.name === billToDelete.customer
        );

        if (customerIndex >= 0) {
          newCustomers[customerIndex] = {
            ...newCustomers[customerIndex],
            visits: Math.max(0, newCustomers[customerIndex].visits - 1),
            total: Math.max(0, newCustomers[customerIndex].total - billToDelete.grand)
          };
        }
      }

      return {
        ...prev,
        bills: prev.bills.filter(bill => bill.id !== id),
        products: newProducts,
        customers: newCustomers
      };
    });
  };

  const addPurchase = (purchase) => {
    setDb(prev => ({
      ...prev,
      purchases: [purchase, ...prev.purchases],
      products: prev.products.map(product => (
        product.name === purchase.product ? { ...product, stock: product.stock + purchase.qty } : product
      )),
      suppliers: prev.suppliers.map(supplier => (
        supplier.name === purchase.supplier
          ? { ...supplier, total: (supplier.total || 0) + purchase.amount }
          : supplier
      ))
    }));
  };

  const addExpense = (expense) => {
    setDb(prev => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  };

  const addRevenueEntries = (entries) => {
    setDb(prev => ({
      ...prev,
      revenueEntries: [
        ...entries,
        ...(prev.revenueEntries || [])
      ]
    }));
  };

  const updateProductPrice = (id, newPrice, userName) => {
    setDb(prev => {
      const products = [...prev.products];
      const index = products.findIndex(product => product.id === id);
      if (index < 0) {
        return prev;
      }

      const oldPrice = products[index].price;
      products[index] = { ...products[index], price: newPrice };

      return {
        ...prev,
        products,
        priceHistory: [
          {
            id: Date.now(),
            date: new Date().toISOString(),
            product: products[index].name,
            old: oldPrice,
            new: newPrice,
            by: userName
          },
          ...prev.priceHistory
        ]
      };
    });
  };

  const deletePriceHistory = (id) => {
    setDb(prev => ({
      ...prev,
      priceHistory: prev.priceHistory.filter(entry => entry.id !== id)
    }));
  };

  const clearPriceHistory = () => {
    setDb(prev => ({
      ...prev,
      priceHistory: []
    }));
  };

  const addRefill = (refill) => {
    setDb(prev => ({
      ...prev,
      refills: [refill, ...prev.refills],
      products: prev.products.map(product => (
        product.name === refill.product ? { ...product, stock: product.stock + refill.qty } : product
      ))
    }));
  };

  const clearRefills = () => {
    setDb(prev => ({
      ...prev,
      refills: []
    }));
  };

  const addLoginLog = (log) => {
    setDb(prev => ({ ...prev, loginLogs: [log, ...prev.loginLogs] }));
  };

  const updateLoginLog = (id, logoutTime) => {
    setDb(prev => ({
      ...prev,
      loginLogs: prev.loginLogs.map(log => (log.id === id ? { ...log, logoutTime } : log))
    }));
  };

  const restoreDatabase = (data) => {
    setDb(normalizeDb(data));
  };

  const refreshData = async () => {
    if (!API_BASE_URL) {
      return;
    }

    setLoading(true);

    try {
      const remoteDb = await fetchRemoteDb();
      if (remoteDb) {
        setDb(remoteDb);
        setError('');
      }
    } catch (refreshError) {
      console.error('Failed to refresh ERP data', refreshError);
      setError('Could not refresh backend data.');
    } finally {
      setLoading(false);
    }
  };

  return {
    db,
    loading,
    error,
    refreshData,
    updateDb,
    addBill,
    deleteBill,
    addPurchase,
    addExpense,
    addRevenueEntries,
    updateProductPrice,
    deletePriceHistory,
    clearPriceHistory,
    addRefill,
    clearRefills,
    addLoginLog,
    updateLoginLog,
    restoreDatabase
  };
}
