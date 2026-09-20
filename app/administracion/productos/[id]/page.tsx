import Link from "next/link";
import {
    notFound,
    redirect,
} from "next/navigation";

import {
    updateProduct,
    deleteProduct,
} from "@/app/lib/products/actions";
import { ProductImageManager } from "@/app/components/admin/ProductImageManager";
import { getActiveCategories } from "@/app/lib/products";
import { createClient } from "@/app/lib/supabase/server";

const inputClassName =
    "mt-1.5 h-11 w-full rounded-[9px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]";

const textareaClassName =
    "mt-1.5 w-full resize-y rounded-[9px] border border-neutral-300 bg-white px-3 py-2.5 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]";

const selectClassName =
    "mt-1.5 h-11 w-full rounded-[9px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]";

type EditarProductoPageProps = {
    params: Promise<{
        id: string;
    }>;
};

function getStatusLabel(status: string) {
    switch (status) {
        case "active":
            return "Publicado";

        case "draft":
            return "Borrador";

        case "hidden":
            return "Oculto";

        default:
            return status;
    }
}

function getStatusClasses(status: string) {
    switch (status) {
        case "active":
            return "border-[#d7c6a7] bg-[#f7f0e5] text-[#806037]";

        case "draft":
            return "border-neutral-300 bg-neutral-100 text-neutral-600";

        case "hidden":
            return "border-neutral-300 bg-white text-neutral-500";

        default:
            return "border-neutral-300 bg-white text-neutral-600";
    }
}

