import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log connection status for debugging
console.log("Supabase URL:", supabaseUrl ? "✅ Connected" : "❌ Missing");
console.log(
  "Supabase Anon Key:",
  supabaseAnonKey ? "✅ Connected" : "❌ Missing",
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
