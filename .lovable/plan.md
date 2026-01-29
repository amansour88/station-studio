
# خطة شاملة لتحسين لوحة التحكم والموقع

## ملخص المشكلات والحلول

هذه الخطة تغطي 10 نقاط رئيسية تم الإشارة إليها، مرتبة حسب الأولوية.

---

## 1. إضافة خلفية لشاشة الدخول

**الملف:** `src/pages/AdminLogin.tsx`

**التعديلات:**
- إضافة صورة خلفية جذابة (من أصول المشروع الموجودة)
- تحسين التصميم بتدرجات لونية

---

## 2. إضافة "تذكرني" و"نسيت كلمة المرور"

**الملفات:**
- `src/pages/AdminLogin.tsx`
- `src/pages/ForgotPassword.tsx` (ملف جديد)
- `src/pages/ResetPassword.tsx` (ملف جديد)
- `src/App.tsx`

**التعديلات:**
- إضافة checkbox "تذكرني" (يستخدم localStorage للحفاظ على الجلسة)
- إضافة رابط "نسيت كلمة المرور"
- إنشاء صفحة لإرسال رابط إعادة تعيين كلمة المرور
- إنشاء صفحة لإدخال كلمة المرور الجديدة

---

## 3. تسجيل الدخول باسم مستخدم بدلاً من الإيميل

**ملاحظة هامة:** نظام المصادقة يعتمد على البريد الإلكتروني كمعرّف أساسي. الحل المقترح:

**الخيار الأول (موصى به):** 
- إضافة حقل `username` في جدول `profiles`
- السماح للمستخدم بإدخال اسم المستخدم
- البحث عن البريد المرتبط به ثم تسجيل الدخول

**التعديلات:**
- تحديث جدول `profiles` لإضافة عمود `username` فريد
- تعديل `AdminLogin.tsx` للبحث عن username أولاً

---

## 4. ربط لوحة التحكم بقاعدة البيانات (المشكلة الرئيسية)

**المشكلة:** التغييرات في لوحة التحكم لا تنعكس على الواجهة الأمامية

**السبب:** الواجهة الأمامية (Hero, Services, Stations) تستخدم بيانات ثابتة (Static) بدلاً من جلبها من قاعدة البيانات

**الملفات المطلوب تعديلها:**
- `src/components/sections/Hero.tsx` - ربطه بجدول `hero_section`
- `src/components/sections/Services.tsx` - ربطه بجدول `services`
- `src/components/sections/Stations.tsx` - ربطه بجدول `stations`
- `src/components/sections/Partners.tsx` - ربطه بجدول `partners`
- `src/components/sections/About.tsx` - ربطه بجدول `about_section`

**التعديلات لكل قسم:**
```text
1. استخدام useQuery لجلب البيانات من Supabase
2. إضافة حالة التحميل (Loading)
3. عرض البيانات الديناميكية بدلاً من الثابتة
```

---

## 5. ربط الخدمات بالواجهة الرئيسية

**الملف:** `src/components/sections/Services.tsx`

**التعديلات:**
- جلب الخدمات من جدول `services` باستخدام useQuery
- عرض الأيقونات ديناميكياً (مع خريطة للأيقونات)
- إضافة حالة التحميل

---

## 6. نموذج تواصل متعدد الأنواع مع رفع الملفات

**التعديلات على قاعدة البيانات:**
- إضافة أعمدة جديدة لجدول `contact_messages`:
  - `type` (نوع الطلب: استفسار، شكوى، وظيفة، استثمار)
  - `service_type` (نوع الخدمة للمستثمرين)
  - `attachment_url` (رابط المرفق)

**الملفات:**
- `src/components/sections/Contact.tsx` - تعديل النموذج
- `src/components/sections/Services.tsx` - تعديل الأزرار

**التعديلات:**
- إضافة اختيار نوع التواصل:
  - خدمات المستثمرين (إدارة المحطات، الامتياز التجاري، تأجير المرافق)
  - شكوى العملاء
  - خدمة العملاء (استفسارات)
  - التقديم على وظائف
- إضافة رفع الملفات (صورة شكوى، صورة مرفق، سيرة ذاتية)
- ربط أزرار المستثمرين بالنموذج مع تحديد النوع تلقائياً

---

## 7. تحسين إدارة المحطات والمناطق

**التعديلات على قاعدة البيانات:**
- إنشاء جدول جديد `regions` للمناطق مع:
  - `id`, `name`, `slug`, `map_url`, `is_active`
- تحديث جدول `stations` لإضافة:
  - `google_maps_url` (رابط خرائط جوجل)
  - `products` (المنتجات المتوفرة)

**الملفات:**
- `src/pages/admin/RegionsManager.tsx` (ملف جديد)
- `src/pages/admin/StationsManager.tsx` - تحديث
- `src/components/sections/Stations.tsx` - تحديث
- `src/components/admin/AdminLayout.tsx` - إضافة رابط المناطق

