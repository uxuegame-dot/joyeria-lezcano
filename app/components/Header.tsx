import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { LogoutButton } from "./LogouButton";
import { CartIndicator } from "./CartIndicator";

const NAV_LINKS = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/servicios", label: "Servicios" },
    { href: "/trabajos", label: "Trabajos realizados" },
    { href: "/la-joyeria", label: "La joyería" },
    { href: "/contacto", label: "Contacto" },
];

export async function Header() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
            <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    href="/"
                    aria-label="Lezcano - Inicio"
                    className="flex shrink-0 items-center"
                >
                    <div className="relative h-20 w-48 overflow-hidden sm:w-52">
                        <Image
                            src="/images/logo-lezcano.png"
                            alt="Lezcano Joyería"
                            fill
                            priority
                            sizes="208px"
                            className="scale-[2.35] object-contain"
                        />
                    </div>
                </Link>

                {/* Navegación de escritorio */}
                <nav
                    aria-label="Navegación principal"
                    className="hidden lg:flex lg:items-center lg:gap-5"
                >
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-neutral-300 transition hover:text-white"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Cuenta y carrito */}
                <div className="flex items-center gap-4">
                    <div className="text-neutral-200">
                        <CartIndicator />
                    </div>

                    {user ? (
                        <>
                            <Link
                                href="/mi-cuenta"
                                className="hidden text-sm text-neutral-300 transition hover:text-white sm:inline"
                            >
                                Mi cuenta
                            </Link>

                            <div className="hidden text-neutral-300 sm:block">
                                <LogoutButton />
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm text-neutral-300 transition hover:text-white"
                        >
                            Ingresar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}