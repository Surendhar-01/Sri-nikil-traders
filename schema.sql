-- ERP Database Schema
-- Generated for Sri Nikil Tradings

CREATE DATABASE IF NOT EXISTS `erp`;
USE `erp`;

SET FOREIGN_KEY_CHECKS=0;

-- ---------------------------------------------------------
-- 1. Table: users (System Users)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'User',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. Table: accounts (Staff Accounts)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user` VARCHAR(255) NOT NULL UNIQUE,
  `pass` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Staff',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. Table: products (Inventory)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(100) UNIQUE,
  `cat` VARCHAR(100),
  `unit` VARCHAR(50),
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `sold` INT NOT NULL DEFAULT 0,
  `image` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. Table: bills (Sales Invoices)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `billNo` VARCHAR(255) NOT NULL UNIQUE,
  `customer` VARCHAR(255),
  `phone` VARCHAR(20),
  `payment` VARCHAR(50),
  `date` DATETIME NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `cgst` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `sgst` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `grand` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `items` LONGTEXT, -- Stores JSON array of items
  `by_user` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. Table: customers (Customer Stats)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) UNIQUE,
  `visits` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `lastVisit` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- ---------------------------------------------------------
-- 7. Table: purchases (Supplier Purchases)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATETIME NOT NULL,
  `supplier` VARCHAR(255),
  `product` VARCHAR(255),
  `qty` INT NOT NULL DEFAULT 0,
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `by_user` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8. Table: refills (Stock Refills)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `refills`;
CREATE TABLE `refills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATETIME NOT NULL,
  `product` VARCHAR(255),
  `qty` INT NOT NULL DEFAULT 0,
  `by` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 9. Table: price_history (Product Price Changes)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `price_history`;
CREATE TABLE `price_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATETIME NOT NULL,
  `product` VARCHAR(255),
  `old` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `new` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `by` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 10. Table: login_logs (User Activity)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `login_logs`;
CREATE TABLE `login_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user` VARCHAR(255),
  `role` VARCHAR(50),
  `loginTime` DATETIME,
  `logoutTime` DATETIME,
  `device` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 11. Table: settings (Shop Metadata)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gst` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `shop` VARCHAR(255),
  `addr` TEXT,
  `gstin` VARCHAR(100),
  `fssai` VARCHAR(100),
  `phone` VARCHAR(100),
  `logo` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Seed Data
-- ---------------------------------------------------------

-- Default Accounts
INSERT INTO `accounts` (`user`, `pass`, `role`) VALUES 
('admin', 'admin123', 'Admin'),
('staff1', 'staff1', 'Staff'),
('staff2', 'staff2', 'Staff'),
('staff3', 'staff3', 'Staff'),
('staff4', 'staff4', 'Staff'),
('staff5', 'staff5', 'Staff');

-- Default Settings
INSERT INTO `settings` (`gst`, `shop`, `addr`, `gstin`, `fssai`, `phone`) VALUES 
(5.00, 'Sri Nikil Tradings', '058/1, Bhavani Main Road, Opp. Central Warehouse, Erode - 638004', '33AMCPD1118L1ZK', '12424007000946', '94875 81302, 0424 2901803');

