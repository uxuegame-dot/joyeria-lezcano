"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type ActionState } from "@/app/lib/auth/actions";

const initialState: ActionState = {
    error: null,
};

export default function RegistroPage() {
    const [state, formAction, isPending] = useActionState(
        signUp,
        initialState
    );

    if (state.success) {
        return (
            <main className="min-h-[68vh] bg-[#f6f2eb]">
                <section className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                    <div className="rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] p-6 text-center shadow-[0_16px_44px_rgba(65,48,29,0.06)] sm:p-8">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f0df] text-lg text-[#53713f]">
                            ✓
                        </div>

                        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Cuenta creada
                        </p>

                        <h1 className="mt-2 font-serif text-3xl text-[#211d18]">
                            Revisá tu email
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6e6358]">
                            Te enviamos un mensaje para confirmar tu cuenta. Cuando la confirmes, ya vas a poder iniciar sesión.
                        </p>

                        <Link
                            href="/login"
                            className="lezcano-button mt-6 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#1b1916] px-6 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e]"
                        >
                            Ir a iniciar sesión
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="border-b border-[#eadfce] bg-gradient-to-r from-[#f3e8d8] via-[#fbf7f0] to-[#efe7dc] px-5 py-5 sm:px-7 sm:py-6">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Tu cuenta
                        </p>

                        <h1 className="mt-1.5 font-serif text-3xl text-[#211d18] sm:text-[34px]">
                            Crear cuenta
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6e6358]">
                            Guardá tus datos, direcciones y seguimiento de pedidos en un solo lugar.
                        </p>
                    </div>

                    <form action={formAction} className="p-5 sm:p-7">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                    Nombre
                                </span>
                                <input
                                    name="firstName"
                                    autoComplete="given-name"
                                    required
                                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm outline-none focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                />
                            </label>

                            <label className="block">
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                    Apellido
                                </span>
                                <input
                                    name="lastName"
                                    autoComplete="family-name"
                                    required
                                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm outline-none focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                />
                            </label>

                            <label className="block">
                                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                    Teléfono
                                </span>
                                <input
                                    name="phone"
                                    autoComplete="tel"
                                    placeholder="Opcional"
                                    className="mt-1.5 h-12 w-full rounded-[12px] border border-[#ddd3c5] bg-[#fbfaf7] px-4 text-sm outline-none placeholder:text-neutral-400 focus:border-[#a77a45] focus:bg-white focus:ring-2 focus:ring-[#a77a45]/10"
                                />
                            </label>

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
                        </div>

                        <label className="mt-4 block">
                            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8b7f73]">
                                Contraseña
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
                            {isPending ? "Creando cuenta..." : "Crear cuenta"}
                        </button>

                        <p className="mt-5 text-center text-sm text-[#7b7066]">
                            ¿Ya tenés cuenta?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-neutral-900 underline decoration-[#b98b55] underline-offset-4"
                            >
                                Iniciar sesión
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </main>
    );
}
