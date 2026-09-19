import {
    NextResponse,
} from "next/server";
import {
    revalidatePath,
} from "next/cache";

import {
    getMercadoPagoOrder,
    getPaidAmount,
    getPrimaryMercadoPagoPayment,
    verifyMercadoPagoWebhookSignature,
} from "@/app/lib/payments/mercadopago-webhook";

import {
    createAdminClient,
} from "@/app/lib/supabase/admin";

export const runtime =
    "nodejs";

export const dynamic =
    "force-dynamic";

type MercadoPagoNotificationBody = {
    action?: string;
    type?: string;
    data?: {
        id?: string;
    };
};

function isUuid(
    value: string
) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
    );
}

export async function POST(
    request: Request
) {
    let body:
        MercadoPagoNotificationBody =
        {};

    try {
        body =
            (await request.json()) as MercadoPagoNotificationBody;
    } catch {
        /*
         * La firma se valida con headers +
         * data.id. Si el body no fuese JSON,
         * seguimos usando el query param.
         */
    }

    const url =
        new URL(
            request.url
        );

    const notificationType =
        url.searchParams.get(
            "type"
        ) ??
        body.type ??
        "";

    /*
     * Esta ruta está configurada únicamente
     * para el tópico Order (Mercado Pago).
     * Ignoramos cualquier otro tópico sin
     * tratarlo como error para evitar reintentos.
     */
    if (
        notificationType &&
        notificationType !==
        "order"
    ) {
        return NextResponse.json(
            {
                received: true,
                ignored: true,
            },
            {
                status: 200,
            }
        );
    }

    const dataId =
        url.searchParams.get(
            "data.id"
        ) ??
        body.data?.id ??
        "";

    const xSignature =
        request.headers.get(
            "x-signature"
        ) ??
        "";

    const xRequestId =
        request.headers.get(
            "x-request-id"
        ) ??
        "";

    if (
        !dataId ||
        !xSignature ||
        !xRequestId
    ) {
        return NextResponse.json(
            {
                error:
                    "Notificación incompleta.",
            },
            {
                status: 400,
            }
        );
    }

    let signatureIsValid =
        false;

    try {
        signatureIsValid =
            verifyMercadoPagoWebhookSignature(
                {
                    xSignature,
                    xRequestId,
                    dataId,
                }
            );
    } catch (error) {
        console.error(
            "No se pudo validar la firma de Mercado Pago:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Webhook no configurado.",
            },
            {
                status: 500,
            }
        );
    }

    if (
        !signatureIsValid
    ) {
        console.warn(
            "Webhook de Mercado Pago rechazado por firma inválida.",
            {
                dataId,
                xRequestId,
            }
        );

        return NextResponse.json(
            {
                error:
                    "Firma inválida.",
            },
            {
                status: 401,
            }
        );
    }

    /*
     * No confiamos en el status enviado en
     * el body del webhook.
     *
     * Consultamos la Order directamente a
     * Mercado Pago con nuestro Access Token.
     */
    let mercadoPagoOrder;

    try {
        mercadoPagoOrder =
            await getMercadoPagoOrder(
                dataId
            );
    } catch (error) {
        console.error(
            "No se pudo consultar la Order notificada:",
            error
        );

        /*
         * 500 hace que Mercado Pago vuelva
         * a intentar la notificación.
         */
        return NextResponse.json(
            {
                error:
                    "No se pudo consultar la Order.",
            },
            {
                status: 500,
            }
        );
    }

    const internalOrderId =
        mercadoPagoOrder
            .external_reference
            ?.trim() ??
        "";

    /*
     * external_reference fue creada por
     * nosotros usando el UUID del pedido.
     * Si no coincide con nuestro formato,
     * no tocamos la base de datos.
     */
    if (
        !isUuid(
            internalOrderId
        )
    ) {
        console.warn(
            "Order de Mercado Pago sin external_reference válida.",
            {
                mercadoPagoOrderId:
                    mercadoPagoOrder.id,
                externalReference:
                    mercadoPagoOrder.external_reference,
            }
        );

        return NextResponse.json(
            {
                received: true,
                ignored: true,
            },
            {
                status: 200,
            }
        );
    }

    const primaryPayment =
        getPrimaryMercadoPagoPayment(
            mercadoPagoOrder
        );

    const paidAmount =
        getPaidAmount(
            mercadoPagoOrder
        );

    const supabaseAdmin =
        createAdminClient();

    const {
        data:
        syncResult,
        error:
        syncError,
    } =
        await supabaseAdmin.rpc(
            "apply_mercadopago_order_state",
            {
                p_order_id:
                    internalOrderId,

                p_mp_order_id:
                    mercadoPagoOrder.id ??
                    dataId,

                p_mp_status:
                    mercadoPagoOrder.status ??
                    "unknown",

                p_mp_status_detail:
                    mercadoPagoOrder.status_detail ??
                    "",

                p_mp_payment_id:
                    primaryPayment?.id ??
                    null,

                p_paid_amount:
                    paidAmount,
            }
        );

    if (
        syncError
    ) {
        console.error(
            "No se pudo sincronizar Mercado Pago con el pedido:",
            syncError
        );

        return NextResponse.json(
            {
                error:
                    "No se pudo actualizar el pedido.",
            },
            {
                status: 500,
            }
        );
    }

    /*
     * Refrescamos las pantallas afectadas.
     */
    revalidatePath(
        "/administracion/pedidos"
    );

    revalidatePath(
        `/administracion/pedidos/${internalOrderId}`
    );

    revalidatePath(
        "/administracion/dashboard"
    );

    revalidatePath(
        "/mi-cuenta/pedidos"
    );

    revalidatePath(
        `/mi-cuenta/pedidos/${internalOrderId}`
    );

    revalidatePath(
        "/administracion/productos"
    );

    revalidatePath(
        "/catalogo"
    );

    revalidatePath(
        "/"
    );

    console.info(
        "Webhook de Mercado Pago procesado.",
        {
            action:
                body.action,
            mercadoPagoOrderId:
                mercadoPagoOrder.id ??
                dataId,
            internalOrderId,
            mercadoPagoStatus:
                mercadoPagoOrder.status,
            mercadoPagoStatusDetail:
                mercadoPagoOrder.status_detail,
            paidAmount,
            syncResult,
        }
    );

    /*
     * Mercado Pago considera recibida la
     * notificación con HTTP 200 o 201.
     */
    return NextResponse.json(
        {
            received: true,
        },
        {
            status: 200,
        }
    );
}