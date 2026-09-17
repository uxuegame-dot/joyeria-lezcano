"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import {
    type CartItem,
    clearCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
} from "@/app/lib/cart";

export function CartPage() {
    const [cart, setCart] =
        useState<CartItem[]>([]);

    const [loaded, setLoaded] =
        useState(false);

    function refreshCart() {
        setCart(getCart());
    }

    useEffect(() => {
        refreshCart();
        setLoaded(true);

        window.addEventListener(
            "cart-updated",
            refreshCart
        );

        return () => {
            window.removeEventListener(
                "cart-updated",
                refreshCart
            );
        };
    }, []);

    function changeQuantity(
        productId: string,
        quantity: number
    ) {
        updateCartQuantity(
            productId,
            quantity
        );
    }

    function decreaseQuantity(
        item: CartItem
    ) {
        if (item.quantity <= 1) {
            return;
        }

        changeQuantity(
            item.id,
            item.quantity - 1
        );
    }

    function increaseQuantity(
        item: CartItem
    ) {
        if (
            item.quantity >=
            item.stock
        ) {
            return;
        }

        changeQuantity(
            item.id,
            item.quantity + 1
        );
    }

    function removeProduct(
        productId: string
    ) {
        removeFromCart(productId);
    }

    function emptyCart() {
        clearCart();
    }

    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.price *
                item.quantity,
            0
        );

    const totalItems =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );

    if (!loaded) {
        return null;
    }

    /*
     * Carrito vacío
     */
    if (cart.length === 0) {
        return (
            <main className="bg-[#f7f4ef]">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="border border-[#ddd5c9] bg-white px-6 py-14 text-center sm:px-10 sm:py-16">

                        {/* Icono */}
                        <div className="mx-auto flex h-12 w-12 items-center justify-center text-[#9a7541]">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                className="h-9 w-9"
                                aria-hidden="true"
                            >
                                <path d="M5 8h14l-1 12H6L5 8Z" />

                                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                            </svg>
                        </div>

                        <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-[#9a7541]">
                            Tu selección
                        </p>

                        <h1 className="mt-3 font-serif text-3xl text-neutral-900 sm:text-4xl">
                            Tu carrito está vacío
                        </h1>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">
                            Explorá el catálogo y
                            agregá las piezas que
                            quieras comprar.
                        </p>

                        <Link
                            href="/catalogo"
                            className="lezcano-button mt-7 inline-flex min-h-12 items-center justify-center bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Explorar catálogo
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#f7f4ef]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

                {/* Encabezado */}
                <div className="mb-7 flex items-end justify-between gap-5 border-b border-[#ddd5c9] pb-6 sm:mb-10">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#9a7541] sm:text-xs">
                            Tu selección
                        </p>

                        <h1 className="mt-2 font-serif text-3xl text-neutral-900 sm:mt-3 sm:text-4xl">
                            Carrito
                        </h1>
                    </div>

                    <p className="pb-1 text-xs text-neutral-500 sm:text-sm">
                        {totalItems}{" "}
                        {totalItems === 1
                            ? "pieza"
                            : "piezas"}
                    </p>
                </div>

                <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-14">

                    {/* Productos */}
                    <div>
                        <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-neutral-200 sm:border-y sm:border-neutral-200">
                            {cart.map(
                                (
                                    item
                                ) => {
                                    const itemTotal =
                                        item.price *
                                        item.quantity;

                                    const canDecrease =
                                        item.quantity >
                                        1;

                                    const canIncrease =
                                        item.quantity <
                                        item.stock;

                                    return (
                                        <article
                                            key={
                                                item.id
                                            }
                                            className="border border-[#ddd5c9] bg-white p-3 sm:grid sm:grid-cols-[130px_1fr] sm:gap-6 sm:border-x-0 sm:border-y-0 sm:bg-transparent sm:px-0 sm:py-6"
                                        >
                                            <div className="grid grid-cols-[96px_1fr] gap-4 sm:contents">

                                                {/* Imagen */}
                                                <Link
                                                    href={`/catalogo/${item.slug}`}
                                                    className="group relative block aspect-square overflow-hidden bg-neutral-100"
                                                >
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={
                                                                item.imageUrl
                                                            }
                                                            alt={
                                                                item.name
                                                            }
                                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-neutral-400">
                                                            Sin imagen
                                                        </div>
                                                    )}

                                                    <div className="pointer-events-none absolute inset-0 border border-black/[0.05]" />
                                                </Link>

                                                {/* Info superior móvil */}
                                                <div className="min-w-0 sm:hidden">
                                                    <Link
                                                        href={`/catalogo/${item.slug}`}
                                                        className="font-serif text-lg leading-tight text-neutral-900 transition-colors hover:text-[#8a693c]"
                                                    >
                                                        {
                                                            item.name
                                                        }
                                                    </Link>

                                                    {item.material && (
                                                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                            {
                                                                item.material
                                                            }
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-sm font-medium text-neutral-900">
                                                        $
                                                        {itemTotal.toLocaleString(
                                                            "es-UY"
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Contenido desktop / acciones */}
                                                <div className="col-span-2 mt-4 min-w-0 sm:col-span-1 sm:mt-0 sm:flex sm:flex-col">

                                                    {/* Cabecera desktop */}
                                                    <div className="hidden justify-between gap-6 sm:flex">
                                                        <div>
                                                            <Link
                                                                href={`/catalogo/${item.slug}`}
                                                                className="font-serif text-lg text-neutral-900 transition-colors hover:text-[#8a693c]"
                                                            >
                                                                {
                                                                    item.name
                                                                }
                                                            </Link>

                                                            {item.material && (
                                                                <p className="mt-1 text-xs text-neutral-500">
                                                                    {
                                                                        item.material
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <p className="shrink-0 text-sm font-medium text-neutral-900">
                                                            $
                                                            {itemTotal.toLocaleString(
                                                                "es-UY"
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Precio unitario */}
                                                    {item.quantity >
                                                        1 && (
                                                            <p className="mb-3 text-[11px] text-neutral-400 sm:mb-0 sm:mt-2">
                                                                $
                                                                {item.price.toLocaleString(
                                                                    "es-UY"
                                                                )}{" "}
                                                                por unidad
                                                            </p>
                                                        )}

                                                    {/* Acciones */}
                                                    <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-3 sm:mt-auto sm:border-t-0 sm:pt-5">

                                                        {/* Cantidad */}
                                                        <div>
                                                            <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-400 sm:text-xs sm:normal-case sm:tracking-normal sm:text-neutral-500">
                                                                Cantidad
                                                            </p>

                                                            <div className="inline-flex h-10 items-center border border-neutral-300 bg-white">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        decreaseQuantity(
                                                                            item
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !canDecrease
                                                                    }
                                                                    aria-label={`Disminuir cantidad de ${item.name}`}
                                                                    className="flex h-full w-10 items-center justify-center text-lg text-neutral-700 transition hover:bg-[#f3eee6] disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                                                                >
                                                                    −
                                                                </button>

                                                                <span className="flex h-full min-w-9 items-center justify-center border-x border-neutral-200 px-2 text-sm font-medium text-neutral-900">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        increaseQuantity(
                                                                            item
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !canIncrease
                                                                    }
                                                                    aria-label={`Aumentar cantidad de ${item.name}`}
                                                                    className="flex h-full w-10 items-center justify-center text-lg text-neutral-700 transition hover:bg-[#f3eee6] disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Eliminar */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeProduct(
                                                                    item.id
                                                                )
                                                            }
                                                            className="group flex min-h-10 items-center gap-2 self-end px-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900 sm:text-sm"
                                                        >
                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            >
                                                                <path d="M4 7h16" />

                                                                <path d="M9 7V4h6v3" />

                                                                <path d="M7 7l1 13h8l1-13" />

                                                                <path d="M10 11v5" />

                                                                <path d="M14 11v5" />
                                                            </svg>

                                                            Eliminar
                                                        </button>
                                                    </div>

                                                    {/* Stock */}
                                                    {!canIncrease &&
                                                        item.stock >
                                                        0 && (
                                                            <p className="mt-2 text-[10px] text-neutral-400">
                                                                Máximo disponible:{" "}
                                                                {
                                                                    item.stock
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                }
                            )}
                        </div>

                        {/* Acciones secundarias */}
                        <div className="mt-5 flex items-center justify-between gap-5">
                            <Link
                                href="/catalogo"
                                className="lezcano-arrow text-xs text-neutral-600 transition-colors hover:text-neutral-900 sm:text-sm"
                            >
                                <span className="arrow">
                                    ←
                                </span>

                                Seguir comprando
                            </Link>

                            <button
                                type="button"
                                onClick={
                                    emptyCart
                                }
                                className="text-xs text-neutral-400 underline underline-offset-4 transition hover:text-neutral-800 sm:text-sm"
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </div>

                    {/* Resumen */}
                    <aside className="border border-[#d8cfc1] bg-white p-5 sm:p-6 lg:sticky lg:top-32">
                        <div className="flex items-center justify-between">
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Resumen
                            </h2>

                            <span className="text-xs text-neutral-400">
                                {totalItems}{" "}
                                {totalItems ===
                                    1
                                    ? "pieza"
                                    : "piezas"}
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">
                                    Subtotal
                                </span>

                                <span className="font-medium text-neutral-900">
                                    $
                                    {subtotal.toLocaleString(
                                        "es-UY"
                                    )}
                                </span>
                            </div>

                            <div className="border-t border-neutral-200 pt-4">
                                <div className="flex items-end justify-between gap-4">
                                    <span className="font-serif text-lg text-neutral-900">
                                        Total parcial
                                    </span>

                                    <span className="font-serif text-2xl text-neutral-900">
                                        $
                                        {subtotal.toLocaleString(
                                            "es-UY"
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-neutral-200 pt-5">
                            <div className="flex items-start gap-3">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7541]"
                                    aria-hidden="true"
                                >
                                    <path d="M3 7h12v10H3z" />

                                    <path d="M15 10h3l3 3v4h-6" />

                                    <circle
                                        cx="7"
                                        cy="18"
                                        r="1.5"
                                    />

                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="1.5"
                                    />
                                </svg>

                                <p className="text-xs leading-5 text-neutral-500">
                                    El costo de envío
                                    o la modalidad de
                                    retiro se definirá
                                    durante el proceso
                                    de compra.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="lezcano-button mt-6 flex min-h-14 w-full items-center justify-center bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Continuar compra
                            <span className="ml-2">
                                →
                            </span>
                        </Link>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                            >
                                <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="10"
                                    rx="1"
                                />

                                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                            </svg>

                            Compra segura
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}