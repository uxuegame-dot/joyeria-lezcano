"use client";

import {
    ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";

type PendingImage = {
    id: string;
    file: File;
    previewUrl: string;
};

const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function createImageId(
    file: File
) {
    return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

function sameFile(
    a: File,
    b: File
) {
    return (
        a.name === b.name &&
        a.size === b.size &&
        a.lastModified ===
        b.lastModified
    );
}

export function NewProductImages() {
    const hiddenFilesRef =
        useRef<HTMLInputElement | null>(
            null
        );

    const [
        images,
        setImages,
    ] = useState<
        PendingImage[]
    >([]);

    const [
        mainImageId,
        setMainImageId,
    ] = useState<
        string | null
    >(null);

    const [
        message,
        setMessage,
    ] = useState<
        string | null
    >(null);

    /*
     * Liberamos las URLs temporales
     * cuando el componente deja de existir.
     */
    useEffect(() => {
        return () => {
            images.forEach(
                (image) =>
                    URL.revokeObjectURL(
                        image.previewUrl
                    )
            );
        };
    }, [images]);

    function syncFormFiles(
        nextImages: PendingImage[]
    ) {
        const input =
            hiddenFilesRef.current;

        if (!input) {
            return;
        }

        const transfer =
            new DataTransfer();

        nextImages.forEach(
            (image) => {
                transfer.items.add(
                    image.file
                );
            }
        );

        input.files =
            transfer.files;
    }

    function addFiles(
        incomingFiles: File[]
    ) {
        setMessage(null);

        const invalidFile =
            incomingFiles.find(
                (file) =>
                    !ACCEPTED_TYPES.includes(
                        file.type
                    )
            );

        if (invalidFile) {
            setMessage(
                `"${invalidFile.name}" no tiene un formato admitido. Usá JPG, PNG o WebP.`
            );
            return;
        }

        const uniqueFiles =
            incomingFiles.filter(
                (incoming) =>
                    !images.some(
                        (current) =>
                            sameFile(
                                current.file,
                                incoming
                            )
                    )
            );

        if (
            uniqueFiles.length === 0
        ) {
            setMessage(
                "Esas imágenes ya están seleccionadas."
            );
            return;
        }

        const additions =
            uniqueFiles.map(
                (file) => ({
                    id: createImageId(
                        file
                    ),
                    file,
                    previewUrl:
                        URL.createObjectURL(
                            file
                        ),
                })
            );

        const nextImages = [
            ...images,
            ...additions,
        ];

        setImages(
            nextImages
        );

        if (!mainImageId) {
            setMainImageId(
                nextImages[0]?.id ??
                null
            );
        }

        syncFormFiles(
            nextImages
        );

        setMessage(
            additions.length ===
                1
                ? "Foto agregada."
                : `${additions.length} fotos agregadas.`
        );
    }

    function handlePickerChange(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files =
            event.target.files;

        if (
            !files ||
            files.length === 0
        ) {
            return;
        }

        addFiles(
            Array.from(files)
        );

        /*
         * Permite volver a elegir
         * el mismo archivo más adelante.
         */
        event.target.value =
            "";
    }

    function removeImage(
        imageId: string
    ) {
        const image =
            images.find(
                (current) =>
                    current.id ===
                    imageId
            );

        if (image) {
            URL.revokeObjectURL(
                image.previewUrl
            );
        }

        const nextImages =
            images.filter(
                (current) =>
                    current.id !==
                    imageId
            );

        setImages(
            nextImages
        );

        if (
            mainImageId ===
            imageId
        ) {
            setMainImageId(
                nextImages[0]?.id ??
                null
            );
        }

        syncFormFiles(
            nextImages
        );

        setMessage(
            "Foto eliminada de la selección."
        );
    }

    const mainImageIndex =
        Math.max(
            0,
            images.findIndex(
                (image) =>
                    image.id ===
                    mainImageId
            )
        );

    return (
        <div>
            <input
                ref={
                    hiddenFilesRef
                }
                type="file"
                name="images"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
            />

            <input
                type="hidden"
                name="main_image_index"
                value={
                    mainImageIndex
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                        Fotografías
                    </p>

                    <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                        Imágenes del
                        producto
                    </h2>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500 sm:text-sm">
                        Sacá una foto o
                        elegí imágenes que
                        ya tengas en el
                        dispositivo.
                    </p>
                </div>

                {images.length >
                    0 && (
                        <p className="text-[10px] text-neutral-400">
                            {
                                images.length
                            }{" "}
                            {images.length ===
                                1
                                ? "foto"
                                : "fotos"}
                        </p>
                    )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-[#9a7541] sm:text-sm">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                        aria-hidden="true"
                    >
                        <path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4z" />
                        <circle
                            cx="12"
                            cy="13.5"
                            r="3.25"
                        />
                    </svg>

                    Tomar foto

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        onChange={
                            handlePickerChange
                        }
                        className="sr-only"
                    />
                </label>

                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 border border-neutral-300 bg-white px-4 text-xs font-medium text-neutral-800 transition hover:border-neutral-900 sm:text-sm">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-4 w-4"
                        aria-hidden="true"
                    >
                        <rect
                            x="3.5"
                            y="4.5"
                            width="17"
                            height="15"
                            rx="1"
                        />
                        <circle
                            cx="9"
                            cy="10"
                            r="1.5"
                        />
                        <path d="m5.5 17 4.2-4.2 3.2 3 2.2-2.2 3.4 3.4" />
                    </svg>

                    Elegir fotos

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={
                            handlePickerChange
                        }
                        className="sr-only"
                    />
                </label>
            </div>

            <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                En celular, “Tomar
                foto” intenta abrir la
                cámara trasera. JPG,
                PNG o WebP.
            </p>

            {message && (
                <div
                    role="status"
                    className="mt-3 border border-neutral-200 bg-[#faf8f4] px-3 py-2 text-xs text-neutral-600"
                >
                    {message}
                </div>
            )}

            {images.length ===
                0 ? (
                <div className="mt-4 flex min-h-28 items-center justify-center border border-dashed border-neutral-300 bg-[#fafafa] px-4 text-center">
                    <p className="max-w-sm text-xs leading-5 text-neutral-500">
                        Todavía no
                        agregaste fotos.
                        Si publicás el
                        producto, necesitás
                        al menos una.
                    </p>
                </div>
            ) : (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {images.map(
                        (
                            image,
                            index
                        ) => {
                            const isMain =
                                image.id ===
                                mainImageId;

                            return (
                                <article
                                    key={
                                        image.id
                                    }
                                    className={`overflow-hidden border bg-white ${isMain
                                        ? "border-[#b28a53]"
                                        : "border-neutral-200"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMainImageId(
                                                image.id
                                            )
                                        }
                                        className="relative block aspect-square w-full bg-neutral-100 text-left"
                                        aria-label={`Usar ${image.file.name} como imagen principal`}
                                    >
                                        <img
                                            src={
                                                image.previewUrl
                                            }
                                            alt={`Vista previa ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />

                                        {isMain && (
                                            <span className="absolute left-2 top-2 bg-neutral-900 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.1em] text-white">
                                                Principal
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-between gap-2 p-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMainImageId(
                                                    image.id
                                                )
                                            }
                                            disabled={
                                                isMain
                                            }
                                            className="min-w-0 truncate text-left text-[9px] font-medium text-[#806037] disabled:text-neutral-400"
                                        >
                                            {isMain
                                                ? "Principal"
                                                : "Hacer principal"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeImage(
                                                    image.id
                                                )
                                            }
                                            className="shrink-0 text-[9px] text-red-600"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </article>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}