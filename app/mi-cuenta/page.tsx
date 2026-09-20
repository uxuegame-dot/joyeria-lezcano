import Link from "next/link";
import { redirect } from "next/navigation";

import { AddressEditor } from "@/app/components/account/AddressEditor";
import { getUserOrders } from "@/app/lib/orders";
import { createClient } from "@/app/lib/supabase/server";

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

function formatDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "es-UY",
        {
            dateStyle:
                "medium",
            timeZone:
                "America/Montevideo",
        }
    ).format(
        new Date(date)
    );
}

function formatMoney(
    value: number | string
) {
    return Number(
        value
    ).toLocaleString(
        "es-UY"
    );
}

function getStatusClasses(
    status: string
) {
    switch (status) {
        case "payment_confirmed":
            return "border-[#d9e3d2] bg-[#f1f5ee] text-[#5f6e53]";
        case "preparing":
            return "border-[#dfd5c3] bg-[#faf4e9] text-[#80613a]";
        case "ready_for_pickup":
        case "shipped":
            return "border-[#d9d6e8] bg-[#f4f2f8] text-[#675f80]";
        case "completed":
            return "border-neutral-200 bg-neutral-50 text-neutral-600";
        case "cancelled":
        case "payment_rejected":
            return "border-red-200 bg-red-50 text-red-700";
        default:
            return "border-[#eadcc8] bg-[#fbf6ed] text-[#80613a]";
    }
}

