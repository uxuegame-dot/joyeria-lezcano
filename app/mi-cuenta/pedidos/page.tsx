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

function getStatusClasses(status: string) {
    switch (status) {
        case "payment_confirmed":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "preparing":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "ready_for_pickup":
        case "shipped":
            return "border-violet-200 bg-violet-50 text-violet-700";
        case "completed":
            return "border-neutral-200 bg-neutral-100 text-neutral-600";
        case "payment_rejected":
            return "border-red-200 bg-red-50 text-red-700";
        case "cancelled":
            return "border-neutral-200 bg-white text-neutral-400";
        default:
            return "border-[#e2cfaf] bg-[#fbf3e6] text-[#825e31]";
    }
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
        <main className="min-h-screen bg-[#f6f2eb]">
            <section className="border-b border-[#ddd1c0]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/mi-cuenta"
                        className="lezcano-arrow inline-flex text-sm text-[#7f7468] hover:text-[#8d6031]"
                    >
                        <span className="arrow">←</span>
                        Mi cuenta
                    </Link>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                                Historial
                            </p>

                            <h1 className="mt-1.5 font-serif text-3xl leading-tight text-[#211d18] sm:text-4xl">
                                Mis pedidos
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6e6358]">
                                Revisá el estado de tus compras y consultá el detalle de cada pedido.
                            </p>
                        </div>

                        {orders.length > 0 && (
                            <span className="inline-flex w-fit rounded-full border border-[#ddcfbd] bg-[#fffdf9] px-3 py-1.5 text-[10px] font-medium text-[#6c5b49]">
                                {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {orders.length === 0 ? (
                    <div className="mx-auto max-w-xl rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] px-6 py-10 text-center shadow-[0_12px_36px_rgba(65,48,29,0.05)]">
                        <h2 className="font-serif text-2xl text-[#211d18]">
                            Todavía no hay pedidos
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#71665c]">
                            Las compras realizadas con esta cuenta van a aparecer acá.
                        </p>

                        <Link
                            href="/catalogo"
                            className="lezcano-button mt-6 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#1b1916] px-6 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e]"
                        >
                            Explorar catálogo →
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-hidden rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_12px_36px_rgba(65,48,29,0.04)] md:block">
                            <div className="grid grid-cols-[72px_90px_1fr_170px_130px] gap-5 border-b border-[#e7ddcf] bg-[#f8f3ec] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8b7f73]">
                                <span></span>
                                <span>Pedido</span>
                                <span>Estado</span>
                                <span>Fecha</span>
                                <span className="text-right">Total</span>
                            </div>

                            <div className="divide-y divide-[#e9e0d5]">
                                {orders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/mi-cuenta/pedidos/${order.id}`}
                                        className="group grid grid-cols-[72px_90px_1fr_170px_130px] items-center gap-5 px-5 py-4 transition hover:bg-[#fbf7f0]"
                                    >
                                        <div className="h-14 w-14 overflow-hidden rounded-[12px] bg-[#eee7dc]">
                                            {order.preview_image_url ? (
                                                <img
                                                    src={order.preview_image_url}
                                                    alt={order.preview_image_alt}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] uppercase tracking-[0.12em] text-neutral-400">
                                                    Lezcano
                                                </div>
                                            )}
                                        </div>

                                        <div>
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
                                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(order.status)}`}>
                                                {STATUS_LABELS[order.status] || order.status}
                                            </span>

                                            <p className="mt-1.5 text-[11px] text-neutral-500">
                                                {order.delivery_method === "pickup" ? "Retiro" : "Envío"}
                                            </p>
                                        </div>

                                        <p className="text-xs leading-5 text-neutral-600">
                                            {formatDate(order.created_at)}
                                        </p>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-neutral-900">
                                                ${formatMoney(order.total)}
                                            </p>
                                            <p className="mt-1 text-[11px] text-[#976a38]">
                                                Ver →
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 md:hidden">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/mi-cuenta/pedidos/${order.id}`}
                                    className="group block rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] p-3.5 shadow-[0_10px_28px_rgba(65,48,29,0.04)]"
                                >
                                    <div className="flex gap-3">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-[#eee7dc]">
                                            {order.preview_image_url ? (
                                                <img
                                                    src={order.preview_image_url}
                                                    alt={order.preview_image_alt}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.12em] text-neutral-400">
                                                    Lezcano
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#976a38]">
                                                        Pedido
                                                    </p>
                                                    <p className="mt-0.5 font-semibold text-neutral-900">
                                                        #{order.order_number}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 font-semibold text-neutral-900">
                                                    ${formatMoney(order.total)}
                                                </p>
                                            </div>

                                            <div className="mt-2">
                                                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusClasses(order.status)}`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-[10px] text-neutral-500">
                                                        {order.delivery_method === "pickup" ? "Retiro" : "Envío"}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-neutral-400">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </div>

                                                <span className="text-[11px] font-medium text-[#976a38]">
                                                    Ver →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
