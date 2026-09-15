'use client'

import { useActionState } from 'react'
import {
    updatePassword,
    type ActionState,
} from '@/app/lib/auth/actions'

const initialState: ActionState = {
    error: null,
}

export function UpdatePasswordForm() {
    const [state, formAction, isPending] = useActionState(
        updatePassword,
        initialState
    )

    if (state.success) {
        return (
            <div className="mt-4">
                <p className="text-sm text-gray-600">
                    Contraseña actualizada correctamente.
                </p>

                <a
                    href="/login"
                    className="mt-3 inline-block text-sm underline"
                >
                    Ir a iniciar sesión
                </a>
            </div>
        )
    }

    return (
        <form
            action={formAction}
            className="mt-4 flex flex-col gap-3"
        >
            <input
                name="password"
                type="password"
                placeholder="Nueva contraseña"
                required
                minLength={8}
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
                {isPending ? 'Guardando...' : 'Guardar contraseña'}
            </button>
        </form>
    )
}