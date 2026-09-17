import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="overflow-hidden border-b border-[#d8cdbd] bg-[#f6f0e6]">
            <div className="mx-auto grid max-w-7xl lg:min-h-[620px] lg:grid-cols-[46%_54%]">

                {/* Contenido */}
                <div className="relative flex items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
                    <div className="relative z-10 max-w-lg">

                        <div className="flex items-center gap-3">
                            <span className="h-px w-7 bg-[#b28a53]" />

                            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#98713e] sm:text-xs">
                                Joyería & Platería · Paysandú
                            </p>
                        </div>

                        <h1 className="mt-7 font-serif text-[48px] leading-[0.98] tracking-[-0.025em] text-[#181714] sm:text-6xl lg:text-[68px]">
                            Piezas con historia,
                            <br />
                            hechas para durar.
                        </h1>

                        <p className="mt-7 max-w-md text-base leading-7 text-[#625d55] lg:text-[17px]">
                            Joyería en plata y oro, piezas para regalar y trabajos
                            realizados con la experiencia de un oficio que atraviesa
                            generaciones.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link
                                href="/catalogo"
                                className="bg-[#181714] px-7 py-4 text-sm font-medium text-white transition duration-300 hover:bg-[#9a7541]"
                            >
                                Explorar catálogo
                            </Link>

                            <Link
                                href="/la-joyeria"
                                className="border border-[#b9ad9b] px-7 py-4 text-sm font-medium text-[#181714] transition duration-300 hover:border-[#9a7541] hover:bg-[#eee4d5]"
                            >
                                Conocer Lezcano
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-4">
                            <span className="h-px w-10 bg-[#b28a53]" />

                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#756d62]">
                                Tradición de oficio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fotografía principal */}
                <div className="relative min-h-[480px] overflow-hidden bg-[#b69a75] sm:min-h-[560px] lg:min-h-[620px]">
                    <Image
                        src="/images/lezcano/joyero.jpg"
                        alt="Joyero trabajando en el taller de Lezcano"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 54vw"
                        className="object-cover transition-transform duration-[1500ms] hover:scale-[1.015]"
                        style={{
                            objectPosition: "center 42%",
                        }}
                    />

                    {/* Calidez sutil sobre la fotografía en blanco y negro */}
                    <div className="pointer-events-none absolute inset-0 bg-[#b1844f]/[0.07]" />

                    {/* Profundidad inferior */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    {/* Sello */}
                    <div className="absolute bottom-6 left-6 border border-white/35 bg-[#17140f]/55 px-4 py-3 text-white backdrop-blur-sm sm:bottom-8 sm:left-8">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#dbc49e]">
                            El taller
                        </p>

                        <p className="mt-1 font-serif text-lg">
                            Paysandú, Uruguay
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}