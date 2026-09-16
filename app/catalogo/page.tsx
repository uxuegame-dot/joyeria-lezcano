import Link from "next/link";
import { SectionTitle } from "@/app/components/SectionTitle";
import { ImagePlaceholder } from "@/app/components/ImagePlaceholder";
import {
    getActiveCategories,
    getActiveProducts,
} from "@/app/lib/products";
import { createClient } from "@/app/lib/supabase/server";

type CatalogoPageProps = {
    searchParams: Promise<{
        linea?: string;
        categoria?: string;
    }>;
};

export default async function CatalogoPage({
    searchParams,
}: CatalogoPageProps) {
    const params = await searchParams;

    const selectedLine =
        params.linea === "plateria"
            ? "silverware"
            : params.linea === "joyeria"
                ? "jewelry"
                : null;

    const selectedCategory = params.categoria;

    const [categories, products] = await Promise.all([
        getActiveCategories(),
        getActiveProducts(),
    ]);

    const supabase = await createClient();

    const visibleCategories = selectedLine
        ? categories.filter(
            (category) => category.line === selectedLine
        )
        : [];

    const filteredProducts = products.filter((product) => {
        const category = Array.isArray(product.categories)
            ? product.categories[0]
            : product.categories;

        if (!category) {
            return false;
        }

        if (
            selectedLine &&
            category.line !== selectedLine
        ) {
            return false;
        }

        if (
            selectedCategory &&
            category.slug !== selectedCategory
        ) {
            return false;
        }

        return true;
    });

    const currentLineLabel =
        selectedLine === "jewelry"
            ? "Joyería"
            : selectedLine === "silverware"
                ? "Platería"
                : null;

    return (
        <div>
            {/* Encabezado */}
            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <SectionTitle
                        eyebrow="Lezcano"
                        title="Catálogo"
                        description="Joyería y platería trabajadas con oficio, tradición y atención al detalle."
                    />
                </div>
            </section>

            {/* Líneas principales */}
            <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Explorar por línea
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/catalogo?linea=joyeria"
                        className={`group border px-6 py-6 transition ${selectedLine === "jewelry"
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                            }`}
                    >
                        <p className="font-serif text-2xl">
                            Joyería
                        </p>

                        <p
                            className={`mt-2 text-sm leading-6 ${selectedLine === "jewelry"
                                ? "text-neutral-300"
                                : "text-neutral-500"
                                }`}
                        >
                            Anillos, cadenas, pulseras, dijes y otras
                            piezas.
                        </p>
                    </Link>

                    <Link
                        href="/catalogo?linea=plateria"
                        className={`group border px-6 py-6 transition ${selectedLine === "silverware"
                            ? "border-neutral-900 bg-neutral-900 text-white"
                            : "border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900"
                            }`}
                    >
                        <p className="font-serif text-2xl">
                            Platería
                        </p>

                        <p
                            className={`mt-2 text-sm leading-6 ${selectedLine === "silverware"
                                ? "text-neutral-300"
                                : "text-neutral-500"
                                }`}
                        >
                            Bombillas, cabos, virolas, llaveros y
                            trabajos en plata.
                        </p>
                    </Link>
                </div>
            </section>

            {/* Categorías */}
            {selectedLine && (
                <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                                {currentLineLabel}
                            </p>

                            <p className="mt-1 text-sm text-neutral-600">
                                Elegí una categoría o explorá todas las
                                piezas.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={
                                    selectedLine === "jewelry"
                                        ? "/catalogo?linea=joyeria"
                                        : "/catalogo?linea=plateria"
                                }
                                className={`rounded-full border px-4 py-2 text-sm transition ${!selectedCategory
                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                                    }`}
                            >
                                Todas
                            </Link>

                            {visibleCategories.map(
                                (category) => (
                                    <Link
                                        key={category.id}
                                        href={`/catalogo?linea=${selectedLine ===
                                            "jewelry"
                                            ? "joyeria"
                                            : "plateria"
                                            }&categoria=${encodeURIComponent(
                                                category.slug
                                            )}`}
                                        className={`rounded-full border px-4 py-2 text-sm transition ${selectedCategory ===
                                            category.slug
                                            ? "border-neutral-900 bg-neutral-900 text-white"
                                            : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500"
                                            }`}
                                    >
                                        {category.name}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Mensaje inicial */}
            {!selectedLine && (
                <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="border border-neutral-200 bg-white px-6 py-14 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Lezcano
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-neutral-900">
                            Dos oficios, una misma tradición
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600">
                            Elegí Joyería o Platería para conocer las
                            piezas disponibles y los trabajos realizados
                            en el taller.
                        </p>
                    </div>
                </section>
            )}

            {/* Productos */}
            {selectedLine && (
                <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
                    {filteredProducts.length === 0 ? (
                        <div className="border border-neutral-200 px-6 py-16 text-center">
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Próximamente
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
                                Estamos preparando esta parte del
                                catálogo. Muy pronto vas a poder consultar
                                las piezas disponibles.
                            </p>

                            <Link
                                href="/contacto"
                                className="mt-6 inline-block text-sm font-medium text-neutral-900 underline underline-offset-4"
                            >
                                Consultarnos directamente
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => {
                                const images = [
                                    ...(product.product_images ?? []),
                                ].sort(
                                    (a, b) =>
                                        a.sort_order -
                                        b.sort_order
                                );

                                const mainImage = images[0];

                                const imageUrl = mainImage
                                    ? supabase.storage
                                        .from("product-images")
                                        .getPublicUrl(
                                            mainImage.storage_path
                                        ).data.publicUrl
                                    : null;

                                const category = Array.isArray(
                                    product.categories
                                )
                                    ? product.categories[0]
                                    : product.categories;

                                const isOnOrder =
                                    product.product_type ===
                                    "on_order" ||
                                    product.product_type ===
                                    "custom";

                                const isOutOfStock =
                                    !isOnOrder &&
                                    product.stock <= 0;

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/catalogo/${product.slug}`}
                                        className="group block"
                                    >
                                        <div className="overflow-hidden bg-neutral-100">
                                            {imageUrl ? (
                                                <div className="aspect-square overflow-hidden">
                                                    <img
                                                        src={
                                                            imageUrl
                                                        }
                                                        alt={
                                                            mainImage?.alt_text ||
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                                    />
                                                </div>
                                            ) : (
                                                <ImagePlaceholder
                                                    label={
                                                        product.name
                                                    }
                                                    aspect="square"
                                                />
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            {category?.name && (
                                                <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">
                                                    {
                                                        category.name
                                                    }
                                                </p>
                                            )}

                                            <p className="mt-1 text-sm font-medium text-neutral-900 group-hover:underline">
                                                {product.name}
                                            </p>

                                            {product.material && (
                                                <p className="mt-1 text-xs text-neutral-500">
                                                    {
                                                        product.material
                                                    }
                                                </p>
                                            )}

                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                                {product.price !==
                                                    null ? (
                                                    <p className="text-sm font-medium text-neutral-900">
                                                        $
                                                        {Number(
                                                            product.price
                                                        ).toLocaleString(
                                                            "es-UY"
                                                        )}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-neutral-600">
                                                        Consultar
                                                        precio
                                                    </p>
                                                )}

                                                {isOnOrder && (
                                                    <span className="text-xs text-neutral-500">
                                                        Por encargo
                                                    </span>
                                                )}

                                                {isOutOfStock && (
                                                    <span className="text-xs text-neutral-500">
                                                        Sin stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}