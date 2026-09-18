import "server-only";

type CreateMercadoPagoCheckoutInput = {
    internalOrderId: string;
    orderNumber: number | string;
    payerEmail: string;
    total: number | string;
};

type CreateMercadoPagoCheckoutResult = {
    mercadoPagoOrderId: string;
    checkoutUrl: string;
};

type MercadoPagoOrderResponse = {
    id?: string;
    checkout_url?: string;
    message?: string;
    error?: string;
    details?: Array<{
        code?: string;
        description?: string;
        message?: string;
    }>;
};

const MERCADO_PAGO_ORDERS_URL =
    "https://api.mercadopago.com/v1/orders";

function getAccessToken() {
    const token =
        process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

    if (!token) {
        throw new Error(
            "Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno."
        );
    }

    return token;
}

function getSiteUrl() {
    const configuredUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (configuredUrl) {
        return configuredUrl.replace(/\/+$/, "");
    }

    const vercelUrl =
        process.env.VERCEL_URL?.trim();

    if (vercelUrl) {
        return `https://${vercelUrl}`.replace(
            /\/+$/,
            ""
        );
    }

    return "http://localhost:3000";
}

function getStoreName() {
    return (
        process.env.NEXT_PUBLIC_STORE_NAME?.trim() ||
        "Joyería Lezcano"
    );
}

function normalizeAmount(
    value: number | string
) {
    const amount = Number(value);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        throw new Error(
            "El total del pedido no es válido para generar el pago."
        );
    }

    return amount.toFixed(2);
}

function getMercadoPagoErrorMessage(
    data: MercadoPagoOrderResponse
) {
    const detail =
        data.details?.find(
            (item) =>
                item.description ||
                item.message ||
                item.code
        );

    if (detail) {
        return (
            detail.description ||
            detail.message ||
            detail.code ||
            "Error desconocido"
        );
    }

    return (
        data.message ||
        data.error ||
        "Mercado Pago rechazó la creación del checkout."
    );
}

export async function createMercadoPagoCheckout(
    input: CreateMercadoPagoCheckoutInput
): Promise<CreateMercadoPagoCheckoutResult> {
    const accessToken =
        getAccessToken();

    const siteUrl =
        getSiteUrl();

    const storeName =
        getStoreName();

    const totalAmount =
        normalizeAmount(
            input.total
        );

    const orderNumber =
        String(
            input.orderNumber
        );

    /*
     * Usamos el UUID del pedido interno como clave
     * de idempotencia. Para un mismo pedido, repetir
     * accidentalmente esta solicitud no debería crear
     * dos orders de Mercado Pago.
     */
    const idempotencyKey =
        input.internalOrderId;

    const resultBaseUrl =
        `${siteUrl}/pago/resultado`;

    const response =
        await fetch(
            MERCADO_PAGO_ORDERS_URL,
            {
                method: "POST",
                headers: {
                    Accept:
                        "application/json",
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${accessToken}`,
                    "X-Idempotency-Key":
                        idempotencyKey,
                },
                body: JSON.stringify({
                    type: "online",
                    processing_mode:
                        "manual",
                    total_amount:
                        totalAmount,
                    external_reference:
                        input.internalOrderId,
                    description:
                        `${storeName} · Pedido #${orderNumber}`,
                    payer: {
                        email:
                            input.payerEmail,
                    },
                    config: {
                        online: {
                            success_url:
                                `${resultBaseUrl}?resultado=aprobado&pedido=${encodeURIComponent(
                                    orderNumber
                                )}`,
                            failure_url:
                                `${resultBaseUrl}?resultado=rechazado&pedido=${encodeURIComponent(
                                    orderNumber
                                )}`,
                            pending_url:
                                `${resultBaseUrl}?resultado=pendiente&pedido=${encodeURIComponent(
                                    orderNumber
                                )}`,
                            auto_return:
                                "all",
                        },
                    },
                }),
                cache: "no-store",
            }
        );

    let data: MercadoPagoOrderResponse =
        {};

    try {
        data =
            (await response.json()) as MercadoPagoOrderResponse;
    } catch {
        // Mercado Pago devolvió una respuesta sin JSON útil.
    }

    if (!response.ok) {
        console.error(
            "Error al crear order de Mercado Pago:",
            {
                status:
                    response.status,
                data,
            }
        );

        throw new Error(
            getMercadoPagoErrorMessage(
                data
            )
        );
    }

    if (
        !data.id ||
        !data.checkout_url
    ) {
        console.error(
            "Respuesta inesperada de Mercado Pago:",
            data
        );

        throw new Error(
            "Mercado Pago creó una respuesta incompleta y no pudimos iniciar el pago."
        );
    }

    return {
        mercadoPagoOrderId:
            data.id,
        checkoutUrl:
            data.checkout_url,
    };
}