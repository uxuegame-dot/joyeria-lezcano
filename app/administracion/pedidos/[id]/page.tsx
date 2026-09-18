import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";

import { OrderStatusManager } from "@/app/components/admin/OrderStatusManager";
import { getAdminOrderById } from "@/app/lib/orders";
import { createClient } from "@/app/lib/supabase/server";

type AdminOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

type ProductInfo = {
    slug: string | null;
    product_type: string | null;
    material: string | null;
    category_name: string | null;
};

type ProductImage = {
    storage_path: string;
    alt_text: string | null;
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat(
        "es-UY",
        {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone:
                "America/Montevideo",
        }
    ).format(new Date(date));
}

function formatMoney(
    value: number | string
) {
    return Number(
        value
    ).toLocaleString(
        "es-UY",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    );
}

function getStatusLabel(
    status: string,
    deliveryMethod: string
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
            return deliveryMethod ===
                "shipping"
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

function getStatusClasses(
    status: string
) {
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

        case "cancelled":
            return "border-neutral-300 bg-white text-neutral-400";

        case "payment_rejected":
            return "border-red-200 bg-red-50 text-red-700";

        default:
            return "border-neutral-300 bg-white text-neutral-600";
    }
}

function getProductTypeLabel(
    productType: string | null
) {
    switch (productType) {
        case "direct":
            return "Venta directa";

        case "unique":
            return "Pieza única";

        case "on_order":
            return "Por encargo";

        case "custom":
            return "Personalizado";

        default:
            return null;
    }
}

function getNextStep(
    status: string,
    deliveryMethod: string
) {
    switch (status) {
        case "pending_confirmation":
            return {
                title:
                    "Revisar y confirmar el pedido",
                description:
                    "Verificá los productos, los datos del cliente y la modalidad de entrega. Si está todo correcto, avanzá a Pendiente de pago.",
            };

        case "pending_payment":
            return {
                title:
                    "Esperar y verificar el pago",
                description:
                    "Confirmá que el pago haya ingresado antes de marcarlo como Pago confirmado. Si el pedido requiere coordinación, contactá al cliente.",
            };

        case "payment_confirmed":
            return {
                title:
                    "Reservar la pieza y comenzar la preparación",
                description:
                    "El pago ya está confirmado y el stock fue descontado. Retirá o reservá la pieza físicamente y avanzá a En preparación.",
            };

        case "preparing":
            return {
                title:
                    deliveryMethod ===
                        "shipping"
                        ? "Preparar el envío"
                        : "Preparar el retiro",
                description:
                    deliveryMethod ===
                        "shipping"
                        ? "Prepará y embalá el pedido. Cuando salga de la joyería, marcá el pedido como Enviado."
                        : "Prepará el pedido. Cuando esté pronto para entregar al cliente, marcá Listo para retirar.",
            };

        case "ready_for_pickup":
            return {
                title:
                    "Avisar al cliente que está pronto",
                description:
                    "El pedido está listo para retirar. Cuando el cliente lo retire, marcá el pedido como Completado.",
            };

        case "shipped":
            return {
                title:
                    "Hacer seguimiento de la entrega",
                description:
                    "El pedido ya fue enviado. Cuando tengas confirmación de que llegó al cliente, marcá el pedido como Completado.",
            };

        case "completed":
            return {
                title:
                    "Pedido finalizado",
                description:
                    deliveryMethod ===
                        "shipping"
                        ? "La entrega fue completada. No quedan acciones pendientes."
                        : "El cliente retiró el pedido. No quedan acciones pendientes.",
            };

        case "payment_rejected":
            return {
                title:
                    "Resolver el pago",
                description:
                    "El pago no se confirmó. Contactá al cliente si corresponde o cancelá el pedido si la operación no va a continuar.",
            };

        case "cancelled":
            return {
                title:
                    "Pedido cancelado",
                description:
                    "El pedido quedó cerrado y no requiere nuevas acciones.",
            };

        default:
            return {
                title:
                    "Revisar el pedido",
                description:
                    "Revisá la información y actualizá el estado según corresponda.",
            };
    }
}

