import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="overflow-hidden border-b border-[#d8cdbd] bg-[#f6f0e6]">
            <div className="mx-auto grid max-w-7xl lg:min-h-[600px] lg:grid-cols-[46%_54%]">

                {/* Contenido */}
                <div className="relative flex items-center px-5 py-10 sm:px-8 sm:py-14 lg:px-14 lg:py-20">
                    <div className="relative z-10 max-w-lg">

                        <div className="flex items-center gap-2.5">
                            <span className="h-px w-6 bg-[#b28a53] sm:w-7" />

                            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#98713e] sm:text-[11px] sm:tracking-[0.28em] lg:text-xs">
                                Joyería & Platería · Paysandú
                            </p>
                        </div>

                        <h1 className="mt-5 font-serif text-[38px] leading-[1] tracking-[-0.025em] text-[#181714] sm:mt-6 sm:text-[52px] lg:text-[64px]">
                            Piezas con historia,
                            <br />
                            hechas para durar.
                        </h1>

                        <p className="mt-5 max-w-md text-sm leading-6 text-[#625d55] sm:mt-6 sm:text-base sm:leading-7 lg:text-[17px]">
                            Joyería en plata y oro, piezas para regalar y trabajos
                            realizados con la experiencia de un oficio que atraviesa
                            generaciones.
                        </p>

                        <div className="mt-6 grid gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
                            <Link
                                href="/catalogo"
                                className="flex min-h-11 items-center justify-center bg-[#181714] px-5 py-3 text-sm font-medium text-white transition duration-300 hover:bg-[#9a7541] sm:px-6"
                            >
                                Explorar catálogo
                            </Link>

                            <Link
                                href="/la-joyeria"
                                className="flex min-h-11 items-center justify-center border border-[#b9ad9b] px-5 py-3 text-sm font-medium text-[#181714] transition duration-300 hover:border-[#9a7541] hover:bg-[#eee4d5] sm:px-6"
                            >
                                Conocer Lezcano
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center gap-3 sm:mt-9 sm:gap-4">
                            <span className="h-px w-8 bg-[#b28a53] sm:w-10" />

                            <p className="text-[10px] uppercase tracking-[0.18em] text-[#756d62] sm:text-[11px] sm:tracking-[0.2em]">
                                Tradición de oficio
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fotografía principal */}
                <div className="relative min-h-[340px] overflow-hidden bg-[#b69a75] sm:min-h-[440px] lg:min-h-[600px]">
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
                    <div className="absolute bottom-4 left-4 border border-white/35 bg-[#17140f]/55 px-3 py-2.5 text-white backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-4 sm:py-3 lg:bottom-8 lg:left-8">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#dbc49e] sm:text-[10px] sm:tracking-[0.25em]">
                            El taller
                        </p>

                        <p className="mt-1 font-serif text-base sm:text-lg">
                            Paysandú, Uruguay
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}