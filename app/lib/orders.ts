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

export async function getAdminOrders() {
    const { supabase, isAdmin } =
        await getAdminClient();

    if (!isAdmin) {
        return [];
    }

    const { data, error } = await supabase
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
            apartment,
            additional_info,
            shipping_method,
            tracking_number,
            customer_notes,
            admin_notes,
            created_at,
            updated_at
        `)
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
                apartment,
                additional_info,
                shipping_method,
                tracking_number,
                customer_notes,
                admin_notes,
                created_at,
                updated_at
            `)
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
