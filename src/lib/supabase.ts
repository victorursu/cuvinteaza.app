import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config";

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "");

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  console.warn(
    "Supabase credentials not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = supabaseInstance;

