import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import {
    updateProduct,
    deleteProduct,
} from "@/app/lib/products/actions";
import { ProductImageManager } from "@/app/components/admin/ProductImageManager";
import { getActiveCategories } from "@/app/lib/products";

const inputClassName =
    "mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900";

const selectClassName =
    "mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900";

type EditarProductoPageProps = {
    params: Promise<{
        id: string;
    }>;
};

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

    const { data: profile, error: profileError } =
        await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

    if (profileError || !profile?.is_admin) {
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
        { data: product, error: productError },
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

    if (productError || !product) {
        notFound();
    }

    const { data: productImages, error: imagesError } =
        await supabase
            .from("product_images")
            .select(
                "id, storage_path, alt_text, sort_order"
            )
            .eq("product_id", product.id)
            .order("sort_order", {
                ascending: true,
            });

    if (imagesError) {
        throw new Error(
            `Error al obtener las imágenes: ${imagesError.message}`
        );
    }

    const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

    const jewelryCategories = categories.filter(
        (item) => item.line === "jewelry"
    );

    const silverwareCategories = categories.filter(
        (item) => item.line === "silverware"
    );

    const deleteProductAction = deleteProduct.bind(
        null,
        product.id
    );

    return (
        <div>
            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/administracion/productos"
                        className="text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
                    >
                        ← Productos
                    </Link>

                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Administración
                        </p>

                        <h1 className="mt-2 font-serif text-4xl tracking-tight text-neutral-900">
                            Editar producto
                        </h1>

                        <p className="mt-3 text-sm text-neutral-600">
                            Modificá la información de esta pieza y
                            administrá sus fotografías.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="border border-neutral-200 bg-white p-6 sm:p-8">
                    <form
                        action={updateProduct}
                        className="space-y-8"
                    >
                        <input
                            type="hidden"
                            name="product_id"
                            value={product.id}
                        />

                        <div>
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Información básica
                            </h2>

                            <p className="mt-2 text-sm text-neutral-600">
                                Estos datos aparecen en el catálogo.
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
                                    defaultValue={product.name}
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
                                    defaultValue={
                                        product.description ?? ""
                                    }
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
                                    defaultValue={
                                        category?.slug ?? ""
                                    }
                                    required
                                    className={selectClassName}
                                >
                                    <option value="" disabled>
                                        Seleccionar categoría
                                    </option>

                                    <optgroup label="Joyería">
                                        {jewelryCategories.map(
                                            (item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.slug}
                                                >
                                                    {item.name}
                                                </option>
                                            )
                                        )}
                                    </optgroup>

                                    <optgroup label="Platería">
                                        {silverwareCategories.map(
                                            (item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.slug}
                                                >
                                                    {item.name}
                                                </option>
                                            )
                                        )}
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
                                    defaultValue={
                                        product.material ?? ""
                                    }
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
                                    defaultValue={
                                        product.price ?? ""
                                    }
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
                                    defaultValue={product.stock}
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
                                    defaultValue={
                                        product.product_type
                                    }
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
                                    defaultValue={product.status}
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
                                    defaultChecked={
                                        product.is_featured
                                    }
                                    className="h-4 w-4 accent-neutral-900"
                                />

                                <span className="text-sm text-neutral-700">
                                    Mostrar como producto destacado
                                </span>
                            </label>
                        </div>

                        <div className="border-t border-neutral-200 pt-6">
                            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                                Identificador interno
                            </p>

                            <p className="mt-2 break-all text-xs text-neutral-500">
                                {product.id}
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:justify-end">
                            <Link
                                href="/administracion/productos"
                                className="px-5 py-3 text-center text-sm font-medium text-neutral-700 transition hover:text-neutral-900"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                            >
                                Guardar cambios
                            </button>
                        </div>
                    </form>

                    <ProductImageManager
                        productId={product.id}
                        productName={product.name}
                        initialImages={productImages ?? []}
                    />

                    <div className="mt-10 border-t border-red-200 pt-8">
                        <h2 className="font-serif text-2xl text-neutral-900">
                            Eliminar producto
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
                            Eliminá definitivamente este producto del
                            catálogo. También se eliminarán todas sus
                            imágenes. Esta acción no se puede deshacer.
                        </p>

                        <form
                            action={deleteProductAction}
                            className="mt-5"
                        >
                            <button
                                type="submit"
                                className="border border-red-300 px-5 py-3 text-sm font-medium text-red-700 transition hover:border-red-500 hover:bg-red-50"
                            >
                                Eliminar producto
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}