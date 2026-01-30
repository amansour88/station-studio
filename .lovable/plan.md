
# خطة تحسين سرعة تحميل الصفحة الرئيسية

## المشكلة
عند فتح الصفحة الرئيسية، يتم تحميل 6+ طلبات API بالتوازي مما يسبب بطء في ظهور المحتوى خاصة قسم Hero.

---

## الحل 1: إضافة Persistent Database Connection

### الملف: `php-api/config/database.php`
تحسين الاتصال بقاعدة البيانات باستخدام اتصال دائم (Persistent Connection).

```php
$pdo = new PDO(
    "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
    DB_USER,
    DB_PASS,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_PERSISTENT => true, // ← إضافة هذا السطر
    ]
);
```

---

## الحل 2: إنشاء API موحد للصفحة الرئيسية

بدلاً من 6 طلبات منفصلة، نجمعها في طلب واحد.

### ملف جديد: `php-api/homepage/data.php`
يجلب جميع بيانات الصفحة الرئيسية في طلب واحد.

```php
<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDB();
    
    // Hero Section
    $hero = $pdo->query("SELECT * FROM hero_section WHERE is_active = 1 LIMIT 1")->fetch();
    
    // About Section
    $about = $pdo->query("SELECT * FROM about_section LIMIT 1")->fetch();
    
    // Services
    $services = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY display_order")->fetchAll();
    
    // Regions
    $regions = $pdo->query("SELECT * FROM regions ORDER BY name")->fetchAll();
    
    // Stations
    $stations = $pdo->query("SELECT * FROM stations ORDER BY region_id")->fetchAll();
    
    // Partners
    $partners = $pdo->query("SELECT * FROM partners WHERE is_active = 1 ORDER BY display_order")->fetchAll();
    
    echo json_encode([
        'hero' => $hero,
        'about' => $about,
        'services' => $services,
        'regions' => $regions,
        'stations' => $stations,
        'partners' => $partners,
    ]);

} catch (Exception $e) {
    error_log("Homepage data error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch homepage data']);
}
```

---

## الحل 3: إضافة HTTP Caching Headers

### تعديل جميع ملفات PHP العامة (hero/get.php, about/get.php, إلخ)

```php
// في بداية الملف بعد CORS
header("Cache-Control: public, max-age=300"); // 5 دقائق
header("ETag: " . md5(json_encode($data)));
```

---

## الحل 4: تحسين React باستخدام staleTime

### تعديل جميع useQuery في الأقسام العامة

```typescript
const { data: heroData, isLoading } = useQuery({
  queryKey: ["hero-section"],
  queryFn: async () => { ... },
  staleTime: 5 * 60 * 1000, // 5 دقائق - لن يعيد الطلب
  gcTime: 30 * 60 * 1000,   // 30 دقيقة في الذاكرة
});
```

---

## الحل 5: عرض المحتوى فوراً مع Fallback

### تعديل Hero.tsx لعرض المحتوى الثابت أولاً

بدلاً من إظهار Skeleton أثناء التحميل، نعرض المحتوى الافتراضي مباشرة.

```typescript
// إزالة شرط isLoading من العرض الرئيسي
// العنوان والوصف يظهران فوراً من الترجمات
<h1 className="...">
  <span>{t("hero.title")} </span>
  <span className="text-gradient-gold">{t("hero.titleHighlight")}</span>
</h1>
```

---

## الحل 6: إضافة Database Indexes

### SQL لتسريع الاستعلامات

```sql
-- في phpMyAdmin على Hostinger
ALTER TABLE hero_section ADD INDEX idx_active (is_active);
ALTER TABLE services ADD INDEX idx_active_order (is_active, display_order);
ALTER TABLE stations ADD INDEX idx_region (region_id);
ALTER TABLE partners ADD INDEX idx_active_order (is_active, display_order);
```

---

## ملخص التغييرات

| الملف | التغيير |
|-------|---------|
| `php-api/config/database.php` | إضافة Persistent Connection |
| `php-api/homepage/data.php` | ملف جديد - API موحد |
| `php-api/hero/get.php` | إضافة Cache headers |
| `php-api/about/get.php` | إضافة Cache headers |
| `php-api/services/list.php` | إضافة Cache headers |
| `php-api/regions/list.php` | إضافة Cache headers |
| `php-api/stations/list.php` | إضافة Cache headers |
| `php-api/partners/list.php` | إضافة Cache headers |
| `src/components/sections/Hero.tsx` | إضافة staleTime + إزالة loading state |
| `src/components/sections/About.tsx` | إضافة staleTime |
| `src/components/sections/Services.tsx` | إضافة staleTime |
| `src/components/sections/Stations.tsx` | إضافة staleTime |
| `src/components/sections/Partners.tsx` | إضافة staleTime |
| `src/hooks/useHomepageData.ts` | ملف جديد - Hook موحد (اختياري) |

---

## النتيجة المتوقعة

- **التحميل الأول**: أسرع بـ 50-70% (طلب واحد بدل 6)
- **الزيارات المتكررة**: فورية تقريباً (من الكاش)
- **تجربة المستخدم**: المحتوى يظهر فوراً بدون Skeleton
