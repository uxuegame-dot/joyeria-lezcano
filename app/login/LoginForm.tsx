"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
    signIn,
    type ActionState,
} from "@/app/lib/auth/actions";

const initialState: ActionState = {
    error: null,
};

type LoginFormProps = {
    notice?: string | null;
    errorNotice?: string | null;
};

export function LoginForm({
    notice,
    errorNotice,
}: LoginFormProps) {
    const [
        state,
        formAction,
        isPending,
    ] = useActionState(
        signIn,
        initialState
    );

    return (
        <div className="rounded-[22px] border border-[#ddd2c2] bg-white p-5 shadow-[0_18px_50px_rgba(61,43,20,0.055)] sm:p-6">
            <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a57638]">
                    Acceso
                </p>

                <h2 className="mt-2 font-serif text-[28px] leading-tight text-neutral-900 sm:text-3xl">
                    Iniciar sesión
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Ingresá para ver tus datos, direcciones y pedidos.
                </p>
            </div>

            {notice && (
                <div className="mt-5 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm leading-5 text-emerald-800">
                        {notice}
                    </p>
                </div>
            )}

            {errorNotice && (
                <div className="mt-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm leading-5 text-red-700">
                        {errorNotice}
                    </p>
                </div>
            )}

            <form
                action={formAction}
                className="mt-5 space-y-4"
            >
                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                        Email
                    </span>

                    <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@email.com"
                        required
                        className="h-12 w-full rounded-[14px] border border-neutral-200 bg-[#fcfbf8] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b7884a] focus:bg-white focus:ring-4 focus:ring-[#b7884a]/10"
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                        Contraseña
                    </span>

                    <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Tu contraseña"
                        required
                        className="h-12 w-full rounded-[14px] border border-neutral-200 bg-[#fcfbf8] px-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b7884a] focus:bg-white focus:ring-4 focus:ring-[#b7884a]/10"
                    />
                </label>

                {state.error && (
                    <div className="rounded-[14px] border border-red-200 bg-red-50 px-3.5 py-3">
                        <p className="text-sm leading-5 text-red-700">
                            {state.error}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="lezcano-button flex min-h-12 w-full items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8e642e] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending
                        ? "Ingresando..."
                        : "Ingresar"}
                </button>
            </form>

            <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <Link
                    href="/recuperar-password"
                    className="font-medium text-[#8d6735] transition hover:text-neutral-900"
                >
                    ¿Olvidaste tu contraseña?
                </Link>

                <p className="text-neutral-500">
                    ¿No tenés cuenta?{" "}
                    <Link
                        href="/registro"
                        className="font-medium text-neutral-900 underline decoration-[#c8a66f] underline-offset-4"
                    >
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    );
}