**التعديلات:**
- إضافة صفحة إدارة المناطق
- إمكانية إضافة رابط الموقع لكل منطقة
- تصفية المحطات حسب المنطقة في الواجهة الأمامية
- عرض الخدمات والمنتجات لكل محطة

---

## 8. إدارة المستخدمين في صفحة الإعدادات

**الملفات:**
- `src/pages/admin/AdminSettings.tsx`
- `supabase/functions/manage-users/index.ts` (Edge Function جديدة)

**التعديلات:**
- إنشاء Edge Function لإدارة المستخدمين (إنشاء، تعديل، حذف)
- عرض قائمة كاملة بالمستخدمين
- إمكانية تغيير صلاحيات المستخدمين
- إمكانية تعطيل/تفعيل المستخدمين
- إمكانية إعادة تعيين كلمة المرور

---

## 9. تحويل الشركاء إلى Slider متحرك

**الملف:** `src/components/sections/Partners.tsx`

**التعديلات:**
- استخدام `embla-carousel-react` (مثبت بالفعل)
- تصميم صف واحد من الكروت يتحرك يميناً وشمالاً
- إضافة auto-play
- إيقاف الحركة عند hover

---

## 10. نقل شعار "مليون عميل" إلى Hero

**الملفات:**
- `src/components/sections/Hero.tsx`
- `src/components/sections/Partners.tsx`

**التعديلات:**
- نقل البانر من Partners إلى Hero
- وضعه تحت الوصف وفوق الأزرار

---

## الجزء التقني

### تعديلات قاعدة البيانات

```sql
-- إضافة أعمدة جديدة لجدول contact_messages
ALTER TABLE contact_messages 
ADD COLUMN type text DEFAULT 'general',
ADD COLUMN service_type text,
ADD COLUMN attachment_url text;

-- إنشاء جدول المناطق
CREATE TABLE regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  map_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تحديث جدول المحطات
ALTER TABLE stations
ADD COLUMN google_maps_url text,
ADD COLUMN products text[];

-- إضافة username فريد لـ profiles
ALTER TABLE profiles
ADD COLUMN username text UNIQUE;
```

### Edge Functions المطلوبة

1. **manage-users** - لإدارة المستخدمين (إنشاء، تعديل، حذف، عرض)

### الملفات الجديدة

| الملف | الوصف |
|-------|-------|
| `src/pages/ForgotPassword.tsx` | صفحة نسيت كلمة المرور |
| `src/pages/ResetPassword.tsx` | صفحة إعادة تعيين كلمة المرور |
| `src/pages/admin/RegionsManager.tsx` | إدارة المناطق |
| `supabase/functions/manage-users/index.ts` | Edge Function لإدارة المستخدمين |

### الملفات المعدلة

| الملف | نوع التعديل |
|-------|-------------|
| `src/pages/AdminLogin.tsx` | خلفية + تذكرني + نسيت كلمة المرور + username |
| `src/components/sections/Hero.tsx` | ربط بقاعدة البيانات + بانر المليون عميل |
| `src/components/sections/Services.tsx` | ربط بقاعدة البيانات + أزرار المستثمرين |
| `src/components/sections/Stations.tsx` | ربط بقاعدة البيانات + تصفية حسب المنطقة |
| `src/components/sections/Partners.tsx` | ربط بقاعدة البيانات + Slider + إزالة البانر |
| `src/components/sections/About.tsx` | ربط بقاعدة البيانات |
| `src/components/sections/Contact.tsx` | نموذج متعدد الأنواع + رفع ملفات |
| `src/pages/admin/AdminSettings.tsx` | إدارة كاملة للمستخدمين |
| `src/pages/admin/StationsManager.tsx` | إضافة رابط الموقع والمنتجات |
| `src/components/admin/AdminLayout.tsx` | إضافة رابط المناطق |
| `src/App.tsx` | إضافة routes جديدة |

---

## ترتيب التنفيذ

1. **المرحلة الأولى:** ربط البيانات (النقطة 4، 5) - الأهم
2. **المرحلة الثانية:** تحسين شاشة الدخول (النقاط 1، 2، 3)
3. **المرحلة الثالثة:** نموذج التواصل المتقدم (النقطة 6)
4. **المرحلة الرابعة:** إدارة المناطق والمحطات (النقطة 7)
5. **المرحلة الخامسة:** إدارة المستخدمين (النقطة 8)
6. **المرحلة السادسة:** تحسينات التصميم (النقاط 9، 10)

---

## الوقت المتوقع

التنفيذ الكامل لجميع النقاط سيتم على مراحل متعددة نظراً لحجم التغييرات المطلوبة.
