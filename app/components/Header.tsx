import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { LogoutButton } from "./LogouButton";
import { CartIndicator } from "./CartIndicator";
import { MobileMenu } from "./MobileMenu";

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
        <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
            <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    aria-label="Lezcano - Inicio"
                    className="flex shrink-0 items-center"
                >
                    <div className="relative h-16 w-36 overflow-hidden sm:h-20 sm:w-52">
                        <Image
                            src="/images/logo-lezcano.png"
                            alt="Lezcano Joyería"
                            fill
                            priority
                            sizes="(max-width: 640px) 144px, 208px"
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
                            className="text-sm text-neutral-300 transition hover:text-[#c5a66d]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Acciones de escritorio */}
                <div className="hidden items-center gap-4 lg:flex">
                    <div className="text-neutral-200">
                        <CartIndicator />
                    </div>

                    {isAdmin && (
                        <Link
                            href="/administracion"
                            className="text-sm text-[#c5a66d] transition hover:text-[#dcc28f]"
                        >
                            Administración
                        </Link>
                    )}

                    {user ? (
                        <>
                            <Link
                                href="/mi-cuenta"
                                className="text-sm text-neutral-300 transition hover:text-white"
                            >
                                Mi cuenta
                            </Link>

                            <div className="text-neutral-300">
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

                {/* Acciones móviles */}
                <div className="flex items-center gap-4 lg:hidden">
                    <div className="text-neutral-200">
                        <CartIndicator />
                    </div>

                    <MobileMenu
                        links={NAV_LINKS}
                        isLoggedIn={Boolean(user)}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>
        </header>
    );
}