
# خطة إصلاح المشاكل: المحطات + السلايدر + السرعة + Footer

## ملخص المشاكل والحلول

| المشكلة | السبب | الحل |
|---------|-------|------|
| 1. المحطات فارغة | لا يوجد Fallback data + PHP API غير متاح في Lovable | إضافة بيانات افتراضية للمحطات والمناطق |
| 2. السلايدر لا يلف | إعدادات Embla غير مضبوطة للـ infinite loop | تعديل إعدادات الـ autoplay وإضافة تكرار للعناصر |
| 3. سرعة التحميل | 5+ طلبات API منفصلة | يوجد بالفعل `homepage/data.php` موحد (لكن غير مستخدم) |
| 4. روابط السوشيال ثابتة | Footer لا يجلب الإعدادات | ربط Footer بـ API الإعدادات |

---

## المهمة 1: إضافة Fallback Data للمحطات

**الملف:** `src/components/sections/Stations.tsx`

**المشكلة الحالية:**
- الكود يحاول جلب البيانات من `/regions/list.php` و `/stations/list.php`
- في بيئة Lovable Preview، لا يوجد PHP API
- النتيجة: لا تظهر أي محطات أو مناطق

**الحل:**
إضافة بيانات fallback للمحطات والمناطق مثلما فعلنا مع Services و Partners:

```typescript
// Fallback regions
const fallbackRegions = [
  { id: "1", name: "القصيم", name_en: "Al-Qassim", stations_count: 35 },
  { id: "2", name: "مكة المكرمة", name_en: "Makkah", stations_count: 20 },
  { id: "3", name: "المدينة المنورة", name_en: "Madinah", stations_count: 12 },
  { id: "4", name: "حائل", name_en: "Hail", stations_count: 6 },
  { id: "5", name: "عسير", name_en: "Asir", stations_count: 5 },
];

// Fallback stations (78 محطة حسب البيانات)
const fallbackStations = [
  { id: "1", name: "محطة بريدة الرئيسية", city: "بريدة", region: "القصيم", lat: 26.3266, lng: 43.9748 },
  { id: "2", name: "محطة عنيزة", city: "عنيزة", region: "القصيم", lat: 26.0840, lng: 43.9953 },
  // ... المزيد من المحطات
];

// استخدام Fallback عند فشل API
const regions = dbRegions && dbRegions.length > 0 ? dbRegions : fallbackRegions;
const stations = dbStations && dbStations.length > 0 ? dbStations : fallbackStations;
```

---

## المهمة 2: إصلاح سلايدر الشركاء للعمل كـ Infinite Loop

**الملف:** `src/components/sections/Partners.tsx`

**المشكلة الحالية:**
- السلايدر يتوقف عند آخر عنصر
- لا يستمر في الدوران بشكل لا نهائي

**الحل:**
تعديل إعدادات Embla Carousel لإنشاء loop حقيقي:

```typescript
// 1. مضاعفة العناصر لضمان التدفق المستمر
const duplicatedPartners = [...partners, ...partners, ...partners];

// 2. تحسين إعدادات Embla
const emblaOptions = useMemo(() => ({
  loop: true,
  align: "start" as const,
  direction: language === "ar" ? "rtl" : "ltr",
  dragFree: true,           // ← إضافة للحركة السلسة
  containScroll: false,      // ← إضافة لعدم التوقف
  skipSnaps: true,           // ← إضافة للتخطي السلس
}), [language]);

// 3. تحسين Autoplay
const autoplay = useRef(
  Autoplay({
    delay: 0,                 // ← تغيير لـ 0 للحركة المستمرة
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    playOnInit: true,
  }),
);
```

**خيار بديل (CSS Animation):**
إذا لم ينجح Embla، يمكن استخدام CSS marquee:

```css
@keyframes scroll-partners {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.33%); }
}

.partners-track {
  display: flex;
  animation: scroll-partners 30s linear infinite;
}

.partners-track:hover {
  animation-play-state: paused;
}
```

---

## المهمة 3: ربط Footer بإعدادات الموقع

**الملف:** `src/components/layout/Footer.tsx`

**المشكلة الحالية:**
- روابط السوشيال ميديا ثابتة (`href="#"`)
- لا يجلب الإعدادات من API

**الحل:**
جلب الإعدادات من `/settings/get.php` وعرضها:

```typescript
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// جلب إعدادات الموقع
const { data: settings } = useQuery({
  queryKey: ["site-settings"],
  queryFn: () => api.get<Record<string, string>>("/settings/get.php"),
  staleTime: 10 * 60 * 1000, // 10 دقائق
});

// استخدام الإعدادات
<a href={settings?.facebook_url || "#"}>
  <Facebook className="w-5 h-5" />
</a>
<a href={settings?.twitter_url || "#"}>
  <Twitter className="w-5 h-5" />
</a>
// ...
```

---

## المهمة 4: تحسين سرعة التحميل (اختياري)

**الوضع الحالي:**
- كل قسم يجلب بياناته بشكل منفصل (5-6 طلبات)
- يوجد بالفعل `php-api/homepage/data.php` يجلب كل البيانات مرة واحدة

**ملاحظة:** 
هذا التحسين سيعمل فقط على موقع الإنتاج (aws.sa) لأنه يحتاج PHP.
في Lovable Preview سنعتمد على Fallback data.

---

## ملخص الملفات المتأثرة

| الملف | التعديل |
|-------|---------|
| `src/components/sections/Stations.tsx` | إضافة fallbackRegions و fallbackStations |
| `src/components/sections/Partners.tsx` | إصلاح infinite loop |
| `src/components/layout/Footer.tsx` | جلب إعدادات السوشيال ميديا |

---

## النتائج المتوقعة

بعد التنفيذ:
- ✅ المحطات تظهر ببيانات افتراضية في Lovable Preview
- ✅ المحطات تظهر ببيانات حقيقية على aws.sa
- ✅ سلايدر الشركاء يدور باستمرار بدون توقف
- ✅ روابط السوشيال ميديا تعمل من الإعدادات
- ✅ الموقع يعمل حتى لو فشل API
