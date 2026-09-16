import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getAdminOrderById } from "@/app/lib/orders";
import { OrderStatusManager } from "@/app/components/admin/OrderStatusManager";

type AdminOrderPageProps = {
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

export default async function AdminOrderPage({
    params,
}: AdminOrderPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        redirect("/");
    }

    const order = await getAdminOrderById(id);

    if (!order) {
        notFound();
    }

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <Link
                href="/administracion/pedidos"
                className="text-sm text-neutral-500 transition hover:text-neutral-900"
            >
                ← Volver a pedidos
            </Link>

            <div className="mt-6 flex flex-col justify-between gap-5 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Pedido
                    </p>

                    <h1 className="mt-2 font-serif text-4xl text-neutral-900">
                        #{order.order_number}
                    </h1>

                    <p className="mt-3 text-sm text-neutral-500">
                        {formatDate(order.created_at)}
                    </p>
                </div>

                <div className="w-fit border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800">
                    {STATUS_LABELS[order.status] || order.status}
                </div>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
                <div className="space-y-10">
                    {/* Productos */}
                    <section>
                        <h2 className="font-serif text-2xl text-neutral-900">
                            Productos
                        </h2>

                        <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between gap-6 py-5"
                                >
                                    <div>
                                        <p className="font-medium text-neutral-900">
                                            {item.product_name}
                                        </p>

                                        <p className="mt-1 text-sm text-neutral-500">
                                            Cantidad: {item.quantity}
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-500">
                                            $
                                            {Number(
                                                item.unit_price
                                            ).toLocaleString("es-UY")}{" "}
                                            c/u
                                        </p>
                                    </div>

                                    <p className="font-medium text-neutral-900">
                                        $
                                        {Number(
                                            item.subtotal
                                        ).toLocaleString("es-UY")}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 space-y-3 border-b border-neutral-200 pb-5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Subtotal
                                </span>

                                <span className="text-neutral-900">
                                    $
                                    {Number(
                                        order.subtotal
                                    ).toLocaleString("es-UY")}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-neutral-500">
                                    Envío
                                </span>

                                <span className="text-neutral-900">
                                    {Number(order.shipping_cost) > 0
                                        ? `$${Number(
                                            order.shipping_cost
                                        ).toLocaleString("es-UY")}`
                                        : order.delivery_method === "shipping"
                                            ? "A coordinar"
                                            : "—"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 flex justify-between text-lg">
                            <span className="font-medium text-neutral-900">
                                Total
                            </span>

                            <span className="font-medium text-neutral-900">
                                $
                                {Number(order.total).toLocaleString("es-UY")}
                            </span>
                        </div>
                    </section>

                    {/* Notas */}
                    {order.customer_notes && (
                        <section className="border-t border-neutral-200 pt-8">
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Observaciones del cliente
                            </h2>

                            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-neutral-600">
                                {order.customer_notes}
                            </p>
                        </section>
                    )}
                </div>

                {/* Datos cliente */}
                <aside className="h-fit border border-neutral-200 bg-white p-6">
                    <h2 className="font-serif text-2xl text-neutral-900">
                        Cliente
                    </h2>

                    <dl className="mt-6 space-y-5 text-sm">
                        <div>
                            <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                Nombre
                            </dt>

                            <dd className="mt-1 text-neutral-900">
                                {order.recipient_name || "—"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                Teléfono / WhatsApp
                            </dt>

                            <dd className="mt-1 text-neutral-900">
                                {order.recipient_phone || "—"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                Email
                            </dt>

                            <dd className="mt-1 break-words text-neutral-900">
                                {order.customer_email || "—"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                Entrega
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
                                    <dt className="text-xs uppercase tracking-wide text-neutral-500">
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
                                    <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                        Ciudad
                                    </dt>

                                    <dd className="mt-1 text-neutral-900">
                                        {order.city || "—"}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-xs uppercase tracking-wide text-neutral-500">
                                        Departamento
                                    </dt>

                                    <dd className="mt-1 text-neutral-900">
                                        {order.department || "—"}
                                    </dd>
                                </div>
                            </>
                        )}
                    </dl>

                    {/* Gestión del pedido */}
                    <div className="mt-6 border-t border-neutral-200 pt-6">
                        <OrderStatusManager
                            orderId={order.id}
                            currentStatus={order.status}
                        />
                    </div>
                </aside>
            </div>
        </main>
    );
}