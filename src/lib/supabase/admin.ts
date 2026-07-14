import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Klient uprzywilejowany wyłącznie do operacji Auth wykonywanych na serwerze.
 * Nie wolno importować go do Client Components ani przekazywać klucza do przeglądarki.
 */
export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const serverKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serverKey) {
    throw new Error("Brak SUPABASE_SECRET_KEY dla logowania ucznia kodem QR.");
  }

  return createSupabaseClient(url, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
