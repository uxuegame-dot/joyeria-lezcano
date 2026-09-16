"use client";

import {
    ChangeEvent,
    useState,
} from "react";

import { createClient } from "@/app/lib/supabase/client";

type ProductImage = {
    id: string;
    storage_path: string;
    alt_text: string;
    sort_order: number;
};

type ProductImageManagerProps = {
    productId: string;
    productName: string;
    initialImages: ProductImage[];
};

export function ProductImageManager({
    productId,
    productName,
    initialImages,
}: ProductImageManagerProps) {
    const supabase = createClient();

    const [images, setImages] =
        useState<ProductImage[]>(
            [...initialImages].sort(
                (a, b) =>
                    a.sort_order - b.sort_order
            )
        );

    const [uploading, setUploading] =
        useState(false);

    const [processingId, setProcessingId] =
        useState<string | null>(null);

    const [message, setMessage] =
        useState<string | null>(null);

    function getPublicUrl(
        storagePath: string
    ) {
        const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(storagePath);

        return data.publicUrl;
    }

    async function handleUpload(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files = event.target.files;

        if (!files || files.length === 0) {
            return;
        }

        setUploading(true);
        setMessage(null);

        try {
            const uploadedImages: ProductImage[] =
                [];

            const highestSortOrder =
                images.length > 0
                    ? Math.max(
                        ...images.map(
                            (image) =>
                                image.sort_order
                        )
                    )
                    : -1;

            for (
                const file of Array.from(files)
            ) {
                if (
                    ![
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                    ].includes(file.type)
                ) {
                    throw new Error(
                        `"${file.name}" no es una imagen válida.`
                    );
                }

                const extension =
                    file.name
                        .split(".")
                        .pop()
                        ?.toLowerCase() ||
                    "jpg";

                const fileName =
                    `${crypto.randomUUID()}.${extension}`;

                const storagePath =
                    `${productId}/${fileName}`;

                const { error: uploadError } =
                    await supabase.storage
                        .from("product-images")
                        .upload(
                            storagePath,
                            file,
                            {
                                cacheControl:
                                    "3600",
                                upsert: false,
                                contentType:
                                    file.type,
                            }
                        );

                if (uploadError) {
                    throw new Error(
                        `No se pudo subir "${file.name}": ${uploadError.message}`
                    );
                }

                const nextSortOrder =
                    highestSortOrder +
                    1 +
                    uploadedImages.length;

                const {
                    data: imageRecord,
                    error: databaseError,
                } = await supabase
                    .from("product_images")
                    .insert({
                        product_id: productId,
                        storage_path:
                            storagePath,
                        alt_text:
                            productName,
                        sort_order:
                            nextSortOrder,
                    })
                    .select(
                        "id, storage_path, alt_text, sort_order"
                    )
                    .single();

                if (databaseError) {
                    await supabase.storage
                        .from(
                            "product-images"
                        )
                        .remove([
                            storagePath,
                        ]);

                    throw new Error(
                        `La imagen se subió, pero no pudo asociarse al producto: ${databaseError.message}`
                    );
                }

                uploadedImages.push(
                    imageRecord
                );
            }

            setImages((current) =>
                [
                    ...current,
                    ...uploadedImages,
                ].sort(
                    (a, b) =>
                        a.sort_order -
                        b.sort_order
                )
            );

            setMessage(
                uploadedImages.length === 1
                    ? "Imagen subida correctamente."
                    : `${uploadedImages.length} imágenes subidas correctamente.`
            );

            event.target.value = "";
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al subir las imágenes."
            );
        } finally {
            setUploading(false);
        }
    }

    /*
     * Intercambia dos posiciones utilizando
     * un valor temporal para no violar la
     * restricción UNIQUE(product_id, sort_order).
     */
    async function swapImages(
        first: ProductImage,
        second: ProductImage
    ) {
        const firstOrder =
            first.sort_order;

        const secondOrder =
            second.sort_order;

        const temporaryOrder = -1;

        const { error: temporaryError } =
            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        temporaryOrder,
                })
                .eq("id", first.id)
                .eq(
                    "product_id",
                    productId
                );

        if (temporaryError) {
            throw new Error(
                temporaryError.message
            );
        }

        const { error: secondError } =
            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        firstOrder,
                })
                .eq("id", second.id)
                .eq(
                    "product_id",
                    productId
                );

        if (secondError) {
            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        firstOrder,
                })
                .eq("id", first.id)
                .eq(
                    "product_id",
                    productId
                );

            throw new Error(
                secondError.message
            );
        }

        const { error: firstError } =
            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        secondOrder,
                })
                .eq("id", first.id)
                .eq(
                    "product_id",
                    productId
                );

        if (firstError) {
            /*
             * Intentamos restaurar las
             * posiciones originales.
             */
            await supabase
                .from("product_images")
                .update({
                    sort_order: -1,
                })
                .eq("id", second.id)
                .eq(
                    "product_id",
                    productId
                );

            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        firstOrder,
                })
                .eq("id", first.id)
                .eq(
                    "product_id",
                    productId
                );

            await supabase
                .from("product_images")
                .update({
                    sort_order:
                        secondOrder,
                })
                .eq("id", second.id)
                .eq(
                    "product_id",
                    productId
                );

            throw new Error(
                firstError.message
            );
        }

        setImages((current) =>
            current
                .map((image) => {
                    if (
                        image.id ===
                        first.id
                    ) {
                        return {
                            ...image,
                            sort_order:
                                secondOrder,
                        };
                    }

                    if (
                        image.id ===
                        second.id
                    ) {
                        return {
                            ...image,
                            sort_order:
                                firstOrder,
                        };
                    }

                    return image;
                })
                .sort(
                    (a, b) =>
                        a.sort_order -
                        b.sort_order
                )
        );
    }

    async function handleMove(
        imageId: string,
        direction: "left" | "right"
    ) {
        const sorted = [...images].sort(
            (a, b) =>
                a.sort_order -
                b.sort_order
        );

        const index =
            sorted.findIndex(
                (image) =>
                    image.id === imageId
            );

        if (index === -1) {
            return;
        }

        const targetIndex =
            direction === "left"
                ? index - 1
                : index + 1;

        if (
            targetIndex < 0 ||
            targetIndex >=
            sorted.length
        ) {
            return;
        }

        const currentImage =
            sorted[index];

        const targetImage =
            sorted[targetIndex];

        setProcessingId(imageId);
        setMessage(null);

        try {
            await swapImages(
                currentImage,
                targetImage
            );

            setMessage(
                "Orden de imágenes actualizado."
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? `No se pudo cambiar el orden: ${error.message}`
                    : "No se pudo cambiar el orden."
            );
        } finally {
            setProcessingId(null);
        }
    }

    async function handleSetMain(
        imageId: string
    ) {
        const sorted = [...images].sort(
            (a, b) =>
                a.sort_order -
                b.sort_order
        );

        const selected =
            sorted.find(
                (image) =>
                    image.id === imageId
            );

        const main = sorted[0];

        if (!selected || !main) {
            return;
        }

        if (
            selected.id === main.id
        ) {
            return;
        }

        setProcessingId(imageId);
        setMessage(null);

        try {
            await swapImages(
                selected,
                main
            );

            setMessage(
                "Imagen principal actualizada correctamente."
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? `No se pudo cambiar la imagen principal: ${error.message}`
                    : "No se pudo cambiar la imagen principal."
            );
        } finally {
            setProcessingId(null);
        }
    }

    async function handleDelete(
        image: ProductImage
    ) {
        const confirmed =
            window.confirm(
                "¿Seguro que querés eliminar esta imagen? Esta acción no se puede deshacer."
            );

        if (!confirmed) {
            return;
        }

        setProcessingId(image.id);
        setMessage(null);

        try {
            const {
                error: databaseError,
            } = await supabase
                .from("product_images")
                .delete()
                .eq("id", image.id)
                .eq(
                    "product_id",
                    productId
                );

            if (databaseError) {
                throw new Error(
                    `No se pudo eliminar el registro: ${databaseError.message}`
                );
            }

            const {
                error: storageError,
            } = await supabase.storage
                .from("product-images")
                .remove([
                    image.storage_path,
                ]);

            if (storageError) {
                throw new Error(
                    `El registro fue eliminado, pero no se pudo borrar el archivo de Storage: ${storageError.message}`
                );
            }

            const remainingImages =
                images
                    .filter(
                        (
                            currentImage
                        ) =>
                            currentImage.id !==
                            image.id
                    )
                    .sort(
                        (a, b) =>
                            a.sort_order -
                            b.sort_order
                    );

            /*
             * Primero asignamos posiciones
             * temporales negativas.
             */
            for (
                let index = 0;
                index <
                remainingImages.length;
                index++
            ) {
                const currentImage =
                    remainingImages[
                    index
                    ];

                const { error } =
                    await supabase
                        .from(
                            "product_images"
                        )
                        .update({
                            sort_order:
                                -(
                                    index +
                                    1
                                ),
                        })
                        .eq(
                            "id",
                            currentImage.id
                        )
                        .eq(
                            "product_id",
                            productId
                        );

                if (error) {
                    throw new Error(
                        `No se pudo reorganizar las imágenes: ${error.message}`
                    );
                }
            }

            /*
             * Después normalizamos:
             * 0, 1, 2, 3...
             */
            const normalizedImages: ProductImage[] =
                [];

            for (
                let index = 0;
                index <
                remainingImages.length;
                index++
            ) {
                const currentImage =
                    remainingImages[
                    index
                    ];

                const { error } =
                    await supabase
                        .from(
                            "product_images"
                        )
                        .update({
                            sort_order:
                                index,
                        })
                        .eq(
                            "id",
                            currentImage.id
                        )
                        .eq(
                            "product_id",
                            productId
                        );

                if (error) {
                    throw new Error(
                        `No se pudo reorganizar las imágenes: ${error.message}`
                    );
                }

                normalizedImages.push({
                    ...currentImage,
                    sort_order:
                        index,
                });
            }

            setImages(
                normalizedImages
            );

            setMessage(
                "Imagen eliminada correctamente."
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo eliminar la imagen."
            );
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <section className="mt-10 border-t border-neutral-200 pt-8">
            <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Imágenes
                </p>

                <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                    Imágenes del producto
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                    Subí fotografías y ordenalas
                    como querés que aparezcan.
                    La primera será la imagen
                    principal del producto.
                </p>
            </div>

            <div className="mt-6">
                <label
                    className={`inline-flex items-center justify-center border border-neutral-900 bg-white px-5 py-3 text-sm font-medium text-neutral-900 transition ${uploading
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-neutral-50"
                        }`}
                >
                    {uploading
                        ? "Subiendo..."
                        : "+ Agregar imágenes"}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={
                            uploading ||
                            processingId !==
                            null
                        }
                        onChange={
                            handleUpload
                        }
                        className="sr-only"
                    />
                </label>

                <p className="mt-2 text-xs text-neutral-500">
                    Formatos admitidos: JPG,
                    PNG y WebP.
                </p>

                {message && (
                    <div
                        role="status"
                        className="mt-4 border border-neutral-200 bg-neutral-50 px-4 py-3"
                    >
                        <p className="text-sm font-medium text-neutral-900">
                            {message}
                        </p>
                    </div>
                )}
            </div>

            {images.length > 0 ? (
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[...images]
                        .sort(
                            (a, b) =>
                                a.sort_order -
                                b.sort_order
                        )
                        .map(
                            (
                                image,
                                index
                            ) => {
                                const isMain =
                                    index ===
                                    0;

                                const isProcessing =
                                    processingId ===
                                    image.id;

                                const canMoveLeft =
                                    index > 0;

                                const canMoveRight =
                                    index <
                                    images.length -
                                    1;

                                return (
                                    <article
                                        key={
                                            image.id
                                        }
                                        className={`overflow-hidden border bg-white ${isMain
                                            ? "border-neutral-900"
                                            : "border-neutral-200"
                                            }`}
                                    >
                                        <div className="relative aspect-square bg-neutral-100">
                                            <img
                                                src={getPublicUrl(
                                                    image.storage_path
                                                )}
                                                alt={
                                                    image.alt_text ||
                                                    productName
                                                }
                                                className="h-full w-full object-cover"
                                            />

                                            <span
                                                className={`absolute left-3 top-3 px-3 py-1.5 text-xs font-medium ${isMain
                                                    ? "bg-neutral-900 text-white"
                                                    : "bg-white/95 text-neutral-900"
                                                    }`}
                                            >
                                                {isMain
                                                    ? "Principal"
                                                    : `Imagen ${index +
                                                    1
                                                    }`}
                                            </span>
                                        </div>

                                        <div className="p-4">
                                            <p className="text-sm font-medium text-neutral-900">
                                                {isMain
                                                    ? "Imagen principal"
                                                    : `Imagen ${index +
                                                    1
                                                    }`}
                                            </p>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !canMoveLeft ||
                                                        processingId !==
                                                        null
                                                    }
                                                    onClick={() =>
                                                        handleMove(
                                                            image.id,
                                                            "left"
                                                        )
                                                    }
                                                    className="border border-neutral-300 px-3 py-2 text-sm text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    ←
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={
                                                        !canMoveRight ||
                                                        processingId !==
                                                        null
                                                    }
                                                    onClick={() =>
                                                        handleMove(
                                                            image.id,
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
                                                    disabled={
                                                        processingId !==
                                                        null
                                                    }
                                                    onClick={() =>
                                                        handleSetMain(
                                                            image.id
                                                        )
                                                    }
                                                    className="mt-2 w-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isProcessing
                                                        ? "Procesando..."
                                                        : "Usar como principal"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                disabled={
                                                    processingId !==
                                                    null
                                                }
                                                onClick={() =>
                                                    handleDelete(
                                                        image
                                                    )
                                                }
                                                className="mt-2 w-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isProcessing
                                                    ? "Procesando..."
                                                    : "Eliminar imagen"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                </div>
            ) : (
                <div className="mt-8 border border-dashed border-neutral-300 px-6 py-12 text-center">
                    <p className="text-sm text-neutral-600">
                        Este producto todavía no
                        tiene imágenes.
                    </p>
                </div>
            )}
        </section>
    );
}