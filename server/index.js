const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const envCandidates = [
  path.resolve(process.cwd(), '.env.development'),
  path.resolve(__dirname, '.env.development')
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
require('dotenv').config({ path: envPath });
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;
const dbName = process.env.DB_DATABASE || process.env.DB_NAME || 'erp';
const dbPort = Number(process.env.DB_PORT || 3306);

function isHashedPassword(storedPassword) {
  return typeof storedPassword === 'string' && storedPassword.startsWith('scrypt$');
}

function hashPassword(password) {
  const plain = String(password || '');
  const salt = crypto.randomBytes(16).toString('hex');
  const N = 16384;
  const r = 8;
  const p = 1;
  const derivedKey = crypto.scryptSync(plain, salt, 64, { N, r, p }).toString('hex');
  return `scrypt$${N}$${r}$${p}$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedPassword) {
  const plain = String(password || '');
  const stored = String(storedPassword || '');

  if (!isHashedPassword(stored)) {
    return plain === stored;
  }

  const [prefix, nStr, rStr, pStr, salt, hashHex] = stored.split('$');
  if (prefix !== 'scrypt' || !salt || !hashHex) {
    return false;
  }

  const N = Number(nStr || 16384);
  const r = Number(rStr || 8);
  const p = Number(pStr || 1);
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(plain, salt, expected.length, { N, r, p });

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}

function toMysqlDateTime(value) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return now.toLocaleString('sv').replace('T', ' ').slice(0, 19);
  }

  return parsed.toLocaleString('sv').replace('T', ' ').slice(0, 19);
}

async function getNextBillNo(connection) {
  const [rows] = await connection.query(
    "SELECT billNo FROM bills WHERE billNo LIKE 'SNT-%' ORDER BY CAST(SUBSTRING_INDEX(billNo, '-', -1) AS UNSIGNED) DESC LIMIT 1"
  );

  const current = rows?.[0]?.billNo || '';
  const match = String(current).match(/SNT-(\d+)/i);
  const seq = match ? Number(match[1]) + 1 : 1000;
  return `SNT-${String(seq).padStart(4, '0')}`;
}

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Sri Nikil ERP API',
    status: 'ok',
    docs: '/docs'
  });
});

app.get('/docs', (req, res) => {
  res.json({
    name: 'Sri Nikil ERP API',
    baseUrl: '/api',
    endpoints: [
      'GET /api/db',
      'POST /api/auth/login',
      'POST /api/bills',
      'DELETE /api/bills/:id',
      'DELETE /api/bills',
      'POST /api/refills',
      'DELETE /api/refills/:id',
      'DELETE /api/refills',
      'PUT /api/products/:id/price',
      'POST /api/products',
      'DELETE /api/products/:id',
      'DELETE /api/price-history/:id',
      'DELETE /api/price-history',
      'POST /api/accounts',
      'PUT /api/accounts/:user/password',
      'DELETE /api/accounts/:user',
      'DELETE /api/customers',
      'POST /api/login-logs',
      'PUT /api/login-logs/:id/logout',
      'DELETE /api/login-logs/:id',
      'DELETE /api/login-logs',
      'PUT /api/settings'
    ]
  });
});

// --- Initialize Database ---
async function initializeDatabase() {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: dbPort
  });

  try {
    // 1. Create database if it doesn't exist
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    // 2. Select the database
    await tempConnection.query(`USE \`${dbName}\``);

    // 3. Define and ensure all required tables exist
    const tableDefinitions = {
      users: `CREATE TABLE IF NOT EXISTS \`users\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`username\` VARCHAR(255) NOT NULL UNIQUE, \`password\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'User', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      accounts: `CREATE TABLE IF NOT EXISTS \`accounts\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255) NOT NULL UNIQUE, \`pass\` VARCHAR(255) NOT NULL, \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff', \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      products: `CREATE TABLE IF NOT EXISTS \`products\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`code\` VARCHAR(100) UNIQUE, \`cat\` VARCHAR(100), \`unit\` VARCHAR(50), \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`stock\` INT NOT NULL DEFAULT 0, \`sold\` INT NOT NULL DEFAULT 0, \`image\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      bills: `CREATE TABLE IF NOT EXISTS \`bills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`billNo\` VARCHAR(255) NOT NULL, \`customer\` VARCHAR(255), \`phone\` VARCHAR(20), \`payment\` VARCHAR(50), \`date\` DATETIME NOT NULL, \`subtotal\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`cgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`sgst\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`grand\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, \`items\` LONGTEXT, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      customers: `CREATE TABLE IF NOT EXISTS \`customers\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`name\` VARCHAR(255) NOT NULL, \`phone\` VARCHAR(50) UNIQUE, \`visits\` INT NOT NULL DEFAULT 0, \`total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`firstVisit\` DATETIME, \`lastVisit\` DATETIME, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      sales: `CREATE TABLE IF NOT EXISTS \`sales\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`billNo\` VARCHAR(255), \`customer\` VARCHAR(255), \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by_user\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      refills: `CREATE TABLE IF NOT EXISTS \`refills\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`qty\` INT NOT NULL DEFAULT 0, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      price_history: `CREATE TABLE IF NOT EXISTS \`price_history\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`date\` DATETIME NOT NULL, \`product\` VARCHAR(255), \`old\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`new\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00, \`by\` VARCHAR(100), \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      login_logs: `CREATE TABLE IF NOT EXISTS \`login_logs\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`user\` VARCHAR(255), \`role\` VARCHAR(50), \`loginTime\` DATETIME, \`logoutTime\` DATETIME, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`,
      settings: `CREATE TABLE IF NOT EXISTS \`settings\` ( \`id\` INT AUTO_INCREMENT PRIMARY KEY, \`gst\` DECIMAL(5, 2) NOT NULL DEFAULT 0.00, \`shop\` VARCHAR(255), \`addr\` TEXT, \`gstin\` VARCHAR(100), \`fssai\` VARCHAR(100), \`phone\` VARCHAR(100), \`logo\` TEXT, \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE=InnoDB`
    };

    for (const [tableName, query] of Object.entries(tableDefinitions)) {
      try {
        await tempConnection.query(query);
      } catch (err) {
        console.warn(`Failed to create/verify table ${tableName}:`, err.message);
      }
    }

    // 4. Handle migrations / refinements
    // firstVisit for customers
    const [customerCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'customers', 'firstVisit']
    );
    if (customerCols.length === 0) {
      await tempConnection.query('ALTER TABLE `customers` ADD COLUMN firstVisit DATETIME NULL AFTER total');
    }

    // billNo uniqueness removal (if desired by earlier code logic)
    const [billNoUniqueIndexes] = await tempConnection.query(
      `SELECT INDEX_NAME FROM information_schema.statistics WHERE table_schema = ? AND table_name = 'bills' AND column_name = 'billNo' AND non_unique = 0`,
      [dbName]
    );
    for (const indexRow of billNoUniqueIndexes) {
      if (indexRow?.INDEX_NAME) {
        await tempConnection.query(`ALTER TABLE \`bills\` DROP INDEX \`${indexRow.INDEX_NAME}\``);
      }
    }

    // login_logs device column cleanup
    const [deviceCols] = await tempConnection.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?',
      [dbName, 'login_logs', 'device']
    );
    if (deviceCols.length > 0) {
      await tempConnection.query('ALTER TABLE `login_logs` DROP COLUMN `device`');
    }

  } finally {
    await tempConnection.end();
  }
}

