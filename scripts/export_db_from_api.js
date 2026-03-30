/* global process */
import fs from 'fs';
import path from 'path';

// Config
const apiUrl = process.env.EXPORT_API_URL || 'http://localhost:5001/api/db';
const outputFile = process.env.EXPORT_SQL_FILE || path.resolve(process.cwd(), 'client', 'src', 'components', 'Dashboard', 'schema.sql');

const defaultData = {
  users: [
    { id: 1, username: 'admin', password: 'admin_password', role: 'Admin' },
    { id: 2, username: 'alice', password: 'pass1', role: 'User' },
    { id: 3, username: 'bob', password: 'pass2', role: 'User' },
    { id: 4, username: 'charlie', password: 'pass3', role: 'User' }
  ],
  accounts: [
    { id: 1, user: 'admin', pass: 'admin123', role: 'Admin' },
    { id: 2, user: 'staff', pass: 'staff123', role: 'Staff' },
    { id: 3, user: 'staff1', pass: 'staff123', role: 'Staff' },
    { id: 4, user: 'staff2', pass: 'staff123', role: 'Staff' },
    { id: 5, user: 'staff3', pass: 'staff123', role: 'Staff' },
    { id: 6, user: 'staff4', pass: 'staff123', role: 'Staff' },
    { id: 7, user: 'staff5', pass: 'staff123', role: 'Staff' }
  ],
  products: [
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
  ],
  customers: [
    { id: 1, name: 'Alice Johnson', phone: '9876543210', visits: 3, total: 1282.50, lastVisit: '2026-03-25 16:30:00' },
    { id: 2, name: 'Bob Singh', phone: '9123456789', visits: 1, total: 234.00, lastVisit: '2026-03-26 11:15:00' }
  ],
  bills: [
    { id: 1, billNo: 'BILL-1001', customer: 'Alice Johnson', payment: 'Card', subtotal: 230, cgst: 8.69, sgst: 8.69, grand: 247.38, items: '[{"prod":"GNR-01P","qty":1}]', date: '2026-03-01 11:05:00' },
    { id: 2, billNo: 'BILL-1002', customer: 'Bob Singh', payment: 'Cash', subtotal: 85, cgst: 2.38, sgst: 2.38, grand: 89.75, items: '[{"prod":"GNR-01B","qty":1}]', date: '2026-03-03 15:30:00' }
  ],
  revenueEntries: [
    { id: 1, description: 'Wholesale order income', amount: 1200.00, date: '2026-03-02 12:00:00' },
    { id: 2, description: 'Stock clearance event', amount: 650.00, date: '2026-03-04 16:15:00' },
    { id: 3, description: 'Service revenue', amount: 320.00, date: '2026-03-08 10:45:00' },
    { id: 4, description: 'Online store promotion', amount: 490.00, date: '2026-03-11 14:30:00' }
  ],
  purchases: [
    { id: 1, date: '2026-03-01 10:00:00', supplier: 'Sri Bhavani Oils', product: 'Groundnut Oil (Refined) 5L Can', qty: 10, amount: 9300 },
    { id: 2, date: '2026-03-05 14:20:00', supplier: 'Coimbatore Oil Traders', product: 'Sesame Oil (Mukiil) 15kg Tin', qty: 4, amount: 16200 }
  ],
  refills: [
    { id: 1, date: '2026-03-07 09:00:00', product: 'Groundnut Oil (Refined) 5L Can', qty: 20, by: 'Admin' },
    { id: 2, date: '2026-03-09 16:30:00', product: 'Sunflower Oil (Refined) 5L Can', qty: 15, by: 'Admin' }
  ],
  priceHistory: [
    { id: 1, date: '2026-03-05 10:00:00', product: 'Groundnut Oil (Refined) 15kg Tin', old: 2860, new: 2920, by: 'admin' },
    { id: 2, date: '2026-03-12 11:20:00', product: 'Sunflower Oil (Refined) 5L Can', old: 910, new: 940, by: 'admin' },
    { id: 3, date: '2026-03-18 15:10:00', product: 'Sesame Oil (Karmegam) 1L Packet', old: 318, new: 330, by: 'staff' }
  ],
  loginLogs: [
    { id: 1, user: 'admin', loginTime: '2026-03-25 08:00:00', logoutTime: '2026-03-25 17:00:00' }
  ],
  settings: {
    id: 1,
    gst: 5,
    shop: 'Sri Nikil Tradings',
    addr: '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004',
    gstin: '33AMCPD1118L1ZK',
    fssai: '12424007000946',
    phone: '94875 81302, 0424 2901803'
  }
};

