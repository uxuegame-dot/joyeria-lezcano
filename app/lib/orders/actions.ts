"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

type CheckoutItem = {
    product_id: string;
    quantity: number;
};

type CreateOrderInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    deliveryMethod: "pickup" | "shipping";
    address?: string;
    city?: string;
    department?: string;
    notes?: string;
    items: CheckoutItem[];
};

type CreateOrderResult =
    | {
        success: true;
        orderId: string;
        orderNumber: number;
        total: number;
    }
    | {
        success: false;
        error: string;
    };

export async function createOrder(
    input: CreateOrderInput
): Promise<CreateOrderResult> {
    const supabase = await createClient();

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const email = input.email.trim();
    const phone = input.phone.trim();

    if (!firstName) {
        return {
            success: false,
            error: "Ingresá tu nombre.",
        };
    }

    if (!lastName) {
        return {
            success: false,
            error: "Ingresá tu apellido.",
        };
    }

    if (!email) {
        return {
            success: false,
            error: "Ingresá tu email.",
        };
    }

    if (!phone) {
        return {
            success: false,
            error: "Ingresá tu teléfono o WhatsApp.",
        };
    }

    if (
        input.deliveryMethod !== "pickup" &&
        input.deliveryMethod !== "shipping"
    ) {
        return {
            success: false,
            error: "Seleccioná una forma de entrega válida.",
        };
    }

    if (
        input.deliveryMethod === "shipping" &&
        !input.address?.trim()
    ) {
        return {
            success: false,
            error: "Ingresá la dirección para el envío.",
        };
    }

    if (!input.items.length) {
        return {
            success: false,
            error: "El carrito está vacío.",
        };
    }

    const items = input.items
        .filter(
            (item) =>
                typeof item.product_id === "string" &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0
        )
        .map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
        }));

    if (items.length !== input.items.length) {
        return {
            success: false,
            error: "Hay productos inválidos en el carrito.",
        };
    }

    const { data, error } = await supabase.rpc(
        "create_order",
        {
            p_customer_first_name: firstName,
            p_customer_last_name: lastName,
            p_customer_email: email,
            p_customer_phone: phone,
            p_delivery_method: input.deliveryMethod,
            p_address:
                input.deliveryMethod === "shipping"
                    ? input.address?.trim() || null
                    : null,
            p_city:
                input.deliveryMethod === "shipping"
                    ? input.city?.trim() || null
                    : null,
            p_department:
                input.deliveryMethod === "shipping"
                    ? input.department?.trim() || null
                    : null,
            p_notes: input.notes?.trim() || null,
            p_items: items,
        }
    );

    if (error) {
        console.error("Error al crear pedido:", error);

        return {
            success: false,
            error:
                error.message ||
                "No se pudo confirmar el pedido.",
        };
    }

    if (!data) {
        return {
            success: false,
            error:
                "No se recibió la confirmación del pedido.",
        };
    }

    return {
        success: true,
        orderId: String(data.order_id),
        orderNumber: Number(data.order_number),
        total: Number(data.total),
    };
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: string
): Promise<
    | { success: true }
    | { success: false; error: string }
> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "Tenés que iniciar sesión.",
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        return {
            success: false,
            error: "No tenés permisos para modificar pedidos.",
        };
    }

    const { error } = await supabase.rpc(
        "update_order_status",
        {
            p_order_id: orderId,
            p_new_status: newStatus,
        }
    );

    if (error) {
        console.error(
            "Error al cambiar estado:",
            error
        );

        return {
            success: false,
            error: error.message,
        };
    }

    revalidatePath("/administracion/pedidos");
    revalidatePath(
        `/administracion/pedidos/${orderId}`
    );

    return {
        success: true,
    };
}