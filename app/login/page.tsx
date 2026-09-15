'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn, type ActionState } from '@/app/lib/auth/actions'

const initialState: ActionState = {
    error: null,
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(
        signIn,
        initialState
    )

    return (
        <main className="mx-auto max-w-sm p-6">
            <h1 className="text-xl font-semibold">Iniciar sesión</h1>

            <form action={formAction} className="mt-4 flex flex-col gap-3">
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    className="rounded border p-2"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Contraseña"
                    required
                    className="rounded border p-2"
                />

                {state.error && (
                    <p className="text-sm text-red-600">{state.error}</p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded bg-black p-2 text-white disabled:opacity-50"
                >
                    {isPending ? 'Ingresando...' : 'Ingresar'}
                </button>
            </form>

            <Link
                href="/recuperar-password"
                className="mt-3 inline-block text-sm underline"
            >
                ¿Olvidaste tu contraseña?
            </Link>

            <p className="mt-4 text-sm text-gray-600">
                ¿No tenés una cuenta?{' '}
                <Link href="/registro" className="underline">
                    Registrate
                </Link>
            </p>
        </main>
    )
}