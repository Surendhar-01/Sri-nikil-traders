import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.development') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

function numberValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  return Number(value);
}

async function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oil',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

const pool = await createPool();

async function queryTable(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

async function loadErpData() {
  const [
    products,
    bills,
    billItems,
    customers,
    suppliers,
    expenses,
    revenueEntries,
    purchases,
    refills,
    priceHistory,
    loginLogs,
    accounts,
    settingsRows
  ] = await Promise.all([
    queryTable(`
      SELECT id, code, name, category, unit, price, stock, sold, image_url
      FROM products
      ORDER BY id
    `),
    queryTable(`
      SELECT id, bill_no, bill_date, customer_name, phone, payment_method, subtotal, cgst, sgst, grand_total, created_by
      FROM bills
      ORDER BY bill_date DESC, id DESC
    `),
    queryTable(`
      SELECT bill_id, product_id, product_name, qty, price, total
      FROM bill_items
      ORDER BY id DESC
    `),
    queryTable(`
      SELECT id, name, phone, visits, total_amount, first_visit, last_visit
      FROM customers
      ORDER BY id
    `),
    queryTable(`
      SELECT id, name, contact, products_summary, address_text, total_amount
      FROM suppliers
      ORDER BY id
    `),
    queryTable(`
      SELECT id, expense_date, category, description_text, amount, created_by
      FROM expenses
      ORDER BY expense_date DESC, id DESC
    `),
    queryTable(`
      SELECT id, revenue_date, head_name, source_name, amount, auto_sum, created_by
      FROM revenue_entries
      ORDER BY revenue_date DESC, id DESC
    `),
    queryTable(`
      SELECT id, purchase_date, supplier_name, product_name, qty, amount, created_by
      FROM purchases
      ORDER BY purchase_date DESC, id DESC
    `),
    queryTable(`
      SELECT id, refill_date, product_name, qty, created_by
      FROM refills
      ORDER BY refill_date DESC, id DESC
    `),
    queryTable(`
      SELECT id, changed_at, product_name, old_price, new_price, changed_by
      FROM price_history
      ORDER BY changed_at DESC, id DESC
    `),
    queryTable(`
      SELECT id, user_name, role_name, login_time, logout_time, device_name
      FROM login_logs
      ORDER BY login_time DESC, id DESC
    `),
    queryTable(`
      SELECT user_name, password_text, role_name
      FROM accounts
      ORDER BY user_name
    `),
    queryTable(`
      SELECT id, gst, shop_name, address_text, gstin, fssai, phone, bill_seq
      FROM settings
      ORDER BY id
      LIMIT 1
    `)
  ]);

  const billItemsByBillId = billItems.reduce((accumulator, item) => {
    const key = item.bill_id;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push({
      id: Number(item.product_id),
      name: item.product_name,
      qty: Number(item.qty),
      price: numberValue(item.price),
      total: numberValue(item.total)
    });

    return accumulator;
  }, {});

  const settings = settingsRows[0] || {};
  const mappedAccounts = accounts
    .filter(account => account.user_name)
    .map(account => ({
      user: account.user_name,
      pass: account.password_text,
      role: account.role_name || (account.user_name?.toLowerCase() === 'admin' ? 'Admin' : 'Staff')
    }));

  const requiredAccounts = [
    { user: 'admin', pass: 'admin123', role: 'Admin' },
    { user: 'staff', pass: 'staff123', role: 'Staff' }
  ];

  requiredAccounts.forEach(requiredAccount => {
    if (!mappedAccounts.some(account => account.user?.toLowerCase() === requiredAccount.user)) {
      mappedAccounts.push(requiredAccount);
    }
  });

  return {
    products: products.map(product => ({
      id: Number(product.id),
      code: product.code,
      name: product.name,
      cat: product.category,
      unit: product.unit,
      price: numberValue(product.price),
      stock: Number(product.stock),
      sold: Number(product.sold),
      image: product.image_url
    })),
    bills: bills.map(bill => ({
      id: Number(bill.id),
      billNo: bill.bill_no,
      date: new Date(bill.bill_date).toISOString(),
      customer: bill.customer_name,
      phone: bill.phone || '',
      payment: bill.payment_method || '',
      subtotal: numberValue(bill.subtotal),
      cgst: numberValue(bill.cgst),
      sgst: numberValue(bill.sgst),
      grand: numberValue(bill.grand_total),
      by: bill.created_by || 'staff',
      items: billItemsByBillId[bill.id] || []
    })),
    customers: customers.map(customer => ({
      id: Number(customer.id),
      name: customer.name,
      phone: customer.phone || '',
      visits: Number(customer.visits),
      total: numberValue(customer.total_amount),
      firstVisit: customer.first_visit ? new Date(customer.first_visit).toISOString() : null,
      lastVisit: customer.last_visit ? new Date(customer.last_visit).toISOString() : null
    })),
    suppliers: suppliers.map(supplier => ({
      id: Number(supplier.id),
      name: supplier.name,
      contact: supplier.contact || '',
      products: supplier.products_summary || '',
      addr: supplier.address_text || '',
      total: numberValue(supplier.total_amount)
    })),
    expenses: expenses.map(expense => ({
      id: Number(expense.id),
      date: new Date(expense.expense_date).toISOString(),
      category: expense.category,
      desc: expense.description_text || '',
      amount: numberValue(expense.amount),
      by: expense.created_by || 'staff'
    })),
    revenueEntries: revenueEntries.map(entry => ({
      id: Number(entry.id),
      date: new Date(entry.revenue_date).toISOString(),
      head: entry.head_name,
      source: entry.source_name,
      amount: numberValue(entry.amount),
      autoSum: Boolean(entry.auto_sum),
      by: entry.created_by || 'staff'
    })),
    purchases: purchases.map(purchase => ({
      id: Number(purchase.id),
      date: new Date(purchase.purchase_date).toISOString(),
      supplier: purchase.supplier_name,
      product: purchase.product_name,
      qty: Number(purchase.qty),
      amount: numberValue(purchase.amount),
      by: purchase.created_by || 'staff'
    })),
    refills: refills.map(refill => ({
      id: Number(refill.id),
      date: new Date(refill.refill_date).toISOString(),
      product: refill.product_name,
      qty: Number(refill.qty),
      by: refill.created_by || 'staff'
    })),
    priceHistory: priceHistory.map(entry => ({
      id: Number(entry.id),
      date: new Date(entry.changed_at).toISOString(),
      product: entry.product_name,
      old: numberValue(entry.old_price),
      new: numberValue(entry.new_price),
      by: entry.changed_by || 'staff'
    })),
    loginLogs: loginLogs.map(log => ({
      id: Number(log.id),
      user: log.user_name,
      role: log.role_name || 'Staff',
      loginTime: new Date(log.login_time).toISOString(),
      logoutTime: log.logout_time ? new Date(log.logout_time).toISOString() : null,
      device: log.device_name || 'Desktop'
    })),
    accounts: mappedAccounts,
    settings: {
      gst: numberValue(settings.gst),
      shop: settings.shop_name || 'Sri Nikil Tradings',
      addr: settings.address_text || '',
      gstin: settings.gstin || '',
      fssai: settings.fssai || '',
      phone: settings.phone || ''
    },
    billSeq: Number(settings.bill_seq || 1000)
  };
}

function buildBillNumber(sequence) {
  return `SNT-${String(sequence).padStart(4, '0')}`;
}

async function getSettingsRow(connection) {
  const [rows] = await connection.query(`
    SELECT id, bill_seq
    FROM settings
    ORDER BY id
    LIMIT 1
  `);

  return rows[0] || null;
}

async function getProductMap(connection, productIds) {
  if (!productIds.length) {
    return new Map();
  }

  const [rows] = await connection.query(
    `
      SELECT id, name, price, stock, sold
      FROM products
      WHERE id IN (?)
    `,
    [productIds]
  );

  return new Map(rows.map(row => [Number(row.id), row]));
}

app.get('/api/erp-data', async (_request, response) => {
  try {
    const data = await loadErpData();
    response.json(data);
  } catch (error) {
    console.error('Failed to load ERP data from MySQL', error);
    response.status(500).json({
      message: 'Failed to load ERP data from MySQL.',
      error: error.message
    });
  }
});

app.get('/api/db', async (_request, response) => {
  try {
    const data = await loadErpData();
    response.json(data);
  } catch (error) {
    console.error('Failed to load ERP data from MySQL', error);
    response.status(500).json({
      message: 'Failed to load ERP data from MySQL.',
      error: error.message
    });
  }
});

app.post('/api/bills', async (request, response) => {
  const {
    customer,
    phone,
    payment,
    items,
    subtotal,
    cgst,
    sgst,
    grand,
    by_user: byUser
  } = request.body || {};

  if (!customer?.trim()) {
    return response.status(400).json({ message: 'Customer name is required.' });
  }

  if (!phone?.trim()) {
    return response.status(400).json({ message: 'Phone number is required.' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ message: 'At least one bill item is required.' });
  }

  const normalizedItems = items.map(item => ({
    id: Number(item.id),
    name: String(item.name || '').trim(),
    qty: Number(item.qty),
    price: numberValue(item.price),
    total: numberValue(item.total)
  }));

  if (normalizedItems.some(item => !item.id || !item.name || item.qty <= 0 || item.price < 0 || item.total < 0)) {
    return response.status(400).json({ message: 'Bill contains invalid item data.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const settingsRow = await getSettingsRow(connection);
    if (!settingsRow) {
      throw new Error('Settings row not found.');
    }

    const currentBillSeq = Number(settingsRow.bill_seq || 1000);
    const billNo = buildBillNumber(currentBillSeq);
    const productIds = [...new Set(normalizedItems.map(item => item.id))];
    const productMap = await getProductMap(connection, productIds);

    if (productMap.size !== productIds.length) {
      throw new Error('One or more products were not found.');
    }

    for (const item of normalizedItems) {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error(`Product ${item.id} was not found.`);
      }

      if (Number(product.stock) < item.qty) {
        throw new Error(`${product.name} has insufficient stock.`);
      }
    }

    const [billResult] = await connection.query(
      `
        INSERT INTO bills (
          bill_no,
          bill_date,
          customer_name,
          phone,
          payment_method,
          subtotal,
          cgst,
          sgst,
          grand_total,
          created_by
        )
        VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        billNo,
        customer.trim(),
        phone.trim(),
        String(payment || 'Cash'),
        numberValue(subtotal),
        numberValue(cgst),
        numberValue(sgst),
        numberValue(grand),
        String(byUser || 'staff')
      ]
    );

    const billId = Number(billResult.insertId);

    for (const item of normalizedItems) {
      await connection.query(
        `
          INSERT INTO bill_items (
            bill_id,
            product_id,
            product_name,
            qty,
            price,
            total
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          billId,
          item.id,
          item.name,
          item.qty,
          item.price,
          item.total
        ]
      );

      await connection.query(
        `
          UPDATE products
          SET stock = stock - ?, sold = sold + ?
          WHERE id = ?
        `,
        [item.qty, item.qty, item.id]
      );
    }

    const [customerRows] = await connection.query(
      `
        SELECT id, visits, total_amount
        FROM customers
        WHERE phone = ?
        LIMIT 1
      `,
      [phone.trim()]
    );

    if (customerRows.length > 0) {
      const existingCustomer = customerRows[0];
      await connection.query(
        `
          UPDATE customers
          SET
            name = ?,
            visits = ?,
            total_amount = ?,
            last_visit = NOW()
          WHERE id = ?
        `,
        [
          customer.trim(),
          Number(existingCustomer.visits || 0) + 1,
          numberValue(existingCustomer.total_amount) + numberValue(grand),
          existingCustomer.id
        ]
      );
    } else {
      await connection.query(
        `
          INSERT INTO customers (
            name,
            phone,
            visits,
            total_amount,
            first_visit,
            last_visit
          )
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `,
        [customer.trim(), phone.trim(), 1, numberValue(grand)]
      );
    }

    await connection.query(
      `
        UPDATE settings
        SET bill_seq = ?
        WHERE id = ?
      `,
      [currentBillSeq + 1, settingsRow.id]
    );

    await connection.commit();

    response.status(201).json({
      id: billId,
      billNo
    });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to save bill', error);
    response.status(500).json({
      message: error.message || 'Failed to save bill.'
    });
  } finally {
    connection.release();
  }
});

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ ok: true, database: process.env.DB_NAME || 'oil' });
  } catch (error) {
    response.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`ERP API running at http://localhost:${port}/api`);
});