function normalizeWhatsAppNumber(
    phone: string | null
) {
    if (!phone) {
        return null;
    }

    const digits =
        phone.replace(/\D/g, "");

    if (!digits) {
        return null;
    }

    if (
        digits.startsWith("598")
    ) {
        return digits;
    }

    if (
        digits.startsWith("0")
    ) {
        return `598${digits.slice(
            1
        )}`;
    }

    if (
        digits.length <= 9
    ) {
        return `598${digits}`;
    }

    return digits;
}

export default async function AdminOrderPage({
    params,
}: AdminOrderPageProps) {
    const { id } =
        await params;

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
        error: profileError,
    } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (
        profileError ||
        !profile?.is_admin
    ) {
        redirect("/");
    }

    const order =
        await getAdminOrderById(
            id
        );

    if (!order) {
        notFound();
    }

    /*
     * --------------------------------------------------
     * INFORMACIÓN VISUAL DE LOS PRODUCTOS
     * --------------------------------------------------
     */

    const productIds = [
        ...new Set(
            order.items
                .map(
                    (item) =>
                        item.product_id
                )
                .filter(
                    (
                        productId
                    ): productId is string =>
                        Boolean(
                            productId
                        )
                )
        ),
    ];

    const productInfoById =
        new Map<
            string,
            ProductInfo
        >();

    const imageByProductId =
        new Map<
            string,
            ProductImage
        >();

    if (
        productIds.length > 0
    ) {
        const [
            productsResult,
            imagesResult,
        ] =
            await Promise.all([
                supabase
                    .from(
                        "products"
                    )
                    .select(`
                        id,
                        slug,
                        product_type,
                        material,
                        categories (
                            name
                        )
                    `)
                    .in(
                        "id",
                        productIds
                    ),

                supabase
                    .from(
                        "product_images"
                    )
                    .select(
                        "product_id, storage_path, alt_text, sort_order"
                    )
                    .in(
                        "product_id",
                        productIds
                    )
                    .order(
                        "sort_order",
                        {
                            ascending:
                                true,
                        }
                    ),
            ]);

        if (
            productsResult.error
        ) {
            console.error(
                "No se pudo obtener información adicional de los productos:",
                productsResult.error
            );
        }

        if (
            imagesResult.error
        ) {
            console.error(
                "No se pudieron obtener las imágenes del pedido:",
                imagesResult.error
            );
        }

        for (
            const product of
            productsResult.data ??
            []
        ) {
            const category =
                Array.isArray(
                    product.categories
                )
                    ? product
                        .categories[0]
                    : product.categories;

            productInfoById.set(
                product.id,
                {
                    slug:
                        product.slug ??
                        null,
                    product_type:
                        product.product_type ??
                        null,
                    material:
                        product.material ??
                        null,
                    category_name:
                        category?.name ??
                        null,
                }
            );
        }

        for (
            const image of
            imagesResult.data ??
            []
        ) {
            if (
                !imageByProductId.has(
                    image.product_id
                )
            ) {
                imageByProductId.set(
                    image.product_id,
                    {
                        storage_path:
                            image.storage_path,
                        alt_text:
                            image.alt_text,
                    }
                );
            }
        }
    }

    const items =
        order.items.map(
            (item) => {
                const productInfo =
                    item.product_id
                        ? productInfoById.get(
                            item.product_id
                        ) ??
                        null
                        : null;

                const mainImage =
                    item.product_id
                        ? imageByProductId.get(
                            item.product_id
                        ) ??
                        null
                        : null;

                const imageUrl =
                    mainImage
                        ? supabase.storage
                            .from(
                                "product-images"
                            )
                            .getPublicUrl(
                                mainImage.storage_path
                            )
                            .data
                            .publicUrl
                        : null;

                return {
                    ...item,
                    ...productInfo,
                    image_url:
                        imageUrl,
                    image_alt:
                        mainImage?.alt_text ??
                        item.product_name,
                };
            }
        );

    const nextStep =
        getNextStep(
            order.status,
            order.delivery_method
        );

    const whatsappNumber =
        normalizeWhatsAppNumber(
            order.recipient_phone
        );

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            {/* Encabezado */}
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
                    <Link
                        href="/administracion/pedidos"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Volver a
                        pedidos
                    </Link>

                    <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                                Gestión de
                                pedido
                            </p>

                            <h1 className="mt-1 font-serif text-3xl text-neutral-900 sm:mt-2 sm:text-4xl">
                                Pedido #
                                {
                                    order.order_number
                                }
                            </h1>

                            <p className="mt-1.5 text-[11px] text-neutral-500 sm:mt-2 sm:text-sm">
                                {formatDate(
                                    order.created_at
                                )}
                            </p>
                        </div>

                        <span
                            className={`w-fit border px-3 py-1.5 text-[10px] font-medium sm:px-4 sm:py-2 sm:text-xs ${getStatusClasses(
                                order.status
                            )}`}
                        >
                            {getStatusLabel(
                                order.status,
                                order.delivery_method
                            )}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
                    <div className="space-y-5">
                        {/* Gestión */}
                        <section className="border border-[#d8cfc1] bg-white">
                            <div className="border-b border-neutral-100 bg-[#eee8de] px-4 py-4 sm:px-5 sm:py-5">
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541] sm:text-[10px]">
                                    Qué hacer
                                    ahora
                                </p>

                                <h2 className="mt-1.5 font-serif text-xl text-neutral-900 sm:text-2xl">
                                    {
                                        nextStep.title
                                    }
                                </h2>

                                <p className="mt-2 text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
                                    {
                                        nextStep.description
                                    }
                                </p>
                            </div>

                            <div className="p-4 sm:p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400">
                                            Estado
                                            actual
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-neutral-900">
                                            {getStatusLabel(
                                                order.status,
                                                order.delivery_method
                                            )}
                                        </p>
                                    </div>

                                    {order.status ===
                                        "payment_confirmed" && (
                                            <span className="text-right text-[10px] leading-4 text-emerald-700">
                                                Stock
                                                descontado
                                            </span>
                                        )}
                                </div>

                                <div className="mt-4 border-t border-neutral-100 pt-4">
                                    <OrderStatusManager
                                        orderId={
                                            order.id
                                        }
                                        currentStatus={
                                            order.status
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Productos */}
                        <section className="border border-[#d8cfc1] bg-white p-4 sm:p-5">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541] sm:text-[10px]">
                                        Pedido
                                    </p>

                                    <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                                        Productos
                                    </h2>
                                </div>

                                <p className="text-[11px] text-neutral-500">
                                    {
                                        items.length
                                    }{" "}
                                    {items.length ===
                                        1
                                        ? "producto"
                                        : "productos"}
                                </p>
                            </div>

                            <div className="mt-4 divide-y divide-neutral-100 border-y border-neutral-100">
                                {items.map(
                                    (
                                        item
                                    ) => {
                                        const typeLabel =
                                            getProductTypeLabel(
                                                item.product_type ??
                                                null
                                            );

                                        return (
                                            <article
                                                key={
                                                    item.id
                                                }
                                                className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                                            >
                                                <div className="h-16 w-16 overflow-hidden border border-neutral-200 bg-neutral-100 sm:h-20 sm:w-20">
                                                    {item.image_url ? (
                                                        <img
                                                            src={
                                                                item.image_url
                                                            }
                                                            alt={
                                                                item.image_alt
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[8px] uppercase tracking-wide text-neutral-400">
                                                            Lezcano
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 sm:text-base">
                                                        {
                                                            item.product_name
                                                        }
                                                    </p>

                                                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-neutral-500 sm:text-xs">
                                                        {item.category_name && (
                                                            <span>
                                                                {
                                                                    item.category_name
                                                                }
                                                            </span>
                                                        )}

                                                        {item.material && (
                                                            <span>
                                                                {
                                                                    item.material
                                                                }
                                                            </span>
                                                        )}

                                                        {typeLabel && (
                                                            <span>
                                                                {
                                                                    typeLabel
                                                                }
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-[11px] text-neutral-500 sm:text-xs">
                                                        Cantidad:{" "}
                                                        {
                                                            item.quantity
                                                        }{" "}
                                                        · $
                                                        {formatMoney(
                                                            item.unit_price
                                                        )}{" "}
                                                        c/u
                                                    </p>

                                                    {item.product_id && (
                                                        <Link
                                                            href={`/administracion/productos/${item.product_id}`}
                                                            className="mt-1.5 inline-flex text-[10px] font-medium text-[#806037] underline underline-offset-3 sm:text-xs"
                                                        >
                                                            Ver
                                                            producto
                                                        </Link>
                                                    )}
                                                </div>

                                                <div className="col-start-2 text-left sm:col-start-auto sm:text-right">
                                                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400 sm:hidden">
                                                        Subtotal
                                                    </p>

                                                    <p className="text-sm font-medium text-neutral-900 sm:text-base">
                                                        $
                                                        {formatMoney(
                                                            item.subtotal
                                                        )}
                                                    </p>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>

                            <div className="mt-4 space-y-2.5 text-xs sm:text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-500">
                                        Subtotal
                                    </span>

                                    <span className="text-neutral-900">
                                        $
                                        {formatMoney(
                                            order.subtotal
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-neutral-500">
                                        Envío
                                    </span>

                                    <span className="text-right text-neutral-900">
                                        {Number(
                                            order.shipping_cost
                                        ) > 0
                                            ? `$${formatMoney(
                                                order.shipping_cost
                                            )}`
                                            : order.delivery_method ===
                                                "shipping"
                                                ? "A coordinar"
                                                : "—"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4 border-t border-neutral-100 pt-3 text-base font-medium">
                                    <span>
                                        Total
                                    </span>

                                    <span>
                                        $
                                        {formatMoney(
                                            order.total
                                        )}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Observaciones */}
                        {order.customer_notes && (
                            <section className="border border-[#d8cfc1] bg-white p-4 sm:p-5">
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541] sm:text-[10px]">
                                    Cliente
                                </p>

                                <h2 className="mt-1 font-serif text-xl text-neutral-900">
                                    Observaciones
                                </h2>

                                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-neutral-600">
                                    {
                                        order.customer_notes
                                    }
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Cliente y entrega */}
                    <aside className="h-fit border border-[#d8cfc1] bg-white p-4 sm:p-5 lg:sticky lg:top-32">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541] sm:text-[10px]">
                            Datos del
                            pedido
                        </p>

                        <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                            Cliente y
                            entrega
                        </h2>

                        <div className="mt-4 space-y-4 text-sm">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                    Cliente
                                </p>

                                <p className="mt-1 font-medium text-neutral-900">
                                    {order.recipient_name ||
                                        "—"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                        Teléfono
                                    </p>

                                    <p className="mt-1 break-words text-neutral-900">
                                        {order.recipient_phone ||
                                            "—"}
                                    </p>

                                    {whatsappNumber && (
                                        <a
                                            href={`https://wa.me/${whatsappNumber}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-flex text-[11px] font-medium text-[#806037] underline underline-offset-3"
                                        >
                                            Abrir
                                            WhatsApp
                                        </a>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                        Email
                                    </p>

                                    <p className="mt-1 break-words text-neutral-900">
                                        {order.customer_email ||
                                            "—"}
                                    </p>

                                    {order.customer_email && (
                                        <a
                                            href={`mailto:${order.customer_email}`}
                                            className="mt-1 inline-flex text-[11px] font-medium text-[#806037] underline underline-offset-3"
                                        >
                                            Enviar
                                            email
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-neutral-100 pt-4">
                                <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                    Modalidad
                                </p>

                                <p className="mt-1 font-medium text-neutral-900">
                                    {order.delivery_method ===
                                        "pickup"
                                        ? "Retiro en la joyería"
                                        : "Envío"}
                                </p>
                            </div>

                            {order.delivery_method ===
                                "shipping" && (
                                    <div className="border border-neutral-200 bg-[#faf8f4] p-3">
                                        <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                            Dirección
                                            de entrega
                                        </p>

                                        <p className="mt-1.5 font-medium leading-5 text-neutral-900">
                                            {order.address_line ||
                                                "—"}
                                            {order.apartment
                                                ? `, ${order.apartment}`
                                                : ""}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                                            {[
                                                order.city,
                                                order.department,
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    ", "
                                                ) ||
                                                "Ubicación no especificada"}
                                        </p>

                                        {order.additional_info && (
                                            <p className="mt-2 border-t border-neutral-200 pt-2 text-xs leading-5 text-neutral-500">
                                                {
                                                    order.additional_info
                                                }
                                            </p>
                                        )}
                                    </div>
                                )}

                            {order.tracking_number && (
                                <div className="border-t border-neutral-100 pt-4">
                                    <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                                        Seguimiento
                                    </p>

                                    <p className="mt-1 break-all text-neutral-900">
                                        {
                                            order.tracking_number
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}