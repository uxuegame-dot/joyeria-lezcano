"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/app/lib/supabase/server";
import { createMercadoPagoCheckout } from "@/app/lib/payments/mercadopago";

type DeliveryMethod =
    | "pickup"
    | "shipping";

type OrderItemInput = {
    product_id: string;
    quantity: number;
};

type CreateOrderInput = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    deliveryMethod: DeliveryMethod;
    address: string;
    city: string;
    department: string;
    notes: string;
    items: OrderItemInput[];
};

type CreateOrderResult =
    | {
        success: true;
        orderId: string;
        orderNumber:
        | number
        | string;
        total:
        | number
        | string;
        checkoutUrl:
        | string
        | null;
        paymentError:
        | string
        | null;
    }
    | {
        success: false;
        error: string;
    };

type UpdateOrderStatusResult =
    | {
        success: true;
        status: string;
    }
    | {
        success: false;
        error: string;
    };

const VALID_ORDER_STATUSES = [
    "pending_confirmation",
    "pending_payment",
    "payment_confirmed",
    "preparing",
    "ready_for_pickup",
    "shipped",
    "completed",
    "cancelled",
    "payment_rejected",
] as const;

function getErrorMessage(
    error: unknown
) {
    if (
        error instanceof Error &&
        error.message
    ) {
        return error.message;
    }

    if (
        typeof error ===
        "object" &&
        error !== null &&
        "message" in error &&
        typeof (
            error as {
                message?: unknown;
            }
        ).message ===
        "string"
    ) {
        return (
            error as {
                message: string;
            }
        ).message;
    }

    return null;
}

export async function createOrder(
    input: CreateOrderInput
): Promise<CreateOrderResult> {
    const supabase =
        await createClient();

    const firstName =
        input.firstName.trim();

    const lastName =
        input.lastName.trim();

    const email =
        input.email.trim();

    const phone =
        input.phone.trim();

    const address =
        input.address.trim();

    const city =
        input.city.trim();

    const department =
        input.department.trim();

    const notes =
        input.notes.trim();

    if (!firstName) {
        return {
            success: false,
            error:
                "Ingresá tu nombre.",
        };
    }

    if (!lastName) {
        return {
            success: false,
            error:
                "Ingresá tu apellido.",
        };
    }

    if (!email) {
        return {
            success: false,
            error:
                "Ingresá tu email.",
        };
    }

    if (!phone) {
        return {
            success: false,
            error:
                "Ingresá tu teléfono.",
        };
    }

    if (
        input.deliveryMethod !==
        "pickup" &&
        input.deliveryMethod !==
        "shipping"
    ) {
        return {
            success: false,
            error:
                "El método de entrega no es válido.",
        };
    }

    if (
        input.deliveryMethod ===
        "shipping" &&
        !address
    ) {
        return {
            success: false,
            error:
                "Ingresá la dirección de envío.",
        };
    }

    if (
        input.deliveryMethod ===
        "shipping" &&
        !city
    ) {
        return {
            success: false,
            error:
                "Ingresá la ciudad para el envío.",
        };
    }

    if (
        input.deliveryMethod ===
        "shipping" &&
        !department
    ) {
        return {
            success: false,
            error:
                "Ingresá el departamento para el envío.",
        };
    }

    if (
        !Array.isArray(
            input.items
        ) ||
        input.items.length === 0
    ) {
        return {
            success: false,
            error:
                "El carrito está vacío.",
        };
    }

    for (
        const item of
        input.items
    ) {
        if (
            !item.product_id ||
            !Number.isInteger(
                item.quantity
            ) ||
            item.quantity < 1
        ) {
            return {
                success: false,
                error:
                    "Hay un producto inválido en el carrito.",
            };
        }
    }

    const {
        data,
        error,
    } = await supabase.rpc(
        "create_order",
        {
            p_customer_first_name:
                firstName,

            p_customer_last_name:
                lastName,

            p_customer_email:
                email,

            p_customer_phone:
                phone,

            p_delivery_method:
                input.deliveryMethod,

            p_address:
                input.deliveryMethod ===
                    "shipping"
                    ? address
                    : "",

            p_city:
                input.deliveryMethod ===
                    "shipping"
                    ? city
                    : "",

            p_department:
                input.deliveryMethod ===
                    "shipping"
                    ? department
                    : "",

            p_notes:
                notes,

            p_items:
                input.items,
        }
    );

    if (error) {
        console.error(
            "Error al crear el pedido:",
            error
        );

        return {
            success: false,
            error:
                error.message ||
                "No se pudo crear el pedido.",
        };
    }

    if (
        !data ||
        typeof data !==
        "object"
    ) {
        return {
            success: false,
            error:
                "El pedido se creó, pero no pudimos obtener sus datos.",
        };
    }

    const result =
        data as {
            order_id?: string;
            order_number?:
            | number
            | string;
            total?:
            | number
            | string;
        };

    if (
        !result.order_id ||
        result.order_number ===
        undefined
    ) {
        console.error(
            "Respuesta inesperada de create_order:",
            data
        );

        return {
            success: false,
            error:
                "No pudimos confirmar correctamente el pedido.",
        };
    }

    revalidatePath(
        "/administracion/pedidos"
    );

    revalidatePath(
        "/mi-cuenta/pedidos"
    );

    /*
     * RETIRO EN LA JOYERÍA
     * --------------------
     * El total ya está definido, por lo que podemos
     * crear inmediatamente el checkout de Mercado Pago.
     *
     * ENVÍO
     * -----
     * Todavía NO creamos el checkout porque falta
     * confirmar el costo de envío desde Administración.
     */
    let checkoutUrl:
        | string
        | null = null;

    let paymentError:
        | string
        | null = null;

    if (
        input.deliveryMethod ===
        "pickup"
    ) {
        try {
            const payment =
                await createMercadoPagoCheckout(
                    {
                        internalOrderId:
                            result.order_id,
                        orderNumber:
                            result.order_number,
                        payerEmail:
                            email,
                        total:
                            result.total ??
                            0,
                    }
                );

            checkoutUrl =
                payment.checkoutUrl;
        } catch (paymentSetupError) {
            console.error(
                "El pedido se creó, pero no se pudo iniciar Mercado Pago:",
                paymentSetupError
            );

            paymentError =
                getErrorMessage(
                    paymentSetupError
                ) ??
                "El pedido quedó registrado, pero no pudimos abrir Mercado Pago.";
        }
    }

    return {
        success: true,
        orderId:
            result.order_id,
        orderNumber:
            result.order_number,
        total:
            result.total ?? 0,
        checkoutUrl,
        paymentError,
    };
}

