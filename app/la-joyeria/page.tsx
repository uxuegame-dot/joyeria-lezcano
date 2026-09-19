import Image from "next/image";
import { Reveal } from "@/app/components/Reveal";

export default function LaJoyeriaPage() {
    return (
        <main className="bg-[#f7f4ef]">
            <section className="border-b border-[#ddd5c9]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#9a7541] sm:text-[11px]">
                            Joyería Lezcano
                        </p>

                        <h1 className="mt-2.5 font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl">
                            Nuestra historia
                        </h1>

                        <p className="mt-3.5 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
                            Una historia de oficio construida en Paysandú.
                        </p>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
                    <Reveal soft>
                        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 sm:mx-auto sm:max-w-xl lg:mx-0 lg:max-w-none">
                            <Image
                                src="/images/lezcano/mesa-trabajo.jpg"
                                alt="Taller de Joyería Lezcano"
                                fill
                                sizes="(max-width: 1024px) 100vw, 42vw"
                                className="lezcano-image object-cover"
                            />
                        </div>
                    </Reveal>

                    <Reveal delay={80}>
                        <div className="lg:pt-6">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-[#9a7541]">
                                El origen de Lezcano
                            </p>

                            <h2 className="mt-2.5 font-serif text-2xl leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                                Una historia que vamos a contar con la voz de quien la vivió.
                            </h2>

                            <div className="mt-4 space-y-4 text-sm leading-6 text-neutral-600 sm:mt-5 sm:text-base sm:leading-7">
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
                        </div>
                    </Reveal>
                </div>
            </section>

            <section className="border-y border-neutral-800 bg-[#181817] text-white">
                <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
                    <Reveal soft>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                                <Image
                                    src="/images/lezcano/maquina.jpg"
                                    alt="Herramientas y oficio en Joyería Lezcano"
                                    fill
                                    sizes="(max-width: 640px) 50vw, 45vw"
                                    className="lezcano-image object-cover"
                                />
                            </div>

                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                                <Image
                                    src="/images/lezcano/trabajo-bombilla.jpg"
                                    alt="Trabajo realizado en Joyería Lezcano"
                                    fill
                                    sizes="(max-width: 640px) 50vw, 45vw"
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