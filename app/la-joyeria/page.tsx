import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/app/components/Reveal";

export default function LaJoyeriaPage() {
    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            <section className="border-b border-[#dfd3c3] bg-[linear-gradient(135deg,#f7f1e7_0%,#fbf8f2_58%,#eee2d0_100%)]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#a87636] sm:text-[10px]">
                            Joyería Lezcano
                        </p>

                        <div className="mt-1.5 grid gap-3 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-12">
                            <h1 className="font-serif text-[30px] leading-none tracking-[-0.035em] text-[#211c19] sm:text-4xl">
                                Nuestra historia
                            </h1>

                            <p className="max-w-2xl text-sm leading-6 text-[#6d625a] sm:text-[15px]">
                                Una historia de oficio construida en Paysandú.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
                <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch lg:gap-7">
                    <Reveal soft>
                        <div className="group relative h-full min-h-[360px] overflow-hidden rounded-[24px] bg-neutral-100 sm:min-h-[430px]">
                            <Image
                                src="/images/lezcano/mesa-trabajo.jpg"
                                alt="Taller de Joyería Lezcano"
                                fill
                                sizes="(max-width: 1024px) 100vw, 44vw"
                                className="lezcano-image object-cover"
                                style={{
                                    objectPosition: "center 48%",
                                }}
                            />

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                            <div className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                                Taller · Paysandú
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={80}>
                        <div className="flex h-full flex-col rounded-[24px] border border-[#ddcfbc] bg-white/80 p-5 shadow-[0_12px_30px_rgba(61,45,28,0.045)] sm:p-7">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a87636]">
                                El origen de Lezcano
                            </p>

                            <h2 className="mt-2.5 max-w-xl font-serif text-[27px] leading-tight tracking-[-0.03em] text-[#241f1c] sm:text-[31px]">
                                Una historia que vamos a contar con la voz de quien la vivió.
                            </h2>

                            <div className="mt-4 space-y-3.5 text-sm leading-6 text-[#6d625a] sm:text-[15px] sm:leading-7">
                                <p>
                                    Esta página está preparada para contar la
                                    historia real de Joyería Lezcano: sus
                                    comienzos, el aprendizaje del oficio y el
                                    recorrido que llevó a la joyería hasta hoy.
                                </p>

                                <p>
                                    Antes de publicar fechas, personas o
                                    anécdotas, vamos a reconstruir esa historia
                                    junto al dueño para que el relato sea fiel,
                                    claro y tenga el valor que merece.
                                </p>
                            </div>

                            <div className="mt-auto pt-6">
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Oficio",
                                        "Taller",
                                        "Paysandú",
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full border border-[#ddc59d] bg-[#fbf5ea] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#856036]"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="border-y border-neutral-800 bg-[#181817] text-white">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
                    <Reveal soft>
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d0a665]">
                                    El taller
                                </p>

                                <h2 className="mt-1.5 font-serif text-[26px] tracking-[-0.025em] text-white sm:text-[30px]">
                                    Herramientas, procesos y trabajo real.
                                </h2>
                            </div>

                            <Link
                                href="/trabajos"
                                className="lezcano-arrow inline-flex w-fit text-sm font-semibold text-[#d5b27b] transition hover:text-white"
                            >
                                Ver trabajos
                                <span className="arrow">
                                    →
                                </span>
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1.08fr_0.92fr] sm:gap-4">
                            <div className="group relative aspect-[16/10] overflow-hidden rounded-[20px] bg-neutral-900">
                                <Image
                                    src="/images/lezcano/maquina.jpg"
                                    alt="Herramientas y oficio en Joyería Lezcano"
                                    fill
                                    sizes="(max-width: 640px) 100vw, 52vw"
                                    className="lezcano-image object-cover"
                                />
                            </div>

                            <div className="group relative aspect-[16/10] overflow-hidden rounded-[20px] bg-neutral-900">
                                <Image
                                    src="/images/lezcano/trabajo-bombilla.jpg"
                                    alt="Trabajo realizado en Joyería Lezcano"
                                    fill
                                    sizes="(max-width: 640px) 100vw, 44vw"
                                    className="lezcano-image object-cover"
                                />
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    );
}
