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
                    className="mt-8 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
                >
                    Volver al inicio
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="border-b border-neutral-200 pb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Panel privado
                </p>

                <h1 className="mt-3 font-serif text-4xl text-neutral-900">
                    Administración
                </h1>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    Bienvenido, {profile.first_name} {profile.last_name}.
                </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* PRODUCTOS */}
                <Link
                    href="/administracion/productos"
                    className="group border border-neutral-200 p-6 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                    <h2 className="font-serif text-2xl text-neutral-900">
                        Productos
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                        Crear, editar, publicar y administrar productos del
                        catálogo.
                    </p>

                    <p className="mt-6 text-sm font-medium text-neutral-900">
                        Administrar productos →
                    </p>
                </Link>

                {/* PEDIDOS */}
                <Link
                    href="/administracion/pedidos"
                    className="group border border-neutral-200 p-6 transition hover:border-neutral-400 hover:bg-neutral-50"
                >
                    <h2 className="font-serif text-2xl text-neutral-900">
                        Pedidos
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                        Consultar y gestionar los pedidos realizados desde la
                        tienda.
                    </p>

                    <p className="mt-6 text-sm font-medium text-neutral-900">
                        Ver pedidos →
                    </p>
                </Link>

                {/* CLIENTES */}
                <div className="border border-neutral-200 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="font-serif text-2xl text-neutral-900">
                            Clientes
                        </h2>

                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                            Próximamente
                        </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-neutral-600">
                        Consulta y administración de clientes de la joyería.
                    </p>
                </div>
            </div>
        </section>
    );
}