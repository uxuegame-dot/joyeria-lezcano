import Link from "next/link";

const FOOTER_LINKS = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/servicios", label: "Servicios" },
    { href: "/trabajos", label: "Trabajos realizados" },
    { href: "/la-joyeria", label: "La joyería" },
    { href: "/contacto", label: "Contacto" },
];

export function Footer() {
    return (
        <footer className="border-t border-neutral-800 bg-[#151515] text-white">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">
                    {/* Marca */}
                    <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                            Paysandú · Uruguay
                        </p>

                        <h2 className="mt-4 font-serif text-3xl text-white">
                            Lezcano
                        </h2>

                        <p className="mt-1 text-sm uppercase tracking-[0.18em] text-neutral-400">
                            Joyería & Platería
                        </p>

                        <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
                            Joyería y platería con una tradición de oficio,
                            experiencia y atención por cada detalle.
                        </p>
                    </div>

                    {/* Navegación */}
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Explorar
                        </p>

                        <nav
                            aria-label="Navegación del pie de página"
                            className="mt-5 flex flex-col items-start gap-3"
                        >
                            {FOOTER_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-neutral-300 transition hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contacto */}
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Contacto
                        </p>

                        <div className="mt-5 flex flex-col items-start gap-4 text-sm">
                            <a
                                href="https://maps.app.goo.gl/U1WcScnCXKj4Trws5"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="leading-6 text-neutral-300 transition hover:text-white"
                            >
                                Larrañaga 721
                                <br />
                                Paysandú, Uruguay
                            </a>

                            <a
                                href="tel:+59899726968"
                                className="text-neutral-300 transition hover:text-white"
                            >
                                +598 99 726 968
                            </a>

                            <a
                                href="https://wa.me/59899726968"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-300 transition hover:text-white"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                {/* Redes y copyright */}
                <div className="mt-14 flex flex-col gap-5 border-t border-neutral-800 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-x-6 gap-y-3">
                        <a
                            href="https://www.instagram.com/joyeria_lezcano"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-400 transition hover:text-white"
                        >
                            Instagram · Joyería
                        </a>

                        <a
                            href="https://www.instagram.com/plateria_lezcano"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-400 transition hover:text-white"
                        >
                            Instagram · Platería
                        </a>
                    </div>

                    <p className="text-xs text-neutral-600">
                        © {new Date().getFullYear()} Lezcano
                    </p>
                </div>
            </div>
        </footer>
    );
}