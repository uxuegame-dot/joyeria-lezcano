import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";

const ATTENTION_STATUSES = [
    "pending_confirmation",
    "pending_payment",
    "payment_rejected",
];

const IN_PROGRESS_STATUSES = [
    "payment_confirmed",
    "preparing",
    "ready_for_pickup",
    "shipped",
];

const COMPLETED_STATUSES = [
    "completed",
];

type DashboardOrder = {
    id: string;
    order_number: number;
    status: string;
    total: number | string;
    recipient_name: string | null;
    delivery_method: string;
    created_at: string;
};

type DashboardProduct = {
    id: string;
    status: string;
    stock: number;
    is_featured: boolean;
    created_at: string;
};

function formatMoney(value: number | string) {
    return Number(value).toLocaleString("es-UY", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("es-UY", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Montevideo",
    }).format(new Date(date));
}

function getStatusLabel(
    status: string,
    deliveryMethod?: string
) {
    switch (status) {
        case "pending_confirmation":
            return "Pendiente de confirmación";
        case "pending_payment":
            return "Pendiente de pago";
        case "payment_confirmed":
            return "Pago confirmado";
        case "preparing":
            return "En preparación";
        case "ready_for_pickup":
            return "Listo para retirar";
        case "shipped":
            return "Enviado";
        case "completed":
            return deliveryMethod === "shipping"
                ? "Entregado"
                : "Retirado";
        case "cancelled":
            return "Cancelado";
        case "payment_rejected":
            return "Pago rechazado";
        default:
            return status;
    }
}

function getStatusClasses(status: string) {
    switch (status) {
        case "pending_confirmation":
            return "border-amber-300 bg-amber-50 text-amber-800";
        case "pending_payment":
            return "border-[#d6c095] bg-[#f7f0e5] text-[#806037]";
        case "payment_confirmed":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        case "preparing":
            return "border-blue-200 bg-blue-50 text-blue-700";
        case "ready_for_pickup":
        case "shipped":
            return "border-violet-200 bg-violet-50 text-violet-700";
        case "completed":
            return "border-neutral-300 bg-neutral-100 text-neutral-600";
        case "payment_rejected":
            return "border-red-200 bg-red-50 text-red-700";
        case "cancelled":
        default:
            return "border-neutral-300 bg-white text-neutral-500";
    }
}

