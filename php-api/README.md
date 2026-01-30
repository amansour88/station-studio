# PHP API for AWS Website

هذا هو الـ API الخلفي للموقع. يجب رفعه على استضافة Hostinger.

## هيكل المجلدات

```
api/
├── config/
│   └── database.php      # إعدادات قاعدة البيانات (يجب تعديلها)
├── middleware/
│   ├── auth.php          # التحقق من المصادقة
│   └── cors.php          # إعدادات CORS (يجب تعديلها)
├── auth/                 # نقاط نهاية المصادقة
├── users/                # إدارة المستخدمين (للمسؤول فقط)
├── hero/                 # قسم الهيرو
├── about/                # قسم من نحن
├── services/             # الخدمات
├── regions/              # المناطق
├── stations/             # المحطات
├── partners/             # الشركاء
├── messages/             # الرسائل
├── stats/                # الإحصائيات
└── upload/               # رفع الملفات
```

## الإعداد

### 1. تعديل إعدادات قاعدة البيانات

عدّل ملف `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u761491305_web');
define('DB_USER', 'اسم_المستخدم');  // غيّر هذا
define('DB_PASS', 'كلمة_المرور');    // غيّر هذا
```

### 2. تعديل إعدادات CORS

عدّل ملف `middleware/cors.php`:
```php
$allowed_origins = [
    'https://YOUR_DOMAIN.com',      // غيّر هذا لنطاقك
    'https://www.YOUR_DOMAIN.com',
];
```

### 3. إنشاء جداول قاعدة البيانات

قم بتنفيذ ملف `database.sql` في phpMyAdmin لإنشاء الجداول.

### 4. رفع الملفات

ارفع مجلد `api/` إلى `public_html/api/` على Hostinger.

### 5. إنشاء مجلد الرفع

أنشئ المجلدات التالية مع صلاحيات 755:
```
public_html/
└── uploads/
    ├── hero/
    ├── about/
    ├── services/
    ├── stations/
    ├── partners/
    └── contact-attachments/
```

### 6. إعداد PHP

تأكد من أن إصدار PHP هو 8.1 أو أحدث في لوحة تحكم Hostinger.

## نقاط النهاية

### المصادقة
- `POST /api/auth/login.php` - تسجيل الدخول
- `POST /api/auth/logout.php` - تسجيل الخروج
- `GET /api/auth/check-session.php` - التحقق من الجلسة
- `POST /api/auth/change-password.php` - تغيير كلمة المرور

### الخدمات
- `GET /api/services/list.php` - جلب الخدمات
- `POST /api/services/create.php` - إضافة خدمة
- `PUT /api/services/update.php` - تحديث خدمة
- `DELETE /api/services/delete.php?id=xxx` - حذف خدمة

### المحطات
- `GET /api/stations/list.php` - جلب المحطات
- `POST /api/stations/create.php` - إضافة محطة
- `PUT /api/stations/update.php` - تحديث محطة
- `DELETE /api/stations/delete.php?id=xxx` - حذف محطة

وهكذا لباقي النقاط...

## الأمان

- جميع كلمات المرور مشفرة بـ `password_hash()`
- جميع الاستعلامات تستخدم Prepared Statements
- الجلسات محمية بـ httponly و secure cookies
- CORS محدد لنطاقات معينة فقط
