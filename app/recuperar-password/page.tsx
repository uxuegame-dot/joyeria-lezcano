"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
    requestPasswordReset,
    type ActionState,
} from "@/app/lib/auth/actions";

const initialState: ActionState = {
    error: null,
};

export default function RecuperarPasswordPage() {
    const [state, formAction, isPending] = useActionState(
        requestPasswordReset,
        initialState
    );

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="border-b border-[#eadfce] bg-gradient-to-r from-[#f3e8d8] via-[#fbf7f0] to-[#efe7dc] px-5 py-5 sm:px-7 sm:py-6">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Seguridad
                        </p>

                        <h1 className="mt-1.5 font-serif text-3xl text-[#211d18] sm:text-[34px]">
                            Recuperar contraseña
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6e6358]">
                            Te enviaremos un enlace seguro para elegir una nueva contraseña.
                        </p>
                    </div>

                    <div className="p-5 sm:p-7">
                        {state.success ? (
                            <div>
                                <div className="rounded-[14px] border border-[#d9e4cf] bg-[#f3f7ef] px-4 py-4">
                                    <p className="text-sm leading-6 text-[#506144]">
                                        Si el email existe en nuestro sistema, te enviamos un link para restablecer la contraseña.
                                    </p>
                                </div>

                                <Link
                                    href="/login"
                                    className="lezcano-button mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e]"
                                >
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        ) : (
                            <form action={formAction}>
                                <label className="block">
                                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                        Email
                                    </span>

                                    <input
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm outline-none focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                    />
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
                                    {isPending
                                        ? "Enviando..."
                                        : "Enviar enlace de recuperación"}
                                </button>

                                <Link
                                    href="/login"
                                    className="mt-4 inline-flex text-sm text-[#966635] hover:text-[#6f4824]"
                                >
                                    ← Volver al inicio de sesión
                                </Link>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
