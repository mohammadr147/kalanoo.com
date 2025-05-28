
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2024 at 10:00 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kalanow_db`
--
CREATE DATABASE IF NOT EXISTS `kalanow_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kalanow_db`;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins` (Placeholder, actual password should be hashed)
--
INSERT IGNORE INTO `admins` (`id`, `username`, `password_hash`, `role`) VALUES
(1, 'admin', '$2b$10$your_bcrypt_hash_for_Admin123@', 'admin'); -- Replace with a real bcrypt hash

-- --------------------------------------------------------

--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `national_id` varchar(10) DEFAULT NULL,
  `secondary_phone` varchar(15) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `birth_month` tinyint(2) DEFAULT NULL,
  `birth_day` tinyint(2) DEFAULT NULL,
  `address` text DEFAULT NULL COMMENT 'Store as JSON: {"full_address":"", "province":"", "city":"", "postal_code":""}',
  `referral_code` varchar(20) DEFAULT NULL,
  `invited_by_user_id` int(11) DEFAULT NULL,
  `wallet_balance` decimal(12,2) DEFAULT 0.00,
  `role` enum('user','agent','admin','blocked') DEFAULT 'user',
  `is_profile_complete` tinyint(1) DEFAULT 0,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login_at` timestamp NULL DEFAULT NULL,
  `profile_updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `referral_code` (`referral_code`),
  KEY `invited_by_user_id` (`invited_by_user_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`invited_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `parent_id`, `order`, `is_active`) VALUES
