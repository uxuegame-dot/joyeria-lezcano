"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCartCount } from "@/app/lib/cart";

export function CartIndicator() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        function updateCount() {
            setCount(getCartCount());
        }

        updateCount();

        window.addEventListener(
            "cart-updated",
            updateCount
        );

        window.addEventListener(
            "storage",
            updateCount
        );

        return () => {
            window.removeEventListener(
                "cart-updated",
                updateCount
            );

            window.removeEventListener(
                "storage",
                updateCount
            );
        };
    }, []);

    return (
        <Link
            href="/carrito"
            aria-label={`Carrito${count > 0 ? ` con ${count} productos` : ""}`}
            title="Carrito"
            className="group relative flex h-10 w-10 items-center justify-center text-neutral-200 transition-all duration-300 hover:text-[#d6b777]"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-[22px] w-[22px] transition-transform duration-300 group-hover:-translate-y-0.5"
                aria-hidden="true"
            >
                <path d="M5 8h14l-1 12H6L5 8Z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>

            {count > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#b28a53] px-1 text-[10px] font-semibold leading-none text-white shadow-sm">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    );
}