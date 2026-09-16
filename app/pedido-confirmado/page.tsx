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
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="border border-neutral-200 bg-white px-6 py-14 text-center sm:px-10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-xl text-white">
                    ✓
                </div>

                <p className="mt-6 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Pedido recibido
                </p>

                <h1 className="mt-3 font-serif text-3xl text-neutral-900 sm:text-4xl">
                    ¡Gracias por tu pedido!
                </h1>

                {numero && (
                    <p className="mt-5 text-base font-medium text-neutral-900">
                        Pedido #{numero}
                    </p>
                )}

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-neutral-600">
                    Registramos correctamente tu
                    pedido. La joyería se pondrá en
                    contacto contigo para coordinar
                    los siguientes pasos.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/catalogo"
                        className="bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Seguir viendo piezas
                    </Link>

                    <Link
                        href="/"
                        className="border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}