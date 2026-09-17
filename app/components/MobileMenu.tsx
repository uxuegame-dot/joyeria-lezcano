"use client";

import Image from "next/image";
import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import {
    usePathname,
} from "next/navigation";

import {
    createPortal,
} from "react-dom";

import {
    LogoutButton,
} from "./LogouButton";

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
    const [isOpen, setIsOpen] =
        useState(false);

    const [mounted, setMounted] =
        useState(false);

    const pathname =
        usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow =
                "";

            return;
        }

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [isOpen]);

    const closeMenu = () => {
        setIsOpen(false);
    };

    const menu =
        mounted && isOpen
            ? createPortal(
                <div className="fixed inset-0 z-[9999] bg-neutral-950 lg:hidden">

                    {/* Encabezado */}
                    <div className="flex h-[82px] items-center justify-between border-b border-neutral-800 px-4 sm:px-6">

                        {/* Logo */}
                        <Link
                            href="/"
                            onClick={
                                closeMenu
                            }
                            aria-label="Lezcano - Inicio"
                            className="flex shrink-0 items-center transition-opacity duration-300 hover:opacity-80"
                        >
                            <div className="relative h-[60px] w-[135px] overflow-hidden">
                                <Image
                                    src="/images/logo-lezcano.png"
                                    alt="Lezcano Joyería"
                                    fill
                                    priority
                                    sizes="135px"
                                    className="scale-[2.35] object-contain"
                                />
                            </div>
                        </Link>

                        {/* Cerrar */}
                        <button
                            type="button"
                            aria-label="Cerrar menú"
                            onClick={
                                closeMenu
                            }
                            className="group flex h-11 w-11 items-center justify-center text-neutral-200 transition-colors duration-300 hover:text-[#d6b777]"
                        >
                            <span className="relative block h-6 w-6">
                                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 rotate-45 bg-current transition-transform duration-300 group-hover:rotate-[40deg]" />

                                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 -rotate-45 bg-current transition-transform duration-300 group-hover:-rotate-[40deg]" />
                            </span>
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="h-[calc(100dvh-82px)] overflow-y-auto">
                        <div className="mx-auto flex min-h-full max-w-6xl flex-col px-6 pb-10 pt-8">

                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-[0.28em] text-[#a8844f]">
                                    Explorar
                                </p>

                                <Link
                                    href="/catalogo"
                                    onClick={
                                        closeMenu
                                    }
                                    className="text-xs text-neutral-500 transition-colors duration-300 hover:text-neutral-200"
                                >
                                    Ver catálogo
                                </Link>
                            </div>

                            {/* Navegación */}
                            <nav
                                aria-label="Navegación móvil"
                                className="border-y border-neutral-800"
                            >
                                {links.map(
                                    (
                                        link
                                    ) => (
                                        <Link
                                            key={
                                                link.href
                                            }
                                            href={
                                                link.href
                                            }
                                            onClick={
                                                closeMenu
                                            }
                                            className="group flex items-center justify-between border-b border-neutral-800 py-[18px] last:border-b-0"
                                        >
                                            <span className="font-serif text-[27px] leading-tight text-neutral-100 transition-colors duration-300 group-hover:text-[#c5a66d]">
                                                {
                                                    link.label
                                                }
                                            </span>

                                            <span className="inline-block text-lg text-[#a8844f] transition-transform duration-300 group-hover:translate-x-1">
                                                →
                                            </span>
                                        </Link>
                                    )
                                )}
                            </nav>

                            {/* Accesos de cuenta */}
                            <div className="mt-8">

                                {isAdmin && (
                                    <Link
                                        href="/administracion"
                                        onClick={
                                            closeMenu
                                        }
                                        className="group mb-7 flex items-center justify-between border border-[#6f5936] px-5 py-4 text-sm text-[#d1b47d] transition-colors duration-300 hover:border-[#a8844f] hover:bg-[#a8844f]/10"
                                    >
                                        <span>
                                            Administración
                                        </span>

                                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </Link>
                                )}

                                {isLoggedIn ? (
                                    <div className="flex flex-col gap-5">
                                        <Link
                                            href="/mi-cuenta"
                                            onClick={
                                                closeMenu
                                            }
                                            className="flex items-center gap-3 text-sm text-neutral-300 transition-colors duration-300 hover:text-white"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="8"
                                                    r="3.5"
                                                />

                                                <path d="M5 21a7 7 0 0 1 14 0" />
                                            </svg>

                                            Mi cuenta
                                        </Link>

                                        <div className="border-t border-neutral-800 pt-5 text-sm text-neutral-500 transition-colors hover:text-neutral-200">
                                            <LogoutButton />
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={
                                            closeMenu
                                        }
                                        className="flex items-center gap-3 text-sm text-neutral-300 transition-colors duration-300 hover:text-white"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        >
                                            <circle
                                                cx="12"
                                                cy="8"
                                                r="3.5"
                                            />

                                            <path d="M5 21a7 7 0 0 1 14 0" />
                                        </svg>

                                        Ingresar
                                    </Link>
                                )}
                            </div>

                            {/* Pie */}
                            <div className="mt-auto pt-14">
                                <div className="border-t border-neutral-800 pt-6">
                                    <p className="text-[10px] uppercase tracking-[0.28em] text-[#a8844f]">
                                        Joyería &
                                        Platería
                                    </p>

                                    <p className="mt-2 text-xs text-neutral-500">
                                        Lezcano ·
                                        Paysandú
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
            {/* Hamburguesa */}
            <button
                type="button"
                aria-label="Abrir menú"
                aria-expanded={
                    isOpen
                }
                onClick={() =>
                    setIsOpen(true)
                }
                className="group flex h-10 w-10 items-center justify-center text-neutral-200 transition-colors duration-300 hover:text-[#d6b777]"
            >
                <span className="flex w-[22px] flex-col gap-[5px]">
                    <span className="h-px w-[22px] bg-current transition-transform duration-300 group-hover:translate-x-0.5" />

                    <span className="h-px w-[22px] bg-current" />

                    <span className="h-px w-[22px] bg-current transition-transform duration-300 group-hover:-translate-x-0.5" />
                </span>
            </button>

            {menu}
        </>
    );
}