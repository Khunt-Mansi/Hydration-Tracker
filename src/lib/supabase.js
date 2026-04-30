import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check .env file.");
}

const AUTH_STORAGE_KEY = "drashti-hydration-auth-v3";
const REQUEST_TIMEOUT_MS = 6000;
const projectRef = new URL(supabaseUrl).hostname.split(".")[0];

function clearOldSupabaseLocks() {
  try {
    [
      `sb-${projectRef}-auth-token`,
      `lock:sb-${projectRef}-auth-token`,
      `lock:${AUTH_STORAGE_KEY}`,
    ].forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage may be blocked in private mode. App can still continue.
  }
}

clearOldSupabaseLocks();

function fetchWithTimeout(resource, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  return fetch(resource, {
    ...options,
    signal: controller.signal,
  }).finally(() => window.clearTimeout(timeout));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithTimeout,
  },
  auth: {
    storageKey: AUTH_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "password",
  },
});

export function clearAuthStorage() {
  clearOldSupabaseLocks();
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Safe cleanup only.
  }
}
