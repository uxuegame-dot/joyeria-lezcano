import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";

const PAGE_SIZE = 20;

const ATTENTION_STATUSES = [
    "pending_confirmation",
    "pending_payment",
    "payment_rejected",
];

const DELIVERY_STATUSES = [
    "ready_for_pickup",
    "shipped",
];

const ALL_STATUSES = [
    "pending_confirmation",
    "pending_payment",
    "payment_confirmed",
    "preparing",
    "ready_for_pickup",
    "shipped",
    "completed",
    "cancelled",
    "payment_rejected",
];

type AdminOrdersPageProps = {
    searchParams: Promise<{
        buscar?: string;
        vista?: string;
        estado?: string;
        entrega?: string;
        ordenar?: string;
        pagina?: string;
    }>;
};

type AdminOrderItem = {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    quantity: number | string;
    created_at: string;
    product_type: string | null;
    image_url: string | null;
    image_alt: string;
};

type AdminOrder = {
    id: string;
    order_number: number;
    user_id: string | null;
    delivery_method: string;
    status: string;
    subtotal: number | string;
    shipping_cost: number | string;
    total: number | string;
    recipient_name: string | null;
    recipient_phone: string | null;
    customer_email: string | null;
    department: string | null;
    city: string | null;
    address_line: string | null;
    created_at: string;
    updated_at: string;
    items: AdminOrderItem[];
};

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es-UY")
        .trim();
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("es-UY", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Montevideo",
    }).format(new Date(date));
}

function formatMoney(value: number | string) {
    return Number(value).toLocaleString("es-UY", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
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
        case "cancelled":
            return "border-neutral-300 bg-white text-neutral-400";
        case "payment_rejected":
            return "border-red-200 bg-red-50 text-red-700";
        default:
            return "border-neutral-300 bg-white text-neutral-600";
    }
}

function getDeliveryLabel(deliveryMethod: string) {
    return deliveryMethod === "shipping"
        ? "Envío"
        : "Retiro";
}

function getProductTypeLabel(productType: string | null) {
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
            return "Producto";
    }
}

function getViewStatuses(view: string) {
    switch (view) {
        case "atencion":
            return ATTENTION_STATUSES;
        case "pagados":
            return ["payment_confirmed"];
        case "preparacion":
            return ["preparing"];
        case "entrega":
            return DELIVERY_STATUSES;
        case "finalizados":
            return ["completed"];
        case "todos":
        default:
            return null;
    }
}

function parsePage(value?: string) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
        return 1;
    }

    return parsed;
}

function buildOrdersUrl(params: {
    buscar?: string;
    vista?: string;
    estado?: string;
    entrega?: string;
    ordenar?: string;
    pagina?: number | string;
}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "todos"
        ) {
            return;
        }

        query.set(key, String(value));
    });

    const queryString = query.toString();

    return queryString
        ? `/administracion/pedidos?${queryString}`
        : "/administracion/pedidos";
}

function getPriority(status: string) {
    switch (status) {
        case "pending_confirmation":
            return 0;
        case "pending_payment":
            return 1;
        case "payment_rejected":
            return 2;
        case "payment_confirmed":
            return 3;
        case "preparing":
            return 4;
        case "ready_for_pickup":
        case "shipped":
            return 5;
        case "completed":
            return 6;
        case "cancelled":
            return 7;
        default:
            return 8;
    }
}

