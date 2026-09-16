import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="border-b border-neutral-300 bg-[#f1efe9]">
            <div className="mx-auto grid max-w-7xl lg:grid-cols-[42%_58%]">
                {/* Contenido */}
                <div className="flex min-h-[560px] items-center px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
                    <div className="w-full max-w-md">
                        <p className="whitespace-nowrap text-xs uppercase tracking-[0.24em] text-neutral-500">
                            Joyería & Platería · Paysandú
                        </p>

                        <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-tight text-neutral-900 sm:text-6xl lg:text-[64px]">
                            El oficio detrás
                            <br />
                            de cada pieza.
                        </h1>

                        <p className="mt-6 max-w-md text-sm leading-7 text-neutral-600 sm:text-base">
                            Joyería y platería con una tradición de oficio,
                            experiencia y atención por cada detalle.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/catalogo"
                                className="bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                            >
                                Explorar catálogo
                            </Link>

                            <Link
                                href="/la-joyeria"
                                className="border border-neutral-400 px-6 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-white/50"
                            >
                                Conocer Lezcano
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Fotografía principal */}
                <div className="relative min-h-[500px] overflow-hidden lg:min-h-[560px]">
                    <Image
                        src="/images/lezcano/joyero.jpg"
                        alt="Joyero trabajando en el taller de Lezcano"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover"
                        style={{ objectPosition: "center 42%" }}
                    />
                </div>
            </div>
        </section>
    );
}