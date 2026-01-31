<?php
/**
 * Centralized Configuration File
 * إعدادات الموقع الموحدة
 */

// Site Settings
define('SITE_URL', 'https://aws.sa');
define('SITE_NAME_AR', 'محطات اوس');
define('SITE_NAME_EN', 'AWS Stations');

// SMTP Email Settings
define('SMTP_ENABLED', true);
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_PORT', 465);
define('SMTP_SECURE', 'ssl');
define('SMTP_USER', 'a.mansour@aws.sa');      // ← بريد الإرسال
define('SMTP_PASS', 'YOUR_EMAIL_PASSWORD'); // ← ضع كلمة المرور هنا
define('SMTP_FROM', 'a.mansour@aws.sa');
define('SMTP_FROM_NAME', 'محطات اوس');

// Admin Settings
define('ADMIN_EMAIL', 'a.mansour@aws.sa');       // ← البريد المستلم للإشعارات

// Password Reset Settings
define('PASSWORD_RESET_EXPIRY', 3600);      // صلاحية رابط إعادة التعيين (ساعة واحدة)

/**
 * Get setting from database
 * جلب إعداد من قاعدة البيانات
 */
function getSetting($key, $default = null) {
    static $settings = null;
    
    // Load settings once
    if ($settings === null) {
        try {
            require_once __DIR__ . '/database.php';
            $pdo = getDB();
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
            $rows = $stmt->fetchAll();
            $settings = [];
            foreach ($rows as $row) {
                $settings[$row['setting_key']] = $row['setting_value'];
            }
        } catch (Exception $e) {
            $settings = [];
        }
    }
    
    return $settings[$key] ?? $default;
}

/**
 * Get admin panel URL
 */
function getAdminUrl() {
    return SITE_URL . '/admin';
}

/**
 * Get password reset URL
 */
function getPasswordResetUrl($token) {
    return SITE_URL . '/reset-password?token=' . $token;
}
