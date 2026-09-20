import Link from "next/link";

type PedidoConfirmadoPageProps = {
    searchParams: Promise<{
        numero?: string;
    }>;
};

export default async function PedidoConfirmadoPage({
    searchParams,
}: PedidoConfirmadoPageProps) {
    const { numero } = await searchParams;

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[22px] border border-[#d9ccba] bg-[#fffdf9] text-center shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="bg-gradient-to-br from-[#f2e5d3] via-[#fbf7f0] to-[#efe8df] px-6 py-8 sm:px-9 sm:py-10">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1b1916] text-lg text-white">
                            ✓
                        </div>

                        <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Pedido recibido
                        </p>

                        <h1 className="mt-2 font-serif text-3xl text-[#211d18] sm:text-4xl">
                            ¡Gracias por tu pedido!
                        </h1>

                        {numero && (
                            <span className="mt-4 inline-flex rounded-full border border-[#d8c6ae] bg-white/70 px-4 py-2 text-sm font-semibold text-[#6d4d2c]">
                                Pedido #{numero}
                            </span>
                        )}

                        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#6e6358]">
                            Registramos correctamente tu pedido. Podés seguir su estado desde Mi cuenta.
                        </p>
                    </div>

                    <div className="px-6 py-6 sm:px-9">
                        <div className="rounded-[14px] border border-[#e4dacd] bg-[#faf7f2] px-4 py-4 text-left">
                            <p className="text-sm leading-6 text-[#62584f]">
                                Si el pedido requiere confirmación manual, lo revisaremos antes de continuar con el pago o la preparación.
                            </p>
                        </div>

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
                                Seguir viendo piezas
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
