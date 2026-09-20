import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { LogoutButton } from "./LogouButton";
import { CartIndicator } from "./CartIndicator";
import { MobileMenu } from "./MobileMenu";

const NAV_LINKS = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/servicios", label: "Servicios" },
    { href: "/trabajos", label: "Trabajos" },
    { href: "/la-joyeria", label: "La joyería" },
    { href: "/contacto", label: "Contacto" },
];

const MOBILE_MENU_LINKS = [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/trabajos", label: "Trabajos" },
    { href: "/la-joyeria", label: "La joyería" },
    { href: "/contacto", label: "Contacto" },
];

const MOBILE_QUICK_LINKS = [
    {
        href: "/catalogo?linea=joyeria",
        label: "Joyería",
    },
    {
        href: "/catalogo?linea=plateria",
        label: "Platería",
    },
    {
        href: "/servicios",
        label: "Servicios",
    },
];

export async function Header() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;

    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        isAdmin = profile?.is_admin === true;
    }

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md">

            {/* Fila principal */}
            <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-3.5 sm:h-[82px] sm:px-6 lg:h-[88px] lg:px-8">

                {/* Logo */}
                <Link
                    href="/"
                    aria-label="Lezcano - Inicio"
                    className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-85"
                >
                    <div className="relative h-14 w-32 overflow-hidden sm:h-16 sm:w-40 lg:h-[68px] lg:w-44">
                        <Image
                            src="/images/logo-lezcano.png"
                            alt="Lezcano Joyería"
                            fill
                            priority
                            sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 176px"
                            className="scale-[2.35] object-contain"
                        />
                    </div>
                </Link>

                {/* Navegación escritorio */}
                <nav
                    aria-label="Navegación principal"
                    className="hidden lg:flex lg:items-center lg:gap-7"
                >
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative py-2 text-sm text-neutral-300 transition-colors duration-300 hover:text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-[#b28a53] after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Acciones escritorio */}
                <div className="hidden items-center gap-5 lg:flex">
                    {isAdmin && (
                        <Link
                            href="/administracion"
                            className="text-xs uppercase tracking-[0.12em] text-[#c5a66d] transition-colors duration-300 hover:text-[#e0c898]"
                        >
                            Administración
                        </Link>
                    )}

                    {user ? (
                        <Link
                            href="/mi-cuenta"
                            aria-label="Mi cuenta"
                            title="Mi cuenta"
                            className="flex h-10 w-10 items-center justify-center text-neutral-300 transition-all duration-300 hover:text-white"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                            </svg>
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            aria-label="Ingresar"
                            title="Ingresar"
                            className="flex h-10 w-10 items-center justify-center text-neutral-300 transition-all duration-300 hover:text-white"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-5 w-5"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                            </svg>
                        </Link>
                    )}

                    <CartIndicator />

                    {user && (
                        <div className="text-xs text-neutral-500 transition hover:text-neutral-300">
                            <LogoutButton />
                        </div>
                    )}
                </div>

                {/* Acciones móvil */}
                <div className="flex items-center gap-0.5 lg:hidden">

                    {/* Buscar */}
                    <Link
                        href="/catalogo"
                        aria-label="Buscar productos"
                        title="Buscar productos"
                        className="flex h-10 w-10 items-center justify-center text-neutral-200 transition-colors duration-300 hover:text-[#d6b777]"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-[21px] w-[21px]"
                            aria-hidden="true"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="6.5"
                            />

                            <path d="m16 16 4 4" />
                        </svg>
                    </Link>

                    {/* Cuenta */}
                    <Link
                        href={
                            user
                                ? "/mi-cuenta"
                                : "/login"
                        }
                        aria-label={
                            user
                                ? "Mi cuenta"
                                : "Ingresar"
                        }
                        title={
                            user
                                ? "Mi cuenta"
                                : "Ingresar"
                        }
                        className="flex h-10 w-10 items-center justify-center text-neutral-200 transition-colors duration-300 hover:text-[#d6b777]"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-[21px] w-[21px]"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="8"
                                r="3.5"
                            />

                            <path d="M5 21a7 7 0 0 1 14 0" />
                        </svg>
                    </Link>

                    {/* Carrito */}
                    <CartIndicator />

                    {/* Menú */}
                    <MobileMenu
                        links={MOBILE_MENU_LINKS}
                        isLoggedIn={Boolean(user)}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            {/* Accesos rápidos móvil */}
            <nav
                aria-label="Accesos rápidos"
                className="border-t border-neutral-800/90 lg:hidden"
            >
                <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-3.5 sm:px-6">
                    {MOBILE_QUICK_LINKS.map(
                        (
                            link,
                            index
                        ) => (
                            <div
                                key={
                                    link.href
                                }
                                className="flex items-center"
                            >
                                {index > 0 && (
                                    <span className="mx-5 h-3 w-px bg-neutral-700 sm:mx-7" />
                                )}

                                <Link
                                    href={
                                        link.href
                                    }
                                    className="relative py-1 text-[12px] font-medium tracking-[0.02em] text-neutral-300 transition-colors duration-300 hover:text-[#d6b777]"
                                >
                                    {
                                        link.label
                                    }
                                </Link>
                            </div>
                        )
                    )}
                </div>
            </nav>
        </header>
    );
}