
# خطة تنفيذ التحسينات الشاملة

## ملخص التعديلات

| # | المهمة | الملفات المتأثرة |
|---|--------|------------------|
| 1 | تعديل صفحة نسيت كلمة المرور | `src/pages/ForgotPassword.tsx` |
| 2 | إضافة Seed Data كاملة | `php-api/database.sql` |
| 3 | إضافة خاصية موقع الخريطة | `src/types/api.ts` + `src/pages/admin/SiteSettings.tsx` |
| 4 | إظهار المرفقات في الرسائل | `src/pages/admin/MessagesInbox.tsx` |

---

## 1. تعديل صفحة نسيت كلمة المرور

**الملف:** `src/pages/ForgotPassword.tsx`

### التغييرات:

**حذف الشعار من فوق الكارد (سطر 73-78)** واستبدال أيقونة الظرف بالشعار داخل الكارد:

```tsx
// سطر 72-79: حذف قسم الشعار الخارجي
<div className="w-full max-w-md relative z-10">
  {/* Card */}
  <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-aws-lg p-8 border border-border/50">
    {isSuccess ? (
      <div className="text-center">
        <a href="/" className="inline-block mb-4">
          <Logo size="xl" />
        </a>
```

```tsx
// سطر 101-108: استبدال أيقونة الظرف بالشعار
<>
  <div className="text-center mb-8">
    <a href="/" className="inline-block mb-4">
      <Logo size="xl" />
    </a>
    <h1 className="text-2xl font-bold text-foreground mb-2">
      نسيت كلمة المرور؟
    </h1>
```

**إزالة import غير مستخدم:**
```tsx
// سطر 4: إزالة CheckCircle من الـ imports إذا لم يعد مستخدماً
import { Mail, ArrowRight } from "lucide-react";
```

---

## 2. إضافة Seed Data لقاعدة البيانات

**الملف:** `php-api/database.sql`

### إضافة بعد سطر 211 (نهاية الملف):

```sql
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

-- ===========================================
-- إعدادات الخريطة
-- ===========================================
INSERT INTO site_settings (id, setting_key, setting_value) VALUES
(UUID(), 'map_latitude', '26.3266'),
(UUID(), 'map_longitude', '43.9748'),
(UUID(), 'map_zoom', '6')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
```

### تحديث وصف الهيرو (سطر 204-206):

```sql
-- تحديث الهيرو بالوصف الكامل
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
```

---

## 3. إضافة خاصية موقع الخريطة في إعدادات الموقع

### 3.1 تحديث Types

**الملف:** `src/types/api.ts`

```typescript
// تحديث SiteSettings interface (سطر 81-89)
export interface SiteSettings {
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  phone: string;
  email: string;
  address: string;
  // إضافة حقول الخريطة
  map_latitude?: string;
  map_longitude?: string;
  map_zoom?: string;
}
```

### 3.2 تحديث صفحة إعدادات الموقع

**الملف:** `src/pages/admin/SiteSettings.tsx`

**تحديث imports (سطر 3):**
```tsx
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin, Save, Globe, Navigation } from "lucide-react";
```

**تحديث formData الافتراضي (سطر 16-24):**
```tsx
const [formData, setFormData] = useState<SiteSettings>({
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  linkedin_url: "",
  phone: "",
  email: "",
  address: "",
  map_latitude: "",
  map_longitude: "",
  map_zoom: "6",
});
```

**تحديث useEffect (سطر 31-42):**
```tsx
useEffect(() => {
  if (settings) {
    setFormData({
      facebook_url: settings.facebook_url || "",
      twitter_url: settings.twitter_url || "",
      instagram_url: settings.instagram_url || "",
      linkedin_url: settings.linkedin_url || "",
      phone: settings.phone || "",
      email: settings.email || "",
      address: settings.address || "",
      map_latitude: settings.map_latitude || "",
      map_longitude: settings.map_longitude || "",
      map_zoom: settings.map_zoom || "6",
    });
  }
}, [settings]);
```

