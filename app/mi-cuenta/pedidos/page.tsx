import Link from "next/link";
import { redirect } from "next/navigation";

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
        timeStyle: "short",
        timeZone: "America/Montevideo",
    }).format(new Date(date));
}

function formatMoney(value: number | string) {
    return Number(value).toLocaleString("es-UY");
}

export default async function MisPedidosPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const orders = await getUserOrders();

    return (
        <main className="bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                    <Link
                        href="/mi-cuenta"
                        className="lezcano-arrow inline-flex text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                        <span className="arrow">←</span>
                        Mi cuenta
                    </Link>

                    <p className="mt-5 text-[9px] uppercase tracking-[0.24em] text-[#9a7541] sm:mt-6 sm:text-[10px]">
                        Historial
                    </p>

                    <h1 className="mt-2 font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
                        Mis pedidos
                    </h1>

                    <p className="mt-2.5 max-w-xl text-sm leading-6 text-neutral-600">
                        Revisá el estado de tus compras y consultá el detalle de cada pedido.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                {orders.length === 0 ? (
                    <div className="border border-[#d8cfc1] bg-white px-5 py-10 text-center sm:px-6 sm:py-14">
                        <h2 className="font-serif text-2xl text-neutral-900 sm:text-3xl">
                            Todavía no hay pedidos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
                            Las compras realizadas con esta cuenta van a aparecer acá.
                        </p>

                        <Link
                            href="/catalogo"
                            className="lezcano-button mt-6 inline-flex bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Explorar catálogo →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden border border-[#d8cfc1] bg-white">
                        <div className="hidden grid-cols-[72px_90px_1fr_170px_130px] gap-5 border-b border-neutral-200 bg-[#faf8f4] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500 md:grid">
                            <span></span>
                            <span>Pedido</span>
                            <span>Estado</span>
                            <span>Fecha</span>
                            <span className="text-right">
                                Total
                            </span>
                        </div>

                        <div className="divide-y divide-neutral-200">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/mi-cuenta/pedidos/${order.id}`}
                                    className="group grid grid-cols-[54px_50px_1fr_auto] items-center gap-2.5 px-4 py-3.5 transition hover:bg-[#faf8f4] sm:grid-cols-[62px_60px_1fr_auto] sm:gap-3 md:grid-cols-[72px_90px_1fr_170px_130px] md:gap-5 md:px-5 md:py-4"
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
                                        <span className="text-[9px] uppercase tracking-wide text-neutral-400 md:hidden">
                                            Pedido
                                        </span>

                                        <p className="font-medium text-neutral-900">
                                            #{order.order_number}
                                        </p>

                                        {order.total_items > 1 && (
                                            <p className="mt-0.5 text-[10px] text-neutral-400">
                                                {order.total_items} piezas
                                            </p>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <span className="text-[9px] uppercase tracking-wide text-neutral-400 md:hidden">
                                            Estado
                                        </span>

                                        <p className="truncate text-sm font-medium text-neutral-900 transition group-hover:text-[#8a693c]">
                                            {STATUS_LABELS[order.status] || order.status}
                                        </p>

                                        <p className="mt-1 text-[11px] text-neutral-500 md:text-xs">
                                            {order.delivery_method === "pickup"
                                                ? "Retiro"
                                                : "Envío"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-neutral-400 md:hidden">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>

                                    <div className="hidden md:block">
                                        <p className="text-sm text-neutral-600">
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-[9px] uppercase tracking-wide text-neutral-400 md:hidden">
                                            Total
                                        </span>

                                        <p className="text-sm font-medium text-neutral-900 sm:text-base">
                                            ${formatMoney(order.total)}
                                        </p>

                                        <p className="mt-1 text-[11px] text-[#9a7541] md:text-xs">
                                            Ver →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}