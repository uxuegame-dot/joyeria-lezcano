import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import { getAdminOrders } from "@/app/lib/orders";

const STATUS_LABELS: Record<string, string> = {
    pending_confirmation:
        "Pendiente de confirmación",

    pending_payment:
        "Pendiente de pago",

    payment_confirmed:
        "Pago confirmado",

    preparing:
        "En preparación",

    ready_for_pickup:
        "Listo para retirar",

    shipped:
        "Enviado",

    completed:
        "Completado",

    cancelled:
        "Cancelado",

    payment_rejected:
        "Pago rechazado",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat(
        "es-UY",
        {
            dateStyle: "short",
            timeStyle: "short",
            timeZone:
                "America/Montevideo",
        }
    ).format(
        new Date(date)
    );
}

export default async function AdminOrdersPage() {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const {
        data: profile,
    } =
        await supabase
            .from("profiles")
            .select("is_admin")
            .eq(
                "id",
                user.id
            )
            .single();

    if (!profile?.is_admin) {
        redirect("/");
    }

    const orders =
        await getAdminOrders();

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

            {/* Encabezado */}
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Administración
                    </p>

                    <h1 className="mt-3 font-serif text-4xl text-neutral-900">
                        Pedidos
                    </h1>

                    <p className="mt-3 text-sm text-neutral-600">
                        Consultá y gestioná los
                        pedidos realizados desde
                        la tienda.
                    </p>
                </div>

                <Link
                    href="/administracion"
                    className="w-fit text-sm text-neutral-600 underline underline-offset-4 transition hover:text-neutral-900"
                >
                    ← Volver a administración
                </Link>
            </div>

            {/* Sin pedidos */}
            {orders.length === 0 ? (
                <div className="mt-10 border border-neutral-200 bg-white px-6 py-16 text-center">

                    <h2 className="font-serif text-2xl text-neutral-900">
                        Todavía no hay pedidos
                    </h2>

                    <p className="mt-3 text-sm text-neutral-500">
                        Los pedidos realizados
                        desde la tienda aparecerán
                        acá.
                    </p>
                </div>
            ) : (

                /* Lista de pedidos */
                <div className="mt-10 overflow-hidden border border-neutral-200 bg-white">

                    {/* Encabezados desktop */}
                    <div className="hidden grid-cols-[100px_1fr_160px_160px_120px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 md:grid">

                        <span>
                            Pedido
                        </span>

                        <span>
                            Cliente
                        </span>

                        <span>
                            Estado
                        </span>

                        <span>
                            Fecha
                        </span>

                        <span className="text-right">
                            Total
                        </span>
                    </div>

                    <div className="divide-y divide-neutral-200">

                        {orders.map(
                            (order) => (
                                <Link
                                    key={
                                        order.id
                                    }
                                    href={`/administracion/pedidos/${order.id}`}
                                    className="grid gap-3 px-5 py-5 transition hover:bg-neutral-50 md:grid-cols-[100px_1fr_160px_160px_120px] md:items-center md:gap-4"
                                >

                                    {/* Número */}
                                    <div>
                                        <span className="text-xs text-neutral-500 md:hidden">
                                            Pedido
                                        </span>

                                        <p className="font-medium text-neutral-900">
                                            #
                                            {
                                                order.order_number
                                            }
                                        </p>
                                    </div>

                                    {/* Cliente */}
                                    <div>
                                        <span className="text-xs text-neutral-500 md:hidden">
                                            Cliente
                                        </span>

                                        <p className="text-sm text-neutral-900">
                                            {order.recipient_name ||
                                                "Sin nombre"}
                                        </p>

                                        {order.recipient_phone && (
                                            <p className="mt-1 text-xs text-neutral-500">
                                                {
                                                    order.recipient_phone
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <span className="text-xs text-neutral-500 md:hidden">
                                            Estado
                                        </span>

                                        <p className="text-sm text-neutral-700">
                                            {STATUS_LABELS[
                                                order.status
                                            ] ||
                                                order.status}
                                        </p>
                                    </div>

                                    {/* Fecha */}
                                    <div>
                                        <span className="text-xs text-neutral-500 md:hidden">
                                            Fecha
                                        </span>

                                        <p className="text-sm text-neutral-600">
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </p>
                                    </div>

                                    {/* Total */}
                                    <div className="md:text-right">
                                        <span className="text-xs text-neutral-500 md:hidden">
                                            Total
                                        </span>

                                        <p className="font-medium text-neutral-900">
                                            $
                                            {Number(
                                                order.total
                                            ).toLocaleString(
                                                "es-UY"
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}