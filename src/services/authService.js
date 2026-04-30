import { clearAuthStorage, supabase } from "../lib/supabase";

function usernameToEmail(username) {
  const clean = String(username || "").trim().toLowerCase();
  if (!clean) return "";
  if (clean.includes("@")) return clean;
  const domain = import.meta.env.VITE_LOGIN_DOMAIN || "drashti.local";
  return `${clean}@${domain}`;
}

function normalizeNetworkError(error) {
  if (!error) return new Error("Something went wrong.");
  if (error.name === "AbortError" || String(error.message || "").includes("fetch")) {
    return new Error("Unable to connect to Supabase. Please check internet, Supabase URL, anon key, or network/VPN/firewall.");
  }
  return error;
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    // Do not keep the tracker stuck on Loading when old refresh tokens or network issues exist.
    clearAuthStorage();
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
    return null;
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (error) {
    const normalizedError = normalizeNetworkError(error);
    if (normalizedError.message.includes("Unable to connect")) clearAuthStorage();
    throw normalizedError;
  }
}

export async function signInWithUsername(username, password) {
  return signIn(usernameToEmail(username), password);
}

export async function signUpWithUsername(username, password) {
  try {
    const email = usernameToEmail(username);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: String(username || "").trim(),
        },
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    const normalizedError = normalizeNetworkError(error);
    if (normalizedError.message.includes("Unable to connect")) clearAuthStorage();
    throw normalizedError;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
