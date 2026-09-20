"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/lib/auth/actions";

const initialState: ActionState = {
    error: null,
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(
        signIn,
        initialState
    );

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="border-b border-[#eadfce] bg-gradient-to-r from-[#f3e8d8] via-[#fbf7f0] to-[#efe7dc] px-5 py-5 sm:px-7 sm:py-6">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Acceso
                        </p>

                        <h1 className="mt-1.5 font-serif text-3xl leading-tight text-[#211d18] sm:text-[34px]">
                            Iniciar sesión
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6e6358]">
                            Ingresá para ver tus datos, direcciones y pedidos.
                        </p>
                    </div>

                    <form action={formAction} className="p-5 sm:p-7">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                    Email
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                />
                            </label>

                            <label className="block">
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                    Contraseña
                                </span>
                                <input
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm text-neutral-900 outline-none transition focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                />
                            </label>
                        </div>

                        {state.error && (
                            <div className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3">
                                <p className="text-sm leading-5 text-red-700">
                                    {state.error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="lezcano-button mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9a6f3e] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isPending ? "Ingresando..." : "Ingresar"}
                        </button>

                        <div className="mt-5 flex flex-col gap-3 border-t border-[#eee6dc] pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <Link
                                href="/recuperar-password"
                                className="text-[#966635] transition hover:text-[#6f4824]"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>

                            <p className="text-[#7b7066]">
                                ¿No tenés cuenta?{" "}
                                <Link
                                    href="/registro"
                                    className="font-medium text-neutral-900 underline decoration-[#b98b55] underline-offset-4"
                                >
                                    Registrate
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
