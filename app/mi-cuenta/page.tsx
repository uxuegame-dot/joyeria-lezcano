import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/app/components/LogouButton";
import { AddressEditor } from "@/app/components/account/AddressEditor";
import { getUserOrders } from "@/app/lib/orders";
import { createClient } from "@/app/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
    pending_confirmation: "Pendiente de confirmación",
    pending_payment: "Pendiente de pago",
    payment_confirmed: "Pago confirmado",
    preparing: "En preparación",
    ready_for_pickup: "Listo para retirar",
    shipped: "Enviado",
    completed: "Completado",
    cancelled: "Cancelado",
    payment_rejected: "Pago rechazado",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("es-UY", {
        dateStyle: "medium",
        timeZone: "America/Montevideo",
    }).format(new Date(date));
}

function formatMoney(value: number | string) {
    return Number(value).toLocaleString("es-UY");
}

export default async function MiCuentaPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", user.id)
        .maybeSingle();

    const { data: defaultAddress } = await supabase
        .from("addresses")
        .select("address_line, city, department")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

    const orders = await getUserOrders();
    const recentOrders = orders.slice(0, 3);

    const firstName =
        profile?.first_name?.trim() || "";

    const lastName =
        profile?.last_name?.trim() || "";

    const fullName =
        [firstName, lastName]
            .filter(Boolean)
            .join(" ") || "Cliente Lezcano";

    return (
        <main className="bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                    <p className="text-[9px] uppercase tracking-[0.24em] text-[#9a7541] sm:text-[10px]">
                        Tu espacio
                    </p>

                    <div className="mt-2.5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                                Mi cuenta
                            </h1>

                            <p className="mt-2.5 max-w-xl text-sm leading-6 text-neutral-600">
                                Hola, {firstName || fullName}. Desde acá podés ver tus datos y seguir tus pedidos.
                            </p>
                        </div>

                        <div className="w-fit text-sm text-neutral-600">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:gap-5">
                    <div className="space-y-4">
                        <section className="border border-[#d8cfc1] bg-white p-5 sm:p-6">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                                Mis datos
                            </p>

                            <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                {fullName}
                            </h2>

                            <dl className="mt-5 space-y-4 text-sm">
                                <div>
                                    <dt className="text-[10px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                                        Email
                                    </dt>

                                    <dd className="mt-1 break-words text-neutral-900">
                                        {user.email || "—"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-[10px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                                        Teléfono / WhatsApp
                                    </dt>

                                    <dd className="mt-1 text-neutral-900">
                                        {profile?.phone || "No cargado"}
                                    </dd>
                                </div>
                            </dl>

                            <p className="mt-5 border-t border-neutral-100 pt-4 text-xs leading-5 text-neutral-500">
                                Estos datos se utilizan para identificar tu cuenta y facilitar tus pedidos.
                            </p>
                        </section>

                        <AddressEditor
                            initialAddress={defaultAddress ?? null}
                            recipientName={fullName}
                            phone={profile?.phone ?? ""}
                        />
                    </div>

                    <section className="border border-[#d8cfc1] bg-white p-5 sm:p-6">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                                    Compras
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Mis pedidos
                                </h2>
                            </div>

                            {orders.length > 0 && (
                                <Link
                                    href="/mi-cuenta/pedidos"
                                    className="lezcano-arrow inline-flex shrink-0 text-sm font-medium text-neutral-900"
                                >
                                    Ver todos
                                    <span className="arrow">→</span>
                                </Link>
                            )}
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="mt-5 border border-neutral-200 bg-[#faf8f4] px-4 py-6 sm:px-5 sm:py-8">
                                <p className="font-serif text-xl text-neutral-900">
                                    Todavía no tenés pedidos
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-500">
                                    Cuando realices una compra con esta cuenta, vas a poder seguirla desde acá.
                                </p>

                                <Link
                                    href="/catalogo"
                                    className="lezcano-button mt-5 inline-flex bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                                >
                                    Ver catálogo →
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/mi-cuenta/pedidos/${order.id}`}
                                        className="group grid grid-cols-[52px_54px_1fr_auto] items-center gap-2.5 py-3.5 transition sm:grid-cols-[64px_70px_1fr_auto] sm:gap-4 sm:py-4"
                                    >
                                        <div className="h-12 w-12 overflow-hidden bg-[#eee9e1] sm:h-14 sm:w-14">
                                            {order.preview_image_url ? (
                                                <img
                                                    src={order.preview_image_url}
                                                    alt={order.preview_image_alt}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] uppercase tracking-wide text-neutral-400">
                                                    Lezcano
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[9px] uppercase tracking-wide text-neutral-400">
                                                Pedido
                                            </p>

                                            <p className="mt-0.5 font-medium text-neutral-900">
                                                #{order.order_number}
                                            </p>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-neutral-900 transition group-hover:text-[#8a693c]">
                                                {STATUS_LABELS[order.status] || order.status}
                                            </p>

                                            <p className="mt-1 text-[11px] text-neutral-500 sm:text-xs">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-medium text-neutral-900 sm:text-base">
                                                ${formatMoney(order.total)}
                                            </p>

                                            <p className="mt-1 hidden text-xs text-[#9a7541] sm:block">
                                                Ver pedido →
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <Link
                        href="/mi-cuenta/pedidos"
                        className="group border border-[#d8cfc1] bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#b28a53] sm:p-6"
                    >
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                            Seguimiento
                        </p>

                        <h2 className="mt-2 font-serif text-xl text-neutral-900 sm:text-2xl">
                            Historial de pedidos
                        </h2>

                        <p className="mt-2.5 text-sm leading-6 text-neutral-500">
                            Consultá compras anteriores y el estado actual de cada pedido.
                        </p>

                        <span className="lezcano-arrow mt-4 inline-flex text-sm font-medium text-neutral-900">
                            Ir a mis pedidos
                            <span className="arrow">→</span>
                        </span>
                    </Link>

                    <Link
                        href="/catalogo"
                        className="group border border-[#d8cfc1] bg-[#eee8de] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#b28a53] sm:p-6"
                    >
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                            Lezcano
                        </p>

                        <h2 className="mt-2 font-serif text-xl text-neutral-900 sm:text-2xl">
                            Seguir explorando
                        </h2>

                        <p className="mt-2.5 text-sm leading-6 text-neutral-500">
                            Volvé al catálogo para descubrir nuevas piezas.
                        </p>

                        <span className="lezcano-arrow mt-4 inline-flex text-sm font-medium text-neutral-900">
                            Ver catálogo
                            <span className="arrow">→</span>
                        </span>
                    </Link>
                </div>
            </section>
        </main>
    );
}