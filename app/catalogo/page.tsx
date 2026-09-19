import Link from "next/link";
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
        buscar?: string;
        ordenar?: string;
    }>;
};

function normalizeLine(value?: string) {
    if (
        value === "joyeria" ||
        value === "jewelry"
    ) {
        return "jewelry";
    }

    if (
        value === "plateria" ||
        value === "silverware"
    ) {
        return "silverware";
    }

    return null;
}

function getLineUrl(
    line: "jewelry" | "silverware" | null,
    search: string,
    sort: string
) {
    const params = new URLSearchParams();

    if (line === "jewelry") {
        params.set("linea", "joyeria");
    }

    if (line === "silverware") {
        params.set("linea", "plateria");
    }

    if (search) {
        params.set("buscar", search);
    }

    if (sort && sort !== "destacados") {
        params.set("ordenar", sort);
    }

    const query = params.toString();

    return query
        ? `/catalogo?${query}`
        : "/catalogo";
}

export default async function CatalogoPage({
    searchParams,
}: CatalogoPageProps) {
    const params = await searchParams;

    const selectedLine = normalizeLine(
        params.linea
    );

    const selectedCategory =
        params.categoria ?? "";

    const searchTerm =
        params.buscar?.trim() ?? "";

    const sort =
        params.ordenar ?? "destacados";

    const [categories, products] =
        await Promise.all([
            getActiveCategories(),
            getActiveProducts(),
        ]);

    const supabase = await createClient();

    const visibleCategories = selectedLine
        ? categories.filter(
            (category) =>
                category.line === selectedLine
        )
        : categories;

    let filteredProducts = products.filter(
        (product) => {
            const category = Array.isArray(
                product.categories
            )
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

            if (searchTerm) {
                const normalizedSearch =
                    searchTerm.toLocaleLowerCase(
                        "es-UY"
                    );

                const searchableText = [
                    product.name,
                    product.description,
                    product.material,
                    category.name,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("es-UY");

                if (
                    !searchableText.includes(
                        normalizedSearch
                    )
                ) {
                    return false;
                }
            }

            return true;
        }
    );

    filteredProducts = [
        ...filteredProducts,
    ].sort((a, b) => {
        switch (sort) {
            case "precio-menor":
                return (
                    (a.price ?? Infinity) -
                    (b.price ?? Infinity)
                );

            case "precio-mayor":
                return (
                    (b.price ?? -Infinity) -
                    (a.price ?? -Infinity)
                );

            case "recientes":
                return (
                    new Date(
                        b.created_at
                    ).getTime() -
                    new Date(
                        a.created_at
                    ).getTime()
                );

            case "nombre":
                return a.name.localeCompare(
                    b.name,
                    "es"
                );

            case "destacados":
            default:
                if (
                    a.is_featured !==
                    b.is_featured
                ) {
                    return a.is_featured
                        ? -1
                        : 1;
                }

                return (
                    a.sort_order -
                    b.sort_order
                );
        }
    });

    const hasFilters =
        Boolean(selectedLine) ||
        Boolean(selectedCategory) ||
        Boolean(searchTerm) ||
        sort !== "destacados";

    return (
        <div className="bg-[#f8f5ef]">

            {/* Encabezado */}
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#9a7541]">
                        Lezcano
                    </p>

                    <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
                                Catálogo
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">
                                Joyería y platería para
                                descubrir, regalar y
                                conservar.
                            </p>
                        </div>

                        <p className="text-sm text-neutral-500">
                            {filteredProducts.length}{" "}
                            {filteredProducts.length ===
                                1
                                ? "pieza"
                                : "piezas"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Buscador y controles */}
            <section className="border-b border-[#ddd5c9] bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Línea superior */}
                    <div className="flex flex-col gap-3 py-3.5 lg:flex-row lg:items-center lg:justify-between">

                        {/* Buscador */}
                        <form
                            action="/catalogo"
                            method="get"
                            className="relative w-full lg:max-w-sm"
                        >
                            {selectedLine && (
                                <input
                                    type="hidden"
                                    name="linea"
                                    value={
                                        selectedLine ===
                                            "jewelry"
                                            ? "joyeria"
                                            : "plateria"
                                    }
                                />
                            )}

                            {selectedCategory && (
                                <input
                                    type="hidden"
                                    name="categoria"
                                    value={
                                        selectedCategory
                                    }
                                />
                            )}

                            {sort !==
                                "destacados" && (
                                    <input
                                        type="hidden"
                                        name="ordenar"
                                        value={sort}
                                    />
                                )}

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="pointer-events-none absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="7"
                                />
                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="search"
                                name="buscar"
                                defaultValue={searchTerm}
                                enterKeyHint="search"
                                placeholder="Buscar productos..."
                                className="w-full border-b border-neutral-300 bg-transparent py-2.5 pl-8 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]"
                            />

                            <button
                                type="submit"
                                className="sr-only"
                            >
                                Buscar
                            </button>
                        </form>

                        {/* Orden */}
                        <form
                            action="/catalogo"
                            method="get"
                            className="flex items-center gap-3"
                        >
                            {selectedLine && (
                                <input
                                    type="hidden"
                                    name="linea"
                                    value={
                                        selectedLine ===
                                            "jewelry"
                                            ? "joyeria"
                                            : "plateria"
                                    }
                                />
                            )}

                            {selectedCategory && (
                                <input
                                    type="hidden"
                                    name="categoria"
                                    value={
                                        selectedCategory
                                    }
                                />
                            )}

                            {searchTerm && (
                                <input
                                    type="hidden"
                                    name="buscar"
                                    value={searchTerm}
                                />
                            )}

                            <label
                                htmlFor="ordenar"
                                className="whitespace-nowrap text-xs uppercase tracking-[0.15em] text-neutral-500"
                            >
                                Ordenar por
                            </label>

                            <select
                                id="ordenar"
                                name="ordenar"
                                defaultValue={sort}
                                className="border-b border-neutral-300 bg-white py-2 pr-7 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                            >
                                <option value="destacados">
                                    Destacados
                                </option>

                                <option value="recientes">
                                    Más recientes
                                </option>

                                <option value="precio-menor">
                                    Precio: menor a mayor
                                </option>

                                <option value="precio-mayor">
                                    Precio: mayor a menor
                                </option>

                                <option value="nombre">
                                    Nombre
                                </option>
                            </select>

                            <button
                                type="submit"
                                className="border border-neutral-300 px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
                            >
                                Aplicar
                            </button>
                        </form>
                    </div>

                    {/* Líneas */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-neutral-200 py-3">
                        <Link
                            href={getLineUrl(
                                null,
                                searchTerm,
                                sort
                            )}
                            className={`relative py-1 text-sm transition ${!selectedLine
                                ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#9a7541]"
                                : "text-neutral-500 hover:text-neutral-900"
                                }`}
                        >
                            Todo
                        </Link>

                        <Link
                            href={getLineUrl(
                                "jewelry",
                                searchTerm,
                                sort
                            )}
                            className={`relative py-1 text-sm transition ${selectedLine ===
                                "jewelry"
                                ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#9a7541]"
                                : "text-neutral-500 hover:text-neutral-900"
                                }`}
                        >
                            Joyería
                        </Link>

                        <Link
                            href={getLineUrl(
                                "silverware",
                                searchTerm,
                                sort
                            )}
                            className={`relative py-1 text-sm transition ${selectedLine ===
                                "silverware"
                                ? "text-neutral-950 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-[#9a7541]"
                                : "text-neutral-500 hover:text-neutral-900"
                                }`}
                        >
                            Platería
                        </Link>

                        {hasFilters && (
                            <Link
                                href="/catalogo"
                                className="ml-auto text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                            >
                                Limpiar filtros
                            </Link>
                        )}
                    </div>

                    {/* Categorías */}
                    {(selectedLine ||
                        selectedCategory) && (
                            <div className="flex gap-2 overflow-x-auto border-t border-neutral-200 py-3">
                                <Link
                                    href={getLineUrl(
                                        selectedLine,
                                        searchTerm,
                                        sort
                                    )}
                                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition ${!selectedCategory
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500"
                                        }`}
                                >
                                    Todas
                                </Link>

                                {visibleCategories.map(
                                    (category) => {
                                        const categoryParams =
                                            new URLSearchParams();

                                        if (
                                            selectedLine
                                        ) {
                                            categoryParams.set(
                                                "linea",
                                                selectedLine ===
                                                    "jewelry"
                                                    ? "joyeria"
                                                    : "plateria"
                                            );
                                        }

                                        categoryParams.set(
                                            "categoria",
                                            category.slug
                                        );

                                        if (
                                            searchTerm
                                        ) {
                                            categoryParams.set(
                                                "buscar",
                                                searchTerm
                                            );
                                        }

                                        if (
                                            sort !==
                                            "destacados"
                                        ) {
                                            categoryParams.set(
                                                "ordenar",
                                                sort
                                            );
                                        }

                                        return (
                                            <Link
                                                key={
                                                    category.id
                                                }
                                                href={`/catalogo?${categoryParams.toString()}`}
                                                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition ${selectedCategory ===
                                                    category.slug
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500"
                                                    }`}
                                            >
                                                {
                                                    category.name
                                                }
                                            </Link>
                                        );
                                    }
                                )}
                            </div>
                        )}
                </div>
            </section>

            {/* Productos */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                {filteredProducts.length === 0 ? (
                    <div className="border border-[#ddd5c9] bg-white px-6 py-16 text-center">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#9a7541]">
                            Sin resultados
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-neutral-900">
                            No encontramos piezas
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-600">
                            Probá cambiando la búsqueda
                            o eliminando alguno de los
                            filtros.
                        </p>

                        <Link
                            href="/catalogo"
                            className="mt-7 inline-block border-b border-[#b28a53] pb-1 text-sm font-medium text-neutral-900"
                        >
                            Ver catálogo completo →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-9">
                        {filteredProducts.map(
                            (product) => {
                                const images = [
                                    ...(product.product_images ??
                                        []),
                                ].sort(
                                    (a, b) =>
                                        a.sort_order -
                                        b.sort_order
                                );

                                const mainImage =
                                    images[0];

                                const imageUrl =
                                    mainImage
                                        ? supabase.storage
                                            .from(
                                                "product-images"
                                            )
                                            .getPublicUrl(
                                                mainImage.storage_path
                                            ).data
                                            .publicUrl
                                        : null;

                                const category =
                                    Array.isArray(
                                        product.categories
                                    )
                                        ? product
                                            .categories[0]
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
                                        key={
                                            product.id
                                        }
                                        href={`/catalogo/${product.slug}`}
                                        className="group block"
                                    >
                                        {/* Imagen */}
                                        <div className="relative aspect-square overflow-hidden bg-white">
                                            {imageUrl ? (
                                                <img
                                                    src={
                                                        imageUrl
                                                    }
                                                    alt={
                                                        mainImage?.alt_text ||
                                                        product.name
                                                    }
                                                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                                                />
                                            ) : (
                                                <ImagePlaceholder
                                                    label={
                                                        product.name
                                                    }
                                                    aspect="square"
                                                    className="h-full w-full"
                                                />
                                            )}

                                            <div className="pointer-events-none absolute inset-0 border border-black/[0.05]" />

                                            <div className="absolute bottom-3 right-3 hidden h-9 w-9 items-center justify-center bg-white/95 text-sm text-neutral-900 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 lg:flex">
                                                →
                                            </div>
                                        </div>

                                        {/* Datos */}
                                        <div className="mt-3 min-h-[100px]">
                                            {category?.name && (
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a7541]">
                                                    {
                                                        category.name
                                                    }
                                                </p>
                                            )}

                                            <h2 className="mt-1.5 font-serif text-lg leading-tight text-neutral-900 transition-colors duration-300 group-hover:text-[#8a693c]">
                                                {
                                                    product.name
                                                }
                                            </h2>

                                            {product.material && (
                                                <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                    {
                                                        product.material
                                                    }
                                                </p>
                                            )}

                                            <div className="mt-2.5 flex min-h-[22px] items-center justify-between gap-3">
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
                                                    <span className="whitespace-nowrap text-[11px] text-[#9a7541]">
                                                        Por encargo
                                                    </span>
                                                )}

                                                {isOutOfStock && (
                                                    <span className="whitespace-nowrap text-[11px] text-neutral-500">
                                                        Sin stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}