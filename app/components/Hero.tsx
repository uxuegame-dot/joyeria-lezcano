import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="border-b border-[#ddd1c0] bg-[#f4eee5]">
            <div className="mx-auto max-w-7xl px-3.5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                <div className="grid overflow-hidden rounded-[20px] border border-[#d8c9b5] bg-[#fbf7f0] shadow-[0_16px_42px_rgba(74,54,32,0.06)] lg:min-h-[450px] lg:grid-cols-[44%_56%]">
                    <div className="relative flex items-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11">
                        <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#d6b781]/15 blur-3xl" />

                        <div className="relative z-10 max-w-lg">
                            <div className="flex items-center gap-2.5">
                                <span className="h-px w-7 bg-[#b17942]" />

                                <p className="text-[9px] font-semibold uppercase tracking-[0.23em] text-[#8e6637] sm:text-[10px]">
                                    Joyería & Platería · Paysandú
                                </p>
                            </div>

                            <h1 className="mt-4 font-serif text-[34px] leading-[0.99] tracking-[-0.035em] text-[#1e1b17] sm:text-[43px] lg:text-[50px]">
                                Piezas con historia,
                                <br />
                                hechas para durar.
                            </h1>

                            <p className="mt-4 max-w-md text-[13px] leading-6 text-[#675e54] sm:text-sm sm:leading-6">
                                Joyería en plata y oro, piezas para regalar y trabajos
                                realizados con la experiencia de un oficio que atraviesa
                                generaciones.
                            </p>

                            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                                <Link
                                    href="/catalogo"
                                    className="lezcano-button inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#1b1916] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9a6f3e]"
                                >
                                    Explorar catálogo
                                </Link>

                                <Link
                                    href="/la-joyeria"
                                    className="inline-flex min-h-11 items-center justify-center rounded-[12px] border border-[#cdbda8] bg-white/60 px-5 py-3 text-sm font-medium text-[#2c2721] transition hover:border-[#b17942] hover:bg-[#f2e7d7]"
                                >
                                    Conocer Lezcano
                                </Link>
                            </div>

                            <div className="mt-7 flex items-center gap-3">
                                <span className="h-px w-9 bg-[#b17942]" />
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#7b7065]">
                                    Tradición de oficio
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative min-h-[290px] overflow-hidden bg-[#b69a75] sm:min-h-[350px] lg:min-h-[450px]">
                        <Image
                            src="/images/lezcano/joyero.jpg"
                            alt="Joyero trabajando en el taller de Lezcano"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 56vw"
                            className="object-cover transition-transform duration-[1500ms] hover:scale-[1.015]"
                            style={{
                                objectPosition: "center 42%",
                            }}
                        />

                        <div className="pointer-events-none absolute inset-0 bg-[#b1844f]/[0.07]" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                        <div className="absolute bottom-4 left-4 rounded-[12px] border border-white/30 bg-[#17140f]/55 px-3.5 py-2.5 text-white backdrop-blur-md sm:bottom-6 sm:left-6 sm:px-4 sm:py-3">
                            <p className="text-[8px] uppercase tracking-[0.22em] text-[#e1c9a1] sm:text-[9px]">
                                El taller
                            </p>

                            <p className="mt-1 font-serif text-base sm:text-lg">
                                Paysandú, Uruguay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
