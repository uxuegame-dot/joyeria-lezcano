"use client";

import { useActionState } from "react";
import {
    updatePassword,
    type ActionState,
} from "@/app/lib/auth/actions";

const initialState: ActionState = {
    error: null,
};

export function UpdatePasswordForm() {
    const [state, formAction, isPending] = useActionState(
        updatePassword,
        initialState
    );

    if (state.success) {
        return (
            <div>
                <div className="rounded-[14px] border border-[#d9e4cf] bg-[#f3f7ef] px-4 py-4">
                    <p className="text-sm leading-6 text-[#506144]">
                        Contraseña actualizada correctamente.
                    </p>
                </div>

                <a
                    href="/mi-cuenta"
                    className="lezcano-button mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e]"
                >
                    Volver a Mi cuenta
                </a>
            </div>
        );
    }

    return (
        <form action={formAction}>
            <label className="block">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                    Nueva contraseña
                </span>

                <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm outline-none focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                />

                <span className="mt-1.5 block text-[11px] text-[#8a8178]">
                    Mínimo 8 caracteres.
                </span>
            </label>

            {state.error && (
                <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">
                        {state.error}
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="lezcano-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e] disabled:opacity-50"
            >
                {isPending ? "Guardando..." : "Guardar contraseña"}
            </button>
        </form>
    );
}
