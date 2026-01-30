
# خطة تحويل المشروع من Supabase إلى MySQL مع PHP API

## نظرة عامة

سنقوم بتحويل المشروع من استخدام Supabase (PostgreSQL) إلى استضافة Hostinger مع MySQL وPHP API. هذا يتطلب:

1. إنشاء ملفات PHP API كاملة
2. تعديل ملفات React للاتصال بـ PHP API بدلاً من Supabase
3. حذف ملفات Supabase غير المستخدمة

---

## الجزء الأول: ملفات PHP API (للرفع على Hostinger)

### هيكل المجلدات
```text
public_html/
├── api/
│   ├── config/
│   │   └── database.php
│   ├── middleware/
│   │   ├── auth.php
│   │   └── cors.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── logout.php
│   │   ├── check-session.php
│   │   └── change-password.php
│   ├── users/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   ├── delete.php
│   │   ├── toggle-ban.php
│   │   └── reset-password.php
│   ├── hero/
│   │   ├── get.php
│   │   └── update.php
│   ├── about/
│   │   ├── get.php
│   │   └── update.php
│   ├── services/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── regions/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── stations/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── partners/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── messages/
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   └── upload/
│       └── upload.php
├── uploads/
│   ├── hero/
│   ├── services/
│   ├── stations/
│   ├── partners/
│   └── contact-attachments/
└── [React Build Files]
```

---

## الجزء الثاني: ملفات React للتعديل

### ملفات جديدة:
| الملف | الوصف |
|-------|-------|
| `src/lib/api.ts` | خدمة API Client للاتصال بـ PHP |
| `src/types/api.ts` | أنواع TypeScript للـ API |

### ملفات للتعديل (20 ملف):
| الملف | نوع التغيير |
|-------|-------------|
| `src/contexts/AuthContext.tsx` | تحويل كامل - من Supabase Auth إلى PHP Sessions |
| `src/components/admin/ProtectedRoute.tsx` | تعديل طفيف |
| `src/pages/AdminLogin.tsx` | تحويل تسجيل الدخول |
| `src/pages/ForgotPassword.tsx` | تحويل |
| `src/pages/ResetPassword.tsx` | تحويل |
| `src/pages/admin/Dashboard.tsx` | تحويل الإحصائيات |
| `src/pages/admin/HeroEditor.tsx` | تحويل CRUD |
| `src/pages/admin/AboutEditor.tsx` | تحويل CRUD |
| `src/pages/admin/ServicesManager.tsx` | تحويل CRUD |
| `src/pages/admin/RegionsManager.tsx` | تحويل CRUD |
| `src/pages/admin/StationsManager.tsx` | تحويل CRUD + رفع الصور |
| `src/pages/admin/PartnersManager.tsx` | تحويل CRUD + رفع الصور |
| `src/pages/admin/MessagesInbox.tsx` | تحويل CRUD |
| `src/pages/admin/AdminSettings.tsx` | تحويل إدارة المستخدمين |
| `src/components/sections/Hero.tsx` | تحويل القراءة |
| `src/components/sections/About.tsx` | تحويل القراءة |
| `src/components/sections/Services.tsx` | تحويل القراءة |
| `src/components/sections/Stations.tsx` | تحويل القراءة |
| `src/components/sections/Partners.tsx` | تحويل القراءة |
| `src/components/sections/Contact.tsx` | تحويل إرسال النموذج + رفع الملفات |

### ملفات للحذف:
| الملف | السبب |
|-------|-------|
| `src/integrations/supabase/client.ts` | لم يعد مطلوباً |
| `src/integrations/supabase/client.safe.ts` | لم يعد مطلوباً |
| `src/integrations/supabase/types.ts` | لم يعد مطلوباً |
| `supabase/functions/manage-users/index.ts` | لم يعد مطلوباً |

---

## الجزء الثالث: تفاصيل التنفيذ

### 1. خدمة API Client الجديدة (`src/lib/api.ts`)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }
    return response.json();
  },

  async upload(endpoint: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }
    return response.json();
  },
};
```

### 2. تحويل AuthContext

**من (Supabase):**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**إلى (PHP API):**
```typescript
const response = await api.post("/auth/login.php", {
  email,
  password,
});
```

### 3. تحويل عمليات CRUD

**من (Supabase):**
```typescript
const { data, error } = await supabase
  .from("stations")
  .select("*")
  .order("region", { ascending: true });
