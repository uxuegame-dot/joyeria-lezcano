"use client";

import { useState } from "react";

type GalleryImage = {
    id: string;
    url: string;
    alt: string;
};

type ProductGalleryProps = {
    images: GalleryImage[];
    productName: string;
};

export function ProductGallery({
    images,
    productName,
}: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center bg-neutral-100">
                <div className="text-center">
                    <p className="text-sm font-medium text-neutral-600">
                        {productName}
                    </p>

                    <p className="mt-1 text-xs text-neutral-400">
                        Imagen próximamente
                    </p>
                </div>
            </div>
        );
    }

    const selectedImage = images[selectedIndex];

    return (
        <div>
            {/* Imagen principal */}
            <div className="aspect-square overflow-hidden bg-neutral-100">
                <img
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="h-full w-full object-cover"
                />
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => {
                        const active = selectedIndex === index;

                        return (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                                className={`aspect-square overflow-hidden border bg-neutral-100 transition ${active
                                    ? "border-neutral-900"
                                    : "border-neutral-200 hover:border-neutral-500"
                                    }`}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}