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
            <main className="min-h-[68vh] bg-[#f6f2eb]">
                <section className="mx-auto max-w-xl px-4 py-10 text-center sm:px-6">
                    <div className="rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] p-7 shadow-[0_14px_38px_rgba(65,48,29,0.05)]">
                        <h1 className="font-serif text-3xl text-neutral-900">
                            Acceso no autorizado
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-neutral-600">
                            Esta sección está reservada para los administradores de Joyería Lezcano.
                        </p>
                        <Link href="/" className="lezcano-button mt-6 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(20,20,20,0.08)] hover:bg-[#9a6f3e]">
                            Volver al inicio
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    const cards = [
        { href: "/administracion/productos", eyebrow: "Catálogo", title: "Productos", description: "Crear, editar, publicar y administrar las piezas del catálogo.", action: "Administrar productos" },
        { href: "/administracion/pedidos", eyebrow: "Operativa", title: "Pedidos", description: "Consultar, priorizar y gestionar los pedidos de la tienda.", action: "Ver pedidos" },
        { href: "/administracion/dashboard", eyebrow: "Visión general", title: "Dashboard", description: "Resumen de pedidos, ventas confirmadas, catálogo y actividad reciente.", action: "Ver dashboard" },
    ];

    return (
        <main className="min-h-screen bg-[#f6f2eb]">
            <section className="border-b border-[#ddd1c0]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">Panel privado</p>
                    <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">Administración</h1>
                            <p className="mt-2 text-sm leading-6 text-neutral-600">Bienvenido, {profile.first_name} {profile.last_name}.</p>
                        </div>
                        <span className="inline-flex w-fit rounded-full border border-[#ddcfbd] bg-[#fffdf9] px-3 py-1.5 text-[10px] font-medium text-[#6c5b49]">Gestión Lezcano</span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card, index) => (
                        <Link key={card.href} href={card.href} className={`group relative overflow-hidden rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] p-5 shadow-[0_10px_30px_rgba(65,48,29,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#b78a54] hover:shadow-[0_16px_36px_rgba(65,48,29,0.07)] sm:p-6 ${index === 1 ? "bg-gradient-to-br from-[#fffdf9] to-[#f6eadb]" : ""}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#976a38]">{card.eyebrow}</p>
                                    <h2 className="mt-1.5 font-serif text-2xl text-neutral-900">{card.title}</h2>
                                </div>
                                <span className="text-lg text-[#c2ac8f] transition-transform group-hover:translate-x-1 group-hover:text-[#9a6f3e]">→</span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-neutral-600">{card.description}</p>
                            <p className="mt-5 text-xs font-medium text-neutral-900">{card.action}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
