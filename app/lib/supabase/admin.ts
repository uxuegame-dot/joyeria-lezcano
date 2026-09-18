import "server-only";

import {
    createClient,
    type SupabaseClient,
} from "@supabase/supabase-js";

let adminClient:
    | SupabaseClient
    | null = null;

export function createAdminClient() {
    if (adminClient) {
        return adminClient;
    }

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

    const serviceRoleKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl) {
        throw new Error(
            "Falta NEXT_PUBLIC_SUPABASE_URL."
        );
    }

    if (!serviceRoleKey) {
        throw new Error(
            "Falta SUPABASE_SERVICE_ROLE_KEY."
        );
    }

    /*
     * Este cliente usa una credencial de servidor
     * con permisos elevados.
     *
     * NUNCA debe importarse desde Client Components
     * ni exponerse con prefijo NEXT_PUBLIC_.
     */
    adminClient =
        createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken:
                        false,
                    persistSession:
                        false,
                    detectSessionInUrl:
                        false,
                },
            }
        );

    return adminClient;
}