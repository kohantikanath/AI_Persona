import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export function getSupabaseBrowserClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error("Supabase browser credentials are not configured.");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export function getSupabaseServerClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase server credentials are not configured.");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