-- Sample Products
INSERT INTO `products` (`code`, `name`, `cat`, `unit`, `price`, `stock`, `sold`) VALUES 
('GNR-15K', 'Groundnut Oil (Refined) 15kg Tin', 'Groundnut', 'tins', 2920.00, 15, 0),
('GNR-05C', 'Groundnut Oil (Refined) 5L Can', 'Groundnut', 'cans', 930.00, 10, 0),
('GNR-02C', 'Groundnut Oil (Refined) 2L Can', 'Groundnut', 'cans', 383.00, 15, 0),
('GNR-01B', 'Groundnut Oil (Refined) 1L Bottle', 'Groundnut', 'bottles', 188.00, 30, 0),
('GNR-01P', 'Groundnut Oil (Refined) 1L Packet', 'Groundnut', 'pkts', 184.00, 50, 0),
('GNR-HFP', 'Groundnut Oil (Refined) 1/2L Packet', 'Groundnut', 'pkts', 92.00, 0, 0),
('GNP-15K', 'Groundnut Oil (Pure) 15kg Tin', 'Groundnut', 'tins', 3000.00, 8, 0),
('GNP-05C', 'Groundnut Oil (Pure) 5L Can', 'Groundnut', 'cans', 955.00, 10, 0),
('GNP-01P', 'Groundnut Oil (Pure) 1L Packet', 'Groundnut', 'pkts', 193.00, 40, 0),
('SFR-15K', 'Sunflower Oil (Refined) 15kg Tin', 'Sunflower', 'tins', 2950.00, 12, 0),
('SFR-05C', 'Sunflower Oil (Refined) 5L Can', 'Sunflower', 'cans', 940.00, 15, 0),
('SFR-01P', 'Sunflower Oil (Refined) 1L Packet', 'Sunflower', 'pkts', 186.00, 85, 0),
('PAL-15K', 'Palm Oil 15kg Tin', 'Palm', 'tins', 2445.00, 24, 0),
('PAL-05C', 'Palm Oil 5L Can', 'Palm', 'cans', 780.00, 20, 0),
('PAL-01P', 'Palm Oil 1L Packet', 'Palm', 'pkts', 154.00, 60, 0),
('VAN-15K', 'Vanaspati 15kg Tin', 'Vanaspati', 'tins', 2700.00, 5, 0),
('SEM-01P', 'Sesame Oil (Mayil) 1L Packet', 'Sesame', 'pkts', 320.00, 20, 0),
('SEM-HFP', 'Sesame Oil (Mayil) 1/2L Packet', 'Sesame', 'pkts', 160.00, 25, 0),
('SEU-15K', 'Sesame Oil (Mukil) 15kg Tin', 'Sesame', 'tins', 4050.00, 4, 0),
('SEK-15K', 'Sesame Oil (Karmegam Premium) 15kg Tin', 'Sesame', 'tins', 4560.00, 5, 0),
('SEK-05C', 'Sesame Oil (Karmegam) 5L Can', 'Sesame', 'cans', 1575.00, 10, 0),
('SEK-01B', 'Sesame Oil (Karmegam) 1L Bottle', 'Sesame', 'bottles', 340.00, 15, 0),
('SEK-01P', 'Sesame Oil (Karmegam) 1L Packet', 'Sesame', 'pkts', 330.00, 30, 0),
('SEK-HFB', 'Sesame Oil (Karmegam) 1/2L Bottle', 'Sesame', 'bottles', 170.00, 20, 0),
('SEK-HFP', 'Sesame Oil (Karmegam) 1/2L Packet', 'Sesame', 'pkts', 165.00, 25, 0),
('SEK-200B', 'Sesame Oil (Karmegam) 200ml Bottle', 'Sesame', 'bottles', 70.00, 15, 0),
('CAS-01B', 'Castor Oil 1L Bottle', 'Castor', 'bottles', 220.00, 10, 0),
('CAS-HFB', 'Castor Oil 1/2L Bottle', 'Castor', 'bottles', 110.00, 15, 0),
('CON-01P', 'Coconut Oil 1L Packet', 'Coconut', 'pkts', 370.00, 30, 0),
('CON-01B', 'Coconut Oil 1L Bottle', 'Coconut', 'bottles', 370.00, 20, 0),
('CON-HFP', 'Coconut Oil 1/2L Packet', 'Coconut', 'pkts', 185.00, 25, 0),
('CON-HFB', 'Coconut Oil 1/2L Bottle', 'Coconut', 'bottles', 185.00, 20, 0),
('CON-200B', 'Coconut Oil 200g Bottle', 'Coconut', 'bottles', 100.00, 15, 0),
('CON-100B', 'Coconut Oil 100g Bottle', 'Coconut', 'bottles', 50.00, 20, 0);

SET FOREIGN_KEY_CHECKS=1;