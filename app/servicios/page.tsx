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
        <main className="bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#9a7541] sm:text-[11px]">
                            El taller
                        </p>

                        <h1 className="mt-2.5 max-w-3xl font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl">
                            Reparar, transformar y crear.
                        </h1>

                        <p className="mt-3.5 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
                            Además de las piezas disponibles en catálogo, en Lezcano
                            trabajamos sobre piezas existentes y desarrollamos
                            encargos especiales.
                        </p>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
                <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2">
                    {SERVICES.map((service, index) => (
                        <Reveal
                            key={service.title}
                            soft
                            delay={index * 70}
                        >
                            <article className="group relative overflow-hidden border border-[#d8cfc1] bg-white p-5 transition duration-500 hover:-translate-y-1 hover:border-[#b28a53] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] sm:p-7">
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#b28a53] transition-transform duration-500 group-hover:scale-x-100" />

                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                                    {String(index + 1).padStart(2, "0")}
                                </p>

                                <h2 className="mt-2.5 font-serif text-2xl text-neutral-900 transition-colors duration-300 group-hover:text-[#8a693c] sm:text-3xl">
                                    {service.title}
                                </h2>

                                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:leading-7">
                                    {service.description}
                                </p>

                                <a
                                    href={getWhatsAppUrl(service.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lezcano-arrow mt-5 inline-flex items-center gap-2 border-b border-[#b28a53] pb-1 text-sm font-medium text-neutral-900 transition hover:text-[#9a7541] sm:mt-6"
                                >
                                    Consultar por WhatsApp

                                    <span className="arrow">
                                        →
                                    </span>
                                </a>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal soft>
                    <div className="group mt-7 overflow-hidden border border-[#d8cfc1] bg-[#eee8de] px-5 py-5 transition duration-500 hover:border-[#b28a53] sm:mt-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7 sm:py-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                                ¿No encontrás lo que buscás?
                            </p>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
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
                            className="lezcano-button mt-4 inline-flex min-h-11 shrink-0 items-center justify-center bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#9a7541] sm:mt-0"
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