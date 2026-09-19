import Link from "next/link";

const FOOTER_LINKS = [
    {
        href: "/catalogo",
        label: "Catálogo",
    },
    {
        href: "/servicios",
        label: "Servicios",
    },
    {
        href: "/trabajos",
        label: "Trabajos realizados",
    },
    {
        href: "/la-joyeria",
        label: "La joyería",
    },
    {
        href: "/contacto",
        label: "Contacto",
    },
];

const WHATSAPP_URL =
    "https://wa.me/59899726968?text=" +
    encodeURIComponent(
        "Hola, estoy visitando la web de Joyería Lezcano y quería hacer una consulta."
    );

const JEWELRY_INSTAGRAM =
    "https://www.instagram.com/joyeria_lezcano";

const SILVERWARE_INSTAGRAM =
    "https://www.instagram.com/plateria_lezcano";

const MAPS_URL =
    "https://maps.app.goo.gl/U1WcScnCXKj4Trws5";

function LocationIcon() {
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

function WhatsAppIcon() {
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

            <path d="M9.1 8.2 8.3 9.4c-.2.3-.2.7 0 1.1 1 2.1 2.7 3.7 4.8 4.7.4.2.8.1 1.1-.1l1.1-.9" />
        </svg>
    );
}

function PhoneIcon() {
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

function InstagramIcon() {
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

export function Footer() {
    return (
        <footer className="border-t border-neutral-800 bg-[#151515] text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">

                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.75fr_1fr_1fr] lg:gap-12">

                    {/* Marca */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#c9a66b]">
                            Paysandú · Uruguay
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-white">
                            Lezcano
                        </h2>

                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Joyería & Platería
                        </p>

                        <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-400">
                            Oficio, piezas y trabajos realizados
                            con atención por cada detalle.
                        </p>
                    </div>

                    {/* Explorar */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            Explorar
                        </p>

                        <nav
                            aria-label="Navegación del pie de página"
                            className="mt-5 flex flex-col items-start gap-3"
                        >
                            {FOOTER_LINKS.map(
                                (link) => (
                                    <Link
                                        key={
                                            link.href
                                        }
                                        href={
                                            link.href
                                        }
                                        className="text-sm text-neutral-300 transition hover:text-white"
                                    >
                                        {
                                            link.label
                                        }
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>

                    {/* Contacto */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            Encontranos
                        </p>

                        <div className="mt-5 flex flex-col gap-4">

                            {/* Dirección */}
                            <a
                                href={
                                    MAPS_URL
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-start gap-3 text-neutral-300 transition hover:text-white"
                            >
                                <span className="mt-0.5 text-[#c9a66b]">
                                    <LocationIcon />
                                </span>

                                <span className="text-sm leading-6">
                                    Larrañaga 721
                                    <br />
                                    Paysandú,
                                    Uruguay
                                </span>
                            </a>

                            {/* Horarios */}
                            <div className="border-l border-neutral-700 pl-3 text-xs leading-5 text-neutral-400">
                                <p>
                                    Lun–vie · 8:00–11:45 / 15:00–19:00
                                </p>
                                <p>
                                    Sáb · 8:00–12:00 · Dom cerrado
                                </p>
                            </div>

                            {/* Teléfono fijo */}
                            <a
                                href="tel:+59847232760"
                                className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-white"
                            >
                                <span className="text-[#c9a66b]">
                                    <PhoneIcon />
                                </span>

                                <span>
                                    472 32760
                                </span>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href={
                                    WHATSAPP_URL
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-white"
                            >
                                <span className="text-[#c9a66b]">
                                    <WhatsAppIcon />
                                </span>

                                <span>
                                    WhatsApp
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Redes */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                            Seguinos
                        </p>

                        <div className="mt-5 flex flex-col gap-3">
                            <a
                                href={
                                    JEWELRY_INSTAGRAM
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-white"
                            >
                                <span className="text-[#c9a66b]">
                                    <InstagramIcon />
                                </span>

                                <span>
                                    Instagram ·
                                    Joyería
                                </span>
                            </a>

                            <a
                                href={
                                    SILVERWARE_INSTAGRAM
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-neutral-300 transition hover:text-white"
                            >
                                <span className="text-[#c9a66b]">
                                    <InstagramIcon />
                                </span>

                                <span>
                                    Instagram ·
                                    Platería
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Franja inferior */}
                <div className="mt-10 flex flex-col gap-4 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-neutral-500">
                        Paysandú · Uruguay
                    </p>

                    <p className="text-xs text-neutral-600">
                        ©{" "}
                        {new Date().getFullYear()}{" "}
                        Lezcano
                    </p>
                </div>
            </div>
        </footer>
    );
}