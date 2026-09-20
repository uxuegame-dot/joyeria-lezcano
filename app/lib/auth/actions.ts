"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";

export type ActionState = {
    error: string | null;
    success?: boolean;
};

function getSiteUrl() {
    return (
        process.env.NEXT_PUBLIC_SITE_URL?.replace(
            /\/+$/,
            ""
        ) || "http://localhost:3000"
    );
}

function getFriendlyAuthError(
    message: string
) {
    const normalized =
        message.toLowerCase();

    if (
        normalized.includes(
            "invalid login credentials"
        )
    ) {
        return "El email o la contraseña no son correctos.";
    }

    if (
        normalized.includes(
            "email not confirmed"
        )
    ) {
        return "Primero tenés que confirmar tu email. Revisá tu bandeja de entrada.";
    }

    if (
        normalized.includes(
            "user already registered"
        ) ||
        normalized.includes(
            "already been registered"
        )
    ) {
        return "Ya existe una cuenta asociada a ese email.";
    }

    if (
        normalized.includes(
            "password should be at least"
        )
    ) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (
        normalized.includes(
            "rate limit"
        ) ||
        normalized.includes(
            "too many requests"
        )
    ) {
        return "Se realizaron demasiados intentos. Esperá unos minutos y probá nuevamente.";
    }

    return "No pudimos completar la operación. Revisá los datos e intentá nuevamente.";
}

export async function signUp(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(
        formData.get("email") ?? ""
    ).trim();

    const password = String(
        formData.get("password") ?? ""
    );

    const firstName = String(
        formData.get("firstName") ?? ""
    ).trim();

    const lastName = String(
        formData.get("lastName") ?? ""
    ).trim();

    const phone = String(
        formData.get("phone") ?? ""
    ).trim();

    if (
        !email ||
        !password ||
        !firstName ||
        !lastName
    ) {
        return {
            error:
                "Nombre, apellido, email y contraseña son obligatorios.",
        };
    }

    if (password.length < 8) {
        return {
            error:
                "La contraseña debe tener al menos 8 caracteres.",
        };
    }

    const supabase =
        await createClient();

    const { error } =
        await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo:
                    `${getSiteUrl()}/login?confirmed=1`,
                data: {
                    first_name:
                        firstName,
                    last_name:
                        lastName,
                    phone,
                },
            },
        });

    if (error) {
        return {
            error:
                getFriendlyAuthError(
                    error.message
                ),
        };
    }

    return {
        error: null,
        success: true,
    };
}

export async function signIn(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(
        formData.get("email") ?? ""
    ).trim();

    const password = String(
        formData.get("password") ?? ""
    );

    if (!email || !password) {
        return {
            error:
                "Completá email y contraseña.",
        };
    }

    const supabase =
        await createClient();

    const { error } =
        await supabase.auth.signInWithPassword({
            email,
            password,
        });

    if (error) {
        return {
            error:
                getFriendlyAuthError(
                    error.message
                ),
        };
    }

    revalidatePath(
        "/",
        "layout"
    );

    redirect("/");
}

export async function signOut() {
    const supabase =
        await createClient();

    await supabase.auth.signOut();

    revalidatePath(
        "/",
        "layout"
    );

    redirect("/");
}

export async function requestPasswordReset(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(
        formData.get("email") ?? ""
    ).trim();

    if (!email) {
        return {
            error:
                "Ingresá tu email.",
        };
    }

    const supabase =
        await createClient();

    const { error } =
        await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo:
                    `${getSiteUrl()}/auth/confirm?next=/actualizar-password`,
            }
        );

    if (error) {
        return {
            error:
                getFriendlyAuthError(
                    error.message
                ),
        };
    }

    return {
        error: null,
        success: true,
    };
}

export async function updatePassword(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const password = String(
        formData.get("password") ?? ""
    );

    const passwordConfirm =
        String(
            formData.get(
                "passwordConfirm"
            ) ?? ""
        );

    if (password.length < 8) {
        return {
            error:
                "La contraseña debe tener al menos 8 caracteres.",
        };
    }

    if (
        password !==
        passwordConfirm
    ) {
        return {
            error:
                "Las contraseñas no coinciden.",
        };
    }

    const supabase =
        await createClient();

    const { error } =
        await supabase.auth.updateUser({
            password,
        });

    if (error) {
        return {
            error:
                getFriendlyAuthError(
                    error.message
                ),
        };
    }

    return {
        error: null,
        success: true,
    };
}
