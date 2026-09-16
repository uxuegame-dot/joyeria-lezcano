import Link from "next/link";
import { createProduct } from "@/app/lib/products/actions";
import { getActiveCategories } from "@/app/lib/products";
import { NewProductImages } from "@/app/components/admin/NewProductImages";

const inputClassName =
    "mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900";

const selectClassName =
    "mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900";

export default async function NuevoProductoPage() {
    const categories = await getActiveCategories();

    const jewelryCategories = categories.filter(
        (category) => category.line === "jewelry"
    );

    const silverwareCategories = categories.filter(
        (category) => category.line === "silverware"
    );

    async function createProductAction(formData: FormData): Promise<void> {
        "use server";

        await createProduct(formData);
    }

    return (
        <div>
            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/administracion/productos"
                        className="text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                        ← Productos
                    </Link>

                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Administración
                        </p>

                        <h1 className="mt-2 font-serif text-4xl tracking-tight text-neutral-900">
                            Nuevo producto
                        </h1>

                        <p className="mt-3 text-sm text-neutral-600">
                            Cargá una nueva pieza de Joyería o Platería Lezcano.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="border border-neutral-200 bg-white p-6 sm:p-8">
                    <form
                        action={createProductAction}
                        className="space-y-8"
                    >
                        <div>
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Información básica
                            </h2>

                            <p className="mt-2 text-sm text-neutral-600">
                                Completá los datos de la pieza y agregá sus
                                fotografías antes de guardarla.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Ej. Anillo de plata clásico"
                                    required
                                    className={inputClassName}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Descripción
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    placeholder="Describí la pieza..."
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Categoría
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    defaultValue=""
                                    required
                                    className={selectClassName}
                                >
                                    <option value="" disabled>
                                        Seleccionar categoría
                                    </option>

                                    <optgroup label="Joyería">
                                        {jewelryCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.slug}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </optgroup>

                                    <optgroup label="Platería">
                                        {silverwareCategories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.slug}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="material"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Material
                                </label>

                                <input
                                    id="material"
                                    name="material"
                                    type="text"
                                    placeholder="Ej. Plata"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Precio
                                </label>

                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="stock"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Stock
                                </label>

                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    defaultValue="0"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product_type"
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Tipo de producto
                                </label>

                                <select
                                    id="product_type"
                                    name="product_type"
                                    defaultValue="direct"
                                    className={selectClassName}
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
                                    className="block text-sm font-medium text-neutral-900"
                                >
                                    Estado
                                </label>

                                <select
                                    id="status"
                                    name="status"
                                    defaultValue="draft"
                                    className={selectClassName}
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
                        </div>

                        <div className="border-t border-neutral-200 pt-6">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    className="h-4 w-4 accent-neutral-900"
                                />

                                <span className="text-sm text-neutral-700">
                                    Mostrar como producto destacado
                                </span>
                            </label>
                        </div>

                        <NewProductImages />

                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/administracion/productos"
                                className="px-5 py-3 text-center text-sm text-neutral-600 transition hover:text-neutral-900"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                                Guardar producto
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}