"use server";

import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";

type ProductActionResult = {
    error?: string;
};

function createSlug(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function getAdminClient() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            supabase,
            user: null,
            isAdmin: false,
        };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return {
        supabase,
        user,
        isAdmin: profile?.is_admin === true,
    };
}

function validateProductData(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();

    const description = String(
        formData.get("description") ?? ""
    ).trim();

    const categorySlug = String(
        formData.get("category") ?? ""
    ).trim();

    const material = String(
        formData.get("material") ?? ""
    ).trim();

    const priceValue = String(
        formData.get("price") ?? ""
    ).trim();

    const stockValue = String(
        formData.get("stock") ?? "0"
    ).trim();

    const productType = String(
        formData.get("product_type") ?? "direct"
    ).trim();

    const status = String(
        formData.get("status") ?? "draft"
    ).trim();

    const isFeatured =
        formData.get("is_featured") === "on";

    if (!name) {
        return {
            error: "El nombre del producto es obligatorio.",
        };
    }

    if (!categorySlug) {
        return {
            error: "Tenés que seleccionar una categoría.",
        };
    }

    const stock = Number(stockValue);

    if (!Number.isInteger(stock) || stock < 0) {
        return {
            error:
                "El stock debe ser un número entero mayor o igual a 0.",
        };
    }

    const validProductTypes = [
        "direct",
        "unique",
        "on_order",
        "custom",
    ];

    if (!validProductTypes.includes(productType)) {
        return {
            error: "El tipo de producto no es válido.",
        };
    }

    const validStatuses = [
        "draft",
        "active",
        "hidden",
    ];

    if (!validStatuses.includes(status)) {
        return {
            error: "El estado seleccionado no es válido.",
        };
    }

    let price: number | null = null;

    if (priceValue !== "") {
        price = Number(priceValue);

        if (!Number.isFinite(price) || price < 0) {
            return {
                error: "El precio debe ser un número válido.",
            };
        }
    }

    if (
        (productType === "direct" ||
            productType === "unique") &&
        (price === null || price <= 0)
    ) {
        return {
            error:
                "Los productos de venta directa o pieza única deben tener un precio mayor a 0.",
        };
    }

    return {
        data: {
            name,
            description,
            categorySlug,
            material,
            price,
            stock,
            productType,
            status,
            isFeatured,
        },
    };
}

function getImageFiles(formData: FormData) {
    return formData
        .getAll("images")
        .filter(
            (value): value is File =>
                value instanceof File &&
                value.size > 0
        );
}

function getFileExtension(file: File) {
    const extension = file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (extension) {
        return extension;
    }

    if (file.type === "image/png") {
        return "png";
    }

    if (file.type === "image/webp") {
        return "webp";
    }

    return "jpg";
}

