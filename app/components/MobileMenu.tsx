"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { LogoutButton } from "./LogouButton";

type NavLink = {
    href: string;
    label: string;
};

type MobileMenuProps = {
    links: NavLink[];
    isLoggedIn: boolean;
    isAdmin: boolean;
};

export function MobileMenu({
    links,
    isLoggedIn,
    isAdmin,
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = "";
            return;
        }

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const closeMenu = () => {
        setIsOpen(false);
    };

    const menu =
        mounted && isOpen
            ? createPortal(
                <div className="fixed inset-0 z-[9999] bg-neutral-950 lg:hidden">

                    {/* Parte superior */}
                    <div className="flex h-[96px] items-center justify-between border-b border-neutral-800 px-4 sm:px-6">

                        {/* Logo */}
                        <Link
                            href="/"
                            onClick={closeMenu}
                            aria-label="Lezcano - Inicio"
                            className="flex shrink-0 items-center"
                        >
                            <div className="relative h-[72px] w-[150px] overflow-hidden">
                                <Image
                                    src="/images/logo-lezcano.png"
                                    alt="Lezcano Joyería"
                                    fill
                                    priority
                                    sizes="150px"
                                    className="scale-[2.35] object-contain"
                                />
                            </div>
                        </Link>

                        {/* Cerrar */}
                        <button
                            type="button"
                            aria-label="Cerrar menú"
                            onClick={closeMenu}
                            className="flex h-11 w-11 items-center justify-center text-neutral-200 transition hover:text-white"
                        >
                            <span className="relative block h-6 w-6">
                                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 rotate-45 bg-current" />
                                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 -rotate-45 bg-current" />
                            </span>
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="h-[calc(100dvh-96px)] overflow-y-auto">
                        <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 pb-10 pt-8">

                            <p className="mb-6 text-[10px] uppercase tracking-[0.28em] text-[#a8844f]">
                                Explorar
                            </p>

                            {/* Navegación */}
                            <nav
                                aria-label="Navegación móvil"
                                className="border-y border-neutral-800"
                            >
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMenu}
                                        className="group flex items-center justify-between border-b border-neutral-800 py-5 last:border-b-0"
                                    >
                                        <span className="font-serif text-[28px] text-neutral-100 transition group-hover:text-[#c5a66d]">
                                            {link.label}
                                        </span>

                                        <span className="text-lg text-[#a8844f]">
                                            →
                                        </span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Cuenta */}
                            <div className="mt-8">

                                {isAdmin && (
                                    <Link
                                        href="/administracion"
                                        onClick={closeMenu}
                                        className="mb-6 flex items-center justify-between border border-[#6f5936] px-5 py-4 text-sm text-[#d1b47d]"
                                    >
                                        <span>Administración</span>
                                        <span>→</span>
                                    </Link>
                                )}

                                {isLoggedIn ? (
                                    <div className="flex items-center justify-between gap-6">
                                        <Link
                                            href="/mi-cuenta"
                                            onClick={closeMenu}
                                            className="text-sm text-neutral-300 transition hover:text-white"
                                        >
                                            Mi cuenta
                                        </Link>

                                        <div className="text-sm text-neutral-300">
                                            <LogoutButton />
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={closeMenu}
                                        className="inline-block text-sm text-neutral-300 transition hover:text-white"
                                    >
                                        Ingresar
                                    </Link>
                                )}
                            </div>

                            {/* Pie del menú */}
                            <div className="mt-auto pt-14">
                                <div className="border-t border-neutral-800 pt-6">

                                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#a8844f]">
                                        Joyería & Platería
                                    </p>

                                    <p className="mt-2 text-xs text-neutral-500">
                                        Lezcano · Paysandú
                                    </p>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>,
                document.body
            )
            : null;

    return (
        <>
            {/* Botón hamburguesa */}
            <button
                type="button"
                aria-label="Abrir menú"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="flex h-10 w-10 items-center justify-center text-neutral-200 transition hover:text-white"
            >
                <span className="flex w-6 flex-col gap-[6px]">
                    <span className="h-px w-6 bg-current" />
                    <span className="h-px w-6 bg-current" />
                    <span className="h-px w-6 bg-current" />
                </span>
            </button>

            {menu}
        </>
    );
}