```

**إلى (PHP API):**
```typescript
const data = await api.get("/stations/list.php");
```

### 4. تحويل رفع الملفات

**من (Supabase Storage):**
```typescript
await supabase.storage.from("uploads").upload(filePath, file);
const { data } = supabase.storage.from("uploads").getPublicUrl(filePath);
```

**إلى (PHP):**
```typescript
const { url } = await api.upload("/upload/upload.php?folder=stations", file);
```

---

## الجزء الرابع: ملفات PHP الرئيسية

### `api/config/database.php`
```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u761491305_web');
define('DB_USER', 'YOUR_DB_USERNAME');
define('DB_PASS', 'YOUR_DB_PASSWORD');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }
    return $pdo;
}
```

### `api/middleware/cors.php`
```php
<?php
header("Access-Control-Allow-Origin: https://YOUR_DOMAIN.com");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

### `api/middleware/auth.php`
```php
<?php
session_start();

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function requireAdmin() {
    requireAuth();
    if ($_SESSION['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
}

function isAdminOrEditor() {
    return isset($_SESSION['role']) && 
           in_array($_SESSION['role'], ['admin', 'editor']);
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

function getCurrentUserRole() {
    return $_SESSION['role'] ?? null;
}
```

### `api/auth/login.php`
```php
<?php
require_once '../middleware/cors.php';
require_once '../config/database.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

$pdo = getDB();
$stmt = $pdo->prepare("
    SELECT u.*, ur.role 
    FROM users u 
    LEFT JOIN user_roles ur ON u.id = ur.user_id 
    WHERE u.email = ?
");
$stmt->execute([$data['email']]);
$user = $stmt->fetch();

if (!$user || !password_verify($data['password'], $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

if ($user['is_banned']) {
    http_response_code(403);
    echo json_encode(['error' => 'Account is banned']);
    exit;
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'] ?? 'editor';

// Update last login
$pdo->prepare("UPDATE users SET last_sign_in_at = NOW() WHERE id = ?")
    ->execute([$user['id']]);

echo json_encode([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'editor'
    ]
]);
```

### `api/upload/upload.php`
```php
<?php
require_once '../middleware/cors.php';
require_once '../middleware/auth.php';

requireAuth();
if (!isAdminOrEditor()) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

$folder = $_GET['folder'] ?? 'general';
$allowedFolders = ['hero', 'services', 'stations', 'partners', 'contact-attachments'];
if (!in_array($folder, $allowedFolders)) {
    $folder = 'general';
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit;
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
$targetDir = "../../uploads/{$folder}/";

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$targetPath = $targetDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    $url = "/uploads/{$folder}/{$filename}";
    echo json_encode(['url' => $url, 'success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
```

---

## الجزء الخامس: ملفات إضافية مطلوبة

### `.htaccess` (في مجلد public_html)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle React Router
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/api/
    RewriteCond %{REQUEST_URI} !^/uploads/
    RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Protect sensitive files
<FilesMatch "\.(env|sql|log)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### `.env` المحدث (للـ React)
```env
VITE_API_URL=/api
```

---

## الجزء السادس: خطوات التنفيذ

### المرحلة 1: إنشاء ملفات PHP API (أولاً)
1. إنشاء جميع ملفات PHP المذكورة أعلاه
2. رفعها على Hostinger في مجلد `public_html/api/`
3. إنشاء مجلدات `uploads/` بالصلاحيات المناسبة

### المرحلة 2: تعديل ملفات React
1. إنشاء `src/lib/api.ts`
2. إنشاء `src/types/api.ts`
3. تعديل `AuthContext.tsx`
4. تعديل صفحات الإدارة (9 ملفات)
5. تعديل الأقسام العامة (6 ملفات)
6. حذف ملفات Supabase

### المرحلة 3: الاختبار والنشر
1. اختبار محلي
2. بناء المشروع: `npm run build`
3. رفع ملفات `dist/` إلى `public_html/`
4. اختبار شامل على الاستضافة

---

## ملاحظات أمنية مهمة

1. **تشفير كلمات المرور**: استخدام `password_hash()` و `password_verify()` في PHP
2. **حماية الجلسات**: إعداد `session.cookie_httponly = true`
3. **التحقق من المدخلات**: استخدام Prepared Statements لكل استعلام
4. **CORS**: تحديد النطاق المسموح بدقة
5. **التحقق من الصلاحيات**: في كل endpoint يتطلب صلاحية

---

## هل تريد أن أبدأ بتنفيذ هذه الخطة؟

سأبدأ بإنشاء ملفات PHP API أولاً، ثم أعدل ملفات React بالترتيب.
