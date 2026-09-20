import { Reveal } from "@/app/components/Reveal";

const WHATSAPP_NUMBER = "59899726968";

function getWhatsAppUrl(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
    )}`;
}

const SERVICES = [
    {
        title: "Reparaciones",
        description:
            "Evaluamos piezas que necesitan ajuste, reparación o recuperación. Cada caso se revisa de forma particular.",
        whatsapp:
            "Hola, estoy visitando la web de Joyería Lezcano y quería consultar por una reparación.",
    },
    {
        title: "Trabajos personalizados",
        description:
            "Desarrollamos trabajos a medida a partir de una idea, una referencia o una necesidad concreta.",
        whatsapp:
            "Hola, estoy visitando la web de Joyería Lezcano y quería consultar por un trabajo personalizado.",
    },
    {
        title: "Piezas por encargo",
        description:
            "Algunas piezas y trabajos se realizan especialmente por encargo. Consultanos para conocer posibilidades, tiempos y detalles.",
        whatsapp:
            "Hola, estoy visitando la web de Joyería Lezcano y quería consultar por una pieza por encargo.",
    },
    {
        title: "Otros trabajos",
        description:
            "Si tenés una pieza, material o idea particular, escribinos. Podemos evaluar el trabajo y orientarte antes de avanzar.",
        whatsapp:
            "Hola, estoy visitando la web de Joyería Lezcano y quería hacer una consulta sobre un trabajo.",
    },
];

export default function ServiciosPage() {
    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#dfd3c3] bg-[linear-gradient(135deg,#f7f1e7_0%,#fbf8f2_55%,#efe5d5_100%)]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#a87636] sm:text-[10px]">
                            El taller
                        </p>

                        <div className="mt-1.5 grid gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
                            <h1 className="max-w-xl font-serif text-[30px] leading-[1.05] tracking-[-0.035em] text-[#211c19] sm:text-4xl">
                                Reparar, transformar y crear.
                            </h1>

                            <p className="max-w-2xl text-sm leading-6 text-[#6d625a] sm:text-[15px]">
                                Además de las piezas disponibles en catálogo, en Lezcano
                                trabajamos sobre piezas existentes y desarrollamos
                                encargos especiales.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
                <div className="grid gap-3.5 md:grid-cols-2">
                    {SERVICES.map((service, index) => (
                        <Reveal
                            key={service.title}
                            soft
                            delay={index * 70}
                        >
                            <article className="group relative flex h-full min-h-[225px] flex-col overflow-hidden rounded-[22px] border border-[#decfba] bg-[linear-gradient(145deg,#fffdfa_0%,#faf4e9_100%)] p-5 shadow-[0_10px_28px_rgba(63,45,23,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-[#caa66d] hover:shadow-[0_16px_34px_rgba(63,45,23,0.08)] sm:p-6">
                                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#d9b77d]/12 blur-2xl" />

                                <div className="relative z-10 flex h-full flex-col">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[#d8bd91] bg-white/80 px-2 text-[9px] font-semibold tracking-[0.16em] text-[#9a6c31]">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <span className="h-2 w-2 rounded-full bg-[#c99b56]" />
                                    </div>

                                    <h2 className="mt-4 font-serif text-[25px] leading-tight tracking-[-0.025em] text-[#241f1c] transition-colors duration-300 group-hover:text-[#8a632f] sm:text-[28px]">
                                        {service.title}
                                    </h2>

                                    <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#6d625a]">
                                        {service.description}
                                    </p>

                                    <a
                                        href={getWhatsAppUrl(service.whatsapp)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="lezcano-arrow mt-auto inline-flex w-fit pt-5 text-sm font-semibold text-[#7b582c] transition hover:text-[#a87636]"
                                    >
                                        Consultar por WhatsApp

                                        <span className="arrow">
                                            →
                                        </span>
                                    </a>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal soft>
                    <div className="relative mt-5 overflow-hidden rounded-[22px] border border-[#d7c5aa] bg-[#ede2d1] px-5 py-5 shadow-[0_10px_28px_rgba(63,45,23,0.04)] sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-5">
                        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#cda66a]/15 blur-3xl" />

                        <div className="relative">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#93652f]">
                                ¿No encontrás lo que buscás?
                            </p>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#665b52]">
                                Escribinos directamente y contanos qué necesitás.
                                El joyero puede orientarte sobre las posibilidades
                                del trabajo.
                            </p>
                        </div>

                        <a
                            href={getWhatsAppUrl(
                                "Hola, estoy visitando la web de Joyería Lezcano y quería hacer una consulta sobre un trabajo."
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lezcano-button relative mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1d1b19] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(29,27,25,0.12)] transition hover:bg-[#9a6c31] sm:mt-0"
                        >
                            Hacer una consulta
                            <span className="ml-2">→</span>
                        </a>
                    </div>
                </Reveal>
            </section>
        </main>
    );
}