export async function createProduct(
    formData: FormData
): Promise<ProductActionResult> {
    const { supabase, user, isAdmin } =
        await getAdminClient();

    if (!user) {
        return {
            error:
                "Tenés que iniciar sesión para realizar esta acción.",
        };
    }

    if (!isAdmin) {
        return {
            error:
                "No tenés permisos para crear productos.",
        };
    }

    const validation =
        validateProductData(formData);

    if (validation.error || !validation.data) {
        return {
            error: validation.error,
        };
    }

    const {
        name,
        description,
        categorySlug,
        material,
        price,
        stock,
        productType,
        status,
        isFeatured,
    } = validation.data;

    const imageFiles = getImageFiles(formData);

    for (const file of imageFiles) {
        if (!file.type.startsWith("image/")) {
            return {
                error: `"${file.name}" no es una imagen válida.`,
            };
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            return {
                error: `"${file.name}" tiene un formato no admitido. Usá JPG, PNG o WebP.`,
            };
        }
    }

    if (status === "active" && imageFiles.length === 0) {
        return {
            error:
                "Para publicar un producto tenés que agregar al menos una fotografía.",
        };
    }

    const mainImageIndexValue = Number(
        formData.get("main_image_index") ?? "0"
    );

    const mainImageIndex =
        Number.isInteger(mainImageIndexValue) &&
            mainImageIndexValue >= 0 &&
            mainImageIndexValue < imageFiles.length
            ? mainImageIndexValue
            : 0;

    const { data: category, error: categoryError } =
        await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .eq("active", true)
            .single();

    if (categoryError || !category) {
        return {
            error:
                "La categoría seleccionada no es válida.",
        };
    }

    const baseSlug = createSlug(name);

    if (!baseSlug) {
        return {
            error:
                "El nombre no permite generar un identificador válido.",
        };
    }

    let slug = baseSlug;

    const { data: existingProduct } =
        await supabase
            .from("products")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

    if (existingProduct) {
        slug = `${baseSlug}-${Date.now()}`;
    }

    const {
        data: product,
        error: insertError,
    } = await supabase
        .from("products")
        .insert({
            name,
            slug,
            description: description || null,
            category_id: category.id,
            material: material || null,
            price,
            stock,
            product_type: productType,
            status,
            is_featured: isFeatured,
            sort_order: 0,
        })
        .select("id")
        .single();

    if (insertError || !product) {
        console.error(
            "Error al crear producto:",
            insertError
        );

        return {
            error: `No se pudo guardar el producto: ${insertError?.message ??
                "No se obtuvo el identificador del producto."
                }`,
        };
    }

    const uploadedStoragePaths: string[] = [];

    try {
        if (imageFiles.length > 0) {
            const orderedFiles = [
                imageFiles[mainImageIndex],
                ...imageFiles.filter(
                    (_, index) =>
                        index !== mainImageIndex
                ),
            ];

            for (
                let index = 0;
                index < orderedFiles.length;
                index++
            ) {
                const file = orderedFiles[index];

                const extension =
                    getFileExtension(file);

                const fileName =
                    `${crypto.randomUUID()}.${extension}`;

                const storagePath =
                    `${product.id}/${fileName}`;

                const {
                    error: uploadError,
                } = await supabase.storage
                    .from("product-images")
                    .upload(storagePath, file, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type,
                    });

                if (uploadError) {
                    throw new Error(
                        `No se pudo subir "${file.name}": ${uploadError.message}`
                    );
                }

                uploadedStoragePaths.push(
                    storagePath
                );

                const {
                    error: imageInsertError,
                } = await supabase
                    .from("product_images")
                    .insert({
                        product_id: product.id,
                        storage_path:
                            storagePath,
                        alt_text: name,
                        sort_order: index,
                    });

                if (imageInsertError) {
                    throw new Error(
                        `No se pudo asociar "${file.name}" al producto: ${imageInsertError.message}`
                    );
                }
            }
        }
    } catch (error) {
        if (uploadedStoragePaths.length > 0) {
            await supabase.storage
                .from("product-images")
                .remove(uploadedStoragePaths);
        }

        await supabase
            .from("product_images")
            .delete()
            .eq("product_id", product.id);

        await supabase
            .from("products")
            .delete()
            .eq("id", product.id);

        console.error(
            "Error al crear producto con imágenes:",
            error
        );

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "No se pudo crear el producto con sus imágenes.",
        };
    }

    redirect("/administracion/productos");
}

