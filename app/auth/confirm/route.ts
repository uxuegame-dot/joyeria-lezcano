import {
    type EmailOtpType,
} from "@supabase/supabase-js";

import {
    type NextRequest,
    NextResponse,
} from "next/server";

import { createClient } from "@/app/lib/supabase/server";

function getSafeNext(
    value: string | null
) {
    if (
        value &&
        value.startsWith("/") &&
        !value.startsWith("//")
    ) {
        return value;
    }

    return "/actualizar-password";
}

export async function GET(
    request: NextRequest
) {
    const {
        searchParams,
    } = new URL(
        request.url
    );

    const code =
        searchParams.get("code");

    const tokenHash =
        searchParams.get(
            "token_hash"
        );

    const type =
        searchParams.get(
            "type"
        ) as EmailOtpType | null;

    const next =
        getSafeNext(
            searchParams.get(
                "next"
            )
        );

    const supabase =
        await createClient();

    /*
     * Flujo PKCE / callback actual de Supabase.
     * Es el que utiliza, por ejemplo, el email
     * de recuperación con redirectTo.
     */
    if (code) {
        const { error } =
            await supabase.auth.exchangeCodeForSession(
                code
            );

        if (!error) {
            return NextResponse.redirect(
                new URL(
                    next,
                    request.url
                )
            );
        }
    }

    /*
     * También soportamos templates personalizados
     * que envíen token_hash + type directamente.
     */
    if (
        tokenHash &&
        type
    ) {
        const { error } =
            await supabase.auth.verifyOtp({
                type,
                token_hash:
                    tokenHash,
            });

        if (!error) {
            const destination =
                type === "recovery"
                    ? next
                    : "/login?confirmed=1";

            return NextResponse.redirect(
                new URL(
                    destination,
                    request.url
                )
            );
        }
    }

    return NextResponse.redirect(
        new URL(
            "/login?error=recovery_link_invalid",
            request.url
        )
    );
}
