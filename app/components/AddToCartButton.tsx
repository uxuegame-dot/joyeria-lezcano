"use client";

import { useState } from "react";
import { addToCart } from "@/app/lib/cart";

type AddToCartButtonProps = {
    product: {
        id: string;
        slug: string;
        name: string;
        price: number;
        stock: number;
        material: string | null;
        imageUrl: string | null;
    };
};

export function AddToCartButton({
    product,
}: AddToCartButtonProps) {
    const [added, setAdded] = useState(false);

    function handleAddToCart() {
        if (product.stock <= 0) {
            return;
        }

        addToCart({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock,
            material: product.material,
            imageUrl: product.imageUrl,
        });

        setAdded(true);

        window.setTimeout(() => {
            setAdded(false);
        }, 1500);
    }

    return (
        <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-neutral-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
            {added ? "Agregado al carrito ✓" : "Agregar al carrito"}
        </button>
    );
}