export default async function DashboardAdministracionPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } =
        await supabase
            .from("profiles")
            .select("first_name, last_name, is_admin")
            .eq("id", user.id)
            .single();

    if (profileError || !profile?.is_admin) {
        redirect("/");
    }

    const [
        ordersResult,
        productsResult,
    ] = await Promise.all([
        supabase
            .from("orders")
            .select(`
                id,
                order_number,
                status,
                total,
                recipient_name,
                delivery_method,
                created_at
            `)
            .order("created_at", {
                ascending: false,
            }),

        supabase
            .from("products")
            .select(`
                id,
                status,
                stock,
                is_featured,
                created_at
            `),
    ]);

    if (ordersResult.error) {
        throw new Error(
            `No se pudieron obtener los pedidos: ${ordersResult.error.message}`
        );
    }

    if (productsResult.error) {
        throw new Error(
            `No se pudieron obtener los productos: ${productsResult.error.message}`
        );
    }

    const orders =
        (ordersResult.data ??
            []) as DashboardOrder[];

    const products =
        (productsResult.data ??
            []) as DashboardProduct[];

    const now = new Date();

    const sevenDaysAgo =
        new Date(
            now.getTime() -
            7 *
            24 *
            60 *
            60 *
            1000
        );

    const thirtyDaysAgo =
        new Date(
            now.getTime() -
            30 *
            24 *
            60 *
            60 *
            1000
        );

    const attentionCount =
        orders.filter((order) =>
            ATTENTION_STATUSES.includes(
                order.status
            )
        ).length;

    const inProgressCount =
        orders.filter((order) =>
            IN_PROGRESS_STATUSES.includes(
                order.status
            )
        ).length;

    const completedSalesTotal =
        orders
            .filter((order) =>
                COMPLETED_STATUSES.includes(
                    order.status
                )
            )
            .reduce(
                (sum, order) =>
                    sum +
                    Number(order.total),
                0
            );

    const activeOutOfStockCount =
        products.filter(
            (product) =>
                product.status ===
                "active" &&
                product.stock <= 0
        ).length;

    const ordersLast7Days =
        orders.filter(
            (order) =>
                new Date(
                    order.created_at
                ) >= sevenDaysAgo
        ).length;

    const completedOrdersLast30Days =
        orders.filter(
            (order) =>
                COMPLETED_STATUSES.includes(
                    order.status
                ) &&
                new Date(
                    order.created_at
                ) >= thirtyDaysAgo
        );

    const completedSalesLast30Days =
        completedOrdersLast30Days.reduce(
            (sum, order) =>
                sum +
                Number(order.total),
            0
        );

    const totalProducts =
        products.length;

    const publishedProducts =
        products.filter(
            (product) =>
                product.status ===
                "active"
        ).length;

    const featuredProducts =
        products.filter(
            (product) =>
                product.is_featured
        ).length;

    const recentOrders =
        orders.slice(0, 5);

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <Link
                        href="/administracion"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Administración
                    </Link>

                    <div className="mt-4">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                            Visión general
                        </p>

                        <h1 className="mt-1 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                            Dashboard
                        </h1>

                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-600">
                            Estado general de la tienda y accesos rápidos a las
                            tareas que requieren atención.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                {/* Métricas principales */}
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                    <Link
                        href="/administracion/pedidos?vista=atencion"
                        className="border border-[#ddd5c9] bg-white p-3 transition hover:border-[#b28a53] sm:p-4"
                    >
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#9a7541] sm:text-[9px]">
                            Requieren atención
                        </p>

                        <p className="mt-1.5 font-serif text-2xl text-neutral-900 sm:text-3xl">
                            {attentionCount}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                            Confirmación, pago o rechazo
                        </p>
                    </Link>

                    <Link
                        href="/administracion/pedidos"
                        className="border border-[#ddd5c9] bg-white p-3 transition hover:border-[#b28a53] sm:p-4"
                    >
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#9a7541] sm:text-[9px]">
                            En curso
                        </p>

                        <p className="mt-1.5 font-serif text-2xl text-neutral-900 sm:text-3xl">
                            {inProgressCount}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                            Pagados, preparación o entrega
                        </p>
                    </Link>

                    <div className="border border-[#ddd5c9] bg-white p-3 sm:p-4">
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#9a7541] sm:text-[9px]">
                            Monto de ventas completadas
                        </p>

                        <p className="mt-1.5 font-serif text-2xl text-neutral-900 sm:text-3xl">
                            ${formatMoney(
                                completedSalesTotal
                            )}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                            Total acumulado de pedidos completados
                        </p>
                    </div>

                    <Link
                        href="/administracion/productos?stock=sin-stock"
                        className="border border-[#ddd5c9] bg-white p-3 transition hover:border-[#b28a53] sm:p-4"
                    >
                        <p className="text-[8px] uppercase tracking-[0.15em] text-[#9a7541] sm:text-[9px]">
                            Sin stock
                        </p>

                        <p className="mt-1.5 font-serif text-2xl text-neutral-900 sm:text-3xl">
                            {activeOutOfStockCount}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                            Productos publicados
                        </p>
                    </Link>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                    {/* Actividad reciente */}
                    <section className="border border-[#ddd5c9] bg-white">
                        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#9a7541]">
                                    Actividad
                                </p>

                                <h2 className="mt-0.5 font-serif text-xl text-neutral-900">
                                    Pedidos recientes
                                </h2>
                            </div>

                            <Link
                                href="/administracion/pedidos"
                                className="text-[10px] font-medium text-[#806037] transition hover:text-neutral-900 sm:text-xs"
                            >
                                Ver todos →
                            </Link>
                        </div>

                        {recentOrders.length ===
                            0 ? (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-neutral-500">
                                    Todavía no hay pedidos.
                                </p>
                            </div>
                        ) : (
                            <div>
                                {recentOrders.map(
                                    (
                                        order,
                                        index
                                    ) => (
                                        <Link
                                            key={
                                                order.id
                                            }
                                            href={`/administracion/pedidos/${order.id}`}
                                            className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 transition hover:bg-[#faf8f4] ${index !==
                                                recentOrders.length -
                                                1
                                                ? "border-b border-neutral-100"
                                                : ""
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-serif text-lg text-neutral-900">
                                                        #
                                                        {
                                                            order.order_number
                                                        }
                                                    </span>

                                                    <span
                                                        className={`inline-flex border px-1.5 py-0.5 text-[8px] font-medium ${getStatusClasses(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            order.status,
                                                            order.delivery_method
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-0.5 truncate text-xs text-neutral-600">
                                                    {order.recipient_name ||
                                                        "Cliente sin nombre"}
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-neutral-400">
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-medium text-neutral-900">
                                                    $
                                                    {formatMoney(
                                                        order.total
                                                    )}
                                                </p>

                                                <p className="mt-1 text-[9px] text-neutral-400">
                                                    {order.delivery_method ===
                                                        "shipping"
                                                        ? "Envío"
                                                        : "Retiro"}
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        )}
                    </section>

                    {/* Resumen lateral */}
                    <div className="space-y-4">
                        <section className="border border-[#ddd5c9] bg-white p-4">
                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#9a7541]">
                                Últimos períodos
                            </p>

                            <div className="mt-3 divide-y divide-neutral-100">
                                <div className="flex items-end justify-between gap-4 py-2 first:pt-0">
                                    <div>
                                        <p className="text-xs text-neutral-500">
                                            Pedidos recibidos
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-neutral-400">
                                            últimos 7 días
                                        </p>
                                    </div>

                                    <p className="font-serif text-2xl text-neutral-900">
                                        {
                                            ordersLast7Days
                                        }
                                    </p>
                                </div>

                                <div className="flex items-end justify-between gap-4 py-2">
                                    <div>
                                        <p className="text-xs text-neutral-500">
                                            Monto de ventas completadas
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-neutral-400">
                                            últimos 30 días
                                        </p>
                                    </div>

                                    <p className="text-sm font-medium text-neutral-900">
                                        $
                                        {formatMoney(
                                            completedSalesLast30Days
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between gap-4 py-2 last:pb-0">
                                    <div>
                                        <p className="text-xs text-neutral-500">
                                            Ventas completadas
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-neutral-400">
                                            últimos 30 días
                                        </p>
                                    </div>

                                    <p className="font-serif text-2xl text-neutral-900">
                                        {
                                            completedOrdersLast30Days.length
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="border border-[#ddd5c9] bg-white p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#9a7541]">
                                        Catálogo
                                    </p>

                                    <h2 className="mt-0.5 font-serif text-xl text-neutral-900">
                                        Productos
                                    </h2>
                                </div>

                                <Link
                                    href="/administracion/productos"
                                    className="text-[10px] font-medium text-[#806037] hover:text-neutral-900"
                                >
                                    Gestionar →
                                </Link>
                            </div>

                            <div className="mt-3 grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 pt-3 text-center">
                                <div>
                                    <p className="font-serif text-2xl text-neutral-900">
                                        {totalProducts}
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-neutral-500">
                                        Total
                                    </p>
                                </div>

                                <div>
                                    <p className="font-serif text-2xl text-neutral-900">
                                        {publishedProducts}
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-neutral-500">
                                        Publicados
                                    </p>
                                </div>

                                <div>
                                    <p className="font-serif text-2xl text-neutral-900">
                                        {featuredProducts}
                                    </p>
                                    <p className="mt-0.5 text-[9px] text-neutral-500">
                                        Destacados
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="border border-[#ddd5c9] bg-white p-4">
                            <p className="text-[9px] uppercase tracking-[0.16em] text-[#9a7541]">
                                Accesos rápidos
                            </p>

                            <div className="mt-3 grid gap-2">
                                <Link
                                    href="/administracion/productos/nuevo"
                                    className="flex h-10 items-center justify-between bg-neutral-900 px-3 text-xs font-medium text-white transition hover:bg-[#9a7541]"
                                >
                                    Nuevo producto
                                    <span>+</span>
                                </Link>

                                <Link
                                    href="/administracion/pedidos?vista=atencion"
                                    className="flex h-10 items-center justify-between border border-neutral-300 px-3 text-xs font-medium text-neutral-800 transition hover:border-neutral-900"
                                >
                                    Pedidos a revisar
                                    <span>→</span>
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>

                <p className="mt-4 text-[10px] leading-4 text-neutral-400">
                    Las ventas completadas cuentan únicamente pedidos con
                    estado finalizado. Los pagos aprobados por Mercado Pago se
                    incorporarán como una métrica separada cuando integremos
                    el cobro automático y su webhook.
                </p>
            </section>
        </main>
    );
}