export async function updateOrderStatus(
    orderId: string,
    newStatus: string
): Promise<UpdateOrderStatusResult> {
    const supabase =
        await createClient();

    const normalizedOrderId =
        orderId.trim();

    const normalizedStatus =
        newStatus.trim();

    if (
        !normalizedOrderId
    ) {
        return {
            success: false,
            error:
                "No se encontró el pedido.",
        };
    }

    if (
        !VALID_ORDER_STATUSES.includes(
            normalizedStatus as
            (typeof VALID_ORDER_STATUSES)[number]
        )
    ) {
        return {
            success: false,
            error:
                "El estado seleccionado no es válido.",
        };
    }

    const {
        data: {
            user,
        },
        error:
        userError,
    } =
        await supabase.auth.getUser();

    if (
        userError ||
        !user
    ) {
        return {
            success: false,
            error:
                "Tenés que iniciar sesión para gestionar pedidos.",
        };
    }

    const {
        data:
        profile,
        error:
        profileError,
    } =
        await supabase
            .from(
                "profiles"
            )
            .select(
                "is_admin"
            )
            .eq(
                "id",
                user.id
            )
            .maybeSingle();

    if (
        profileError ||
        !profile?.is_admin
    ) {
        return {
            success: false,
            error:
                "No tenés permisos para gestionar pedidos.",
        };
    }

    const {
        data,
        error,
    } =
        await supabase.rpc(
            "update_order_status",
            {
                p_order_id:
                    normalizedOrderId,

                p_new_status:
                    normalizedStatus,
            }
        );

    if (error) {
        console.error(
            "Error al actualizar el estado del pedido:",
            error
        );

        return {
            success: false,
            error:
                error.message ||
                "No se pudo actualizar el estado del pedido.",
        };
    }

    const result =
        data as
        | {
            status?: string;
        }
        | null;

    /*
     * IMPORTANTE:
     *
     * Acá NO hacemos redirect().
     *
     * La acción solamente actualiza el pedido y
     * devuelve el resultado al componente cliente.
     * OrderStatusManager decide qué hacer después.
     *
     * De esta forma, al cambiar:
     *
     * Pago confirmado → En preparación → Listo → Completado
     *
     * el administrador permanece siempre dentro
     * del mismo pedido.
     */
    revalidatePath(
        "/administracion/pedidos"
    );

    revalidatePath(
        `/administracion/pedidos/${normalizedOrderId}`
    );

    revalidatePath(
        "/mi-cuenta/pedidos"
    );

    revalidatePath(
        `/mi-cuenta/pedidos/${normalizedOrderId}`
    );

    /*
     * Algunos cambios de estado afectan stock.
     * Revalidamos también las pantallas donde
     * ese stock puede mostrarse.
     */
    revalidatePath(
        "/catalogo"
    );

    revalidatePath(
        "/administracion/productos"
    );

    revalidatePath(
        "/"
    );

    return {
        success: true,
        status:
            result?.status ??
            normalizedStatus,
    };
}