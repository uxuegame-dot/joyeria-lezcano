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

function getResultContent(result?: string) {
    switch (result) {
        case "aprobado":
            return {
                eyebrow: "Pago recibido",
                title: "Tu pago fue aprobado",
                description:
                    "Mercado Pago procesó el pago. Estamos confirmando la operación y el estado del pedido se actualizará automáticamente.",
                boxClass:
                    "border-emerald-200 bg-emerald-50 text-emerald-800",
                iconClass:
                    "bg-emerald-100 text-emerald-700",
                icon: "✓",
            };

        case "pendiente":
            return {
                eyebrow: "Pago pendiente",
                title: "Tu pago está en proceso",
                description:
                    "El pedido quedó registrado. Mercado Pago nos avisará automáticamente cuando el pago cambie de estado.",
                boxClass:
                    "border-[#e1cfaa] bg-[#faf3e4] text-[#775a34]",
                iconClass:
                    "bg-[#f2e2bf] text-[#8d6a36]",
                icon: "…",
            };

        case "rechazado":
            return {
                eyebrow: "Pago no completado",
                title: "El pago no pudo completarse",
                description:
                    "Tu pedido quedó registrado, pero el pago no fue aprobado. Más adelante vas a poder volver a intentar el pago sin crear otro pedido.",
                boxClass:
                    "border-red-200 bg-red-50 text-red-800",
                iconClass:
                    "bg-red-100 text-red-700",
                icon: "×",
            };

        default:
            return {
                eyebrow: "Pedido registrado",
                title: "Recibimos tu pedido",
                description:
                    "Estamos verificando el estado del pago. El resultado definitivo siempre se toma desde Mercado Pago.",
                boxClass:
                    "border-[#e2d7c9] bg-[#faf7f2] text-[#655b52]",
                iconClass:
                    "bg-[#efe1cf] text-[#8e6637]",
                icon: "✓",
            };
    }
}

export default async function PaymentResultPage({
    searchParams,
}: PaymentResultPageProps) {
    const params = await searchParams;
    const content = getResultContent(params.resultado);
    const orderNumber = params.pedido?.trim();

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[22px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="bg-gradient-to-br from-[#f2e5d3] via-[#fbf7f0] to-[#efe8df] px-6 py-8 sm:px-8 sm:py-9">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-semibold ${content.iconClass}`}>
                            {content.icon}
                        </div>

                        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            {content.eyebrow}
                        </p>

                        <h1 className="mt-2 font-serif text-3xl leading-tight text-[#211d18] sm:text-4xl">
                            {content.title}
                        </h1>

                        {orderNumber && (
                            <span className="mt-4 inline-flex rounded-full border border-[#d8c6ae] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6d4d2c]">
                                Pedido #{orderNumber}
                            </span>
                        )}
                    </div>

                    <div className="px-6 py-6 sm:px-8">
                        <div className={`rounded-[14px] border px-4 py-4 ${content.boxClass}`}>
                            <p className="text-sm leading-6">
                                {content.description}
                            </p>
                        </div>

                        <p className="mt-4 text-[11px] leading-5 text-[#887d72]">
                            Esta pantalla es informativa. La confirmación real del pago se realiza desde el servidor mediante Mercado Pago y sus notificaciones.
                        </p>

                        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                            <Link
                                href="/mi-cuenta/pedidos"
                                className="lezcano-button inline-flex min-h-11 flex-1 items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-semibold text-white hover:bg-[#9a6f3e]"
                            >
                                Ver mis pedidos
                            </Link>

                            <Link
                                href="/catalogo"
                                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[12px] border border-[#d7c9b7] bg-white px-5 py-3 text-sm font-medium text-[#3b342d] hover:border-[#a77a45] hover:bg-[#f7f0e6]"
                            >
                                Volver al catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