function matchesSearch(
    order: AdminOrder,
    searchTerm: string
) {
    if (!searchTerm) {
        return true;
    }

    const trimmedSearch = searchTerm.trim();
    const orderNumberSearch = trimmedSearch.replace(/^#/, "");

    if (/^\d+$/.test(orderNumberSearch)) {
        return String(order.order_number) === orderNumberSearch;
    }

    const normalizedSearch = normalizeText(trimmedSearch);

    const searchableText = [
        order.recipient_name,
        order.recipient_phone,
        order.customer_email,
        order.city,
        order.department,
        ...order.items.map((item) => item.product_name),
    ]
        .filter(Boolean)
        .join(" ");

    return normalizeText(searchableText).includes(
        normalizedSearch
    );
}

export default async function PedidosAdministracionPage({
    searchParams,
}: AdminOrdersPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

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

    if (profileError || !profile?.is_admin) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl text-neutral-900">
                    Acceso no autorizado
                </h1>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    Esta sección está reservada para los administradores de Lezcano.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-block bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Volver al inicio
                </Link>
            </section>
        );
    }

    const searchTerm = params.buscar?.trim() ?? "";

    const validViews = new Set([
        "todos",
        "atencion",
        "pagados",
        "preparacion",
        "entrega",
        "finalizados",
    ]);

    const selectedView =
        params.vista && validViews.has(params.vista)
            ? params.vista
            : "todos";

    const selectedStatus =
        params.estado &&
            ALL_STATUSES.includes(params.estado)
            ? params.estado
            : "";

    const selectedDelivery =
        params.entrega === "pickup" ||
            params.entrega === "shipping"
            ? params.entrega
            : "";

    const validSorts = new Set([
        "prioridad",
        "antiguos",
        "recientes",
        "importe-mayor",
        "importe-menor",
    ]);

    const selectedSort =
        params.ordenar &&
            validSorts.has(params.ordenar)
            ? params.ordenar
            : "prioridad";

    const requestedPage = parsePage(params.pagina);

    const {
        data: orders,
        error: ordersError,
    } = await supabase
        .from("orders")
        .select(`
            id,
            order_number,
            user_id,
            delivery_method,
            status,
            subtotal,
            shipping_cost,
            total,
            recipient_name,
            recipient_phone,
            customer_email,
            department,
            city,
            address_line,
            created_at,
            updated_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (ordersError) {
        throw new Error(
            `Error al obtener pedidos: ${ordersError.message}`
        );
    }

    const rawOrders = orders ?? [];
    const orderIds = rawOrders.map((order) => order.id);

    let rawItems: {
        id: string;
        order_id: string;
        product_id: string | null;
        product_name: string;
        quantity: number | string;
        created_at: string;
    }[] = [];

    if (orderIds.length > 0) {
        const {
            data: items,
            error: itemsError,
        } = await supabase
            .from("order_items")
            .select(`
                id,
                order_id,
                product_id,
                product_name,
                quantity,
                created_at
            `)
            .in("order_id", orderIds)
            .order("created_at", {
                ascending: true,
            });

        if (itemsError) {
            throw new Error(
                `Error al obtener los productos de los pedidos: ${itemsError.message}`
            );
        }

        rawItems = items ?? [];
    }

    const productIds = [
        ...new Set(
            rawItems
                .map((item) => item.product_id)
                .filter(
                    (
                        productId
                    ): productId is string =>
                        Boolean(productId)
                )
        ),
    ];

    const productTypeById = new Map<
        string,
        string | null
    >();

    const imageByProductId = new Map<
        string,
        {
            storage_path: string;
            alt_text: string | null;
        }
    >();

    if (productIds.length > 0) {
        const {
            data: products,
            error: productsError,
        } = await supabase
            .from("products")
            .select("id, product_type")
            .in("id", productIds);

        if (productsError) {
            console.error(
                "No se pudieron obtener los tipos de producto:",
                productsError
            );
        }

        for (const product of products ?? []) {
            productTypeById.set(
                product.id,
                product.product_type
            );
        }

        const {
            data: images,
            error: imagesError,
        } = await supabase
            .from("product_images")
            .select(
                "product_id, storage_path, alt_text, sort_order"
            )
            .in("product_id", productIds)
            .order("sort_order", {
                ascending: true,
            });

        if (imagesError) {
            console.error(
                "No se pudieron obtener las imágenes de los productos de los pedidos:",
                imagesError
            );
        }

        for (const image of images ?? []) {
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

    const itemsByOrderId = new Map<
        string,
        AdminOrderItem[]
    >();

    for (const item of rawItems) {
        const mainImage = item.product_id
            ? imageByProductId.get(
                item.product_id
            ) ?? null
            : null;

        const imageUrl = mainImage
            ? supabase.storage
                .from("product-images")
                .getPublicUrl(
                    mainImage.storage_path
                ).data.publicUrl
            : null;

        const enrichedItem: AdminOrderItem = {
            ...item,
            product_type: item.product_id
                ? productTypeById.get(
                    item.product_id
                ) ?? null
                : null,
            image_url: imageUrl,
            image_alt:
                mainImage?.alt_text ??
                item.product_name ??
                "Producto Lezcano",
        };

        const current =
            itemsByOrderId.get(item.order_id) ??
            [];

        current.push(enrichedItem);

        itemsByOrderId.set(
            item.order_id,
            current
        );
    }

    const allOrders: AdminOrder[] =
        rawOrders.map((order) => ({
            ...order,
            items:
                itemsByOrderId.get(order.id) ??
                [],
        }));

    const attentionCount = allOrders.filter(
        (order) =>
            ATTENTION_STATUSES.includes(
                order.status
            )
    ).length;

    const paidCount = allOrders.filter(
        (order) =>
            order.status ===
            "payment_confirmed"
    ).length;

    const preparingCount = allOrders.filter(
        (order) =>
            order.status === "preparing"
    ).length;

    const deliveryCount = allOrders.filter(
        (order) =>
            DELIVERY_STATUSES.includes(
                order.status
            )
    ).length;

    const completedCount = allOrders.filter(
        (order) =>
            order.status === "completed"
    ).length;

    const viewStatuses =
        getViewStatuses(selectedView);

    let filteredOrders = allOrders.filter(
        (order) => {
            if (
                viewStatuses &&
                !viewStatuses.includes(order.status)
            ) {
                return false;
            }

            if (
                selectedStatus &&
                order.status !== selectedStatus
            ) {
                return false;
            }

            if (
                selectedDelivery &&
                order.delivery_method !==
                selectedDelivery
            ) {
                return false;
            }

            if (
                !matchesSearch(
                    order,
                    searchTerm
                )
            ) {
                return false;
            }

            return true;
        }
    );

    filteredOrders = [
        ...filteredOrders,
    ].sort((a, b) => {
        switch (selectedSort) {
            case "antiguos":
                return (
                    new Date(
                        a.created_at
                    ).getTime() -
                    new Date(
                        b.created_at
                    ).getTime()
                );

            case "recientes":
                return (
                    new Date(
                        b.created_at
                    ).getTime() -
                    new Date(
                        a.created_at
                    ).getTime()
                );

            case "importe-mayor":
                return (
                    Number(b.total) -
                    Number(a.total)
                );

            case "importe-menor":
                return (
                    Number(a.total) -
                    Number(b.total)
                );

            case "prioridad":
            default: {
                const priorityDiff =
                    getPriority(a.status) -
                    getPriority(b.status);

                if (priorityDiff !== 0) {
                    return priorityDiff;
                }

                const aTime = new Date(
                    a.created_at
                ).getTime();

                const bTime = new Date(
                    b.created_at
                ).getTime();

                const finalState =
                    a.status ===
                    "completed" ||
                    a.status ===
                    "cancelled";

                if (finalState) {
                    return bTime - aTime;
                }

                return aTime - bTime;
            }
        }
    });

    const filteredCount =
        filteredOrders.length;

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredCount / PAGE_SIZE
        )
    );

    if (
        requestedPage > totalPages &&
        filteredCount > 0
    ) {
        redirect(
            buildOrdersUrl({
                buscar: searchTerm,
                vista: selectedView,
                estado: selectedStatus,
                entrega: selectedDelivery,
                ordenar: selectedSort,
                pagina: totalPages,
            })
        );
    }

    const currentPage = Math.min(
        requestedPage,
        totalPages
    );

    const startIndex =
        (currentPage - 1) * PAGE_SIZE;

    const visibleOrders =
        filteredOrders.slice(
            startIndex,
            startIndex + PAGE_SIZE
        );

    const firstVisibleOrder =
        filteredCount === 0
            ? 0
            : startIndex + 1;

    const lastVisibleOrder = Math.min(
        startIndex + PAGE_SIZE,
        filteredCount
    );

    const hasFilters =
        Boolean(searchTerm) ||
        selectedView !== "todos" ||
        Boolean(selectedStatus) ||
        Boolean(selectedDelivery) ||
        selectedSort !== "prioridad";

    const paginationParams = {
        buscar: searchTerm,
        vista: selectedView,
        estado: selectedStatus,
        entrega: selectedDelivery,
        ordenar: selectedSort,
    };

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/administracion"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Administración
                    </Link>

                    <div className="mt-4">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                            Administración
                        </p>

                        <h1 className="mt-1 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                            Pedidos
                        </h1>

                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-600">
                            Organizá, priorizá y
                            gestioná los pedidos de
                            la tienda online.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-3 lg:grid-cols-5">
                    <Link
                        href={buildOrdersUrl({
                            vista: "atencion",
                        })}
                        className={`min-w-[132px] rounded-[12px] border p-3 transition hover:border-[#b28a53] sm:min-w-0 sm:p-4 ${selectedView ===
                            "atencion"
                            ? "border-[#b28a53] bg-[#f0e8dc]"
                            : "border-[#ddd5c9] bg-white"
                            }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.16em] text-[#9a7541] sm:text-[10px]">
                            Requieren atención
                        </p>
                        <p className="mt-1.5 font-serif text-2xl text-neutral-900">
                            {attentionCount}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                            Confirmación, pago o rechazo
                        </p>
                    </Link>

                    <Link
                        href={buildOrdersUrl({
                            vista: "pagados",
                        })}
                        className={`min-w-[132px] rounded-[12px] border p-3 transition hover:border-[#b28a53] sm:min-w-0 sm:p-4 ${selectedView ===
                            "pagados"
                            ? "border-[#b28a53] bg-[#f0e8dc]"
                            : "border-[#ddd5c9] bg-white"
                            }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px]">
                            Pago confirmado
                        </p>
                        <p className="mt-1.5 font-serif text-2xl text-neutral-900">
                            {paidCount}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                            Esperan preparación
                        </p>
                    </Link>

                    <Link
                        href={buildOrdersUrl({
                            vista: "preparacion",
                        })}
                        className={`min-w-[132px] rounded-[12px] border p-3 transition hover:border-[#b28a53] sm:min-w-0 sm:p-4 ${selectedView ===
                            "preparacion"
                            ? "border-[#b28a53] bg-[#f0e8dc]"
                            : "border-[#ddd5c9] bg-white"
                            }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px]">
                            En preparación
                        </p>
                        <p className="mt-1.5 font-serif text-2xl text-neutral-900">
                            {preparingCount}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                            En proceso
                        </p>
                    </Link>

                    <Link
                        href={buildOrdersUrl({
                            vista: "entrega",
                        })}
                        className={`min-w-[132px] rounded-[12px] border p-3 transition hover:border-[#b28a53] sm:min-w-0 sm:p-4 ${selectedView ===
                            "entrega"
                            ? "border-[#b28a53] bg-[#f0e8dc]"
                            : "border-[#ddd5c9] bg-white"
                            }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px]">
                            Para entregar
                        </p>
                        <p className="mt-1.5 font-serif text-2xl text-neutral-900">
                            {deliveryCount}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                            Listos o enviados
                        </p>
                    </Link>

                    <Link
                        href={buildOrdersUrl({
                            vista: "finalizados",
                        })}
                        className={`min-w-[132px] rounded-[12px] border p-3 transition hover:border-[#b28a53] sm:min-w-0 sm:p-4 ${selectedView ===
                            "finalizados"
                            ? "border-[#b28a53] bg-[#f0e8dc]"
                            : "border-[#ddd5c9] bg-white"
                            }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px]">
                            Finalizados
                        </p>
                        <p className="mt-1.5 font-serif text-2xl text-neutral-900">
                            {completedCount}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-neutral-500">
                            Entregados o retirados
                        </p>
                    </Link>
                    </div>
                </div>

                <div className="mt-3">
                    <Link
                        href="/administracion/pedidos"
                        className={`inline-flex rounded-full border px-4 py-2 text-xs font-medium transition ${selectedView ===
                            "todos" &&
                            !hasFilters
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-[#d8cfc1] bg-white text-neutral-700 hover:border-neutral-900"
                            }`}
                    >
                        Ver todos los pedidos
                    </Link>
                </div>

                <section className="mt-4 rounded-[14px] border border-[#ddd5c9] bg-white p-3 sm:p-4">
                    <form
                        method="GET"
                        action="/administracion/pedidos"
                    >
                        {selectedView !==
                            "todos" && (
                                <input
                                    type="hidden"
                                    name="vista"
                                    value={
                                        selectedView
                                    }
                                />
                            )}

                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(150px,0.7fr))]">
                            <div>
                                <label
                                    htmlFor="buscar"
                                    className="text-[10px] uppercase tracking-[0.15em] text-neutral-500"
                                >
                                    Buscar
                                </label>

                                <input
                                    id="buscar"
                                    name="buscar"
                                    type="search"
                                    defaultValue={
                                        searchTerm
                                    }
                                    placeholder="# pedido, cliente, producto, teléfono o email"
                                    className="mt-2 h-11 w-full rounded-[9px] border border-[#d8cec1] bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541] focus:ring-2 focus:ring-[#b28a53]/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="estado"
                                    className="text-[10px] uppercase tracking-[0.15em] text-neutral-500"
                                >
                                    Estado
                                </label>

                                <select
                                    id="estado"
                                    name="estado"
                                    defaultValue={
                                        selectedStatus
                                    }
                                    className="mt-2 h-11 w-full rounded-[9px] border border-[#d8cec1] bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541] focus:ring-2 focus:ring-[#b28a53]/10"
                                >
                                    <option value="">
                                        Todos
                                    </option>
                                    <option value="pending_confirmation">
                                        Pendiente de confirmación
                                    </option>
                                    <option value="pending_payment">
                                        Pendiente de pago
                                    </option>
                                    <option value="payment_confirmed">
                                        Pago confirmado
                                    </option>
                                    <option value="preparing">
                                        En preparación
                                    </option>
                                    <option value="ready_for_pickup">
                                        Listo para retirar
                                    </option>
                                    <option value="shipped">
                                        Enviado
                                    </option>
                                    <option value="completed">
                                        Finalizado
                                    </option>
                                    <option value="payment_rejected">
                                        Pago rechazado
                                    </option>
                                    <option value="cancelled">
                                        Cancelado
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="entrega"
                                    className="text-[10px] uppercase tracking-[0.15em] text-neutral-500"
                                >
                                    Entrega
                                </label>

                                <select
                                    id="entrega"
                                    name="entrega"
                                    defaultValue={
                                        selectedDelivery
                                    }
                                    className="mt-2 h-11 w-full rounded-[9px] border border-[#d8cec1] bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541] focus:ring-2 focus:ring-[#b28a53]/10"
                                >
                                    <option value="">
                                        Todos
                                    </option>
                                    <option value="pickup">
                                        Retiro
                                    </option>
                                    <option value="shipping">
                                        Envío
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="ordenar"
                                    className="text-[10px] uppercase tracking-[0.15em] text-neutral-500"
                                >
                                    Ordenar
                                </label>

                                <select
                                    id="ordenar"
                                    name="ordenar"
                                    defaultValue={
                                        selectedSort
                                    }
                                    className="mt-2 h-11 w-full rounded-[9px] border border-[#d8cec1] bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541] focus:ring-2 focus:ring-[#b28a53]/10"
                                >
                                    <option value="prioridad">
                                        Requieren atención primero
                                    </option>
                                    <option value="antiguos">
                                        Más antiguos
                                    </option>
                                    <option value="recientes">
                                        Más recientes
                                    </option>
                                    <option value="importe-mayor">
                                        Mayor importe
                                    </option>
                                    <option value="importe-menor">
                                        Menor importe
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                {hasFilters && (
                                    <Link
                                        href="/administracion/pedidos"
                                        className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                    >
                                        Limpiar filtros
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </form>
                </section>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-neutral-900">
                            {filteredCount === 0
                                ? "Sin resultados"
                                : `${firstVisibleOrder}–${lastVisibleOrder} de ${filteredCount} pedidos`}
                        </p>

                        {selectedSort ===
                            "prioridad" &&
                            filteredCount >
                            0 && (
                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                    Los pedidos que requieren acción aparecen primero.
                                </p>
                            )}
                    </div>

                    {attentionCount > 0 && (
                        <p className="text-xs font-medium text-[#806037]">
                            {attentionCount}{" "}
                            {attentionCount === 1
                                ? "pedido requiere"
                                : "pedidos requieren"}{" "}
                            atención
                        </p>
                    )}
                </div>

                {visibleOrders.length === 0 ? (
                    <div className="mt-5 rounded-[18px] border border-[#ddd5c9] bg-[#fffdf9] px-6 py-12 text-center shadow-[0_8px_24px_rgba(65,48,29,0.03)]">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                            Pedidos
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-neutral-900">
                            {allOrders.length === 0
                                ? "Todavía no hay pedidos"
                                : "No encontramos pedidos"}
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-600">
                            {allOrders.length === 0
                                ? "Cuando un cliente realice un pedido desde la tienda, va a aparecer acá."
                                : "Probá cambiando la búsqueda o alguno de los filtros seleccionados."}
                        </p>

                        {hasFilters && (
                            <Link
                                href="/administracion/pedidos"
                                className="mt-7 inline-flex bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                            >
                                Ver todos
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 overflow-hidden rounded-[16px] border border-[#ddd5c9] bg-[#fffdf9] shadow-[0_8px_24px_rgba(65,48,29,0.03)]">
                        {visibleOrders.map(
                            (order, index) => {
                                const requiresAttention =
                                    ATTENTION_STATUSES.includes(
                                        order.status
                                    );

                                const visibleItems =
                                    order.items.slice(
                                        0,
                                        2
                                    );

                                const remainingItems =
                                    Math.max(
                                        0,
                                        order.items
                                            .length -
                                        visibleItems.length
                                    );

                                return (
                                    <article
                                        key={order.id}
                                        className={`relative p-4 sm:p-5 ${index !==
                                            visibleOrders.length -
                                            1
                                            ? "border-b border-neutral-200"
                                            : ""
                                            } ${requiresAttention
                                                ? "bg-[#fffdf8]"
                                                : "bg-white"
                                            }`}
                                    >
                                        {requiresAttention && (
                                            <div className="absolute inset-y-0 left-0 w-1 bg-[#b28a53]" />
                                        )}

                                        {/* Vista compacta para celular y tablet */}
                                        <div className="xl:hidden">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/administracion/pedidos/${order.id}`}
                                                        className="font-serif text-2xl text-neutral-900 transition hover:text-[#9a7541]"
                                                    >
                                                        #{order.order_number}
                                                    </Link>

                                                    <p className="mt-1 truncate text-sm font-medium text-neutral-900">
                                                        {order.recipient_name ||
                                                            "Cliente sin nombre"}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <span
                                                        className={`inline-flex border px-2 py-1 text-[9px] font-medium ${getStatusClasses(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            order.status,
                                                            order.delivery_method
                                                        )}
                                                    </span>

                                                    {requiresAttention && (
                                                        <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.1em] text-[#9a7541]">
                                                            Requiere atención
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {(order.recipient_phone ||
                                                order.customer_email) && (
                                                    <div className="mt-2 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                                                        {order.recipient_phone && (
                                                            <span>
                                                                {order.recipient_phone}
                                                            </span>
                                                        )}

                                                        {order.customer_email && (
                                                            <span className="min-w-0 truncate">
                                                                {order.customer_email}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                            <div className="mt-3 border-t border-neutral-100 pt-3">
                                                {visibleItems.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {visibleItems.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="flex min-w-0 items-center gap-2.5"
                                                                >
                                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[9px] border border-[#e2d8cc] bg-[#f4f0ea]">
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
                                                                            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[6px] uppercase tracking-wide text-neutral-400">
                                                                                Lezcano
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-neutral-900">
                                                                            {
                                                                                item.product_name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[10px] text-neutral-500">
                                                                            {getProductTypeLabel(
                                                                                item.product_type
                                                                            )}
                                                                            {" · "}
                                                                            Cant.{" "}
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}

                                                        {remainingItems > 0 && (
                                                            <p className="pl-[54px] text-[10px] font-medium text-[#806037]">
                                                                +
                                                                {
                                                                    remainingItems
                                                                }{" "}
                                                                {remainingItems ===
                                                                    1
                                                                    ? "producto más"
                                                                    : "productos más"}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-neutral-500">
                                                        Sin productos registrados
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-3 flex items-end justify-between gap-4 border-t border-neutral-100 pt-3">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium text-neutral-800">
                                                        {getDeliveryLabel(
                                                            order.delivery_method
                                                        )}
                                                        {order.delivery_method ===
                                                            "shipping" &&
                                                            order.city
                                                            ? ` · ${order.city}`
                                                            : ""}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-neutral-500">
                                                        {formatDate(
                                                            order.created_at
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm font-semibold text-neutral-900">
                                                        $
                                                        {formatMoney(
                                                            order.total
                                                        )}
                                                    </p>

                                                    <Link
                                                        href={`/administracion/pedidos/${order.id}`}
                                                        className="lezcano-arrow mt-1 inline-flex text-[11px] font-medium text-[#806037] transition hover:text-neutral-900"
                                                    >
                                                        Gestionar
                                                        <span className="arrow">
                                                            →
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vista amplia para escritorio */}
                                        <div className="hidden gap-5 xl:grid xl:grid-cols-[80px_minmax(180px,0.9fr)_minmax(260px,1.35fr)_170px_120px] xl:items-center">
                                            <div>
                                                <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                                                    Pedido
                                                </p>

                                                <Link
                                                    href={`/administracion/pedidos/${order.id}`}
                                                    className="mt-1 inline-block font-serif text-2xl text-neutral-900 transition hover:text-[#9a7541]"
                                                >
                                                    #{order.order_number}
                                                </Link>
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex border px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(
                                                            order.status
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            order.status,
                                                            order.delivery_method
                                                        )}
                                                    </span>

                                                    {requiresAttention && (
                                                        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#9a7541]">
                                                            Requiere atención
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-2 truncate text-sm font-medium text-neutral-900">
                                                    {order.recipient_name ||
                                                        "Cliente sin nombre"}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                                                    {order.customer_email && (
                                                        <span className="truncate">
                                                            {
                                                                order.customer_email
                                                            }
                                                        </span>
                                                    )}

                                                    {order.recipient_phone && (
                                                        <span>
                                                            {
                                                                order.recipient_phone
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-neutral-400">
                                                    Productos
                                                </p>

                                                {visibleItems.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {visibleItems.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="flex min-w-0 items-center gap-3"
                                                                >
                                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[10px] border border-[#e2d8cc] bg-[#f4f0ea]">
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
                                                                            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[7px] uppercase tracking-wide text-neutral-400">
                                                                                Lezcano
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-medium text-neutral-900">
                                                                            {
                                                                                item.product_name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-0.5 text-[11px] text-neutral-500">
                                                                            {getProductTypeLabel(
                                                                                item.product_type
                                                                            )}
                                                                            {" · "}
                                                                            Cant.{" "}
                                                                            {
                                                                                item.quantity
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}

                                                        {remainingItems > 0 && (
                                                            <p className="pl-[60px] text-[11px] font-medium text-[#806037]">
                                                                +
                                                                {
                                                                    remainingItems
                                                                }{" "}
                                                                {remainingItems ===
                                                                    1
                                                                    ? "producto más"
                                                                    : "productos más"}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-neutral-500">
                                                        Sin productos registrados
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-neutral-800">
                                                    {getDeliveryLabel(
                                                        order.delivery_method
                                                    )}
                                                    {order.delivery_method ===
                                                        "shipping" &&
                                                        order.city
                                                        ? ` · ${order.city}`
                                                        : ""}
                                                </p>

                                                <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-base font-medium text-neutral-900">
                                                    $
                                                    {formatMoney(
                                                        order.total
                                                    )}
                                                </p>

                                                <Link
                                                    href={`/administracion/pedidos/${order.id}`}
                                                    className="lezcano-arrow mt-2 inline-flex text-xs font-medium text-[#806037] transition hover:text-neutral-900"
                                                >
                                                    Gestionar
                                                    <span className="arrow">
                                                        →
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

                {filteredCount > PAGE_SIZE && (
                    <div className="mt-6 flex flex-col gap-4 border-t border-[#ddd5c9] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-neutral-500">
                            Página {currentPage} de{" "}
                            {totalPages}
                        </p>

                        <div className="flex gap-2">
                            {currentPage > 1 && (
                                <Link
                                    href={buildOrdersUrl({
                                        ...paginationParams,
                                        pagina:
                                            currentPage -
                                            1,
                                    })}
                                    className="rounded-[10px] border border-[#d8cfc1] bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition hover:border-[#b78a54] hover:bg-[#fffaf6]"
                                >
                                    ← Anterior
                                </Link>
                            )}

                            {currentPage <
                                totalPages && (
                                    <Link
                                        href={buildOrdersUrl({
                                            ...paginationParams,
                                            pagina:
                                                currentPage +
                                                1,
                                        })}
                                        className="rounded-[10px] border border-[#d8cfc1] bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 transition hover:border-[#b78a54] hover:bg-[#fffaf6]"
                                    >
                                        Siguiente →
                                    </Link>
                                )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}