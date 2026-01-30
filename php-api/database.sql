-- ===========================================
-- AWS Website Database Schema for MySQL
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_banned TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sign_in_at TIMESTAMP NULL,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hero section table
CREATE TABLE IF NOT EXISTS hero_section (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    description TEXT,
    background_image_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- About section table
CREATE TABLE IF NOT EXISTS about_section (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'من نحن',
    content TEXT NOT NULL,
    image_url TEXT,
    stats JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(36)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Fuel',
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    map_url TEXT,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    services JSON,
    products JSON,
    google_maps_url TEXT,
    image_url TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    service_type VARCHAR(50),
    attachment_url TEXT,
    is_read TINYINT(1) DEFAULT 0,
    is_archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_is_archived (is_archived),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- Default site settings
-- ===========================================
INSERT INTO site_settings (id, setting_key, setting_value) VALUES
(UUID(), 'phone', '920008436'),
(UUID(), 'email', 'info@aws.sa'),
(UUID(), 'address', 'المملكة العربية السعودية'),
(UUID(), 'facebook_url', ''),
(UUID(), 'twitter_url', ''),
(UUID(), 'instagram_url', ''),
(UUID(), 'linkedin_url', ''),
(UUID(), 'whatsapp', ''),
(UUID(), 'map_latitude', '26.3266'),
(UUID(), 'map_longitude', '43.9748'),
(UUID(), 'map_zoom', '6')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ===========================================
-- Insert default data
-- ===========================================

-- Default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, created_at) VALUES 
(UUID(), 'admin@aws.sa', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW())
ON DUPLICATE KEY UPDATE email = email;

-- Get admin user ID and create profile and role
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@aws.sa' LIMIT 1);

INSERT INTO profiles (id, user_id, username, full_name, created_at, updated_at) VALUES 
(UUID(), @admin_id, 'admin', 'المسؤول', NOW(), NOW())
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO user_roles (id, user_id, role, created_at) VALUES 
(UUID(), @admin_id, 'admin', NOW())
ON DUPLICATE KEY UPDATE role = role;

-- Default hero section with full description
INSERT INTO hero_section (id, title, subtitle, description, cta_text, cta_link, is_active) VALUES 
(UUID(), 'شريكك الموثوق على الطريق', 'منذ 1998', 
'تعتبر شركة اوس للخدمات البترولية شركة رائدة في مجالات الطاقة، وتتمتع بالخبرة والكفاءة في تقديم وترويج الخدمات البترولية ومراكز الخدمة على الطريق.

نشأت الشركة عام 1998 بفرع واحد في محافظة الأسياح بمنطقة القصيم، واليوم تمتلك الشركة أكثر من 78 محطة في خمسة مناطق وأكثر من ثلاثين مدينة ومحافظة.

تهدف الشركة دائماً إلى تحقيق أعلى معايير الجودة والكفاءة المتسارعة، مع الالتزام برؤية المملكة 2030 في تطوير البنية التحتية.', 
'تواصل معنا', '#contact', 1)
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  title = VALUES(title),
  subtitle = VALUES(subtitle);

-- Default about section
INSERT INTO about_section (id, title, content, stats) VALUES 
(UUID(), 'من نحن', 'شركة اوس للخدمات البترولية، رائدة في مجال الخدمات البترولية منذ 1998.', '[{"label": "سنوات الخبرة", "value": "25+"}, {"label": "محطة وقود", "value": "78"}, {"label": "منطقة", "value": "5"}]')
ON DUPLICATE KEY UPDATE title = title;

-- ===========================================
-- SEED DATA: المناطق
-- ===========================================
INSERT INTO regions (id, name, slug, display_order, is_active) VALUES
(UUID(), 'القصيم', 'qassim', 1, 1),
(UUID(), 'مكة المكرمة', 'makkah', 2, 1),
(UUID(), 'المدينة المنورة', 'madinah', 3, 1),
(UUID(), 'حائل', 'hail', 4, 1),
(UUID(), 'عسير', 'asir', 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===========================================
-- SEED DATA: الخدمات
-- ===========================================
INSERT INTO services (id, title, description, icon, display_order, is_active) VALUES
(UUID(), 'الوقود', 'بنزين 91، بنزين 95، ديزل بأعلى معايير الجودة', 'Fuel', 1, 1),
(UUID(), 'ميني ماركت', 'تشكيلة واسعة من المنتجات والمستلزمات', 'ShoppingCart', 2, 1),
(UUID(), 'مركز خدمة السيارات', 'صيانة وغيار الزيوت والإطارات', 'Car', 3, 1),
(UUID(), 'المطاعم والمقاهي', 'وجبات سريعة ومشروبات متنوعة', 'Coffee', 4, 1),
(UUID(), 'الخدمات الفندقية', 'غرف مريحة للمسافرين', 'Hotel', 5, 1),
(UUID(), 'خدمة غسيل السيارات', 'غسيل يدوي وأوتوماتيكي', 'Droplets', 6, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ===========================================
-- SEED DATA: الشركاء
-- ===========================================
INSERT INTO partners (id, name, description, display_order, is_active) VALUES
(UUID(), 'أرامكو السعودية', 'الشريك الاستراتيجي في الوقود', 1, 1),
(UUID(), 'بترومين', 'زيوت ومحركات', 2, 1),
(UUID(), 'ميشلان', 'إطارات عالمية', 3, 1),
(UUID(), 'كاسترول', 'زيوت محركات', 4, 1),
(UUID(), 'هرفي', 'وجبات سريعة', 5, 1),
(UUID(), 'لولو هايبر', 'تجزئة ومواد غذائية', 6, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ===========================================
-- SEED DATA: المحطات (10 محطات كعينة)
-- ===========================================
INSERT INTO stations (id, name, region, city, latitude, longitude, is_active, products, services) VALUES
(UUID(), 'محطة بريدة الرئيسية', 'القصيم', 'بريدة', 26.3266, 43.9748, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","غسيل سيارات","مركز صيانة"]'),
(UUID(), 'محطة عنيزة', 'القصيم', 'عنيزة', 26.0840, 43.9953, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","مطعم"]'),
(UUID(), 'محطة الرس', 'القصيم', 'الرس', 25.8690, 43.4980, 1, '["بنزين 91","بنزين 95"]', '["ميني ماركت"]'),
(UUID(), 'محطة جدة الكبرى', 'مكة المكرمة', 'جدة', 21.4858, 39.1925, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","مطعم","مقهى","غسيل سيارات"]'),
(UUID(), 'محطة مكة', 'مكة المكرمة', 'مكة المكرمة', 21.4225, 39.8262, 1, '["بنزين 91","بنزين 95"]', '["ميني ماركت","مطعم"]'),
(UUID(), 'محطة المدينة المركزية', 'المدينة المنورة', 'المدينة المنورة', 24.4672, 39.6024, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","مطعم","فندق"]'),
(UUID(), 'محطة ينبع', 'المدينة المنورة', 'ينبع', 24.0895, 38.0618, 1, '["بنزين 91","بنزين 95"]', '["ميني ماركت"]'),
(UUID(), 'محطة حائل الرئيسية', 'حائل', 'حائل', 27.5114, 41.7208, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","مطعم"]'),
(UUID(), 'محطة خميس مشيط', 'عسير', 'خميس مشيط', 18.3066, 42.7296, 1, '["بنزين 91","بنزين 95","ديزل"]', '["ميني ماركت","مطعم","مركز صيانة"]'),
(UUID(), 'محطة أبها', 'عسير', 'أبها', 18.2164, 42.5053, 1, '["بنزين 91","بنزين 95"]', '["ميني ماركت"]')
ON DUPLICATE KEY UPDATE name = VALUES(name);
