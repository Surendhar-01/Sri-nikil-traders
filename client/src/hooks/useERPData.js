import { useEffect, useState } from 'react';

const STORAGE_KEY = 'sri_nikil_erp_db';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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

const samplePriceHistory = [
  {
    id: 1,
    date: '2026-03-05T10:00:00.000Z',
    product: 'Groundnut Oil (Refined) 15kg Tin',
    old: 2860,
    new: 2920,
    by: 'admin'
  },
  {
    id: 2,
    date: '2026-03-12T11:20:00.000Z',
    product: 'Sunflower Oil (Refined) 5L Can',
    old: 910,
    new: 940,
    by: 'admin'
  },
  {
    id: 3,
    date: '2026-03-18T15:10:00.000Z',
    product: 'Sesame Oil (Karmegam) 1L Packet',
    old: 318,
    new: 330,
    by: 'staff'
  }
];

const defaultDb = {
  products: defaultProducts,
  bills: [],
  customers: [],
  suppliers: [],
  priceHistory: samplePriceHistory,
  loginLogs: [],
  accounts: [
    { user: 'admin', pass: 'admin123', role: 'Admin' },
    { user: 'staff', pass: 'staff123', role: 'Staff' },
    { user: 'staff1', pass: 'staff1', role: 'Staff' },
    { user: 'staff2', pass: 'staff2', role: 'Staff' },
    { user: 'staff3', pass: 'staff3', role: 'Staff' }, 
    { user: 'staff4', pass: 'staff4', role: 'Staff' }, 
    { user: 'staff5', pass: 'staff5', role: 'Staff' },
    { user: 'staff6', pass: 'staff6', role: 'Staff' },
    { user: 'staff7', pass: 'staff7', role: 'Staff' },
    { user: 'staff8', pass: 'staff8', role: 'Staff' },
    { user: 'staff9', pass: 'staff9', role: 'Staff' },
    { user: 'staff10', pass: 'staff10', role: 'Staff' }
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

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

function normalizeDb(data) {
  const merged = { ...defaultDb, ...(data || {}) };
  const incomingProducts = Array.isArray(merged.products) ? merged.products : defaultProducts;
  const incomingAccounts = Array.isArray(merged.accounts) ? merged.accounts : defaultDb.accounts;

  merged.products = incomingProducts.map((product, index) => ({
    ...product,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    sold: Number(product.sold || 0),
    image: product.image || defaultProducts[index]?.image || 'https://placehold.co/150x150?text=Product'
  }));

  merged.bills = (Array.isArray(merged.bills) ? merged.bills : []).map((bill) => ({
    ...bill,
    billNo: bill.billNo || bill.bill_no,
    by: bill.by || bill.by_user,
    subtotal: Number(bill.subtotal || 0),
    cgst: Number(bill.cgst || 0),
    sgst: Number(bill.sgst || 0),
    grand: Number(bill.grand || 0),
    items: Array.isArray(bill.items) ? bill.items : []
  }));

  merged.customers = (Array.isArray(merged.customers) ? merged.customers : []).map((customer) => ({
    ...customer,
    visits: Number(customer.visits || 0),
    total: Number(customer.total || 0)
  }));


  merged.purchases = (Array.isArray(merged.purchases) ? merged.purchases : []).map((purchase) => ({
    ...purchase,
    qty: Number(purchase.qty || 0),
    amount: Number(purchase.amount || 0),
    by: purchase.by || purchase.by_user
  }));

  merged.refills = (Array.isArray(merged.refills) ? merged.refills : []).map((refill) => ({
    ...refill,
    qty: Number(refill.qty || 0),
    by: refill.by || refill.by_user
  }));

  const incomingPriceHistory = Array.isArray(merged.priceHistory) && merged.priceHistory.length > 0 ? merged.priceHistory : samplePriceHistory;
  merged.priceHistory = incomingPriceHistory.map((history) => ({
    ...history,
    old: Number(history.old ?? history.old_price ?? 0),
    new: Number(history.new ?? history.new_price ?? 0),
    by: history.by || history.by_user
  }));

  merged.loginLogs = (Array.isArray(merged.loginLogs) ? merged.loginLogs : []).map((log) => ({
    ...log,
    user: log.user || log.user_name,
    loginTime: log.loginTime || log.login_time,
    logoutTime: log.logoutTime || log.logout_time
  }));

  merged.accounts = incomingAccounts
    .filter((account) => account && account.user)
    .map((account) => ({
      ...account,
      pass: account.pass || '',
      role: account.role || (account.user?.toLowerCase() === 'admin' ? 'Admin' : 'Staff')
    }));

  if (merged.accounts.length === 0) {
    merged.accounts = defaultDb.accounts;
  }

  merged.settings = {
    ...defaultDb.settings,
    ...(merged.settings || {}),
    gst: Number(merged.settings?.gst ?? defaultDb.settings.gst)
  };

  merged.billSeq = Number(merged.billSeq || defaultDb.billSeq);

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
  return normalizeDb(await apiRequest('/api/db'));
}

export function useERPData() {
  const [db, setDb] = useState(() => loadStoredDb());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshData = async () => {
    setLoading(true);

    try {
      const remoteDb = await fetchRemoteDb();
      setDb(remoteDb);
      setError('');
      return remoteDb;
    } catch (refreshError) {
      console.error('Failed to refresh ERP data', refreshError);
      setError('Backend data unavailable. Showing local data.');
      throw refreshError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData().catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const updateDb = (key, value) => {
    setDb((prev) => ({ ...prev, [key]: value }));
  };

  const runMutation = async (path, options) => {
    await apiRequest(path, options);
    await refreshData();
  };


  const appendBillLocally = (bill) => {
    const normalizedBill = {
      id: Number(bill.id || db.billSeq || Date.now()),
      billNo: bill.billNo || `SNT-${String(db.billSeq || 1000).padStart(4, '0')}`,
      date: bill.date || new Date().toISOString(),
      customer: bill.customer || '',
      phone: bill.phone || '',
      payment: bill.payment || 'Cash',
      subtotal: Number(bill.subtotal || 0),
      cgst: Number(bill.cgst || 0),
      sgst: Number(bill.sgst || 0),
      grand: Number(bill.grand || 0),
      by: bill.by || bill.by_user || 'staff',
      items: (Array.isArray(bill.items) ? bill.items : []).map((item) => ({
        id: Number(item.id),
        name: item.name,
        qty: Number(item.qty || 0),
        price: Number(item.price || 0),
        total: Number(item.total || 0)
      }))
    };

    setDb((prev) => {
      const existingBills = Array.isArray(prev.bills) ? prev.bills : [];
      const existingCustomers = Array.isArray(prev.customers) ? prev.customers : [];
      const updatedProducts = (Array.isArray(prev.products) ? prev.products : []).map((product) => {
        const matchedItem = normalizedBill.items.find((item) => Number(item.id) === Number(product.id));
        if (!matchedItem) {
          return product;
        }

        return {
          ...product,
          stock: Math.max(0, Number(product.stock || 0) - matchedItem.qty),
          sold: Number(product.sold || 0) + matchedItem.qty
        };
      });

      const existingCustomer = existingCustomers.find((customer) => customer.phone === normalizedBill.phone);
      let updatedCustomers;

      if (existingCustomer) {
        updatedCustomers = existingCustomers.map((customer) => (
          customer.phone === normalizedBill.phone
            ? {
                ...customer,
                name: normalizedBill.customer,
                visits: Number(customer.visits || 0) + 1,
                total: Number(customer.total || 0) + normalizedBill.grand,
                lastVisit: normalizedBill.date
              }
            : customer
        ));
      } else {
        updatedCustomers = [
          {
            id: existingCustomers.length > 0 ? Math.max(...existingCustomers.map((customer) => Number(customer.id || 0))) + 1 : 1,
            name: normalizedBill.customer,
            phone: normalizedBill.phone,
            visits: 1,
            total: normalizedBill.grand,
            firstVisit: normalizedBill.date,
            lastVisit: normalizedBill.date
          },
          ...existingCustomers
        ];
      }

      return {
        ...prev,
        bills: [normalizedBill, ...existingBills],
        products: updatedProducts,
        customers: updatedCustomers,
        billSeq: Number(prev.billSeq || 1000) + 1
      };
    });

    return normalizedBill;
  };

  const authenticateLocally = (user, password) => {
    const account = (Array.isArray(db.accounts) ? db.accounts : []).find((candidate) => (
      candidate.user?.toLowerCase() === user?.toLowerCase() && candidate.pass === password
    ));

    if (!account) {
      throw new Error('Invalid credentials');
    }

    return {
      user: account.user,
      role: account.role || (account.user?.toLowerCase() === 'admin' ? 'Admin' : 'Staff')
    };
  };

  const appendLoginLogLocally = (log) => {
    const normalizedLog = {
      id: Number(log.id || Date.now()),
      user: log.user || log.user_name,
      role: log.role || 'Staff',
      loginTime: log.loginTime || log.login_time || new Date().toISOString(),
      logoutTime: log.logoutTime || log.logout_time || null,
      device: log.device || 'Desktop'
    };

    setDb((prev) => ({
      ...prev,
      loginLogs: [normalizedLog, ...(Array.isArray(prev.loginLogs) ? prev.loginLogs : [])]
    }));

    return normalizedLog;
  };

  const logoutLoginLogLocally = (id) => {
    setDb((prev) => ({
      ...prev,
      loginLogs: (Array.isArray(prev.loginLogs) ? prev.loginLogs : []).map((log) => (
        Number(log.id) === Number(id)
          ? { ...log, logoutTime: new Date().toISOString() }
          : log
      ))
    }));
  };

  const clearLoginLogsLocally = () => {
    setDb((prev) => ({
      ...prev,
      loginLogs: []
    }));
  };



  const appendStaffLocally = (account) => {
    const normalizedAccount = {
      user: String(account.user || '').trim(),
      pass: account.pass || account.password || '',
      role: account.role || 'Staff'
    };

    if (!normalizedAccount.user) {
      return null;
    }

    setDb((prev) => ({
      ...prev,
      accounts: [
        normalizedAccount,
        ...(Array.isArray(prev.accounts) ? prev.accounts : []).filter(
          (existingAccount) => existingAccount.user?.toLowerCase() !== normalizedAccount.user.toLowerCase()
        )
      ]
    }));

    return normalizedAccount;
  };

  const deleteStaffLocally = (username) => {
    setDb((prev) => ({
      ...prev,
      accounts: (Array.isArray(prev.accounts) ? prev.accounts : []).filter(
        (account) => account.user?.toLowerCase() !== String(username || '').toLowerCase()
      )
    }));
  };


  const appendPurchaseLocally = (purchase) => {
    const normalizedPurchase = {
      id: Number(purchase.id || Date.now()),
      date: purchase.date || new Date().toISOString(),
      supplier: purchase.supplier || '',
      product: purchase.product || '',
      qty: Number(purchase.qty || 0),
      amount: Number(purchase.amount || 0),
      by: purchase.by || purchase.by_user || 'staff'
    };

    setDb((prev) => ({
      ...prev,
      purchases: [normalizedPurchase, ...(Array.isArray(prev.purchases) ? prev.purchases : [])],
      products: (Array.isArray(prev.products) ? prev.products : []).map((product) => (
        product.name === normalizedPurchase.product
          ? { ...product, stock: Number(product.stock || 0) + normalizedPurchase.qty }
          : product
      )),
      suppliers: (Array.isArray(prev.suppliers) ? prev.suppliers : []).map((supplier) => (
        supplier.name === normalizedPurchase.supplier
          ? { ...supplier, total: Number(supplier.total || 0) + normalizedPurchase.amount }
          : supplier
      ))
    }));

    return normalizedPurchase;
  };

  const deleteBillLocally = (id) => {
    setDb((prev) => {
      const existingBills = Array.isArray(prev.bills) ? prev.bills : [];
      const billToDelete = existingBills.find((bill) => Number(bill.id) === Number(id));

      if (!billToDelete) {
        return prev;
      }

      const updatedProducts = (Array.isArray(prev.products) ? prev.products : []).map((product) => {
        const matchedItem = (Array.isArray(billToDelete.items) ? billToDelete.items : []).find(
          (item) => Number(item.id) === Number(product.id)
        );

        if (!matchedItem) {
          return product;
        }

        return {
          ...product,
          stock: Number(product.stock || 0) + Number(matchedItem.qty || 0),
          sold: Math.max(0, Number(product.sold || 0) - Number(matchedItem.qty || 0))
        };
      });

      const updatedCustomers = (Array.isArray(prev.customers) ? prev.customers : []).flatMap((customer) => {
        if (customer.phone !== billToDelete.phone) {
          return [customer];
        }

        const nextVisits = Math.max(0, Number(customer.visits || 0) - 1);
        const nextTotal = Math.max(0, Number(customer.total || 0) - Number(billToDelete.grand || 0));

        if (nextVisits === 0) {
          return [];
        }

        return [{
          ...customer,
          visits: nextVisits,
          total: nextTotal
        }];
      });

      return {
        ...prev,
        bills: existingBills.filter((bill) => Number(bill.id) !== Number(id)),
        products: updatedProducts,
        customers: updatedCustomers
      };
    });
  };

  const appendRefillLocally = (refill) => {
    const normalizedRefill = {
      id: Number(refill.id || Date.now()),
      date: refill.date || new Date().toISOString(),
      product: refill.product || '',
      qty: Number(refill.qty || 0),
      by: refill.by || refill.by_user || 'staff'
    };

    setDb((prev) => ({
      ...prev,
      refills: [normalizedRefill, ...(Array.isArray(prev.refills) ? prev.refills : [])],
      products: (Array.isArray(prev.products) ? prev.products : []).map((product) => (
        product.name === normalizedRefill.product
          ? { ...product, stock: Number(product.stock || 0) + normalizedRefill.qty }
          : product
      ))
    }));

    return normalizedRefill;
  };

  const clearRefillsLocally = () => {
    setDb((prev) => ({
      ...prev,
      refills: []
    }));
  };

  const updateSettingsLocally = (settings) => {
    const normalizedSettings = {
      ...defaultDb.settings,
      ...(settings || {}),
      gst: Number(settings?.gst ?? defaultDb.settings.gst)
    };

    setDb((prev) => ({
      ...prev,
      settings: normalizedSettings
    }));

    return normalizedSettings;
  };

  return {
    db,
    loading,
    error,
    refreshData,
    updateDb,
    restoreDatabase: (data) => setDb(normalizeDb(data)),
    login: async (user, password) => {
      try {
        return await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ user, password })
        });
      } catch (loginError) {
        console.warn('Failed to authenticate with backend, using local accounts instead', loginError);
        return authenticateLocally(user, password);
      }
    },
    addProduct: (product) => runMutation('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        code: product.code || '',
        name: product.name,
        cat: product.cat,
        unit: product.unit,
        price: Number(product.price),
        stock: Number(product.stock || 0),
        image: product.image || null
      })
    }),
    deleteProduct: (id) => runMutation(`/api/products/${id}`, { method: 'DELETE' }),
    addBill: async (bill) => {
      try {
        await runMutation('/api/bills', {
          method: 'POST',
          body: JSON.stringify({
            billNo: bill.billNo,
            customer: bill.customer,
            phone: bill.phone,
            payment: bill.payment,
            items: bill.items,
            date: bill.date || new Date().toISOString(),
            subtotal: Number(bill.subtotal),
            cgst: Number(bill.cgst),
            sgst: Number(bill.sgst),
            grand: Number(bill.grand),
            by_user: bill.by || bill.by_user
          })
        });
      } catch (mutationError) {
        console.warn('Failed to save bill to backend, storing locally instead', mutationError);
        appendBillLocally(bill);
      }
    },
    deleteBill: async (id) => {
      try {
        await runMutation(`/api/bills/${id}`, { method: 'DELETE' });
      } catch (mutationError) {
        console.warn('Failed to delete bill in backend, deleting locally instead', mutationError);
        deleteBillLocally(id);
      }
    },
    addPurchase: async (purchase) => {
      try {
        await runMutation('/api/purchases', {
          method: 'POST',
          body: JSON.stringify({
            supplier: purchase.supplier,
            product: purchase.product,
            qty: Number(purchase.qty),
            amount: Number(purchase.amount),
            by_user: purchase.by || purchase.by_user
          })
        });
      } catch (mutationError) {
        console.warn('Failed to save purchase to backend, storing locally instead', mutationError);
        appendPurchaseLocally(purchase);
      }
    },
    updateProductPrice: (id, newPrice, userName) => runMutation(`/api/products/${id}/price`, {
      method: 'PUT',
      body: JSON.stringify({
        new_price: Number(newPrice),
        by_user: userName
      })
    }),
    deletePriceHistory: (id) => runMutation(`/api/price-history/${id}`, { method: 'DELETE' }),
    clearPriceHistory: () => runMutation('/api/price-history', { method: 'DELETE' }),
    addRefill: async (refill) => {
      try {
        await runMutation('/api/refills', {
          method: 'POST',
          body: JSON.stringify({
            product: refill.product,
            qty: Number(refill.qty),
            by_user: refill.by || refill.by_user
          })
        });
      } catch (mutationError) {
        console.warn('Failed to save refill to backend, storing locally instead', mutationError);
        appendRefillLocally(refill);
      }
    },
    clearRefills: async () => {
      try {
        await runMutation('/api/refills', { method: 'DELETE' });
      } catch (mutationError) {
        console.warn('Failed to clear refills in backend, clearing locally instead', mutationError);
        clearRefillsLocally();
      }
    },
    addLoginLog: async (log) => {
      try {
        return await apiRequest('/api/login-logs', {
          method: 'POST',
          body: JSON.stringify({
            user_name: log.user || log.user_name,
            role: log.role,
            login_time: log.loginTime || log.login_time,
            device: log.device
          })
        });
      } catch (logError) {
        console.warn('Failed to save login log to backend, storing locally instead', logError);
        return appendLoginLogLocally(log);
      }
    },
    updateLoginLog: async (id) => {
      try {
        return await apiRequest(`/api/login-logs/${id}/logout`, { method: 'PUT' });
      } catch (logError) {
        console.warn('Failed to update login log in backend, updating locally instead', logError);
        logoutLoginLogLocally(id);
        return { id };
      }
    },
    clearLoginLogs: async () => {
      try {
        await runMutation('/api/login-logs', { method: 'DELETE' });
      } catch (logError) {
        console.warn('Failed to clear login logs in backend, clearing locally instead', logError);
        clearLoginLogsLocally();
      }
    },
    updateSettings: async (settings) => {
      try {
        await runMutation('/api/settings', {
          method: 'PUT',
          body: JSON.stringify({
            gst: Number(settings.gst || 0),
            shop: settings.shop || '',
            addr: settings.addr || '',
            gstin: settings.gstin || '',
            fssai: settings.fssai || '',
            phone: settings.phone || ''
          })
        });
      } catch (mutationError) {
        console.warn('Failed to update settings in backend, updating locally instead', mutationError);
        updateSettingsLocally(settings);
      }
    },
    addStaff: async (account) => {
      try {
        await runMutation('/api/accounts', {
          method: 'POST',
          body: JSON.stringify({
            user: account.user,
            password: account.pass,
            role: account.role
          })
        });
      } catch (mutationError) {
        console.warn('Failed to save staff in backend, storing locally instead', mutationError);
        appendStaffLocally(account);
      }
    },
    deleteStaff: async (username) => {
      try {
        await runMutation(`/api/accounts/${encodeURIComponent(username)}`, {
          method: 'DELETE'
        });
      } catch (mutationError) {
        console.warn('Failed to delete staff in backend, deleting locally instead', mutationError);
        deleteStaffLocally(username);
      }
    }
  };
}
