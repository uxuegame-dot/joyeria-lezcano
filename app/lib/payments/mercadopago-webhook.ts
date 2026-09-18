import "server-only";

import {
    createHmac,
    timingSafeEqual,
} from "node:crypto";

const MERCADO_PAGO_ORDERS_URL =
    "https://api.mercadopago.com/v1/orders";

export type MercadoPagoPayment = {
    id?: string;
    amount?: string;
    paid_amount?: string;
    confirmed_amount?: string;
    status?: string;
    status_detail?: string;
};

export type MercadoPagoOrder = {
    id?: string;
    type?: string;
    processing_mode?: string;
    status?: string;
    status_detail?: string;
    external_reference?: string;
    total_amount?: string;
    total_paid_amount?: string;
    currency?: string;
    transactions?: {
        payments?: MercadoPagoPayment[];
    };
};

function getAccessToken() {
    const accessToken =
        process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

    if (!accessToken) {
        throw new Error(
            "Falta MERCADOPAGO_ACCESS_TOKEN."
        );
    }

    return accessToken;
}

function getWebhookSecret() {
    const secret =
        process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();

    if (!secret) {
        throw new Error(
            "Falta MERCADOPAGO_WEBHOOK_SECRET."
        );
    }

    return secret;
}

function parseSignature(
    xSignature: string
) {
    const parts =
        new Map<string, string>();

    for (
        const part of
        xSignature.split(",")
    ) {
        const [
            rawKey,
            ...rawValue
        ] = part.split("=");

        const key =
            rawKey?.trim();

        const value =
            rawValue
                .join("=")
                .trim();

        if (
            key &&
            value
        ) {
            parts.set(
                key,
                value
            );
        }
    }

    return {
        ts:
            parts.get("ts") ??
            "",
        v1:
            parts.get("v1") ??
            "",
    };
}

function safeCompareHex(
    expectedHex: string,
    receivedHex: string
) {
    if (
        !/^[a-f0-9]+$/i.test(
            expectedHex
        ) ||
        !/^[a-f0-9]+$/i.test(
            receivedHex
        )
    ) {
        return false;
    }

    const expected =
        Buffer.from(
            expectedHex,
            "hex"
        );

    const received =
        Buffer.from(
            receivedHex,
            "hex"
        );

    if (
        expected.length !==
        received.length
    ) {
        return false;
    }

    return timingSafeEqual(
        expected,
        received
    );
}

function calculateSignature(
    dataId: string,
    requestId: string,
    timestamp: string,
    secret: string
) {
    const manifest =
        `id:${dataId};request-id:${requestId};ts:${timestamp};`;

    return createHmac(
        "sha256",
        secret
    )
        .update(
            manifest,
            "utf8"
        )
        .digest(
            "hex"
        );
}

export function verifyMercadoPagoWebhookSignature(
    input: {
        xSignature: string;
        xRequestId: string;
        dataId: string;
    }
) {
    const secret =
        getWebhookSecret();

    const {
        ts,
        v1,
    } = parseSignature(
        input.xSignature
    );

    if (
        !ts ||
        !v1 ||
        !input.xRequestId ||
        !input.dataId
    ) {
        return false;
    }

    /*
     * Mercado Pago documenta el manifiesto:
     *
     * id:<data.id>;request-id:<x-request-id>;ts:<ts>;
     *
     * Algunos recursos alfanuméricos son
     * normalizados a minúsculas por los SDKs.
     * Aceptamos ambas representaciones válidas
     * para mantener compatibilidad con el tópico order.
     */
    const candidates = [
        input.dataId,
        input.dataId.toLowerCase(),
    ];

    for (
        const dataId of
        new Set(candidates)
    ) {
        const expected =
            calculateSignature(
                dataId,
                input.xRequestId,
                ts,
                secret
            );

        if (
            safeCompareHex(
                expected,
                v1
            )
        ) {
            return true;
        }
    }

    return false;
}

export async function getMercadoPagoOrder(
    orderId: string
): Promise<MercadoPagoOrder> {
    const accessToken =
        getAccessToken();

    const response =
        await fetch(
            `${MERCADO_PAGO_ORDERS_URL}/${encodeURIComponent(
                orderId
            )}`,
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json",
                    Authorization:
                        `Bearer ${accessToken}`,
                },
                cache:
                    "no-store",
            }
        );

    let data: MercadoPagoOrder & {
        message?: string;
        error?: string;
    } = {};

    try {
        data =
            (await response.json()) as typeof data;
    } catch {
        // Sin cuerpo JSON útil.
    }

    if (!response.ok) {
        console.error(
            "Error al consultar Order en Mercado Pago:",
            {
                status:
                    response.status,
                data,
            }
        );

        throw new Error(
            data.message ||
            data.error ||
            `Mercado Pago respondió ${response.status}.`
        );
    }

    return data;
}

export function getPrimaryMercadoPagoPayment(
    order: MercadoPagoOrder
) {
    const payments =
        order.transactions
            ?.payments ??
        [];

    if (
        payments.length === 0
    ) {
        return null;
    }

    /*
     * Priorizamos una transacción acreditada.
     * Si todavía no existe, usamos la última
     * informada por Mercado Pago.
     */
    return (
        payments.find(
            (payment) =>
                payment.status ===
                "processed" &&
                payment.status_detail ===
                "accredited"
        ) ??
        payments[
        payments.length - 1
        ]
    );
}

export function getPaidAmount(
    order: MercadoPagoOrder
) {
    const totalPaidAmount =
        Number(
            order.total_paid_amount ??
            0
        );

    if (
        Number.isFinite(
            totalPaidAmount
        ) &&
        totalPaidAmount > 0
    ) {
        return totalPaidAmount;
    }

    const payments =
        order.transactions
            ?.payments ??
        [];

    return payments.reduce(
        (
            total,
            payment
        ) => {
            const amount =
                Number(
                    payment.paid_amount ??
                    0
                );

            return (
                total +
                (Number.isFinite(
                    amount
                )
                    ? amount
                    : 0)
            );
        },
        0
    );
}