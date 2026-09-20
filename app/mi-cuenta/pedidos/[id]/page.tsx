import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getUserOrderById } from "@/app/lib/orders";
import { createClient } from "@/app/lib/supabase/server";

type PedidoPageProps = {
    params: Promise<{
        id: string;
    }>;
};

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
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Montevideo",
    }).format(new Date(date));
}

function formatMoney(value: number | string) {
    return Number(value).toLocaleString("es-UY");
}

function getProgressSteps(
    status: string,
    deliveryMethod: string
) {
    const deliveryLabel =
        deliveryMethod === "pickup"
            ? "Listo para retirar"
            : "Enviado";

    const steps = [
        {
            key: "received",
            label: "Pedido recibido",
        },
        {
            key: "payment",
            label: "Pago confirmado",
        },
        {
            key: "preparing",
            label: "En preparación",
        },
        {
            key: "delivery",
            label: deliveryLabel,
        },
        {
            key: "completed",
            label: "Completado",
        },
    ];

    const statusIndex: Record<string, number> = {
        pending_confirmation: 0,
        pending_payment: 0,
        payment_confirmed: 1,
        preparing: 2,
        ready_for_pickup: 3,
        shipped: 3,
        completed: 4,
    };

    return {
        steps,
        activeIndex: statusIndex[status] ?? 0,
    };
}

