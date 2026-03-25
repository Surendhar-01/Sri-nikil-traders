CREATE DATABASE IF NOT EXISTS sri_nikil_db;
USE sri_nikil_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bill_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS revenue_entries;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS refills;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS settings;

CREATE TABLE products (
  id BIGINT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  sold INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500) DEFAULT NULL
);

CREATE TABLE suppliers (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50) DEFAULT NULL,
  products_summary VARCHAR(255) DEFAULT NULL,
  address_text VARCHAR(255) DEFAULT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE customers (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  visits INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  first_visit DATETIME NULL,
  last_visit DATETIME NULL
);

CREATE TABLE bills (
  id BIGINT PRIMARY KEY,
  bill_no VARCHAR(50) NOT NULL,
  bill_date DATETIME NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  cgst DECIMAL(12,2) NOT NULL DEFAULT 0,
  sgst DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE bill_items (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bill_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_bill_items_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
  CONSTRAINT fk_bill_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE expenses (
  id BIGINT PRIMARY KEY,
  expense_date DATETIME NOT NULL,
  category VARCHAR(100) NOT NULL,
  description_text VARCHAR(255) DEFAULT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE revenue_entries (
  id BIGINT PRIMARY KEY,
  revenue_date DATETIME NOT NULL,
  head_name VARCHAR(100) NOT NULL,
  source_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  auto_sum TINYINT(1) NOT NULL DEFAULT 1,
  created_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE purchases (
  id BIGINT PRIMARY KEY,
  purchase_date DATETIME NOT NULL,
  supplier_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE refills (
  id BIGINT PRIMARY KEY,
  refill_date DATETIME NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  qty INT NOT NULL DEFAULT 0,
  created_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE price_history (
  id BIGINT PRIMARY KEY,
  changed_at DATETIME NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  old_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  new_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  changed_by VARCHAR(100) DEFAULT NULL
);

CREATE TABLE login_logs (
  id BIGINT PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  role_name VARCHAR(100) DEFAULT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME NULL,
  device_name VARCHAR(255) DEFAULT NULL
);

CREATE TABLE accounts (
  user_name VARCHAR(100) PRIMARY KEY,
  password_text VARCHAR(255) NOT NULL,
  role_name VARCHAR(100) NOT NULL
);

CREATE TABLE settings (
  id INT PRIMARY KEY,
  gst DECIMAL(5,2) NOT NULL DEFAULT 0,
  shop_name VARCHAR(255) NOT NULL,
  address_text VARCHAR(255) DEFAULT NULL,
  gstin VARCHAR(50) DEFAULT NULL,
  fssai VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(100) DEFAULT NULL,
  bill_seq INT NOT NULL DEFAULT 1000
);

INSERT INTO products (id, code, name, category, unit, price, stock, sold, image_url) VALUES
(1, 'GNR-15K', 'Groundnut Oil (Refined) 15kg Tin', 'Groundnut', 'tins', 2920.00, 15, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(2, 'GNR-05C', 'Groundnut Oil (Refined) 5L Can', 'Groundnut', 'cans', 930.00, 10, 0, 'https://placehold.co/150x150?text=5L+Can'),
(3, 'GNR-02C', 'Groundnut Oil (Refined) 2L Can', 'Groundnut', 'cans', 383.00, 15, 0, 'https://placehold.co/150x150?text=2L+Can'),
(4, 'GNR-01B', 'Groundnut Oil (Refined) 1L Bottle', 'Groundnut', 'bottles', 188.00, 30, 0, 'https://placehold.co/150x150?text=1L+Bottle'),
(5, 'GNR-01P', 'Groundnut Oil (Refined) 1L Packet', 'Groundnut', 'pkts', 184.00, 50, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(6, 'GNR-HFP', 'Groundnut Oil (Refined) 1/2L Packet', 'Groundnut', 'pkts', 92.00, 0, 0, 'https://placehold.co/150x150?text=Half+L+Pkt'),
(7, 'GNP-15K', 'Groundnut Oil (Pure) 15kg Tin', 'Groundnut', 'tins', 3000.00, 8, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(8, 'GNP-05C', 'Groundnut Oil (Pure) 5L Can', 'Groundnut', 'cans', 955.00, 10, 0, 'https://placehold.co/150x150?text=5L+Can'),
(9, 'GNP-01P', 'Groundnut Oil (Pure) 1L Packet', 'Groundnut', 'pkts', 193.00, 40, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(10, 'SFR-15K', 'Sunflower Oil (Refined) 15kg Tin', 'Sunflower', 'tins', 2950.00, 12, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(11, 'SFR-05C', 'Sunflower Oil (Refined) 5L Can', 'Sunflower', 'cans', 940.00, 15, 0, 'https://placehold.co/150x150?text=5L+Can'),
(12, 'SFR-01P', 'Sunflower Oil (Refined) 1L Packet', 'Sunflower', 'pkts', 186.00, 85, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(13, 'PAL-15K', 'Palm Oil 15kg Tin', 'Palm', 'tins', 2445.00, 24, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(14, 'PAL-05C', 'Palm Oil 5L Can', 'Palm', 'cans', 780.00, 20, 0, 'https://placehold.co/150x150?text=5L+Can'),
(15, 'PAL-01P', 'Palm Oil 1L Packet', 'Palm', 'pkts', 154.00, 60, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(16, 'VAN-15K', 'Vanaspati 15kg Tin', 'Vanaspati', 'tins', 2700.00, 5, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(17, 'SEM-01P', 'Sesame Oil (Mayil) 1L Packet', 'Sesame', 'pkts', 320.00, 20, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(18, 'SEM-HFP', 'Sesame Oil (Mayil) 1/2L Packet', 'Sesame', 'pkts', 160.00, 25, 0, 'https://placehold.co/150x150?text=Half+L+Pkt'),
(19, 'SEU-15K', 'Sesame Oil (Mukil) 15kg Tin', 'Sesame', 'tins', 4050.00, 4, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(20, 'SEK-15K', 'Sesame Oil (Karmegam Premium) 15kg Tin', 'Sesame', 'tins', 4560.00, 5, 0, 'https://placehold.co/150x150?text=15kg+Tin'),
(21, 'SEK-05C', 'Sesame Oil (Karmegam) 5L Can', 'Sesame', 'cans', 1575.00, 10, 0, 'https://placehold.co/150x150?text=5L+Can'),
(22, 'SEK-01B', 'Sesame Oil (Karmegam) 1L Bottle', 'Sesame', 'bottles', 340.00, 15, 0, 'https://placehold.co/150x150?text=1L+Bottle'),
(23, 'SEK-01P', 'Sesame Oil (Karmegam) 1L Packet', 'Sesame', 'pkts', 330.00, 30, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(24, 'SEK-HFB', 'Sesame Oil (Karmegam) 1/2L Bottle', 'Sesame', 'bottles', 170.00, 20, 0, 'https://placehold.co/150x150?text=Half+L+Btl'),
(25, 'SEK-HFP', 'Sesame Oil (Karmegam) 1/2L Packet', 'Sesame', 'pkts', 165.00, 25, 0, 'https://placehold.co/150x150?text=Half+L+Pkt'),
(26, 'SEK-200B', 'Sesame Oil (Karmegam) 200ml Bottle', 'Sesame', 'bottles', 70.00, 15, 0, 'https://placehold.co/150x150?text=200ml+Bottle'),
(27, 'CAS-01B', 'Castor Oil 1L Bottle', 'Castor', 'bottles', 220.00, 10, 0, 'https://placehold.co/150x150?text=1L+Bottle'),
(28, 'CAS-HFB', 'Castor Oil 1/2L Bottle', 'Castor', 'bottles', 110.00, 15, 0, 'https://placehold.co/150x150?text=Half+L+Btl'),
(29, 'CON-01P', 'Coconut Oil 1L Packet', 'Coconut', 'pkts', 370.00, 30, 0, 'https://placehold.co/150x150?text=1L+Packet'),
(30, 'CON-01B', 'Coconut Oil 1L Bottle', 'Coconut', 'bottles', 370.00, 20, 0, 'https://placehold.co/150x150?text=1L+Bottle'),
(31, 'CON-HFP', 'Coconut Oil 1/2L Packet', 'Coconut', 'pkts', 185.00, 25, 0, 'https://placehold.co/150x150?text=Half+L+Pkt'),
(32, 'CON-HFB', 'Coconut Oil 1/2L Bottle', 'Coconut', 'bottles', 185.00, 20, 0, 'https://placehold.co/150x150?text=Half+L+Btl'),
(33, 'CON-200B', 'Coconut Oil 200g Bottle', 'Coconut', 'bottles', 100.00, 15, 0, 'https://placehold.co/150x150?text=200g+Bottle'),
(34, 'CON-100B', 'Coconut Oil 100g Bottle', 'Coconut', 'bottles', 50.00, 20, 0, 'https://placehold.co/150x150?text=100g+Bottle');

INSERT INTO suppliers (id, name, contact, products_summary, address_text, total_amount) VALUES
(1, 'Sri Bhavani Oils', '9876543210', 'Sunflower, Palm', 'Erode', 0.00),
(2, 'Coimbatore Oil Traders', '9988776655', 'Groundnut, Sesame', 'Coimbatore', 0.00),
(3, 'Mayil Agro Foods', '9361024785', 'Sesame, Coconut', 'Salem', 0.00),
(4, 'Delta Wholesale Oils', '9442211788', 'Palm, Vanaspati', 'Karur', 0.00);

INSERT INTO customers (id, name, phone, visits, total_amount, first_visit, last_visit) VALUES
(1, 'Arun Traders', '9000000001', 3, 8760.00, '2026-03-02 10:20:00', '2026-03-23 12:10:00'),
(2, 'Bhavani Stores', '9000000002', 2, 4210.00, '2026-03-05 11:00:00', '2026-03-18 17:25:00'),
(3, 'Classic Mart', '9000000003', 1, 1860.00, '2026-03-21 14:15:00', '2026-03-21 14:15:00'),
(4, 'Devi Agency', '9000000004', 4, 15425.00, '2026-02-26 09:10:00', '2026-03-24 19:05:00'),
(5, 'Elite Super Market', '9000000005', 2, 6520.00, '2026-03-12 16:20:00', '2026-03-25 10:40:00');

INSERT INTO bills (id, bill_no, bill_date, customer_name, phone, payment_method, subtotal, cgst, sgst, grand_total, created_by) VALUES
(1001, 'BILL-1001', '2026-03-18 10:15:00', 'Arun Traders', '9000000001', 'Cash', 2920.00, 0.00, 0.00, 2920.00, 'admin'),
(1002, 'BILL-1002', '2026-03-19 13:25:00', 'Bhavani Stores', '9000000002', 'UPI', 3830.00, 0.00, 0.00, 3830.00, 'staff'),
(1003, 'BILL-1003', '2026-03-21 14:15:00', 'Classic Mart', '9000000003', 'Cash', 1860.00, 0.00, 0.00, 1860.00, 'staff'),
(1004, 'BILL-1004', '2026-03-23 12:10:00', 'Arun Traders', '9000000001', 'Card', 5840.00, 0.00, 0.00, 5840.00, 'admin'),
(1005, 'BILL-1005', '2026-03-24 19:05:00', 'Devi Agency', '9000000004', 'UPI', 7315.00, 0.00, 0.00, 7315.00, 'admin'),
(1006, 'BILL-1006', '2026-03-25 10:40:00', 'Elite Super Market', '9000000005', 'Cash', 6520.00, 0.00, 0.00, 6520.00, 'staff'),
(1007, 'BILL-1007', '2026-03-25 11:20:00', 'Walk-in', '', 'Cash', 1108.00, 0.00, 0.00, 1108.00, 'staff');

INSERT INTO bill_items (bill_id, product_id, product_name, qty, price, total) VALUES
(1001, 1, 'Groundnut Oil (Refined) 15kg Tin', 1, 2920.00, 2920.00),
(1002, 2, 'Groundnut Oil (Refined) 5L Can', 2, 930.00, 1860.00),
(1002, 3, 'Groundnut Oil (Refined) 2L Can', 3, 383.00, 1149.00),
(1002, 4, 'Groundnut Oil (Refined) 1L Bottle', 3, 188.00, 564.00),
(1002, 5, 'Groundnut Oil (Refined) 1L Packet', 1, 184.00, 184.00),
(1002, 6, 'Groundnut Oil (Refined) 1/2L Packet', 0, 92.00, 0.00),
(1002, 8, 'Groundnut Oil (Pure) 5L Can', 0, 955.00, 0.00),
(1002, 12, 'Sunflower Oil (Refined) 1L Packet', 0, 186.00, 0.00),
(1002, 14, 'Palm Oil 5L Can', 0, 780.00, 0.00),
(1002, 17, 'Sesame Oil (Mayil) 1L Packet', 0, 320.00, 0.00),
(1002, 21, 'Sesame Oil (Karmegam) 5L Can', 0, 1575.00, 0.00),
(1002, 29, 'Coconut Oil 1L Packet', 0, 370.00, 0.00),
(1003, 8, 'Groundnut Oil (Pure) 5L Can', 1, 955.00, 955.00),
(1003, 12, 'Sunflower Oil (Refined) 1L Packet', 2, 186.00, 372.00),
(1003, 29, 'Coconut Oil 1L Packet', 1, 370.00, 370.00),
(1003, 5, 'Groundnut Oil (Refined) 1L Packet', 1, 184.00, 184.00),
(1004, 1, 'Groundnut Oil (Refined) 15kg Tin', 2, 2920.00, 5840.00),
(1005, 7, 'Groundnut Oil (Pure) 15kg Tin', 1, 3000.00, 3000.00),
(1005, 21, 'Sesame Oil (Karmegam) 5L Can', 1, 1575.00, 1575.00),
(1005, 29, 'Coconut Oil 1L Packet', 2, 370.00, 740.00),
(1005, 24, 'Sesame Oil (Karmegam) 1/2L Bottle', 2, 170.00, 340.00),
(1005, 26, 'Sesame Oil (Karmegam) 200ml Bottle', 2, 70.00, 140.00),
(1005, 31, 'Coconut Oil 1/2L Packet', 2, 185.00, 370.00),
(1005, 34, 'Coconut Oil 100g Bottle', 23, 50.00, 1150.00),
(1006, 10, 'Sunflower Oil (Refined) 15kg Tin', 1, 2950.00, 2950.00),
(1006, 14, 'Palm Oil 5L Can', 2, 780.00, 1560.00),
(1006, 17, 'Sesame Oil (Mayil) 1L Packet', 2, 320.00, 640.00),
(1006, 30, 'Coconut Oil 1L Bottle', 2, 370.00, 740.00),
(1006, 5, 'Groundnut Oil (Refined) 1L Packet', 2, 184.00, 368.00),
(1006, 4, 'Groundnut Oil (Refined) 1L Bottle', 1, 188.00, 188.00),
(1006, 12, 'Sunflower Oil (Refined) 1L Packet', 4, 186.00, 744.00),
(1006, 6, 'Groundnut Oil (Refined) 1/2L Packet', 0, 92.00, 0.00),
(1006, 18, 'Sesame Oil (Mayil) 1/2L Packet', 0, 160.00, 0.00),
(1007, 4, 'Groundnut Oil (Refined) 1L Bottle', 2, 188.00, 376.00),
(1007, 12, 'Sunflower Oil (Refined) 1L Packet', 2, 186.00, 372.00),
(1007, 15, 'Palm Oil 1L Packet', 2, 154.00, 308.00),
(1007, 34, 'Coconut Oil 100g Bottle', 1, 50.00, 50.00),
(1007, 26, 'Sesame Oil (Karmegam) 200ml Bottle', 0, 70.00, 0.00),
(1007, 18, 'Sesame Oil (Mayil) 1/2L Packet', 0, 160.00, 0.00),
(1007, 32, 'Coconut Oil 1/2L Bottle', 0, 185.00, 0.00),
(1007, 28, 'Castor Oil 1/2L Bottle', 0, 110.00, 0.00);

INSERT INTO expenses (id, expense_date, category, description_text, amount, created_by) VALUES
(2001, '2026-03-18 18:10:00', 'Transport', 'Delivery van diesel refill', 1200.00, 'admin'),
(2002, '2026-03-19 20:00:00', 'Electricity', 'Shop EB payment', 2450.00, 'admin'),
(2003, '2026-03-20 17:45:00', 'Labour', 'Loading and packing wages', 1800.00, 'staff'),
(2004, '2026-03-22 11:30:00', 'Maintenance', 'Counter weighing machine service', 950.00, 'admin'),
(2005, '2026-03-24 16:10:00', 'Purchase', 'Advance paid to Sri Bhavani Oils', 15000.00, 'admin');

INSERT INTO revenue_entries (id, revenue_date, head_name, source_name, amount, auto_sum, created_by) VALUES
(3001, '2026-03-19 09:30:00', 'Sales Revenue', 'Today Sales', 3830.00, 1, 'staff'),
(3002, '2026-03-23 18:40:00', 'Customer Revenue', 'Repeat Customer Sales', 5840.00, 1, 'admin'),
(3003, '2026-03-25 11:45:00', 'Other Income', 'Online Income', 2250.00, 0, 'admin'),
(3004, '2026-03-25 12:05:00', 'Other Income', 'Misc Income', 850.00, 0, 'staff');

INSERT INTO purchases (id, purchase_date, supplier_name, product_name, qty, amount, created_by) VALUES
(4001, '2026-03-17 10:00:00', 'Sri Bhavani Oils', 'Sunflower Oil (Refined) 15kg Tin', 10, 29500.00, 'admin'),
(4002, '2026-03-20 15:20:00', 'Coimbatore Oil Traders', 'Groundnut Oil (Pure) 15kg Tin', 5, 15000.00, 'staff'),
(4003, '2026-03-22 09:40:00', 'Mayil Agro Foods', 'Sesame Oil (Mayil) 1L Packet', 20, 6400.00, 'admin'),
(4004, '2026-03-24 13:15:00', 'Delta Wholesale Oils', 'Palm Oil 5L Can', 18, 14040.00, 'staff');

INSERT INTO refills (id, refill_date, product_name, qty, created_by) VALUES
(5001, '2026-03-20 18:00:00', 'Groundnut Oil (Refined) 5L Can', 15, 'staff'),
(5002, '2026-03-22 12:30:00', 'Palm Oil 1L Packet', 25, 'admin'),
(5003, '2026-03-24 17:20:00', 'Sunflower Oil (Refined) 1L Packet', 30, 'staff');

INSERT INTO price_history (id, changed_at, product_name, old_price, new_price, changed_by) VALUES
(6001, '2026-03-18 08:00:00', 'Groundnut Oil (Pure) 15kg Tin', 2960.00, 3000.00, 'admin'),
(6002, '2026-03-20 08:10:00', 'Groundnut Oil (Refined) 5L Can', 910.00, 930.00, 'admin'),
(6003, '2026-03-22 08:15:00', 'Sunflower Oil (Refined) 15kg Tin', 2910.00, 2950.00, 'staff'),
(6004, '2026-03-24 08:20:00', 'Palm Oil 5L Can', 760.00, 780.00, 'admin'),
(6005, '2026-03-25 08:25:00', 'Sesame Oil (Karmegam) 5L Can', 1540.00, 1575.00, 'admin');

INSERT INTO login_logs (id, user_name, role_name, login_time, logout_time, device_name) VALUES
(7001, 'admin', 'Admin', '2026-03-24 08:55:00', '2026-03-24 20:05:00', 'Desktop'),
(7002, 'staff', 'Staff', '2026-03-24 09:15:00', '2026-03-24 18:30:00', 'Desktop'),
(7003, 'admin', 'Admin', '2026-03-25 08:50:00', NULL, 'Desktop'),
(7004, 'staff', 'Staff', '2026-03-25 09:05:00', NULL, 'Mobile'),
(7005, 'cashier', 'Staff', '2026-03-23 10:00:00', '2026-03-23 18:05:00', 'Desktop'),
(7006, 'cashier', 'Staff', '2026-03-25 09:20:00', NULL, 'Desktop');

INSERT INTO accounts (user_name, password_text, role_name) VALUES
('admin', 'admin123', 'Admin'),
('staff', 'staff123', 'Staff'),
('cashier', 'cashier123', 'Staff');

INSERT INTO settings (id, gst, shop_name, address_text, gstin, fssai, phone, bill_seq) VALUES
(1, 5.00, 'Sri Nikil Tradings', '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004', '33AMCPD1118L1ZK', '12424007000946', '94875 81302, 0424 2901803', 1007);

UPDATE suppliers SET total_amount = 29500.00 WHERE id = 1;
UPDATE suppliers SET total_amount = 15000.00 WHERE id = 2;
UPDATE suppliers SET total_amount = 6400.00 WHERE id = 3;
UPDATE suppliers SET total_amount = 14040.00 WHERE id = 4;

UPDATE products SET stock = 12, sold = 3 WHERE id = 1;
UPDATE products SET stock = 23, sold = 2 WHERE id = 2;
UPDATE products SET stock = 12, sold = 3 WHERE id = 3;
UPDATE products SET stock = 24, sold = 6 WHERE id = 4;
UPDATE products SET stock = 47, sold = 4 WHERE id = 5;
UPDATE products SET stock = 0, sold = 0 WHERE id = 6;
UPDATE products SET stock = 12, sold = 1 WHERE id = 7;
UPDATE products SET stock = 9, sold = 1 WHERE id = 8;
UPDATE products SET stock = 40, sold = 0 WHERE id = 9;
UPDATE products SET stock = 21, sold = 1 WHERE id = 10;
UPDATE products SET stock = 15, sold = 0 WHERE id = 11;
UPDATE products SET stock = 77, sold = 8 WHERE id = 12;
UPDATE products SET stock = 24, sold = 0 WHERE id = 13;
UPDATE products SET stock = 36, sold = 2 WHERE id = 14;
UPDATE products SET stock = 58, sold = 2 WHERE id = 15;
UPDATE products SET stock = 5, sold = 0 WHERE id = 16;
UPDATE products SET stock = 38, sold = 2 WHERE id = 17;
UPDATE products SET stock = 25, sold = 0 WHERE id = 18;
UPDATE products SET stock = 4, sold = 0 WHERE id = 19;
UPDATE products SET stock = 5, sold = 0 WHERE id = 20;
UPDATE products SET stock = 9, sold = 1 WHERE id = 21;
UPDATE products SET stock = 15, sold = 0 WHERE id = 22;
UPDATE products SET stock = 30, sold = 0 WHERE id = 23;
UPDATE products SET stock = 18, sold = 2 WHERE id = 24;
UPDATE products SET stock = 25, sold = 0 WHERE id = 25;
UPDATE products SET stock = 13, sold = 2 WHERE id = 26;
UPDATE products SET stock = 10, sold = 0 WHERE id = 27;
UPDATE products SET stock = 15, sold = 0 WHERE id = 28;
UPDATE products SET stock = 28, sold = 4 WHERE id = 29;
UPDATE products SET stock = 18, sold = 2 WHERE id = 30;
UPDATE products SET stock = 23, sold = 2 WHERE id = 31;
UPDATE products SET stock = 20, sold = 0 WHERE id = 32;
UPDATE products SET stock = 15, sold = 0 WHERE id = 33;
UPDATE products SET stock = 0, sold = 24 WHERE id = 34;

SET FOREIGN_KEY_CHECKS = 1;