export default async function MiCuentaPage() {
    const supabase =
        await createClient();

    const {
        data: {
            user,
        },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect(
            "/login"
        );
    }

    const {
        data: profile,
    } =
        await supabase
            .from(
                "profiles"
            )
            .select(
                "first_name, last_name, phone"
            )
            .eq(
                "id",
                user.id
            )
            .maybeSingle();

    const {
        data: defaultAddress,
    } =
        await supabase
            .from(
                "addresses"
            )
            .select(
                "address_line, city, department"
            )
            .eq(
                "user_id",
                user.id
            )
            .eq(
                "is_default",
                true
            )
            .maybeSingle();

    const orders =
        await getUserOrders();

    const recentOrders =
        orders.slice(
            0,
            3
        );

    const firstName =
        profile
            ?.first_name
            ?.trim() ||
        "";

    const lastName =
        profile
            ?.last_name
            ?.trim() ||
        "";

    const fullName =
        [
            firstName,
            lastName,
        ]
            .filter(
                Boolean
            )
            .join(" ") ||
        "Cliente Lezcano";

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9] bg-gradient-to-r from-[#f7f4ef] via-[#fbf8f2] to-[#f2eadc]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9a7541]">
                        Tu espacio
                    </p>

                    <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-serif text-[30px] leading-tight text-neutral-900 sm:text-4xl">
                                Mi cuenta
                            </h1>

                            <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-600">
                                Hola,{" "}
                                {firstName ||
                                    fullName}
                                . Gestioná tus datos, tu seguridad y el seguimiento de tus compras.
                            </p>
                        </div>

                        {orders.length >
                            0 && (
                            <span className="inline-flex w-fit rounded-full border border-[#ded2c1] bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#80613a]">
                                {
                                    orders.length
                                }{" "}
                                {orders.length ===
                                1
                                    ? "pedido"
                                    : "pedidos"}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-5">
                    <div className="space-y-4">
                        <section className="rounded-[18px] border border-[#d8cfc1] bg-white p-5 shadow-[0_8px_24px_rgba(43,36,28,0.035)] sm:p-6">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a7541]">
                                Mis datos
                            </p>

                            <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-neutral-900 sm:text-2xl">
                                {
                                    fullName
                                }
                            </h2>

                            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
                                <div className="rounded-[12px] border border-neutral-100 bg-[#fbfaf8] px-3.5 py-3">
                                    <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                                        Email
                                    </dt>

                                    <dd className="mt-1 break-words text-neutral-900">
                                        {user.email ||
                                            "—"}
                                    </dd>
                                </div>

                                <div className="rounded-[12px] border border-neutral-100 bg-[#fbfaf8] px-3.5 py-3">
                                    <dt className="text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                                        Teléfono / WhatsApp
                                    </dt>

                                    <dd className="mt-1 text-neutral-900">
                                        {profile?.phone ||
                                            "No cargado"}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <AddressEditor
                            initialAddress={
                                defaultAddress ??
                                null
                            }
                            recipientName={
                                fullName
                            }
                            phone={
                                profile?.phone ??
                                ""
                            }
                        />

                        <section className="rounded-[18px] border border-[#d6d9cc] bg-gradient-to-br from-[#f5f6f0] to-white p-5 shadow-[0_8px_24px_rgba(43,36,28,0.025)] sm:p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5eadc] text-[#667255]">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="h-4.5 w-4.5"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="5"
                                            y="10"
                                            width="14"
                                            height="10"
                                            rx="2"
                                        />
                                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                    </svg>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#6f7b5d]">
                                        Seguridad
                                    </p>

                                    <h2 className="mt-1 font-serif text-[21px] text-neutral-900">
                                        Contraseña
                                    </h2>

                                    <p className="mt-1.5 text-xs leading-5 text-neutral-600">
                                        Podés actualizar tu contraseña cuando quieras desde tu cuenta.
                                    </p>

                                    <Link
                                        href="/actualizar-password"
                                        className="mt-4 inline-flex rounded-[9px] border border-[#cbd2bd] bg-white px-4 py-2.5 text-xs font-medium text-[#59664f] transition hover:border-[#879274] hover:bg-[#f8faf5]"
                                    >
                                        Cambiar contraseña
                                        <span className="ml-2">
                                            →
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="rounded-[18px] border border-[#d8cfc1] bg-white p-5 shadow-[0_8px_24px_rgba(43,36,28,0.035)] sm:p-6">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9a7541]">
                                    Compras
                                </p>

                                <h2 className="mt-1.5 font-serif text-[22px] leading-tight text-neutral-900 sm:text-2xl">
                                    Mis pedidos
                                </h2>
                            </div>

                            {orders.length >
                                0 && (
                                <Link
                                    href="/mi-cuenta/pedidos"
                                    className="lezcano-arrow inline-flex shrink-0 text-xs font-medium text-[#80613a]"
                                >
                                    Ver todos
                                    <span className="arrow">
                                        →
                                    </span>
                                </Link>
                            )}
                        </div>

                        {recentOrders.length ===
                        0 ? (
                            <div className="mt-5 rounded-[14px] border border-[#e7ddce] bg-[#faf6ef] px-4 py-6 sm:px-5 sm:py-7">
                                <p className="font-serif text-xl text-neutral-900">
                                    Todavía no tenés pedidos
                                </p>

                                <p className="mt-2 text-sm leading-6 text-neutral-500">
                                    Cuando realices una compra con esta cuenta, vas a poder seguirla desde acá.
                                </p>

                                <Link
                                    href="/catalogo"
                                    className="mt-5 inline-flex rounded-[10px] bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#8a693c]"
                                >
                                    Ver catálogo
                                    <span className="ml-2">
                                        →
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-2.5">
                                {recentOrders.map(
                                    (
                                        order
                                    ) => (
                                        <Link
                                            key={
                                                order.id
                                            }
                                            href={`/mi-cuenta/pedidos/${order.id}`}
                                            className="group grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-[13px] border border-neutral-100 bg-[#fdfcfb] p-3 transition hover:border-[#d7c6ad] hover:bg-[#fbf7f1]"
                                        >
                                            <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-[#eee9e1]">
                                                {order.preview_image_url ? (
                                                    <img
                                                        src={
                                                            order.preview_image_url
                                                        }
                                                        alt={
                                                            order.preview_image_alt
                                                        }
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] uppercase tracking-wide text-neutral-400">
                                                        Lezcano
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        #
                                                        {
                                                            order.order_number
                                                        }
                                                    </p>

                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium ${getStatusClasses(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {STATUS_LABELS[
                                                            order
                                                                .status
                                                        ] ||
                                                            order.status}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-[11px] text-neutral-500">
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-neutral-900">
                                                    $
                                                    {formatMoney(
                                                        order.total
                                                    )}
                                                </p>

                                                <p className="mt-1 text-[10px] font-medium text-[#9a7541]">
                                                    Ver →
                                                </p>
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        )}

                        <div className="mt-5 grid gap-3 border-t border-neutral-100 pt-5 sm:grid-cols-2">
                            <Link
                                href="/mi-cuenta/pedidos"
                                className="group rounded-[13px] border border-[#ddd2c2] bg-white p-4 transition hover:border-[#b28a53] hover:bg-[#fcf9f4]"
                            >
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9a7541]">
                                    Historial
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-neutral-900">
                                    Todos mis pedidos
                                </p>

                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                    Consultá estados y detalles de compras anteriores.
                                </p>
                            </Link>

                            <Link
                                href="/catalogo"
                                className="group rounded-[13px] border border-[#e1d5c3] bg-[#f4ead9] p-4 transition hover:border-[#b28a53] hover:bg-[#efe0c9]"
                            >
                                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8a693c]">
                                    Catálogo
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-neutral-900">
                                    Seguir explorando
                                </p>

                                <p className="mt-1 text-xs leading-5 text-neutral-600">
                                    Descubrí nuevas piezas de joyería y platería.
                                </p>
                            </Link>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
