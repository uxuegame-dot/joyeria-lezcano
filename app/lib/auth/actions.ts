'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

export type ActionState = {
    error: string | null
    success?: boolean
}

export async function signUp(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()

    if (!email || !password || !firstName || !lastName) {
        return {
            error: 'Nombre, apellido, email y contraseña son obligatorios.',
        }
    }

    if (password.length < 8) {
        return {
            error: 'La contraseña debe tener al menos 8 caracteres.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                phone,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    return {
        error: null,
        success: true,
    }
}

export async function signIn(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) {
        return {
            error: 'Completá email y contraseña.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signOut() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function requestPasswordReset(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const email = String(formData.get('email') ?? '').trim()

    if (!email) {
        return {
            error: 'Ingresá tu email.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    })

    if (error) {
        return { error: error.message }
    }

    return {
        error: null,
        success: true,
    }
}

export async function updatePassword(
    _prev: ActionState,
    formData: FormData
): Promise<ActionState> {
    const password = String(formData.get('password') ?? '')

    if (password.length < 8) {
        return {
            error: 'La contraseña debe tener al menos 8 caracteres.',
        }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return {
        error: null,
        success: true,
    }
}