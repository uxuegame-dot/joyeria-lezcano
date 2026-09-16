"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    type CartItem,
    clearCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
} from "@/app/lib/cart";

export function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

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

    function removeProduct(
        productId: string
    ) {
        removeFromCart(productId);
    }

    function emptyCart() {
        clearCart();
    }

    const subtotal = cart.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0
    );

    if (!loaded) {
        return null;
    }

    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="border border-neutral-200 bg-white px-6 py-16 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Tu selección
                    </p>

                    <h1 className="mt-3 font-serif text-3xl text-neutral-900 sm:text-4xl">
                        Tu carrito está vacío
                    </h1>

                    <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-600">
                        Explorá el catálogo y
                        agregá las piezas que
                        quieras comprar.
                    </p>

                    <Link
                        href="/catalogo"
                        className="mt-7 inline-block bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Ver catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mb-10">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Tu selección
                </p>

                <h1 className="mt-3 font-serif text-4xl text-neutral-900">
                    Carrito
                </h1>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
                <div>
                    <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                        {cart.map((item) => (
                            <article
                                key={item.id}
                                className="grid grid-cols-[100px_1fr] gap-5 py-6 sm:grid-cols-[130px_1fr]"
                            >
                                <Link
                                    href={`/catalogo/${item.slug}`}
                                    className="block aspect-square overflow-hidden bg-neutral-100"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={
                                                item.imageUrl
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                            Sin imagen
                                        </div>
                                    )}
                                </Link>

                                <div className="flex min-w-0 flex-col">
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <Link
                                                href={`/catalogo/${item.slug}`}
                                                className="font-medium text-neutral-900 hover:underline"
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
                                            {(
                                                item.price *
                                                item.quantity
                                            ).toLocaleString(
                                                "es-UY"
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                                        <div>
                                            <label
                                                htmlFor={`quantity-${item.id}`}
                                                className="mb-1 block text-xs text-neutral-500"
                                            >
                                                Cantidad
                                            </label>

                                            <select
                                                id={`quantity-${item.id}`}
                                                value={
                                                    item.quantity
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    changeQuantity(
                                                        item.id,
                                                        Number(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                                }
                                                className="border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
                                            >
                                                {Array.from(
                                                    {
                                                        length:
                                                            item.stock,
                                                    },
                                                    (
                                                        _,
                                                        index
                                                    ) =>
                                                        index +
                                                        1
                                                ).map(
                                                    (
                                                        quantity
                                                    ) => (
                                                        <option
                                                            key={
                                                                quantity
                                                            }
                                                            value={
                                                                quantity
                                                            }
                                                        >
                                                            {
                                                                quantity
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeProduct(
                                                    item.id
                                                )
                                            }
                                            className="text-sm text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={emptyCart}
                        className="mt-5 text-sm text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                    >
                        Vaciar carrito
                    </button>
                </div>

                <aside className="h-fit border border-neutral-200 bg-white p-6">
                    <h2 className="font-serif text-2xl text-neutral-900">
                        Resumen
                    </h2>

                    <div className="mt-6 flex justify-between border-b border-neutral-200 pb-5 text-sm">
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

                    <p className="mt-5 text-xs leading-5 text-neutral-500">
                        El costo de envío o retiro
                        se definirá durante el
                        proceso de compra.
                    </p>

                    <Link
                        href="/checkout"
                        className="mt-6 block w-full bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                        Continuar compra
                    </Link>

                    <Link
                        href="/catalogo"
                        className="mt-4 block text-center text-sm text-neutral-600 underline underline-offset-4 hover:text-neutral-900"
                    >
                        Seguir viendo productos
                    </Link>
                </aside>
            </div>
        </div>
    );
}