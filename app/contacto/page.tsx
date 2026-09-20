import type { ReactNode } from "react";

import { Reveal } from "@/app/components/Reveal";

const WHATSAPP_URL =
    "https://wa.me/59899726968?text=" +
    encodeURIComponent(
        "Hola, estoy visitando la web de Joyería Lezcano y quería hacer una consulta."
    );

const MAPS_URL =
    "https://maps.app.goo.gl/U1WcScnCXKj4Trws5";

const JEWELRY_INSTAGRAM =
    "https://www.instagram.com/joyeria_lezcano";

const SILVERWARE_INSTAGRAM =
    "https://www.instagram.com/plateria_lezcano";

function Icon({
    type,
}: {
    type:
    | "location"
    | "phone"
    | "whatsapp"
    | "instagram"
    | "clock";
}) {
    if (type === "location") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />

                <circle
                    cx="12"
                    cy="10"
                    r="2"
                />
            </svg>
        );
    }

    if (type === "phone") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path d="M6.5 3h3l1.5 4-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.4 19.5 4.5 13.6 4.5 5c0-1.1.9-2 2-2Z" />
            </svg>
        );
    }

    if (type === "clock") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v5l3 2" />
            </svg>
        );
    }

    if (type === "whatsapp") {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />

                <path d="M9 8.5c.4 2.6 2 4.4 4.7 5.2" />
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-5 w-5"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="4"
            />

            <circle
                cx="12"
                cy="12"
                r="3.5"
            />

            <circle
                cx="17.5"
                cy="6.5"
                r=".75"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

function ContactCard({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="group relative flex h-full min-h-[190px] flex-col overflow-hidden rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_10px_30px_rgba(65,48,29,0.035)] p-5 transition duration-500 hover:-translate-y-1 hover:border-[#b78a54] hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] sm:p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#b28a53] transition-transform duration-500 group-hover:scale-x-100" />

            {children}
        </div>
    );
}

export default function ContactoPage() {
    return (
        <main className="bg-[#f6f2eb]">

            {/* Encabezado */}
            <section className="border-b border-[#ddd1c0]">
                <Reveal>
                    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#9a7541] sm:text-[11px]">
                            Lezcano · Paysandú
                        </p>

                        <h1 className="mt-2.5 font-serif text-3xl text-neutral-900 sm:text-4xl">
                            Contacto
                        </h1>

                        <p className="mt-3.5 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
                            Para consultas sobre
                            piezas, encargos o
                            trabajos, escribinos
                            directamente por
                            WhatsApp o visitanos en
                            nuestro local.
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* Contactos */}
            <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

                <div className="grid items-stretch gap-4 md:grid-cols-2">

                    {/* Local */}
                    <Reveal
                        soft
                        className="h-full"
                    >
                        <a
                            href={MAPS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full"
                        >
                            <ContactCard>
                                <span className="inline-flex w-fit text-[#9a7541] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                                    <Icon type="location" />
                                </span>

                                <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                    Local
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Larrañaga 721
                                </h2>

                                <p className="mt-2 text-sm text-neutral-600">
                                    Ciudad de Paysandú ·
                                    Uruguay
                                </p>

                                <span className="lezcano-arrow mt-auto inline-flex w-fit pt-5 text-sm font-medium text-neutral-900">
                                    Abrir en Maps

                                    <span className="arrow">
                                        →
                                    </span>
                                </span>
                            </ContactCard>
                        </a>
                    </Reveal>

                    {/* WhatsApp */}
                    <Reveal
                        soft
                        delay={70}
                        className="h-full"
                    >
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-full"
                        >
                            <ContactCard>
                                <span className="inline-flex w-fit text-[#9a7541] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                                    <Icon type="whatsapp" />
                                </span>

                                <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                    Consultas
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    WhatsApp
                                </h2>

                                <p className="mt-2 text-sm text-neutral-600">
                                    +598 99 726 968
                                </p>

                                <span className="lezcano-arrow mt-auto inline-flex w-fit pt-5 text-sm font-medium text-neutral-900">
                                    Escribir por WhatsApp

                                    <span className="arrow">
                                        →
                                    </span>
                                </span>
                            </ContactCard>
                        </a>
                    </Reveal>

                    {/* Teléfono */}
                    <Reveal
                        soft
                        delay={90}
                        className="h-full"
                    >
                        <a
                            href="tel:+59847232760"
                            className="block h-full"
                        >
                            <ContactCard>
                                <span className="inline-flex w-fit text-[#9a7541] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                                    <Icon type="phone" />
                                </span>

                                <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                    Teléfono
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    472 32760
                                </h2>

                                <p className="mt-2 text-sm text-neutral-600">
                                    Teléfono del local
                                </p>

                                <span className="lezcano-arrow mt-auto inline-flex w-fit pt-5 text-sm font-medium text-neutral-900">
                                    Llamar

                                    <span className="arrow">
                                        →
                                    </span>
                                </span>
                            </ContactCard>
                        </a>
                    </Reveal>

                    {/* Instagram */}
                    <Reveal
                        soft
                        delay={120}
                        className="h-full"
                    >
                        <ContactCard>
                            <span className="inline-flex w-fit text-[#9a7541] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                                <Icon type="instagram" />
                            </span>

                            <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                Redes
                            </p>

                            <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                Instagram
                            </h2>

                            <div className="mt-auto flex flex-col items-start gap-3 pt-5 text-sm">
                                <a
                                    href={
                                        JEWELRY_INSTAGRAM
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lezcano-arrow inline-flex border-b border-[#b28a53] pb-1 text-neutral-900 transition hover:text-[#9a7541]"
                                >
                                    Joyería

                                    <span className="arrow">
                                        →
                                    </span>
                                </a>

                                <a
                                    href={
                                        SILVERWARE_INSTAGRAM
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lezcano-arrow inline-flex border-b border-[#b28a53] pb-1 text-neutral-900 transition hover:text-[#9a7541]"
                                >
                                    Platería

                                    <span className="arrow">
                                        →
                                    </span>
                                </a>
                            </div>
                        </ContactCard>
                    </Reveal>
                </div>

                <Reveal
                    soft
                    delay={150}
                >
                    <div className="mt-4 rounded-[18px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_10px_30px_rgba(65,48,29,0.035)] p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <span className="mt-0.5 inline-flex text-[#9a7541]">
                                <Icon type="clock" />
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                                    Horarios
                                </p>

                                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                    Horario del local
                                </h2>

                                <div className="mt-3 max-w-2xl text-sm text-neutral-600">
                                    <div className="flex flex-col gap-1 border-b border-neutral-100 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                        <span>Lunes a viernes</span>
                                        <span className="text-right text-neutral-900">
                                            8:00–11:45 · 15:00–19:00
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1 border-b border-neutral-100 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                        <span>Sábado</span>
                                        <span className="text-right text-neutral-900">
                                            8:00–12:00
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                        <span>Domingo</span>
                                        <span className="text-right text-neutral-500">
                                            Cerrado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>
        </main>
    );
}