export default async function PedidoPage({
    params,
}: PedidoPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const order = await getUserOrderById(id);

    if (!order) {
        notFound();
    }

    const isProblemStatus =
        order.status === "cancelled" ||
        order.status === "payment_rejected";

    const { steps, activeIndex } =
        getProgressSteps(
            order.status,
            order.delivery_method
        );

    return (
        <main className="min-h-screen bg-[#f6f2eb]">
            <section className="border-b border-[#ddd1c0]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/mi-cuenta/pedidos"
                        className="lezcano-arrow inline-flex text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                        <span className="arrow">←</span>
                        Mis pedidos
                    </Link>

                    <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.24em] text-[#9a7541] sm:text-[10px]">
                                Pedido
                            </p>

                            <h1 className="mt-1.5 font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl">
                                #{order.order_number}
                            </h1>

                            <p className="mt-2 text-xs leading-5 text-neutral-500 sm:mt-3 sm:text-sm">
                                {formatDate(order.created_at)}
                            </p>
                        </div>

                        <div className="w-fit rounded-full border border-[#ddcfbd] bg-[#fffdf9] px-3.5 py-2 text-xs font-medium text-neutral-900 sm:px-4 sm:text-sm">
                            {STATUS_LABELS[order.status] || order.status}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <section className="rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(65,48,29,0.035)] sm:p-6">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                        Seguimiento
                    </p>

                    <h2 className="mt-1.5 font-serif text-xl text-neutral-900 sm:mt-2 sm:text-2xl">
                        Estado de tu pedido
                    </h2>

                    {isProblemStatus ? (
                        <div className="mt-5 rounded-[14px] border border-neutral-200 bg-[#faf8f4] p-4 sm:mt-6 sm:p-5">
                            <p className="text-sm font-medium text-neutral-900">
                                {order.status === "cancelled"
                                    ? "Este pedido fue cancelado."
                                    : "El pago no pudo confirmarse."}
                            </p>

                            <p className="mt-2 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                                Si necesitás ayuda, podés comunicarte con Joyería Lezcano por WhatsApp.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 sm:mt-7">
                            <div className="hidden grid-cols-5 md:grid">
                                {steps.map((step, index) => {
                                    const completed =
                                        index <= activeIndex;

                                    return (
                                        <div
                                            key={step.key}
                                            className="relative text-center"
                                        >
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`absolute left-1/2 top-3 h-px w-full ${index < activeIndex
                                                        ? "bg-[#b28a53]"
                                                        : "bg-neutral-200"
                                                        }`}
                                                />
                                            )}

                                            <div
                                                className={`relative z-10 mx-auto h-6 w-6 rounded-full border ${completed
                                                    ? "border-[#b28a53] bg-[#b28a53]"
                                                    : "border-neutral-300 bg-white"
                                                    }`}
                                            />

                                            <p
                                                className={`mx-auto mt-3 max-w-[120px] text-xs leading-5 ${completed
                                                    ? "font-medium text-neutral-900"
                                                    : "text-neutral-400"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-0 md:hidden">
                                {steps.map((step, index) => {
                                    const completed =
                                        index <= activeIndex;

                                    return (
                                        <div
                                            key={step.key}
                                            className="flex min-h-9 gap-3"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`h-4 w-4 rounded-full border ${completed
                                                        ? "border-[#b28a53] bg-[#b28a53]"
                                                        : "border-neutral-300 bg-white"
                                                        }`}
                                                />

                                                {index < steps.length - 1 && (
                                                    <div
                                                        className={`h-8 w-px ${index < activeIndex
                                                            ? "bg-[#b28a53]"
                                                            : "bg-neutral-200"
                                                            }`}
                                                    />
                                                )}
                                            </div>

                                            <p
                                                className={`-mt-0.5 text-xs leading-5 ${completed
                                                    ? "font-medium text-neutral-900"
                                                    : "text-neutral-400"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {order.status === "pending_confirmation" && (
                                <p className="mt-5 border-t border-neutral-100 pt-4 text-xs leading-5 text-neutral-500 sm:mt-6 sm:pt-5 sm:text-sm sm:leading-6">
                                    Recibimos tu pedido. Lezcano lo revisará antes de continuar con el pago.
                                </p>
                            )}

                            {order.status === "pending_payment" && (
                                <p className="mt-5 border-t border-neutral-100 pt-4 text-xs leading-5 text-neutral-500 sm:mt-6 sm:pt-5 sm:text-sm sm:leading-6">
                                    Tu pedido está confirmado y se encuentra pendiente de pago.
                                </p>
                            )}
                        </div>
                    )}
                </section>

                <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] p-4 shadow-[0_10px_30px_rgba(65,48,29,0.035)] sm:p-6">
                        <h2 className="font-serif text-xl text-neutral-900 sm:text-2xl">
                            Productos
                        </h2>

                        <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200 sm:mt-5">
                            {order.items.map((item) => {
                                const content = (
                                    <>
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-[#eee9e1] sm:h-20 sm:w-20">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.image_alt}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-2 text-center text-[9px] uppercase tracking-wide text-neutral-400">
                                                    Lezcano
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium leading-5 text-neutral-900 sm:text-base">
                                                {item.product_name}
                                            </p>

                                            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                                                Cantidad: {item.quantity}
                                            </p>

                                            <p className="mt-1 text-[11px] text-neutral-400 sm:text-xs">
                                                ${formatMoney(item.unit_price)} c/u
                                            </p>
                                        </div>

                                        <p className="shrink-0 text-sm font-medium text-neutral-900 sm:text-base">
                                            ${formatMoney(item.subtotal)}
                                        </p>
                                    </>
                                );

                                if (item.product_slug) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={`/catalogo/${item.product_slug}`}
                                            className="group flex items-center gap-3 py-4 transition sm:gap-4 sm:py-5"
                                        >
                                            {content}
                                        </Link>
                                    );
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 py-4 sm:gap-4 sm:py-5"
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 space-y-2.5 text-sm sm:mt-5 sm:space-y-3">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Subtotal
                                </span>

                                <span className="text-neutral-900">
                                    ${formatMoney(order.subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Envío
                                </span>

                                <span className="text-neutral-900">
                                    {Number(order.shipping_cost) > 0
                                        ? `$${formatMoney(order.shipping_cost)}`
                                        : order.delivery_method === "shipping"
                                            ? "A coordinar"
                                            : "Sin costo"}
                                </span>
                            </div>

                            <div className="flex justify-between border-t border-neutral-200 pt-3.5 text-base font-medium sm:pt-4">
                                <span>Total</span>

                                <span>
                                    ${formatMoney(order.total)}
                                </span>
                            </div>
                        </div>
                    </section>

                    <aside className="h-fit border border-[#d8cfc1] bg-white p-4 sm:p-6 lg:p-7">
                        <h2 className="font-serif text-xl text-neutral-900 sm:text-2xl">
                            Entrega
                        </h2>

                        <dl className="mt-4 space-y-4 text-sm sm:mt-5 sm:space-y-5">
                            <div>
                                <dt className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                    Modalidad
                                </dt>

                                <dd className="mt-1 text-neutral-900">
                                    {order.delivery_method === "pickup"
                                        ? "Retiro en la joyería"
                                        : "Envío"}
                                </dd>
                            </div>

                            {order.delivery_method === "shipping" && (
                                <>
                                    <div>
                                        <dt className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                            Dirección
                                        </dt>

                                        <dd className="mt-1 text-neutral-900">
                                            {order.address_line || "—"}
                                            {order.apartment
                                                ? `, ${order.apartment}`
                                                : ""}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                            Ciudad
                                        </dt>

                                        <dd className="mt-1 text-neutral-900">
                                            {order.city || "—"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                            Departamento
                                        </dt>

                                        <dd className="mt-1 text-neutral-900">
                                            {order.department || "—"}
                                        </dd>
                                    </div>

                                    {order.tracking_number && (
                                        <div>
                                            <dt className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                                Seguimiento
                                            </dt>

                                            <dd className="mt-1 font-medium text-neutral-900">
                                                {order.tracking_number}
                                            </dd>
                                        </div>
                                    )}
                                </>
                            )}
                        </dl>

                        {order.customer_notes && (
                            <div className="mt-5 border-t border-neutral-100 pt-4 sm:mt-6 sm:pt-5">
                                <p className="text-[9px] uppercase tracking-wide text-neutral-400 sm:text-[10px]">
                                    Tus observaciones
                                </p>

                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">
                                    {order.customer_notes}
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </main>
    );
}