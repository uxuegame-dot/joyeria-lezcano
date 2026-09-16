"use client";

import {
    ChangeEvent,
    useEffect,
    useState,
} from "react";

type SelectedImage = {
    id: string;
    file: File;
    previewUrl: string;
};

export function NewProductImages() {
    const [images, setImages] = useState<SelectedImage[]>([]);

    useEffect(() => {
        return () => {
            images.forEach((image) => {
                URL.revokeObjectURL(image.previewUrl);
            });
        };
    }, [images]);

    function handleImagesChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(event.target.files ?? []);

        const validFiles = files.filter((file) =>
            [
                "image/jpeg",
                "image/png",
                "image/webp",
            ].includes(file.type)
        );

        const newImages = validFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setImages((current) => [
            ...current,
            ...newImages,
        ]);

        event.target.value = "";
    }

    function moveImage(
        index: number,
        direction: "left" | "right"
    ) {
        const targetIndex =
            direction === "left"
                ? index - 1
                : index + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= images.length
        ) {
            return;
        }

        setImages((current) => {
            const next = [...current];

            [next[index], next[targetIndex]] = [
                next[targetIndex],
                next[index],
            ];

            return next;
        });
    }

    function setAsMain(index: number) {
        if (index === 0) {
            return;
        }

        setImages((current) => {
            const next = [...current];

            const [selected] = next.splice(index, 1);

            next.unshift(selected);

            return next;
        });
    }

    function removeImage(index: number) {
        setImages((current) => {
            const next = [...current];

            const [removed] = next.splice(index, 1);

            if (removed) {
                URL.revokeObjectURL(
                    removed.previewUrl
                );
            }

            return next;
        });
    }

    return (
        <section className="border-t border-neutral-200 pt-8">
            <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Imágenes
                </p>

                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                    Fotografías del producto
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                    Agregá las fotografías y ordenalas como
                    querés que aparezcan en el catálogo.
                    La primera será la imagen principal.
                </p>
            </div>

            <div className="mt-6">
                <label className="inline-flex cursor-pointer items-center justify-center border border-neutral-900 bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50">
                    + Agregar fotografías

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImagesChange}
                        className="sr-only"
                    />
                </label>

                <p className="mt-2 text-xs text-neutral-500">
                    Formatos admitidos: JPG, PNG y WebP.
                </p>
            </div>

            {/*
                Los inputs file reales que se envían al servidor.
                DataTransfer nos permite conservar el orden visual.
            */}
            <OrderedFileInputs images={images} />

            {images.length > 0 ? (
                <div className="mt-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {images.map((image, index) => {
                            const isMain = index === 0;
                            const canMoveLeft = index > 0;
                            const canMoveRight =
                                index < images.length - 1;

                            return (
                                <article
                                    key={image.id}
                                    className={`overflow-hidden border bg-white ${isMain
                                        ? "border-neutral-900"
                                        : "border-neutral-200"
                                        }`}
                                >
                                    <div className="relative aspect-square bg-neutral-100">
                                        <img
                                            src={image.previewUrl}
                                            alt={`Vista previa ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />

                                        {isMain && (
                                            <span className="absolute left-3 top-3 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white">
                                                Principal
                                            </span>
                                        )}

                                        {!isMain && (
                                            <span className="absolute left-3 top-3 bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-900">
                                                Imagen {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <p className="truncate text-sm font-medium text-neutral-900">
                                            {image.file.name}
                                        </p>

                                        <p className="mt-1 text-xs text-neutral-500">
                                            {(
                                                image.file.size /
                                                1024 /
                                                1024
                                            ).toFixed(1)}{" "}
                                            MB
                                        </p>

                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                disabled={!canMoveLeft}
                                                onClick={() =>
                                                    moveImage(
                                                        index,
                                                        "left"
                                                    )
                                                }
                                                className="border border-neutral-300 px-3 py-2 text-sm text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ←
                                            </button>

                                            <button
                                                type="button"
                                                disabled={!canMoveRight}
                                                onClick={() =>
                                                    moveImage(
                                                        index,
                                                        "right"
                                                    )
                                                }
                                                className="border border-neutral-300 px-3 py-2 text-sm text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                →
                                            </button>
                                        </div>

                                        {!isMain && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setAsMain(index)
                                                }
                                                className="mt-2 w-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
                                            >
                                                Usar como principal
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeImage(index)
                                            }
                                            className="mt-2 w-full border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-neutral-500">
                        Usá las flechas para cambiar el orden.
                        La primera fotografía será la principal;
                        las siguientes aparecerán como Imagen 2,
                        Imagen 3, etc.
                    </p>
                </div>
            ) : (
                <div className="mt-8 border border-dashed border-neutral-300 px-6 py-10 text-center">
                    <p className="text-sm text-neutral-600">
                        Todavía no seleccionaste fotografías.
                    </p>

                    <p className="mt-2 text-xs text-neutral-500">
                        Los borradores pueden guardarse sin
                        imágenes. Para publicar un producto
                        necesitás al menos una fotografía.
                    </p>
                </div>
            )}
        </section>
    );
}

function OrderedFileInputs({
    images,
}: {
    images: SelectedImage[];
}) {
    return (
        <>
            {images.map((image) => (
                <FileInput
                    key={image.id}
                    file={image.file}
                />
            ))}
        </>
    );
}

function FileInput({
    file,
}: {
    file: File;
}) {
    const [input, setInput] =
        useState<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!input) {
            return;
        }

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        input.files = dataTransfer.files;
    }, [input, file]);

    return (
        <input
            ref={setInput}
            type="file"
            name="images"
            className="hidden"
            tabIndex={-1}
        />
    );
}