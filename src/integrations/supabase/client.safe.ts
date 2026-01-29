// Safe client wrapper.
// The default generated client reads VITE env vars. In some preview environments those can be missing,
// which causes a blank screen at startup. This wrapper provides a fallback.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Prefer Vite env vars when present.
// Fallback values are public (anon) and safe to ship to the browser.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://emprxinbylcxovqbujda.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcHJ4aW5ieWxjeG92cWJ1amRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjY3NjMsImV4cCI6MjA4NTI0Mjc2M30.6JIsiQHMEoDeWkUMjvBDu8mVvTzQbVZFcLxpeTsqOrI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
