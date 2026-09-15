'use client'

import { useActionState } from 'react'
import { signUp, type ActionState } from '@/app/lib/auth/actions'

const initialState: ActionState = {
    error: null,
}

export default function RegistroPage() {
    const [state, formAction, isPending] = useActionState(
        signUp,
        initialState
    )

    if (state.success) {
        return (
            <main className="mx-auto max-w-sm p-6">
                <h1 className="text-xl font-semibold">Cuenta creada</h1>

                <p className="mt-2 text-sm text-gray-600">
                    Si tu email requiere confirmación, revisá tu bandeja de entrada.
                    Si no, ya podés iniciar sesión.
                </p>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-sm p-6">
            <h1 className="text-xl font-semibold">Crear cuenta</h1>

            <form action={formAction} className="mt-4 flex flex-col gap-3">
                <input
                    name="firstName"
                    placeholder="Nombre"
                    required
                    className="rounded border p-2"
                />

                <input
                    name="lastName"
                    placeholder="Apellido"
                    required
                    className="rounded border p-2"
                />

                <input
                    name="phone"
                    placeholder="Teléfono (opcional)"
                    className="rounded border p-2"
                />

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
                    minLength={8}
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
                    {isPending ? 'Creando cuenta...' : 'Registrarme'}
                </button>
            </form>
        </main>
    )
}