// --- Database Connection Pool ---
// Using a pool is better for performance and managing multiple connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: dbName,
  port: dbPort,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function migrateLegacyAccountPasswords() {
  const [tableRows] = await pool.query(
    'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1',
    [dbName, 'accounts']
  );

  if (tableRows.length === 0) {
    return;
  }

  const [rows] = await pool.query('SELECT id, pass FROM accounts');
  for (const account of rows) {
    if (!isHashedPassword(account.pass)) {
      const upgradedHash = hashPassword(account.pass || '');
      await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [upgradedHash, account.id]);
    }
  }
}

// --- API Endpoint to fetch all data ---
// This matches the proxy target in your Vite config
app.get('/api/db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Fetch all data from tables in parallel for efficiency
      const [products, bills, users, customers, sales, refills, priceHistory, accounts, settings, loginLogs] = await Promise.all([
        connection.query('SELECT * FROM products ORDER BY id DESC'),
        connection.query('SELECT * FROM bills ORDER BY date DESC'),
        connection.query('SELECT * FROM users'),
        connection.query('SELECT * FROM customers ORDER BY id DESC'),
        connection.query('SELECT * FROM sales ORDER BY date DESC'),
        connection.query('SELECT * FROM refills ORDER BY date DESC'),
        connection.query('SELECT * FROM price_history ORDER BY date DESC'),
        connection.query('SELECT id, user, role FROM accounts ORDER BY id ASC'),
        connection.query('SELECT * FROM settings LIMIT 1'),
        connection.query("SELECT * FROM login_logs WHERE LOWER(TRIM(COALESCE(role, ''))) <> 'admin' ORDER BY id DESC")
      ]);

      // Send the data back in the format the frontend expects
      res.json({
        products: products[0],
        bills: bills[0],
        users: users[0],
        customers: customers[0],
        sales: sales[0],
        refills: refills[0],
        priceHistory: priceHistory[0],
        accounts: accounts[0],
        settings: settings[0] || {},
        loginLogs: loginLogs[0]
      });
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching data from DB:', error);
    res.status(500).json({ error: 'Failed to fetch data from database' });
  }
});