(1, 'لوازم بزرگ آشپزخانه', 'large-kitchen-appliances', 'یخچال، فریزر، ماشین لباسشویی، ماشین ظرفشویی، اجاق گاز', 'https://placehold.co/100x100.png?text=بزرگ', NULL, 1, 1),
(2, 'شستشو و نظافت', 'laundry-cleaning', 'ماشین لباسشویی، جاروبرقی، بخارشوی', 'https://placehold.co/100x100.png?text=نظافت', NULL, 2, 1),
(3, 'صوتی و تصویری', 'audio-video', 'تلویزیون، سیستم صوتی خانگی، ساندبار', 'https://placehold.co/100x100.png?text=صوت', NULL, 3, 1),
(4, 'لوازم پخت و پز', 'cooking-appliances', 'مایکروویو، آون توستر، سرخ کن، پلوپز', 'https://placehold.co/100x100.png?text=پخت', 1, 1, 1),
(5, 'نوشیدنی ساز', 'drink-makers', 'چای ساز، قهوه ساز، آبمیوه گیری', 'https://placehold.co/100x100.png?text=نوشیدنی', 1, 2, 1),
(6, 'تهویه مطبوع', 'hvac', 'کولر گازی، پنکه، بخاری', 'https://placehold.co/100x100.png?text=تهویه', NULL, 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `installment_price` decimal(12,2) DEFAULT NULL,
  `check_price` decimal(12,2) DEFAULT NULL,
  `original_price` decimal(12,2) DEFAULT NULL,
  `discount_percent` tinyint(3) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `images` text DEFAULT NULL COMMENT 'Store as JSON array of strings: ["url1", "url2"]',
  `category_id` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `products` (`name`, `description`, `price`, `installment_price`, `check_price`, `original_price`, `discount_percent`, `image_url`, `images`, `category_id`, `stock`, `is_featured`, `is_new`, `is_active`) VALUES
('یخچال فریزر ساید بای ساید مدل X', 'یخچال فریزر جادار با طراحی مدرن و سیستم خنک کننده پیشرفته، نوفراست.', 35000000.00, 37000000.00, 36000000.00, 38500000.00, 9, 'https://placehold.co/400x300.png?text=یخچال+ساید', '["https://placehold.co/600x400.png?text=یخچال+نما۱","https://placehold.co/600x400.png?text=یخچال+نما۲"]', 1, 10, 1, 1, 1),
('ماشین لباسشویی 9 کیلویی مدل Y', 'ماشین لباسشویی اتوماتیک با 16 برنامه شستشو و موتور اینورتر کم مصرف.', 18500000.00, 19500000.00, 19000000.00, 20000000.00, 7, 'https://placehold.co/400x300.png?text=لباسشویی', '[]', 2, 15, 1, 1, 1),
('تلویزیون هوشمند 55 اینچ 4K مدل Z', 'تلویزیون LED با کیفیت تصویر 4K، سیستم عامل اندروید و قابلیت اتصال به اینترنت.', 22000000.00, 23500000.00, 23000000.00, NULL, NULL, 'https://placehold.co/400x300.png?text=تلویزیون+55', '[]', 3, 8, 1, 0, 1),
('اجاق گاز فردار 5 شعله مدل A', 'اجاق گاز با صفحه استیل، فندک اتوماتیک و فر جادار با جوجه گردان.', 12000000.00, NULL, 12500000.00, 13000000.00, 8, 'https://placehold.co/400x300.png?text=اجاق+گاز', '[]', 4, 20, 0, 1, 1),
('جاروبرقی 2200 وات مدل B', 'جاروبرقی کیسه ای قدرتمند با لوله تلسکوپی و فیلتر بهداشتی HEPA.', 4500000.00, NULL, NULL, 5000000.00, 10, 'https://placehold.co/400x300.png?text=جاروبرقی', '[]', 2, 25, 0, 0, 1),
('مایکروویو 30 لیتری مدل C', 'مایکروویو با قابلیت گریل، پخت ترکیبی و یخ زدایی سریع.', 6800000.00, NULL, NULL, NULL, NULL, 'https://placehold.co/400x300.png?text=مایکروویو', '[]', 4, 12, 1, 0, 1),
('چای ساز و کتری برقی مدل D', 'چای ساز با کتری استیل و قوری پیرکس، با قابلیت گرم نگهدارنده.', 1200000.00, NULL, NULL, 1500000.00, 20, 'https://placehold.co/400x300.png?text=چای+ساز', '[]', 5, 30, 0, 1, 1),
('کولر گازی 18000 BTU مدل E', 'کولر گازی اسپلیت با عملکرد سرمایش و گرمایش و گاز R410a.', 28000000.00, 30000000.00, NULL, NULL, NULL, 'https://placehold.co/400x300.png?text=کولر+گازی', '[]', 6, 5, 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `items` text NOT NULL COMMENT 'JSON array of CartItem objects',
  `subtotal` decimal(12,2) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending_confirmation','pending_payment','payment_failed','processing','pending_check_confirmation','check_approved','check_rejected','pending_installment_approval','installment_approved','installment_rejected','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending_confirmation',
  `shipping_address` text NOT NULL COMMENT 'JSON object of Address',
  `applied_coupon_code` varchar(50) DEFAULT NULL,
  `payment_method` enum('cash','installments','check') NOT NULL,
  `payment_details` text DEFAULT NULL COMMENT 'JSON object with payment-specific details',
  `notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `applied_coupon_code` (`applied_coupon_code`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  -- CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`applied_coupon_code`) REFERENCES `coupons` (`code`) ON DELETE SET NULL ON UPDATE CASCADE -- Enable if you use coupon code as FK
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `expiry_date` datetime NOT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `min_order_value` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `type` enum('commission','purchase','withdrawal','deposit','refund','withdrawal_request') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') DEFAULT 'completed',
  `shaba_number` varchar(26) DEFAULT NULL COMMENT 'For withdrawal requests, e.g. IRXXXXXXXXXXXXXXXXXXXXXXXX',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default MLM settings
INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('mlm_number_of_levels', '3'),
('mlm_level_percentages', '[10, 5, 2]'), -- JSON array: Level 1: 10%, Level 2: 5%, Level 3: 2%
('min_withdrawal_amount', '50000');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `mobile_image_url` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Banners
INSERT IGNORE INTO `banners` (`title`, `description`, `image_url`, `link`, `order`, `is_active`) VALUES
('تخفیف ویژه تابستانه', 'بهترین لوازم خانگی با تخفیف‌های باورنکردنی!', 'https://placehold.co/1200x400.png?text=تخفیف+تابستانه', '/products?category=summer-sale', 1, 1),
('جشنواره لوازم آشپزخانه', 'آشپزخانه رویایی خود را با ما بسازید.', 'https://placehold.co/1200x400.png?text=جشنواره+آشپزخانه', '/products?category=kitchen-appliances', 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `landing_pages`
--
CREATE TABLE IF NOT EXISTS `landing_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `content` text DEFAULT NULL COMMENT 'HTML content of the page',
  `image_url` varchar(255) DEFAULT NULL,
  `cta_text` varchar(50) DEFAULT NULL,
  `cta_link` varchar(255) DEFAULT NULL,
  `background_color` varchar(7) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `info_pages`
--
CREATE TABLE IF NOT EXISTS `info_pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `info_pages` (`title`, `slug`, `content`, `is_active`) VALUES
('درباره ما', 'about-us', '<p>اینجا متن درباره ما قرار می‌گیرد.</p>', 1),
('تماس با ما', 'contact-us', '<p>اطلاعات تماس با ما.</p>', 1),
('سوالات متداول', 'faq', '<p>سوالات متداول و پاسخ‌ها.</p>', 1),
('شرایط و قوانین', 'terms', '<p>شرایط استفاده از فروشگاه کالانو.</p>', 1),
('حریم خصوصی', 'privacy', '<p>سیاست‌های مربوط به حریم خصوصی کاربران.</p>', 1),
('رویه بازگرداندن کالا', 'returns', '<p>شرایط و مراحل بازگرداندن کالا.</p>', 1),
('شرایط ارسال', 'shipping', '<p>اطلاعات مربوط به هزینه‌ها و روش‌های ارسال.</p>', 1),
('روش‌های پرداخت', 'payment-methods', '<p>روش‌های مختلف پرداخت در کالانو.</p>', 1);

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--
CREATE TABLE IF NOT EXISTS `otp_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `phone_expires_at_is_used_index` (`phone`,`expires_at`,`is_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--
CREATE TABLE IF NOT EXISTS `sms_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_phone` varchar(15) NOT NULL,
  `message_content` text NOT NULL,
  `status` varchar(20) NOT NULL,
  `provider_message_id` varchar(100) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_logs`
--
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recipient_email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL,
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('open','pending_reply','closed','resolved') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_reply_at` timestamp NULL DEFAULT NULL,
  `last_reply_by` enum('user','admin') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_messages`
--
CREATE TABLE IF NOT EXISTS `ticket_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_type` enum('user','admin') NOT NULL,
  `message` text NOT NULL,
  `attachments` text DEFAULT NULL COMMENT 'JSON array of attachment URLs',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ticket_messages_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