function escape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value.toString();
  return `'${String(value).replace(/'/g, "''")}'`;
}

function rowToInsert(table, row) {
  const columns = Object.keys(row);
  const values = columns.map((col) => escape(row[col]));
  return `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c}\``).join(', ')}) VALUES (${values.join(', ')});`;
}

async function main() {
  console.log(`Fetching data from ${apiUrl} ...`);
  let data;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.warn(`API responded ${res.status} ${res.statusText}; falling back to default data.`);
      data = defaultData;
    } else {
      data = await res.json();
    }
  } catch (err) {
    console.warn(`Failed to fetch API data: ${err.message}; falling back to default data.`);
    data = defaultData;
  }


  const lines = [];
  lines.push('-- Exported from API', `-- ${new Date().toISOString()}`, 'SET FOREIGN_KEY_CHECKS=0;');

  for (const table of ['users', 'accounts', 'products', 'customers', 'bills', 'revenueEntries', 'purchases', 'refills', 'priceHistory', 'loginLogs', 'settings']) {
    let rows = data[table];
    if (table === 'settings') {
      rows = data.settings ? [data.settings] : [];
    } else if (!Array.isArray(rows)) {
      rows = [];
    }

    const sqlTableName =
      table === 'revenueEntries' ? 'revenue_entries' :
      table === 'priceHistory' ? 'price_history' :
      table === 'loginLogs' ? 'login_logs' :
      table === 'settings' ? 'settings' :
      table;

    lines.push(`\n-- ${sqlTableName} (${Array.isArray(rows) ? rows.length : (rows ? 1 : 0)} rows)`);
    lines.push(`DROP TABLE IF EXISTS \`${sqlTableName}\`;`);

    if (sqlTableName === 'users') {
      lines.push(`CREATE TABLE \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(255) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'User',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'products') {
      lines.push(`CREATE TABLE \`products\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`code\` VARCHAR(100) UNIQUE,
  \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`sold\` INT NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'bills') {
      lines.push(`CREATE TABLE \`bills\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`billNo\` VARCHAR(255) NOT NULL UNIQUE,
  \`customer\` VARCHAR(255),
  \`grand\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`payment\` VARCHAR(50),
  \`date\` DATETIME NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'revenue_entries') {
      lines.push(`CREATE TABLE \`revenue_entries\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`description\` TEXT,
  \`amount\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`date\` DATETIME NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'accounts') {
      lines.push(`CREATE TABLE \`accounts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user\` VARCHAR(255) NOT NULL UNIQUE,
  \`pass\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Staff',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'customers') {
      lines.push(`CREATE TABLE \`customers\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`phone\` VARCHAR(50),
  \`visits\` INT NOT NULL DEFAULT 0,
  \`total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`lastVisit\` DATETIME,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'purchases') {
      lines.push(`CREATE TABLE \`purchases\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`date\` DATETIME NOT NULL,
  \`supplier\` VARCHAR(255),
  \`product\` VARCHAR(255),
  \`qty\` INT NOT NULL DEFAULT 0,
  \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'refills') {
      lines.push(`CREATE TABLE \`refills\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`date\` DATETIME NOT NULL,
  \`product\` VARCHAR(255),
  \`qty\` INT NOT NULL DEFAULT 0,
  \`by\` VARCHAR(100),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'price_history') {
      lines.push(`CREATE TABLE \`price_history\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`date\` DATETIME NOT NULL,
  \`product\` VARCHAR(255),
  \`old\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`new\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  \`by\` VARCHAR(100),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'login_logs') {
      lines.push(`CREATE TABLE \`login_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user\` VARCHAR(255),
  \`loginTime\` DATETIME,
  \`logoutTime\` DATETIME,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    } else if (sqlTableName === 'settings') {
      lines.push(`CREATE TABLE \`settings\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`gst\` DECIMAL(5, 2) NOT NULL DEFAULT 0,
  \`shop\` VARCHAR(255),
  \`addr\` TEXT,
  \`gstin\` VARCHAR(100),
  \`fssai\` VARCHAR(100),
  \`phone\` VARCHAR(100),
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    }

    for (const row of rows) {
      lines.push(rowToInsert(sqlTableName, row));
    }
  }

  lines.push('SET FOREIGN_KEY_CHECKS=1;');

  fs.writeFileSync(outputFile, lines.join('\n') + '\n', 'utf-8');
  console.log(`Saved exported SQL to ${outputFile}`);
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