**إضافة قسم الخريطة بعد قسم معلومات التواصل (بعد سطر 145):**
```tsx
{/* Map Location Section */}
<div className="bg-card rounded-2xl p-6 border border-border/50">
  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
    <Navigation className="w-5 h-5 text-primary" />
    موقع المقر الرئيسي على الخريطة
  </h2>
  <div className="grid md:grid-cols-3 gap-4">
    <div>
      <label className="block text-sm font-medium mb-2">خط العرض (Latitude)</label>
      <Input
        placeholder="26.3266"
        value={formData.map_latitude || ""}
        onChange={(e) => setFormData({ ...formData, map_latitude: e.target.value })}
        dir="ltr"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">خط الطول (Longitude)</label>
      <Input
        placeholder="43.9748"
        value={formData.map_longitude || ""}
        onChange={(e) => setFormData({ ...formData, map_longitude: e.target.value })}
        dir="ltr"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-2">مستوى التقريب (Zoom)</label>
      <Input
        placeholder="6"
        type="number"
        min="1"
        max="18"
        value={formData.map_zoom || ""}
        onChange={(e) => setFormData({ ...formData, map_zoom: e.target.value })}
        dir="ltr"
      />
    </div>
  </div>
  <p className="text-sm text-muted-foreground mt-3">
    يمكنك الحصول على الإحداثيات من Google Maps بالضغط بزر الماوس الأيمن على الموقع واختيار الإحداثيات
  </p>
</div>
```

---

## 4. إظهار المرفقات في عرض الرسائل

**الملف:** `src/pages/admin/MessagesInbox.tsx`

### 4.1 تحديث imports (سطر 1-11):
```tsx
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Search,
  Phone,
  Calendar,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
```

### 4.2 تحديث Interface (سطر 19-29):
```tsx
interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  type: string | null;
  service_type: string | null;
  attachment_url: string | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}
```

### 4.3 إضافة عرض المرفقات (بعد سطر 324):
```tsx
{/* Body */}
<div className="flex-1 p-6 overflow-y-auto">
  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
    {selectedMessage.message}
  </p>
  
  {/* Attachment */}
  {selectedMessage.attachment_url && (
    <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">ملف مرفق</p>
          <p className="text-sm text-muted-foreground truncate">
            {selectedMessage.attachment_url.split('/').pop()}
          </p>
        </div>
        <a
          href={selectedMessage.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>تحميل</span>
        </a>
      </div>
    </div>
  )}

  {/* Message Type Badge */}
  {selectedMessage.type && selectedMessage.type !== 'general' && (
    <div className="mt-4">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary/20 text-secondary">
        {selectedMessage.type === 'franchise' ? 'طلب امتياز' : 
         selectedMessage.type === 'service' ? 'استفسار خدمة' : 
         selectedMessage.type}
      </span>
      {selectedMessage.service_type && (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground mr-2">
          {selectedMessage.service_type}
        </span>
      )}
    </div>
  )}
</div>
```

---

## ملخص الملفات المتأثرة

| الملف | التعديلات |
|-------|-----------|
| `src/pages/ForgotPassword.tsx` | حذف الشعار الخارجي + استبدال أيقونة الظرف بالشعار |
| `php-api/database.sql` | إضافة Seed Data للمناطق والخدمات والشركاء والمحطات + تحديث الهيرو + إعدادات الخريطة |
| `src/types/api.ts` | إضافة حقول الخريطة في SiteSettings |
| `src/pages/admin/SiteSettings.tsx` | إضافة قسم موقع الخريطة |
| `src/pages/admin/MessagesInbox.tsx` | إضافة عرض المرفقات + نوع الرسالة |

---

## ملاحظات مهمة

### بعد التنفيذ:

1. **إعادة استيراد قاعدة البيانات:** يجب إعادة استيراد ملف `database.sql` المحدث في phpMyAdmin
2. **اختبار البريد:** تأكد من إعدادات SMTP في `php-api/config/config.php`
3. **اختبار المرفقات:** جرب إرسال رسالة مع ملف مرفق للتأكد من ظهورها

### للبريد الإلكتروني:
- تأكد من إنشاء حساب `noreply@aws.sa` في Hostinger
- ضع كلمة المرور الصحيحة في `SMTP_PASS`
- النظام سيستخدم `mail()` العادية تلقائياً إذا لم تكن PHPMailer موجودة
