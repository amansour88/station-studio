
# خطة إصلاح شاملة لمشاكل الموقع

## ملخص المشاكل المكتشفة

بعد فحص شامل للمشروع، وجدت **مشكلة جذرية واحدة** تسبب كل المشاكل المذكورة:

**الـ API يرسل الطلبات إلى `/api/...` على سيرفر Lovable بدلاً من سيرفر Hostinger الخارجي**

---

## تفاصيل المشاكل

### 1. الصفحة البيضاء
- **السبب**: الـ API يُعيد صفحة HTML (`Project not found`) بدلاً من JSON
- **الدليل**: من سجلات الشبكة، كل الطلبات تُرجع `404` مع صفحة HTML

### 2. سنة التأسيس والخدمات لا تتحدث
- **السبب**: عند الحفظ، الطلب يذهب إلى `/api/hero/update.php` على Lovable (غير موجود)
- **النتيجة**: الحفظ يفشل صامتاً والبيانات لا تُحفظ في قاعدة البيانات

### 3. مشكلة السلايدر
- **السبب**: طلب `/api/partners/list.php` يُرجع `404`
- **النتيجة**: السلايدر يستخدم البيانات الثابتة (fallback) بدلاً من قاعدة البيانات

### 4. خطأ إرسال الرسائل
- **السبب**: طلب `/api/messages/create.php` يفشل بـ `404`
- **النتيجة**: الرسالة لا تُرسل ويظهر خطأ للمستخدم

---

## الحل المطلوب

### الخطوة 1: إضافة متغير البيئة `VITE_API_URL`

يجب إضافة رابط الـ API الخارجي في إعدادات المشروع:

```
VITE_API_URL=https://aws.sa/api
```

**أو** (حسب مكان رفع ملفات PHP):
```
VITE_API_URL=https://aws.sa/php-api
```

### الخطوة 2: تعديل ملف `src/lib/api.ts`

تحديث الملف ليستخدم الرابط من متغير البيئة:

```typescript
// قبل:
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// بعد (مع fallback للتطوير):
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://aws.sa/api";
```

### الخطوة 3: التأكد من إعدادات CORS

في ملف `php-api/middleware/cors.php`، يجب إضافة رابط معاينة Lovable:

```php
$allowed_origins = [
    'https://aws.sa',
    'https://www.aws.sa',
    'https://station-studio.lovable.app',
    'https://id-preview--b98bc172-4c7e-470a-abb0-5149fd721ca5.lovable.app',
    'http://localhost:5173',
];
```

### الخطوة 4: التأكد من إعدادات قاعدة البيانات

في ملف `php-api/config/database.php`:
```php
define('DB_USER', 'اسم_المستخدم_الحقيقي');
define('DB_PASS', 'كلمة_المرور_الحقيقية');
```

### الخطوة 5: التأكد من إعدادات البريد

في ملف `php-api/config/config.php`:
```php
define('SMTP_USER', 'noreply@aws.sa');
define('SMTP_PASS', 'كلمة_مرور_البريد');
```

---

## تحسينات إضافية مقترحة

### 1. معالجة أفضل للأخطاء

إضافة `try...catch` في `AuthContext` لمنع الصفحة البيضاء عند فشل الـ API:

```typescript
const checkSession = async () => {
  try {
    const response = await api.get<CheckSessionResponse>("/auth/check-session.php");
    // ... handle success
  } catch (error) {
    console.error("Session check failed:", error);
    // Continue without authentication instead of crashing
  } finally {
    setLoading(false);
  }
};
```

### 2. إضافة `queryClient.invalidateQueries` بعد التحديثات

لضمان تحديث البيانات على الصفحة الرئيسية بعد الحفظ في لوحة التحكم:

```typescript
// في HeroEditor.tsx بعد الحفظ الناجح:
queryClient.invalidateQueries({ queryKey: ["hero-section"] });

// في ServicesManager.tsx بعد الحفظ:
queryClient.invalidateQueries({ queryKey: ["services"] });
```

---

## خطوات التنفيذ

| الخطوة | الملف | الإجراء |
|--------|-------|---------|
| 1 | Settings → Environment | إضافة `VITE_API_URL` |
| 2 | `src/lib/api.ts` | تحديث `API_BASE_URL` |
| 3 | `src/contexts/AuthContext.tsx` | تحسين معالجة الأخطاء |
| 4 | `src/pages/admin/HeroEditor.tsx` | إضافة cache invalidation |
| 5 | `src/pages/admin/ServicesManager.tsx` | إضافة cache invalidation |
| 6 | `php-api/middleware/cors.php` | إضافة روابط Lovable |

---

## ما يحتاج تأكيد منك

**هل رابط الـ API على Hostinger هو:**
- `https://aws.sa/api/` ؟
- أم `https://aws.sa/php-api/` ؟
- أم رابط آخر؟

بمجرد تأكيد الرابط، سأقوم بتطبيق كل الإصلاحات دفعة واحدة.
