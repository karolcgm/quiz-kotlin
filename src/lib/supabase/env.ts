const fallbackSupabaseUrl = "https://example.supabase.co";
const fallbackSupabaseAnonKey = "supabase-anon-key-for-build-only";

export function getSupabaseEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackSupabaseUrl,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? fallbackSupabaseAnonKey,
    isConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}
