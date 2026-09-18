import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";

export default async function AdministracionPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, is_admin")
        .eq("id", user.id)
        .single();

    if (error || !profile?.is_admin) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl text-neutral-900">
                    Acceso no autorizado
                </h1>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    Esta sección está reservada para los administradores de
                    Joyería Lezcano.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-flex bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                >
                    Volver al inicio
                </Link>
            </section>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#9a7541]">
                        Panel privado
                    </p>

                    <h1 className="mt-2 font-serif text-4xl tracking-tight text-neutral-900">
                        Administración
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                        Bienvenido, {profile.first_name} {profile.last_name}.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/administracion/productos"
                        className="group border border-[#ddd5c9] bg-white p-5 transition hover:border-[#b28a53] sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                    Catálogo
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Productos
                                </h2>
                            </div>

                            <span className="text-lg text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-[#9a7541]">
                                →
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Crear, editar, publicar y administrar las piezas del
                            catálogo.
                        </p>

                        <p className="mt-5 text-xs font-medium text-neutral-900">
                            Administrar productos
                        </p>
                    </Link>

                    <Link
                        href="/administracion/pedidos"
                        className="group border border-[#ddd5c9] bg-white p-5 transition hover:border-[#b28a53] sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                    Operativa
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Pedidos
                                </h2>
                            </div>

                            <span className="text-lg text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-[#9a7541]">
                                →
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Consultar, priorizar y gestionar los pedidos de la
                            tienda.
                        </p>

                        <p className="mt-5 text-xs font-medium text-neutral-900">
                            Ver pedidos
                        </p>
                    </Link>

                    <Link
                        href="/administracion/dashboard"
                        className="group border border-[#ddd5c9] bg-white p-5 transition hover:border-[#b28a53] sm:col-span-2 sm:p-6 lg:col-span-1"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                    Visión general
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Dashboard
                                </h2>
                            </div>

                            <span className="text-lg text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-[#9a7541]">
                                →
                            </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Resumen de pedidos, ventas confirmadas, catálogo y
                            actividad reciente.
                        </p>

                        <p className="mt-5 text-xs font-medium text-neutral-900">
                            Ver dashboard
                        </p>
                    </Link>
                </div>
            </section>
        </main>
    );
}