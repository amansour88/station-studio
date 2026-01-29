
# خطة إنشاء مستخدم مسؤول (Admin)

## ملخص
سأقوم بإنشاء Edge Function آمنة لإنشاء مستخدم admin جديد مع البريد الإلكتروني وكلمة المرور المطلوبة.

## المتطلبات
لإنشاء مستخدم في نظام المصادقة، نحتاج إلى:
1. **Edge Function** تستخدم Service Role Key لإنشاء المستخدم
2. **إدخال في جدول user_roles** لتعيين صلاحية admin

## التفاصيل

### بيانات المستخدم الجديد
- **البريد الإلكتروني**: admin@aws.sa (أو يمكنك اختيار بريد آخر)
- **كلمة المرور**: admin123
- **الصلاحية**: admin

---

## خطوات التنفيذ

### 1. إنشاء Edge Function لإنشاء المستخدم

سأنشئ ملف `supabase/functions/create-admin-user/index.ts`:

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, password } = await req.json();

    // إنشاء المستخدم
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) throw createError;

    // إضافة صلاحية admin
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userData.user.id, role: "admin" });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ success: true, user_id: userData.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### 2. استدعاء الـ Function لإنشاء المستخدم

بعد إنشاء الـ Function، سأستدعيها لإنشاء المستخدم:

```json
{
  "email": "admin@aws.sa",
  "password": "admin123"
}
```

---

## ملاحظات أمنية مهمة

- كلمة المرور `admin123` **ضعيفة جداً** وينصح بتغييرها فوراً بعد تسجيل الدخول
- تأكد من حذف الـ Edge Function بعد إنشاء المستخدم لمنع إنشاء مستخدمين آخرين بشكل غير مصرح

---

## بعد الموافقة

1. سأنشئ Edge Function
2. سأستدعيها لإنشاء المستخدم
3. ستتمكن من تسجيل الدخول على `/admin/login` بـ:
   - **البريد**: admin@aws.sa
   - **كلمة المرور**: admin123