export default async function EditarProductoPage({
    params,
}: EditarProductoPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const {
        data: profile,
        error: profileError,
    } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (
        profileError ||
        !profile?.is_admin
    ) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center">
                <h1 className="font-serif text-3xl text-neutral-900">
                    Acceso no autorizado
                </h1>

                <p className="mt-4 text-sm text-neutral-600">
                    No tenés permisos para acceder a esta sección.
                </p>
            </div>
        );
    }

    const [
        {
            data: product,
            error: productError,
        },
        categories,
    ] = await Promise.all([
        supabase
            .from("products")
            .select(`
                id,
                name,
                description,
                material,
                price,
                stock,
                product_type,
                status,
                is_featured,
                category_id,
                categories (
                    id,
                    name,
                    slug,
                    line
                )
            `)
            .eq("id", id)
            .single(),

        getActiveCategories(),
    ]);

    if (
        productError ||
        !product
    ) {
        notFound();
    }

    const productId = product.id;

    const {
        data: productImages,
        error: imagesError,
    } = await supabase
        .from("product_images")
        .select(
            "id, storage_path, alt_text, sort_order"
        )
        .eq(
            "product_id",
            productId
        )
        .order(
            "sort_order",
            {
                ascending: true,
            }
        );

    if (imagesError) {
        throw new Error(
            `Error al obtener las imágenes: ${imagesError.message}`
        );
    }

    const category =
        Array.isArray(
            product.categories
        )
            ? product.categories[0]
            : product.categories;

    const jewelryCategories =
        categories.filter(
            (item) =>
                item.line ===
                "jewelry"
        );

    const silverwareCategories =
        categories.filter(
            (item) =>
                item.line ===
                "silverware"
        );

    async function updateProductAction(
        formData: FormData
    ): Promise<void> {
        "use server";

        await updateProduct(
            formData
        );
    }

    async function deleteProductAction(): Promise<void> {
        "use server";

        await deleteProduct(
            productId
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f5f0]">
            {/* Encabezado compacto */}
            <section className="border-b border-[#e0d6c8] bg-[#fbf8f2]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/administracion/productos"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Productos
                    </Link>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                                Administración
                            </p>

                            <h1 className="mt-1 font-serif text-[30px] leading-none tracking-tight text-neutral-900 sm:text-4xl">
                                Editar producto
                            </h1>

                            <p className="mt-1.5 max-w-2xl truncate text-sm text-neutral-600">
                                {product.name}
                            </p>
                        </div>

                        <span
                            className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-medium ${getStatusClasses(
                                product.status
                            )}`}
                        >
                            {getStatusLabel(
                                product.status
                            )}
                        </span>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-8 lg:px-8">
                <form
                    id="edit-product-form"
                    action={
                        updateProductAction
                    }
                >
                    <input
                        type="hidden"
                        name="product_id"
                        value={
                            productId
                        }
                    />

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.75fr)] lg:items-start">
                        {/* Información principal */}
                        <section className="rounded-[14px] border border-[#ddd5c9] bg-white p-4 shadow-[0_8px_24px_rgba(67,52,35,0.035)] sm:p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                        Producto
                                    </p>

                                    <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                                        Información
                                    </h2>
                                </div>

                                <span className="text-[10px] text-neutral-400">
                                    Catálogo
                                </span>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-medium text-neutral-800"
                                    >
                                        Nombre
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        defaultValue={
                                            product.name
                                        }
                                        required
                                        className={
                                            inputClassName
                                        }
                                    />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="category"
                                            className="block text-xs font-medium text-neutral-800"
                                        >
                                            Categoría
                                        </label>

                                        <select
                                            id="category"
                                            name="category"
                                            defaultValue={
                                                category?.slug ??
                                                ""
                                            }
                                            required
                                            className={
                                                selectClassName
                                            }
                                        >
                                            <option
                                                value=""
                                                disabled
                                            >
                                                Seleccionar categoría
                                            </option>

                                            <optgroup label="Joyería">
                                                {jewelryCategories.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <option
                                                            key={
                                                                item.id
                                                            }
                                                            value={
                                                                item.slug
                                                            }
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>

                                            <optgroup label="Platería">
                                                {silverwareCategories.map(
                                                    (
                                                        item
                                                    ) => (
                                                        <option
                                                            key={
                                                                item.id
                                                            }
                                                            value={
                                                                item.slug
                                                            }
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="material"
                                            className="block text-xs font-medium text-neutral-800"
                                        >
                                            Material
                                        </label>

                                        <input
                                            id="material"
                                            name="material"
                                            type="text"
                                            defaultValue={
                                                product.material ??
                                                ""
                                            }
                                            placeholder="Ej. Plata 925"
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="description"
                                        className="block text-xs font-medium text-neutral-800"
                                    >
                                        Descripción
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        defaultValue={
                                            product.description ??
                                            ""
                                        }
                                        className={
                                            textareaClassName
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Venta y publicación */}
                        <section className="rounded-[14px] border border-[#ddd5c9] bg-white p-4 shadow-[0_8px_24px_rgba(67,52,35,0.035)] sm:p-5">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                    Gestión
                                </p>

                                <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                                    Venta y publicación
                                </h2>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="block text-xs font-medium text-neutral-800"
                                        >
                                            Precio
                                        </label>

                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            inputMode="decimal"
                                            defaultValue={
                                                product.price ??
                                                ""
                                            }
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="stock"
                                            className="block text-xs font-medium text-neutral-800"
                                        >
                                            Stock
                                        </label>

                                        <input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            inputMode="numeric"
                                            defaultValue={
                                                product.stock
                                            }
                                            className={
                                                inputClassName
                                            }
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="product_type"
                                        className="block text-xs font-medium text-neutral-800"
                                    >
                                        Modalidad
                                    </label>

                                    <select
                                        id="product_type"
                                        name="product_type"
                                        defaultValue={
                                            product.product_type
                                        }
                                        className={
                                            selectClassName
                                        }
                                    >
                                        <option value="direct">
                                            Venta directa
                                        </option>

                                        <option value="unique">
                                            Pieza única
                                        </option>

                                        <option value="on_order">
                                            Por encargo
                                        </option>

                                        <option value="custom">
                                            Personalizado
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="status"
                                        className="block text-xs font-medium text-neutral-800"
                                    >
                                        Estado
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={
                                            product.status
                                        }
                                        className={
                                            selectClassName
                                        }
                                    >
                                        <option value="draft">
                                            Borrador
                                        </option>

                                        <option value="active">
                                            Publicado
                                        </option>

                                        <option value="hidden">
                                            Oculto
                                        </option>
                                    </select>
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 border-t border-neutral-100 pt-4">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        defaultChecked={
                                            product.is_featured
                                        }
                                        className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900"
                                    />

                                    <span>
                                        <span className="block text-xs font-medium text-neutral-800">
                                            Destacar producto
                                        </span>

                                        <span className="mt-0.5 block text-[10px] leading-4 text-neutral-500">
                                            Mostrarlo entre las piezas destacadas del inicio.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Acciones escritorio */}
                    <div className="mt-4 hidden items-center justify-end gap-2 sm:flex">
                        <Link
                            href="/administracion/productos"
                            className="inline-flex h-10 items-center justify-center px-4 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            className="h-10 rounded-[9px] bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Guardar cambios
                        </button>
                    </div>
                </form>

                {/* Fotografías */}
                <div className="mt-5 rounded-[14px] border border-[#ddd5c9] bg-white p-4 shadow-[0_8px_24px_rgba(67,52,35,0.035)] sm:p-5">
                    <ProductImageManager
                        productId={
                            productId
                        }
                        productName={
                            product.name
                        }
                        initialImages={
                            productImages ??
                            []
                        }
                    />
                </div>

                {/* Información técnica */}
                <details className="mt-4 overflow-hidden rounded-[14px] border border-[#ddd5c9] bg-white">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-medium text-neutral-600">
                        Información técnica
                    </summary>

                    <div className="border-t border-neutral-100 px-4 py-3">
                        <p className="text-[9px] uppercase tracking-[0.14em] text-neutral-400">
                            Identificador interno
                        </p>

                        <p className="mt-1 break-all text-[10px] text-neutral-500">
                            {
                                productId
                            }
                        </p>
                    </div>
                </details>

                {/* Zona de peligro */}
                <details className="mt-4 overflow-hidden rounded-[14px] border border-red-200 bg-white">
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-medium text-red-700">
                        Eliminar producto
                    </summary>

                    <div className="border-t border-red-100 px-4 py-4">
                        <p className="max-w-xl text-xs leading-5 text-neutral-600">
                            Elimina definitivamente esta pieza del catálogo junto con sus fotografías. Esta acción no se puede deshacer.
                        </p>

                        <form
                            action={
                                deleteProductAction
                            }
                            className="mt-3"
                        >
                            <button
                                type="submit"
                                className="rounded-[9px] border border-red-300 px-4 py-2.5 text-xs font-medium text-red-700 transition hover:border-red-500 hover:bg-red-50"
                            >
                                Eliminar definitivamente
                            </button>
                        </form>
                    </div>
                </details>
            </section>

            {/* Barra fija móvil */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8cfc1] bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
                <div className="mx-auto flex max-w-6xl gap-2">
                    <Link
                        href="/administracion/productos"
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-[9px] border border-neutral-300 text-sm font-medium text-neutral-700"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        form="edit-product-form"
                        className="h-11 flex-[1.3] rounded-[9px] bg-neutral-900 px-4 text-sm font-medium text-white"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </main>
    );
}