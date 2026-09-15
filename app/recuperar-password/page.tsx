'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
    requestPasswordReset,
    type ActionState,
} from '@/app/lib/auth/actions'

const initialState: ActionState = {
    error: null,
}

export default function RecuperarPasswordPage() {
    const [state, formAction, isPending] = useActionState(
        requestPasswordReset,
        initialState
    )

    return (
        <main className="mx-auto max-w-sm p-6">
            <h1 className="text-xl font-semibold">
                Recuperar contraseña
            </h1>

            {state.success ? (
                <div className="mt-4">
                    <p className="text-sm text-gray-600">
                        Si el email existe en nuestro sistema, te enviamos
                        un link para restablecer la contraseña.
                    </p>

                    <Link
                        href="/login"
                        className="mt-4 inline-block text-sm underline"
                    >
                        Volver al inicio de sesión
                    </Link>
                </div>
            ) : (
                <form
                    action={formAction}
                    className="mt-4 flex flex-col gap-3"
                >
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="rounded border p-2"
                    />

                    {state.error && (
                        <p className="text-sm text-red-600">
                            {state.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded bg-black p-2 text-white disabled:opacity-50"
                    >
                        {isPending
                            ? 'Enviando...'
                            : 'Enviar link de recuperación'}
                    </button>
                </form>
            )}
        </main>
    )
}