// --- Authentication ---
app.post('/api/auth/login', async (req, res) => {
  const { user, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) LIMIT 1',
      [user]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const account = rows[0];
    const validPassword = verifyPassword(password, account.pass);

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!isHashedPassword(account.pass)) {
      const upgradedHash = hashPassword(password);
      await pool.query('UPDATE accounts SET pass = ? WHERE id = ?', [upgradedHash, account.id]);
    }

    res.json({ user: account.user, role: account.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Auth failure' });
  }
});

// --- API write endpoints for persistence ---
app.post('/api/bills', async (req, res) => {
  const { billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const saleDate = toMysqlDateTime(date);

    let billNoToUse = String(billNo || '').trim();
    if (!billNoToUse) {
      billNoToUse = await getNextBillNo(connection);
    } else {
      const [existing] = await connection.query(
        'SELECT id FROM bills WHERE billNo = ? LIMIT 1',
        [billNoToUse]
      );
      if (existing.length > 0) {
        billNoToUse = await getNextBillNo(connection);
      }
    }

    const [result] = await connection.query(
      'INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [billNoToUse, customer, phone, payment, saleDate, subtotal, cgst, sgst, grand, JSON.stringify(items || []), by_user]
    );

    // Update stock for each item
    if (Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE id = ?',
          [item.qty, item.qty, item.id]
        );
        // Insert into item-wise sales table
        await connection.query(
          'INSERT INTO sales (date, billNo, customer, product, qty, amount, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [saleDate, billNoToUse, customer || null, item.name, item.qty, item.total || (item.qty * item.price), by_user || null]
        );
      }
    }

    // optionally maintain customers table
    if (customer) {
      await connection.query(
        'INSERT INTO customers (`name`, `phone`, `visits`, `total`, `firstVisit`, `lastVisit`) VALUES (?, ?, 1, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `firstVisit` = IFNULL(LEAST(`firstVisit`, VALUES(`firstVisit`)), VALUES(`firstVisit`)), `lastVisit` = IFNULL(GREATEST(`lastVisit`, VALUES(`lastVisit`)), VALUES(`lastVisit`))',
        [customer, phone || null, grand || 0, saleDate, saleDate]
      );
    }

    await connection.commit();
    res.json({ id: result.insertId, billNo: billNoToUse });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to insert bill:', error);
    res.status(500).json({ error: 'Unable to save bill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/bills/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch the bill to get items
    const [bills] = await connection.query('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    if (bills.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Bill not found' });
    }

    const bill = bills[0];
    const items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;

    // 2. Revert stock
    if (Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
          [item.qty, item.qty, item.id]
        );
      }
    }

    // 3. Delete the bill
    await connection.query('DELETE FROM bills WHERE id = ?', [req.params.id]);
    await connection.query('DELETE FROM sales WHERE billNo = ?', [bill.billNo]);

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to delete bill:', error);
    res.status(500).json({ error: 'Unable to delete bill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/bills', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [bills] = await connection.query('SELECT items FROM bills');
    const rollbackByProductId = new Map();

    for (const bill of bills) {
      const parsedItems = typeof bill.items === 'string' ? JSON.parse(bill.items || '[]') : (bill.items || []);
      if (!Array.isArray(parsedItems)) {
        continue;
      }

      for (const item of parsedItems) {
        const productId = Number(item.id);
        const qty = Number(item.qty || 0);
        if (!Number.isFinite(productId) || !Number.isFinite(qty) || qty <= 0) {
          continue;
        }

        rollbackByProductId.set(productId, (rollbackByProductId.get(productId) || 0) + qty);
      }
    }

    for (const [productId, qty] of rollbackByProductId.entries()) {
      await connection.query(
        'UPDATE products SET stock = stock + ?, sold = GREATEST(0, sold - ?) WHERE id = ?',
        [qty, qty, productId]
      );
    }

    await connection.query('DELETE FROM bills');
    await connection.query('DELETE FROM customers');
    await connection.query('DELETE FROM sales');

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to clear bills:', error);
    res.status(500).json({ error: 'Unable to clear bills' });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/api/refills', async (req, res) => {
  const { product, qty, by, by_user, date } = req.body;
  const refillQty = Number.parseInt(qty, 10);
  if (!product || !Number.isFinite(refillQty) || refillQty <= 0) {
    return res.status(400).json({ error: 'Product and positive quantity are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query(
      'UPDATE products SET stock = stock + ? WHERE name = ?',
      [refillQty, product]
    );

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found for refill' });
    }

    const [result] = await connection.query(
      'INSERT INTO refills (product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, NOW())',
      [product, refillQty, by || by_user || 'system', toMysqlDateTime(date)]
    );

    await connection.commit();
    res.json({ id: result.insertId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to insert refill:', error);
    res.status(500).json({ error: 'Unable to save refill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/refills/:id', async (req, res) => {
  const refillId = Number(req.params.id);
  if (!Number.isFinite(refillId)) {
    return res.status(400).json({ error: 'Valid refill id is required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT id, product, qty FROM refills WHERE id = ? LIMIT 1', [refillId]);
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Refill record not found' });
    }

    const refill = rows[0];
    await connection.query(
      'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE name = ?',
      [Number(refill.qty || 0), refill.product]
    );
    await connection.query('DELETE FROM refills WHERE id = ?', [refillId]);

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to delete refill:', error);
    res.status(500).json({ error: 'Unable to delete refill' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/refills', async (req, res) => {
  try {
    await pool.query('DELETE FROM refills');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear refills:', error);
    res.status(500).json({ error: 'Unable to clear refills' });
  }
});

app.post('/api/price-history', async (req, res) => {
  const { product, old, new: newPrice, by, date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [product, old, newPrice, by || 'system', date || new Date()]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert price history:', error);
    res.status(500).json({ error: 'Unable to save price history' });
  }
});

app.put('/api/products/:id/price', async (req, res) => {
  const productId = Number(req.params.id);
  const newPrice = Number(req.body?.new_price);
  const byUser = req.body?.by_user || 'system';

  if (!Number.isFinite(productId) || !Number.isFinite(newPrice) || newPrice < 0) {
    return res.status(400).json({ error: 'Valid product id and new price are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT name, price FROM products WHERE id = ? LIMIT 1', [productId]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const oldPrice = Number(product.price || 0);

    await connection.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, productId]);
    await connection.query(
      'INSERT INTO price_history (`product`, `old`, `new`, `by`, `date`, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [product.name, oldPrice, newPrice, byUser, toMysqlDateTime(req.body?.date)]
    );

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Failed to update product price:', error);
    res.status(500).json({ error: 'Unable to update product price' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/api/price-history/:id', async (req, res) => {
  const historyId = Number(req.params.id);
  if (!Number.isFinite(historyId)) {
    return res.status(400).json({ error: 'Valid history id is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM price_history WHERE id = ?', [historyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Price history entry not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete price history:', error);
    res.status(500).json({ error: 'Unable to delete price history' });
  }
});

app.delete('/api/price-history', async (req, res) => {
  try {
    await pool.query('DELETE FROM price_history');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear price history:', error);
    res.status(500).json({ error: 'Unable to clear price history' });
  }
});

app.post('/api/products', async (req, res) => {
  const { code, name, cat, unit, price, stock, image } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (code, name, cat, unit, price, stock, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [code, name, cat, unit, price, stock, image]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert product:', error);
    res.status(500).json({ error: 'Unable to save product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Unable to delete product' });
  }
});

app.post('/api/accounts', async (req, res) => {
  const { user, password, role } = req.body;
  try {
    const hashedPassword = hashPassword(password || '');
    const [result] = await pool.query(
      'INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())',
      [user, hashedPassword, role || 'Staff']
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert account:', error);
    res.status(500).json({ error: 'Unable to save account' });
  }
});

app.put('/api/accounts/:user/password', async (req, res) => {
  const username = String(req.params.user || '').trim();
  const nextPassword = String(req.body?.password || '');

  if (!username || !nextPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = hashPassword(nextPassword);
    const [result] = await pool.query('UPDATE accounts SET pass = ? WHERE user = ?', [hashedPassword, username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update account password:', error);
    res.status(500).json({ error: 'Unable to update account password' });
  }
});

app.delete('/api/accounts/:user', async (req, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE user = ?', [req.params.user]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete account:', error);
    res.status(500).json({ error: 'Unable to delete account' });
  }
});

app.delete('/api/customers', async (req, res) => {
  try {
    await pool.query('DELETE FROM customers');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear customers:', error);
    res.status(500).json({ error: 'Unable to clear customers' });
  }
});

app.post('/api/login-logs', async (req, res) => {
  const { user_name, role } = req.body;
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedRole === 'admin') {
    return res.json({ skipped: true });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO login_logs (user, role, loginTime, created_at) VALUES (?, ?, NOW(), NOW())',
      [user_name, role]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert login log:', error);
    res.status(500).json({ error: 'Unable to save login log' });
  }
});

app.put('/api/login-logs/:id/logout', async (req, res) => {
  try {
    await pool.query('UPDATE login_logs SET logoutTime = NOW() WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update login log:', error);
    res.status(500).json({ error: 'Unable to update login log' });
  }
});

app.delete('/api/login-logs/:id', async (req, res) => {
  const logId = Number(req.params.id);
  if (!Number.isFinite(logId)) {
    return res.status(400).json({ error: 'Valid login log id is required' });
  }

  try {
    const [result] = await pool.query('DELETE FROM login_logs WHERE id = ?', [logId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Login log not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete login log:', error);
    res.status(500).json({ error: 'Unable to delete login log' });
  }
});

app.delete('/api/login-logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM login_logs');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to clear login logs:', error);
    res.status(500).json({ error: 'Unable to clear login logs' });
  }
});

app.put('/api/settings', async (req, res) => {
  const { gst, shop, addr, gstin, fssai, phone } = req.body;
  try {
    // Only update first row
    await pool.query('UPDATE settings SET gst=?, shop=?, addr=?, gstin=?, fssai=?, phone=? LIMIT 1', [gst, shop, addr, gstin, fssai, phone]);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ error: 'Unable to update settings' });
  }
});


// --- Start the server ---
app.listen(port, '0.0.0.0', async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Verify database connection on startup
    await pool.query('SELECT 1');
    await migrateLegacyAccountPasswords();
    console.log(`Database connected and server listening on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});
