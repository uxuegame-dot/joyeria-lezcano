import Image from "next/image";
import { Reveal } from "@/app/components/Reveal";

const WHATSAPP_URL =
    "https://wa.me/59899726968?text=" +
    encodeURIComponent(
        "Hola, estuve viendo los trabajos realizados en la web de Joyería Lezcano y quería hacer una consulta."
    );

const WORKS = [
    {
        src: "/images/lezcano/trabajo-cuchilla.jpg",
        alt: "Trabajo de platería realizado por Lezcano",
        title: "Trabajo de platería",
    },
    {
        src: "/images/lezcano/trabajo-cabo.jpg",
        alt: "Trabajo de cabo realizado en el taller de Lezcano",
        title: "Trabajo de taller",
    },
    {
        src: "/images/lezcano/trabajo-bombilla.jpg",
        alt: "Trabajo de bombilla realizado en Lezcano",
        title: "Bombilla",
    },
    {
        src: "/images/lezcano/plateria-bombillas.jpg",
        alt: "Bombillas de Platería Lezcano",
        title: "Platería",
    },
    {
        src: "/images/lezcano/mesa-trabajo.jpg",
        alt: "Mesa de trabajo del taller de Lezcano",
        title: "En el taller",
    },
    {
        src: "/images/lezcano/maquina.jpg",
        alt: "Máquina tradicional del taller de Lezcano",
        title: "Proceso y oficio",
    },
];

export default function TrabajosPage() {
    return (
        <main className="bg-[#f6f2eb]">
            <section className="border-b border-[#ddd1c0]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#9a7541] sm:text-[11px]">
                            Hecho en el taller
                        </p>

                        <h1 className="mt-2.5 font-serif text-3xl text-neutral-900 sm:text-4xl">
                            Trabajos realizados
                        </h1>

                        <p className="mt-3.5 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
                            Una selección de piezas, procesos y trabajos que han
                            pasado por el taller de Lezcano.
                        </p>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 lg:gap-x-6">
                    {WORKS.map((work, index) => (
                        <Reveal
                            key={`${work.src}-${index}`}
                            soft
                            delay={(index % 3) * 70}
                        >
                            <article className="group">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[#ded4c7] bg-neutral-100">
                                    <Image
                                        src={work.src}
                                        alt={work.alt}
                                        fill
                                        sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 280px"
                                        className="lezcano-image object-cover"
                                    />

                                    <div className="pointer-events-none absolute inset-0 border border-black/[0.05]" />

                                    <div className="absolute bottom-3 right-3 hidden h-9 w-9 items-center justify-center bg-white/90 text-sm text-neutral-900 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 lg:flex">
                                        ↗
                                    </div>
                                </div>

                                <p className="mt-2.5 text-[9px] uppercase tracking-[0.18em] text-[#9a7541] sm:mt-3 sm:text-[10px]">
                                    Lezcano
                                </p>

                                <h2 className="mt-1 font-serif text-base text-neutral-900 transition-colors duration-300 group-hover:text-[#8a693c] sm:text-lg">
                                    {work.title}
                                </h2>
                            </article>
                        </Reveal>
                    ))}
                </div>

                <Reveal soft>
                    <div className="mt-10 border-t border-[#ddd1c0] pt-7 text-center sm:mt-12 sm:pt-8">
                        <p className="mx-auto max-w-xl text-sm leading-6 text-neutral-600 sm:leading-7">
                            ¿Tenés una idea o una pieza que quieras trabajar?
                            Escribinos y contanos qué tenés en mente.
                        </p>

                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lezcano-button mt-5 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Consultar por WhatsApp
                            <span className="ml-2">→</span>
                        </a>
                    </div>
                </Reveal>
            </section>
        </main>
    );
}