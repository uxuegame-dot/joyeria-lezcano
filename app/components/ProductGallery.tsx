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
            <div className="mx-auto flex aspect-square w-full max-w-[350px] items-center justify-center rounded-[20px] border border-[#e2d9cc] bg-[#f0ebe3] sm:max-w-[420px] lg:max-w-[460px]">
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
                current === images.length - 1
                    ? 0
                    : current + 1
        );
    }

    return (
        <div className="mx-auto w-full max-w-[350px] sm:max-w-[420px] lg:max-w-[460px]">
            <div className="relative overflow-hidden rounded-[20px] border border-[#e2d9cc] bg-[#efeae2] shadow-[0_12px_32px_rgba(78,59,38,0.05)]">
                <div className="aspect-square overflow-hidden">
                    <img
                        src={selectedImage.url}
                        alt={selectedImage.alt}
                        className="h-full w-full object-cover"
                    />
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={previousImage}
                            aria-label="Imagen anterior"
                            className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-base text-neutral-900 shadow-sm backdrop-blur-sm transition hover:bg-white sm:hidden"
                        >
                            ←
                        </button>

                        <button
                            type="button"
                            onClick={nextImage}
                            aria-label="Imagen siguiente"
                            className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-base text-neutral-900 shadow-sm backdrop-blur-sm transition hover:bg-white sm:hidden"
                        >
                            →
                        </button>

                        <div className="absolute bottom-2.5 right-2.5 rounded-full bg-neutral-950/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm sm:hidden">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-2.5 flex justify-center gap-1.5 sm:hidden">
                    {images.map((image, index) => {
                        const active =
                            selectedIndex === index;

                        return (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    active
                                        ? "w-5 bg-[#9a7541]"
                                        : "w-1.5 bg-neutral-300"
                                }`}
                            />
                        );
                    })}
                </div>
            )}

            {images.length > 1 && (
                <div className="mt-3 hidden grid-cols-5 gap-2.5 sm:grid">
                    {images.map((image, index) => {
                        const active =
                            selectedIndex === index;

                        return (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                                className={`aspect-square overflow-hidden rounded-[12px] border bg-neutral-100 transition ${
                                    active
                                        ? "border-[#9a7541] ring-1 ring-[#9a7541]/20"
                                        : "border-[#ddd5c9] hover:border-[#b28a53]"
                                }`}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