export async function updateProduct(
    formData: FormData
): Promise<ProductActionResult> {
    const { supabase, user, isAdmin } =
        await getAdminClient();

    if (!user) {
        return {
            error:
                "Tenés que iniciar sesión para realizar esta acción.",
        };
    }

    if (!isAdmin) {
        return {
            error:
                "No tenés permisos para editar productos.",
        };
    }

    const productId = String(
        formData.get("product_id") ?? ""
    ).trim();

    if (!productId) {
        return {
            error:
                "No se encontró el producto que querés editar.",
        };
    }

    const validation =
        validateProductData(formData);

    if (validation.error || !validation.data) {
        return {
            error: validation.error,
        };
    }

    const {
        name,
        description,
        categorySlug,
        material,
        price,
        stock,
        productType,
        status,
        isFeatured,
    } = validation.data;

    const { data: category, error: categoryError } =
        await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .eq("active", true)
            .single();

    if (categoryError || !category) {
        return {
            error:
                "La categoría seleccionada no es válida.",
        };
    }

    /*
     * También protegemos la edición:
     * un producto no puede quedar publicado sin imágenes.
     */
    if (status === "active") {
        const {
            count,
            error: imageCountError,
        } = await supabase
            .from("product_images")
            .select("id", {
                count: "exact",
                head: true,
            })
            .eq("product_id", productId);

        if (imageCountError) {
            return {
                error:
                    "No se pudo comprobar si el producto tiene imágenes.",
            };
        }

        if (!count || count === 0) {
            return {
                error:
                    "Para publicar un producto tenés que agregar al menos una fotografía.",
            };
        }
    }

    const { error: updateError } =
        await supabase
            .from("products")
            .update({
                name,
                description:
                    description || null,
                category_id: category.id,
                material: material || null,
                price,
                stock,
                product_type: productType,
                status,
                is_featured: isFeatured,
            })
            .eq("id", productId);

    if (updateError) {
        console.error(
            "Error al actualizar producto:",
            updateError
        );

        return {
            error: `No se pudo actualizar el producto: ${updateError.message}`,
        };
    }

    redirect("/administracion/productos");
}

export async function deleteProduct(
    productId: string
): Promise<ProductActionResult> {
    const { supabase, user, isAdmin } =
        await getAdminClient();

    if (!user) {
        return {
            error:
                "Tenés que iniciar sesión para realizar esta acción.",
        };
    }

    if (!isAdmin) {
        return {
            error:
                "No tenés permisos para eliminar productos.",
        };
    }

    if (!productId) {
        return {
            error:
                "No se encontró el producto que querés eliminar.",
        };
    }

    const {
        data: product,
        error: productError,
    } = await supabase
        .from("products")
        .select("id")
        .eq("id", productId)
        .single();

    if (productError || !product) {
        return {
            error:
                "El producto que querés eliminar no existe.",
        };
    }

    const {
        data: images,
        error: imagesError,
    } = await supabase
        .from("product_images")
        .select("storage_path")
        .eq("product_id", productId);

    if (imagesError) {
        console.error(
            "Error al obtener imágenes:",
            imagesError
        );

        return {
            error: `No se pudieron obtener las imágenes del producto: ${imagesError.message}`,
        };
    }

    const storagePaths =
        images
            ?.map(
                (image) =>
                    image.storage_path
            )
            .filter(
                (
                    path
                ): path is string =>
                    Boolean(path)
            ) ?? [];

    if (storagePaths.length > 0) {
        const { error: storageError } =
            await supabase.storage
                .from("product-images")
                .remove(storagePaths);

        if (storageError) {
            console.error(
                "Error al eliminar imágenes de Storage:",
                storageError
            );

            return {
                error: `No se pudieron eliminar las imágenes del producto: ${storageError.message}`,
            };
        }
    }

    const { error: deleteImagesError } =
        await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId);

    if (deleteImagesError) {
        console.error(
            "Error al eliminar registros de imágenes:",
            deleteImagesError
        );

        return {
            error: `No se pudieron eliminar los registros de imágenes: ${deleteImagesError.message}`,
        };
    }

    const { error: deleteProductError } =
        await supabase
            .from("products")
            .delete()
            .eq("id", productId);

    if (deleteProductError) {
        console.error(
            "Error al eliminar producto:",
            deleteProductError
        );

        return {
            error: `No se pudo eliminar el producto: ${deleteProductError.message}`,
        };
    }

    redirect("/administracion/productos");
}