import Link from "next/link";

type PaymentResultPageProps = {
    searchParams: Promise<{
        resultado?: string;
        pedido?: string;
        external_reference?: string;
        order_id?: string;
        payment_id?: string;
        status?: string;
    }>;
};

function getResultContent(
    result?: string
) {
    switch (result) {
        case "aprobado":
            return {
                eyebrow:
                    "Pago recibido",
                title:
                    "Tu pago fue aprobado",
                description:
                    "Mercado Pago procesó el pago. Estamos confirmando la operación y el estado del pedido se actualizará automáticamente.",
                boxClass:
                    "border-emerald-200 bg-emerald-50",
                dotClass:
                    "bg-emerald-500",
            };

        case "pendiente":
            return {
                eyebrow:
                    "Pago pendiente",
                title:
                    "Tu pago está en proceso",
                description:
                    "El pedido quedó registrado. Mercado Pago nos avisará automáticamente cuando el pago cambie de estado.",
                boxClass:
                    "border-[#d6c095] bg-[#f7f0e5]",
                dotClass:
                    "bg-[#b28a53]",
            };

        case "rechazado":
            return {
                eyebrow:
                    "Pago no completado",
                title:
                    "El pago no pudo completarse",
                description:
                    "Tu pedido quedó registrado, pero el pago no fue aprobado. Más adelante vas a poder volver a intentar el pago sin crear otro pedido.",
                boxClass:
                    "border-red-200 bg-red-50",
                dotClass:
                    "bg-red-500",
            };

        default:
            return {
                eyebrow:
                    "Pedido registrado",
                title:
                    "Recibimos tu pedido",
                description:
                    "Estamos verificando el estado del pago. El resultado definitivo siempre se toma desde Mercado Pago, no desde esta pantalla.",
                boxClass:
                    "border-neutral-200 bg-white",
                dotClass:
                    "bg-neutral-400",
            };
    }
}

export default async function PaymentResultPage({
    searchParams,
}: PaymentResultPageProps) {
    const params =
        await searchParams;

    const content =
        getResultContent(
            params.resultado
        );

    const orderNumber =
        params.pedido?.trim();

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
                <div className="border border-[#ddd5c9] bg-white p-6 sm:p-8">
                    <div className="flex items-center gap-2">
                        <span
                            className={`h-2 w-2 rounded-full ${content.dotClass}`}
                        />

                        <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a7541]">
                            {content.eyebrow}
                        </p>
                    </div>

                    <h1 className="mt-3 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                        {content.title}
                    </h1>

                    {orderNumber && (
                        <p className="mt-3 text-sm font-medium text-neutral-900">
                            Pedido #{orderNumber}
                        </p>
                    )}

                    <div
                        className={`mt-6 border px-4 py-4 ${content.boxClass}`}
                    >
                        <p className="text-sm leading-6 text-neutral-700">
                            {content.description}
                        </p>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-neutral-500">
                        Importante: esta página es solamente informativa. La confirmación real del pago se hará desde el servidor consultando a Mercado Pago y mediante sus notificaciones Webhook.
                    </p>

                    <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                        <Link
                            href="/mi-cuenta/pedidos"
                            className="inline-flex min-h-11 items-center justify-center bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Ver mis pedidos
                        </Link>

                        <Link
                            href="/catalogo"
                            className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-900"
                        >
                            Volver al catálogo
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}