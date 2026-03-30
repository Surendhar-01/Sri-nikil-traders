require('dotenv').config({ path: '.env.development' });
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Initialize Database ---
async function initializeDatabase() {
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306
  });
  await tempConnection.execute('CREATE DATABASE IF NOT EXISTS erp');
  await tempConnection.end();
}

// --- Database Connection Pool ---
// Using a pool is better for performance and managing multiple connections
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- API Endpoint to fetch all data ---
// This matches the proxy target in your Vite config
app.get('/api/db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Fetch all data from tables in parallel for efficiency
      const [products, bills, users, customers, purchases, refills, priceHistory, accounts, settings, loginLogs] = await Promise.all([
        connection.query('SELECT * FROM products ORDER BY id DESC'),
        connection.query('SELECT * FROM bills ORDER BY date DESC'),
        connection.query('SELECT * FROM users'),
        connection.query('SELECT * FROM customers ORDER BY id DESC'),
        connection.query('SELECT * FROM purchases ORDER BY date DESC'),
        connection.query('SELECT * FROM refills ORDER BY date DESC'),
        connection.query('SELECT * FROM price_history ORDER BY date DESC'),
        connection.query('SELECT * FROM accounts'),
        connection.query('SELECT * FROM settings LIMIT 1'),
        connection.query('SELECT * FROM login_logs ORDER BY id DESC')
      ]);

      // Send the data back in the format the frontend expects
      res.json({
        products: products[0],
        bills: bills[0],
        users: users[0],
        customers: customers[0],
        purchases: purchases[0],
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
      'SELECT * FROM accounts WHERE LOWER(TRIM(user)) = LOWER(TRIM(?)) AND TRIM(pass) = TRIM(?)',
      [user, password]
    );

    if (rows.length > 0) {
      const account = rows[0];
      res.json({ user: account.user, role: account.role });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
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

    const [result] = await connection.query(
      'INSERT INTO bills (billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, items, by_user, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [billNo, customer, phone, payment, date, subtotal, cgst, sgst, grand, JSON.stringify(items || []), by_user]
    );

    // Update stock for each item
    if (Array.isArray(items)) {
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = GREATEST(0, stock - ?), sold = sold + ? WHERE id = ?',
          [item.qty, item.qty, item.id]
        );
      }
    }

    // optionally maintain customers table
    if (customer) {
      await connection.query(
        'INSERT INTO customers (`name`, `phone`, `visits`, `total`, `lastVisit`) VALUES (?, ?, 1, ?, ?) ON DUPLICATE KEY UPDATE `visits` = `visits` + 1, `total` = `total` + VALUES(`total`), `lastVisit` = VALUES(`lastVisit`)',
        [customer, phone || null, grand || 0, date]
      );
    }

    await connection.commit();
    res.json({ id: result.insertId });
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

app.post('/api/purchases', async (req, res) => {
  const { supplier, product, qty, amount, date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO purchases (supplier, product, qty, amount, date, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [supplier, product, qty, amount, date || new Date()]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert purchase:', error);
    res.status(500).json({ error: 'Unable to save purchase' });
  }
});

app.post('/api/refills', async (req, res) => {
  const { product, qty, by, date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO refills (product, qty, `by`, date, created_at) VALUES (?, ?, ?, ?, NOW())',
      [product, qty, by || 'system', date || new Date()]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert refill:', error);
    res.status(500).json({ error: 'Unable to save refill' });
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
    const [result] = await pool.query(
      'INSERT INTO accounts (user, pass, role, created_at) VALUES (?, ?, ?, NOW())',
      [user, password, role || 'Staff']
    );
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Failed to insert account:', error);
    res.status(500).json({ error: 'Unable to save account' });
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

app.post('/api/login-logs', async (req, res) => {
  const { user_name, role, login_time, device } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO login_logs (user, role, loginTime, device, created_at) VALUES (?, ?, NOW(), ?, NOW())',
      [user_name, role, device]
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
    console.log(`Database connected and server listening on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}).on('error', (err) => {
  console.error('Failed to start server:', err);
});