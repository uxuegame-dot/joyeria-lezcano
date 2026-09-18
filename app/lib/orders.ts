import { createClient } from "@/app/lib/supabase/server";

async function getAdminClient() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            supabase,
            isAdmin: false,
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return {
        supabase,
        isAdmin: profile?.is_admin === true,
    };
}

async function getAuthenticatedClient() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return {
        supabase,
        user,
    };
}

const ORDER_FIELDS = `
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
    apartment,
    additional_info,
    shipping_method,
    tracking_number,
    customer_notes,
    admin_notes,
    created_at,
    updated_at
`;

export async function getAdminOrders() {
    const { supabase, isAdmin } =
        await getAdminClient();

    if (!isAdmin) {
        return [];
    }

    const { data, error } = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(
            `Error al obtener pedidos: ${error.message}`
        );
    }

    return data ?? [];
}

export async function getAdminOrderById(
    orderId: string
) {
    const { supabase, isAdmin } =
        await getAdminClient();

    if (!isAdmin) {
        return null;
    }

    const { data: order, error } =
        await supabase
            .from("orders")
            .select(ORDER_FIELDS)
            .eq("id", orderId)
            .single();

    if (error || !order) {
        return null;
    }

    const { data: items, error: itemsError } =
        await supabase
            .from("order_items")
            .select(`
                id,
                product_id,
                product_name,
                unit_price,
                quantity,
                subtotal,
                created_at
            `)
            .eq("order_id", orderId)
            .order("created_at", {
                ascending: true,
            });

    if (itemsError) {
        throw new Error(
            `Error al obtener los productos del pedido: ${itemsError.message}`
        );
    }

    return {
        ...order,
        items: items ?? [],
    };
}

export async function getUserOrders() {
    const { supabase, user } =
        await getAuthenticatedClient();

    if (!user) {
        return [];
    }

    const { data: orders, error } = await supabase
        .from("orders")
        .select(ORDER_FIELDS)
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(
            `Error al obtener tus pedidos: ${error.message}`
        );
    }

    const orderList = orders ?? [];

    if (orderList.length === 0) {
        return [];
    }

    const orderIds = orderList.map(
        (order) => order.id
    );

    const { data: items, error: itemsError } =
        await supabase
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
            `Error al obtener los productos de tus pedidos: ${itemsError.message}`
        );
    }

    const itemList = items ?? [];

    const productIds = [
        ...new Set(
            itemList
                .map((item) => item.product_id)
                .filter(
                    (productId): productId is string =>
                        Boolean(productId)
                )
        ),
    ];

    const imageByProductId = new Map<
        string,
        {
            storage_path: string;
            alt_text: string | null;
        }
    >();

    if (productIds.length > 0) {
        const { data: images, error: imagesError } =
            await supabase
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
                "No se pudieron obtener las imágenes de los pedidos:",
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
        typeof itemList
    >();

    for (const item of itemList) {
        const current =
            itemsByOrderId.get(
                item.order_id
            ) ?? [];

        current.push(item);

        itemsByOrderId.set(
            item.order_id,
            current
        );
    }

    return orderList.map((order) => {
        const orderItems =
            itemsByOrderId.get(
                order.id
            ) ?? [];

        const firstItem =
            orderItems[0] ?? null;

        const mainImage =
            firstItem?.product_id
                ? imageByProductId.get(
                    firstItem.product_id
                ) ?? null
                : null;

        const previewImageUrl =
            mainImage
                ? supabase.storage
                    .from(
                        "product-images"
                    )
                    .getPublicUrl(
                        mainImage.storage_path
                    ).data.publicUrl
                : null;

        const totalItems =
            orderItems.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.quantity
                    ),
                0
            );

        return {
            ...order,
            preview_image_url:
                previewImageUrl,
            preview_image_alt:
                mainImage?.alt_text ??
                firstItem?.product_name ??
                "Pedido Lezcano",
            preview_product_name:
                firstItem?.product_name ??
                null,
            total_items:
                totalItems,
        };
    });
}

export async function getUserOrderById(
    orderId: string
) {
    const { supabase, user } =
        await getAuthenticatedClient();

    if (!user) {
        return null;
    }

    const { data: order, error } =
        await supabase
            .from("orders")
            .select(ORDER_FIELDS)
            .eq("id", orderId)
            .eq("user_id", user.id)
            .maybeSingle();

    if (error || !order) {
        return null;
    }

    const { data: items, error: itemsError } =
        await supabase
            .from("order_items")
            .select(`
                id,
                product_id,
                product_name,
                unit_price,
                quantity,
                subtotal,
                created_at
            `)
            .eq("order_id", order.id)
            .order("created_at", {
                ascending: true,
            });

    if (itemsError) {
        throw new Error(
            `Error al obtener los productos de tu pedido: ${itemsError.message}`
        );
    }

    const itemList = items ?? [];

    const productIds = [
        ...new Set(
            itemList
                .map((item) => item.product_id)
                .filter(
                    (productId): productId is string =>
                        Boolean(productId)
                )
        ),
    ];

    const productSlugById = new Map<
        string,
        string
    >();

    const imageByProductId = new Map<
        string,
        {
            storage_path: string;
            alt_text: string | null;
        }
    >();

    if (productIds.length > 0) {
        const [
            productsResult,
            imagesResult,
        ] = await Promise.all([
            supabase
                .from("products")
                .select("id, slug")
                .in("id", productIds),

            supabase
                .from("product_images")
                .select(
                    "product_id, storage_path, alt_text, sort_order"
                )
                .in("product_id", productIds)
                .order("sort_order", {
                    ascending: true,
                }),
        ]);

        if (productsResult.error) {
            console.error(
                "No se pudieron obtener los slugs de los productos del pedido:",
                productsResult.error
            );
        }

        if (imagesResult.error) {
            console.error(
                "No se pudieron obtener las imágenes de los productos del pedido:",
                imagesResult.error
            );
        }

        for (
            const product of
            productsResult.data ?? []
        ) {
            if (product.slug) {
                productSlugById.set(
                    product.id,
                    product.slug
                );
            }
        }

        for (
            const image of
            imagesResult.data ?? []
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

    const enrichedItems =
        itemList.map((item) => {
            const image =
                item.product_id
                    ? imageByProductId.get(
                        item.product_id
                    )
                    : null;

            const imageUrl =
                image
                    ? supabase.storage
                        .from(
                            "product-images"
                        )
                        .getPublicUrl(
                            image.storage_path
                        ).data.publicUrl
                    : null;

            return {
                ...item,
                product_slug:
                    item.product_id
                        ? productSlugById.get(
                            item.product_id
                        ) ?? null
                        : null,
                image_url: imageUrl,
                image_alt:
                    image?.alt_text ??
                    item.product_name,
            };
        });

    return {
        ...order,
        items: enrichedItems,
    };
}