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
    const [selectedIndex, setSelectedIndex] =
        useState(0);

    if (images.length === 0) {
        return (
            <div className="mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center bg-neutral-100 sm:max-w-none">
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

    const selectedImage =
        images[selectedIndex];

    function previousImage() {
        setSelectedIndex(
            (current) =>
                current === 0
                    ? images.length - 1
                    : current - 1
        );
    }

    function nextImage() {
        setSelectedIndex(
            (current) =>
                current ===
                    images.length - 1
                    ? 0
                    : current + 1
        );
    }

    return (
        <div>
            {/* Imagen principal */}
            <div className="relative mx-auto w-full max-w-[420px] sm:max-w-none">

                <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img
                        src={
                            selectedImage.url
                        }
                        alt={
                            selectedImage.alt
                        }
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Navegación móvil */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={
                                previousImage
                            }
                            aria-label="Imagen anterior"
                            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-neutral-900 shadow-sm backdrop-blur-sm transition hover:bg-white sm:hidden"
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onClick={
                                nextImage
                            }
                            aria-label="Imagen siguiente"
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-neutral-900 shadow-sm backdrop-blur-sm transition hover:bg-white sm:hidden"
                        >
                            →
                        </button>

                        <div className="absolute bottom-3 right-3 rounded-full bg-neutral-950/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm sm:hidden">
                            {selectedIndex + 1}
                            {" / "}
                            {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Indicadores móvil */}
            {images.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
                    {images.map(
                        (
                            image,
                            index
                        ) => {
                            const active =
                                selectedIndex ===
                                index;

                            return (
                                <button
                                    key={
                                        image.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedIndex(
                                            index
                                        )
                                    }
                                    aria-label={`Ver imagen ${index +
                                        1
                                        } de ${productName
                                        }`}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${active
                                        ? "w-6 bg-[#9a7541]"
                                        : "w-1.5 bg-neutral-300"
                                        }`}
                                />
                            );
                        }
                    )}
                </div>
            )}

            {/* Miniaturas tablet / escritorio */}
            {images.length > 1 && (
                <div className="mt-4 hidden grid-cols-4 gap-3 sm:grid sm:grid-cols-5">
                    {images.map(
                        (
                            image,
                            index
                        ) => {
                            const active =
                                selectedIndex ===
                                index;

                            return (
                                <button
                                    key={
                                        image.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        setSelectedIndex(
                                            index
                                        )
                                    }
                                    aria-label={`Ver imagen ${index +
                                        1
                                        } de ${productName
                                        }`}
                                    className={`aspect-square overflow-hidden border bg-neutral-100 transition ${active
                                        ? "border-neutral-900"
                                        : "border-neutral-200 hover:border-neutral-500"
                                        }`}
                                >
                                    <img
                                        src={
                                            image.url
                                        }
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                                    />
                                </button>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}