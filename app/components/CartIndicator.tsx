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
            className="text-sm text-neutral-700 transition hover:text-neutral-900"
        >
            Carrito{count > 0 ? ` (${count})` : ""}
        </Link>
    );
}