import Link from "next/link";

import { NewProductImages } from "@/app/components/admin/NewProductImages";
import { getActiveCategories } from "@/app/lib/products";
import { createProduct } from "@/app/lib/products/actions";

const inputClassName =
    "mt-1.5 h-11 w-full rounded-[9px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]";

const textareaClassName =
    "mt-1.5 w-full resize-y rounded-[9px] border border-neutral-300 bg-white px-3 py-2.5 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]";

const selectClassName =
    "mt-1.5 h-11 w-full rounded-[9px] border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]";

export default async function NuevoProductoPage() {
    const categories =
        await getActiveCategories();

    const jewelryCategories =
        categories.filter(
            (category) =>
                category.line ===
                "jewelry"
        );

    const silverwareCategories =
        categories.filter(
            (category) =>
                category.line ===
                "silverware"
        );

    async function createProductAction(
        formData: FormData
    ) {
        "use server";

        await createProduct(
            formData
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            {/* Encabezado compacto */}
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/administracion/productos"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Productos
                    </Link>

                    <div className="mt-4">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                            Administración
                        </p>

                        <h1 className="mt-1 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                            Nuevo producto
                        </h1>

                        <p className="mt-1.5 text-sm text-neutral-600">
                            Cargá la pieza,
                            agregá sus fotos y
                            definí cómo se
                            publica.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-8 lg:px-8">
                <form
                    id="new-product-form"
                    action={createProductAction}
                >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.75fr)] lg:items-start">
                        {/* Información */}
                        <section className="rounded-[16px] border border-[#ddd5c9] bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(65,48,29,0.03)] sm:p-5">
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
                                        placeholder="Ej. Anillo de plata clásico"
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
                                            defaultValue=""
                                            required
                                            className={
                                                selectClassName
                                            }
                                        >
                                            <option
                                                value=""
                                                disabled
                                            >
                                                Seleccionar
                                            </option>

                                            <optgroup label="Joyería">
                                                {jewelryCategories.map(
                                                    (
                                                        category
                                                    ) => (
                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.slug
                                                            }
                                                        >
                                                            {
                                                                category.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </optgroup>

                                            <optgroup label="Platería">
                                                {silverwareCategories.map(
                                                    (
                                                        category
                                                    ) => (
                                                        <option
                                                            key={
                                                                category.id
                                                            }
                                                            value={
                                                                category.slug
                                                            }
                                                        >
                                                            {
                                                                category.name
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
                                        placeholder="Describí la pieza..."
                                        className={
                                            textareaClassName
                                        }
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Venta y publicación */}
                        <section className="rounded-[16px] border border-[#ddd5c9] bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(65,48,29,0.03)] sm:p-5">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                                    Gestión
                                </p>

                                <h2 className="mt-1 font-serif text-xl text-neutral-900 sm:text-2xl">
                                    Venta y
                                    publicación
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
                                            placeholder="0"
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
                                            defaultValue="0"
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
                                        defaultValue="direct"
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
                                        defaultValue="draft"
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
                                        className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900"
                                    />

                                    <span>
                                        <span className="block text-xs font-medium text-neutral-800">
                                            Destacar
                                            producto
                                        </span>

                                        <span className="mt-0.5 block text-[10px] leading-4 text-neutral-500">
                                            Mostrarlo
                                            entre las
                                            piezas
                                            destacadas
                                            del inicio.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Imágenes */}
                    <section className="mt-4 rounded-[16px] border border-[#ddd5c9] bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(65,48,29,0.03)] sm:p-5">
                        <NewProductImages />
                    </section>

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
                            className="h-10 rounded-[10px] bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Guardar producto
                        </button>
                    </div>
                </form>
            </section>

            {/* Barra fija móvil */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8cfc1] bg-[#fffdf9]/95 px-4 py-3 shadow-[0_-8px_24px_rgba(65,48,29,0.06)] backdrop-blur sm:hidden">
                <div className="mx-auto flex max-w-6xl gap-2">
                    <Link
                        href="/administracion/productos"
                        className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-[#d8cec1] bg-white text-sm font-medium text-neutral-700"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        form="new-product-form"
                        className="h-11 flex-[1.3] rounded-[10px] bg-neutral-900 px-4 text-sm font-medium text-white"
                    >
                        Guardar producto
                    </button>
                </div>
            </div>
        </main>
    );
}