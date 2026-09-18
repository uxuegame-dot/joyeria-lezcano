import Link from "next/link";
import {
    redirect,
} from "next/navigation";

import {
    createClient,
} from "@/app/lib/supabase/server";

const PAGE_SIZE = 20;

type ProductosAdministracionPageProps = {
    searchParams: Promise<{
        buscar?: string;
        linea?: string;
        categoria?: string;
        estado?: string;
        modalidad?: string;
        stock?: string;
        destacado?: string;
        ordenar?: string;
        pagina?: string;
    }>;
};

function getStatusLabel(
    status: string
) {
    switch (status) {
        case "active":
            return "Publicado";

        case "draft":
            return "Borrador";

        case "hidden":
            return "Oculto";

        case "archived":
            return "Archivado";

        default:
            return status;
    }
}

function getStatusClasses(
    status: string
) {
    switch (status) {
        case "active":
            return "border-[#d7c6a7] bg-[#f7f0e5] text-[#806037]";

        case "draft":
            return "border-neutral-300 bg-neutral-100 text-neutral-600";

        case "hidden":
            return "border-neutral-300 bg-white text-neutral-500";

        case "archived":
            return "border-neutral-300 bg-neutral-100 text-neutral-400";

        default:
            return "border-neutral-300 bg-white text-neutral-600";
    }
}

function getProductTypeLabel(
    productType: string
) {
    switch (productType) {
        case "direct":
            return "Venta directa";

        case "unique":
            return "Pieza única";

        case "on_order":
            return "Por encargo";

        case "custom":
            return "Personalizado";

        default:
            return productType;
    }
}

function getLineLabel(
    line?: string | null
) {
    switch (line) {
        case "jewelry":
            return "Joyería";

        case "silverware":
            return "Platería";

        default:
            return "—";
    }
}

function getLineValue(
    line?: string
) {
    if (
        line === "joyeria"
    ) {
        return "jewelry";
    }

    if (
        line === "plateria"
    ) {
        return "silverware";
    }

    return "";
}

function parsePage(
    value?: string
) {
    const parsed =
        Number(value);

    if (
        !Number.isInteger(parsed) ||
        parsed < 1
    ) {
        return 1;
    }

    return parsed;
}

function buildProductsUrl(
    params: {
        buscar?: string;
        linea?: string;
        categoria?: string;
        estado?: string;
        modalidad?: string;
        stock?: string;
        destacado?: string;
        ordenar?: string;
        pagina?: string | number;
    }
) {
    const query =
        new URLSearchParams();

    Object.entries(
        params
    ).forEach(
        ([key, value]) => {
            if (
                value === undefined ||
                value === null ||
                value === "" ||
                value === "todos"
            ) {
                return;
            }

            query.set(
                key,
                String(value)
            );
        }
    );

    const queryString =
        query.toString();

    return queryString
        ? `/administracion/productos?${queryString}`
        : "/administracion/productos";
}

export default async function ProductosAdministracionPage({
    searchParams,
}: ProductosAdministracionPageProps) {
    const params =
        await searchParams;

    const supabase =
        await createClient();

    /*
     * --------------------------------------------------
     * SEGURIDAD
     * --------------------------------------------------
     */

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

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
            <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl text-neutral-900">
                    Acceso no autorizado
                </h1>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    Esta sección está
                    reservada para los
                    administradores de
                    Lezcano.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-block bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Volver al inicio
                </Link>
            </section>
        );
    }

    /*
     * --------------------------------------------------
     * PARÁMETROS
     * --------------------------------------------------
     */

    const searchTerm =
        params.buscar?.trim() ??
        "";

    const selectedLine =
        getLineValue(
            params.linea
        );

    const selectedCategory =
        params.categoria ?? "";

    const selectedStatus =
        params.estado ?? "";

    const selectedProductType =
        params.modalidad ?? "";

    const selectedStock =
        params.stock ?? "";

    const selectedFeatured =
        params.destacado ?? "";

    const selectedSort =
        params.ordenar ??
        "recientes";

    const requestedPage =
        parsePage(
            params.pagina
        );

    /*
     * --------------------------------------------------
     * CATEGORÍAS
     * --------------------------------------------------
     */

    const {
        data: categories,
        error: categoriesError,
    } = await supabase
        .from("categories")
        .select(`
            id,
            name,
            slug,
            line,
            active,
            sort_order
        `)
        .order(
            "line",
            {
                ascending: true,
            }
        )
        .order(
            "sort_order",
            {
                ascending: true,
            }
        );

    if (categoriesError) {
        throw new Error(
            `Error al obtener categorías: ${categoriesError.message}`
        );
    }

    const categoryList =
        categories ?? [];

    const visibleCategories =
        selectedLine
            ? categoryList.filter(
                (category) =>
                    category.line ===
                    selectedLine
            )
            : categoryList;

    /*
     * IDs utilizados para filtrar por línea.
     */
    const categoryIdsForLine =
        selectedLine
            ? categoryList
                .filter(
                    (category) =>
                        category.line ===
                        selectedLine
                )
                .map(
                    (category) =>
                        category.id
                )
            : [];

    /*
     * --------------------------------------------------
     * ESTADÍSTICAS GENERALES
     * --------------------------------------------------
     */

    const [
        totalResult,
        activeResult,
        outOfStockResult,
        featuredResult,
    ] = await Promise.all([
        supabase
            .from("products")
            .select(
                "id",
                {
                    count: "exact",
                    head: true,
                }
            ),

        supabase
            .from("products")
            .select(
                "id",
                {
                    count: "exact",
                    head: true,
                }
            )
            .eq(
                "status",
                "active"
            ),

        supabase
            .from("products")
            .select(
                "id",
                {
                    count: "exact",
                    head: true,
                }
            )
            .eq(
                "stock",
                0
            ),

        supabase
            .from("products")
            .select(
                "id",
                {
                    count: "exact",
                    head: true,
                }
            )
            .eq(
                "is_featured",
                true
            ),
    ]);

    const totalProducts =
        totalResult.count ?? 0;

    const publishedProducts =
        activeResult.count ?? 0;

    const outOfStockProducts =
        outOfStockResult.count ??
        0;

    const featuredProducts =
        featuredResult.count ?? 0;

    /*
     * --------------------------------------------------
     * CONSULTA DE PRODUCTOS
     * --------------------------------------------------
     */

    let productsQuery =
        supabase
            .from("products")
            .select(
                `
                    id,
                    name,
                    slug,
                    material,
                    price,
                    stock,
                    product_type,
                    status,
                    is_featured,
                    created_at,
                    category_id,
                    categories (
                        id,
                        name,
                        slug,
                        line
                    ),
                    product_images (
                        id,
                        storage_path,
                        alt_text,
                        sort_order
                    )
                `,
                {
                    count: "exact",
                }
            );

    /*
     * Buscar por nombre o material.
     */
    if (searchTerm) {
        productsQuery =
            productsQuery.or(
                `name.ilike.%${searchTerm}%,material.ilike.%${searchTerm}%`
            );
    }

    /*
     * Línea
     */
    if (selectedLine) {
        if (
            categoryIdsForLine.length >
            0
        ) {
            productsQuery =
                productsQuery.in(
                    "category_id",
                    categoryIdsForLine
                );
        } else {
            productsQuery =
                productsQuery.eq(
                    "id",
                    "00000000-0000-0000-0000-000000000000"
                );
        }
    }

    /*
     * Categoría
     */
    if (selectedCategory) {
        productsQuery =
            productsQuery.eq(
                "category_id",
                selectedCategory
            );
    }

    /*
     * Estado
     */
    if (selectedStatus) {
        productsQuery =
            productsQuery.eq(
                "status",
                selectedStatus
            );
    }

    /*
     * Modalidad
     */
    if (
        selectedProductType
    ) {
        productsQuery =
            productsQuery.eq(
                "product_type",
                selectedProductType
            );
    }

    /*
     * Stock
     */
    if (
        selectedStock ===
        "disponible"
    ) {
        productsQuery =
            productsQuery.gt(
                "stock",
                0
            );
    }

    if (
        selectedStock ===
        "sin-stock"
    ) {
        productsQuery =
            productsQuery.eq(
                "stock",
                0
            );
    }

    /*
     * Destacados
     */
    if (
        selectedFeatured ===
        "si"
    ) {
        productsQuery =
            productsQuery.eq(
                "is_featured",
                true
            );
    }

    /*
     * Orden
     */
    switch (
    selectedSort
    ) {
        case "antiguos":
            productsQuery =
                productsQuery.order(
                    "created_at",
                    {
                        ascending:
                            true,
                    }
                );
            break;

        case "nombre":
            productsQuery =
                productsQuery.order(
                    "name",
                    {
                        ascending:
                            true,
                    }
                );
            break;

        case "precio-menor":
            productsQuery =
                productsQuery.order(
                    "price",
                    {
                        ascending:
                            true,
                        nullsFirst:
                            false,
                    }
                );
            break;

        case "precio-mayor":
            productsQuery =
                productsQuery.order(
                    "price",
                    {
                        ascending:
                            false,
                        nullsFirst:
                            false,
                    }
                );
            break;

        case "stock-menor":
            productsQuery =
                productsQuery.order(
                    "stock",
                    {
                        ascending:
                            true,
                    }
                );
            break;

        case "stock-mayor":
            productsQuery =
                productsQuery.order(
                    "stock",
                    {
                        ascending:
                            false,
                    }
                );
            break;

        case "destacados":
            productsQuery =
                productsQuery
                    .order(
                        "is_featured",
                        {
                            ascending:
                                false,
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false,
                        }
                    );
            break;

        case "recientes":
        default:
            productsQuery =
                productsQuery.order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                );
            break;
    }

    /*
     * Paginación
     */
    const offset =
        (requestedPage - 1) *
        PAGE_SIZE;

    productsQuery =
        productsQuery.range(
            offset,
            offset +
            PAGE_SIZE -
            1
        );

    const {
        data: products,
        error: productsError,
        count,
    } = await productsQuery;

    if (productsError) {
        throw new Error(
            `Error al obtener productos: ${productsError.message}`
        );
    }

    const productList =
        products ?? [];

    const filteredCount =
        count ?? 0;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredCount /
                PAGE_SIZE
            )
        );

    /*
     * Si alguien entra manualmente
     * a una página que ya no existe.
     */
    if (
        requestedPage >
        totalPages &&
        filteredCount > 0
    ) {
        redirect(
            buildProductsUrl({
                buscar:
                    searchTerm,
                linea:
                    params.linea,
                categoria:
                    selectedCategory,
                estado:
                    selectedStatus,
                modalidad:
                    selectedProductType,
                stock:
                    selectedStock,
                destacado:
                    selectedFeatured,
                ordenar:
                    selectedSort,
                pagina:
                    totalPages,
            })
        );
    }

    const currentPage =
        Math.min(
            requestedPage,
            totalPages
        );

    const hasFilters =
        Boolean(searchTerm) ||
        Boolean(selectedLine) ||
        Boolean(
            selectedCategory
        ) ||
        Boolean(
            selectedStatus
        ) ||
        Boolean(
            selectedProductType
        ) ||
        Boolean(
            selectedStock
        ) ||
        Boolean(
            selectedFeatured
        ) ||
        selectedSort !==
        "recientes";

    const firstVisibleProduct =
        filteredCount === 0
            ? 0
            : (currentPage - 1) *
            PAGE_SIZE +
            1;

    const lastVisibleProduct =
        Math.min(
            currentPage *
            PAGE_SIZE,
            filteredCount
        );

    const paginationParams = {
        buscar:
            searchTerm,
        linea:
            params.linea,
        categoria:
            selectedCategory,
        estado:
            selectedStatus,
        modalidad:
            selectedProductType,
        stock:
            selectedStock,
        destacado:
            selectedFeatured,
        ordenar:
            selectedSort,
    };

    return (
        <main className="min-h-screen bg-[#f7f4ef]">
            {/* Encabezado compacto */}
            <section className="border-b border-[#ddd5c9]">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <Link
                        href="/administracion"
                        className="text-xs text-neutral-500 transition hover:text-neutral-900 sm:text-sm"
                    >
                        ← Administración
                    </Link>

                    <div className="mt-4 flex items-end justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                                Administración
                            </p>

                            <h1 className="mt-1 font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                                Productos
                            </h1>

                            <p className="mt-1.5 hidden text-sm text-neutral-600 sm:block">
                                Gestioná el catálogo de Joyería y Platería Lezcano.
                            </p>
                        </div>

                        <Link
                            href="/administracion/productos/nuevo"
                            className="lezcano-button inline-flex h-10 shrink-0 items-center justify-center bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-[#9a7541] sm:h-11 sm:px-5 sm:text-sm"
                        >
                            <span className="sm:hidden">+ Nuevo</span>
                            <span className="hidden sm:inline">+ Nuevo producto</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                {/* Estadísticas compactas */}
                <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
                    <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-4">
                        <Link
                            href="/administracion/productos"
                            className="min-w-[118px] border border-[#ddd5c9] bg-white px-3 py-2.5 transition hover:border-[#b28a53] sm:min-w-0"
                        >
                            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                                Total
                            </p>

                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="font-serif text-xl text-neutral-900">
                                    {totalProducts}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                    productos
                                </span>
                            </div>
                        </Link>

                        <Link
                            href={buildProductsUrl({
                                estado: "active",
                            })}
                            className="min-w-[118px] border border-[#ddd5c9] bg-white px-3 py-2.5 transition hover:border-[#b28a53] sm:min-w-0"
                        >
                            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                                Publicados
                            </p>

                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="font-serif text-xl text-neutral-900">
                                    {publishedProducts}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                    visibles
                                </span>
                            </div>
                        </Link>

                        <Link
                            href={buildProductsUrl({
                                stock: "sin-stock",
                            })}
                            className="min-w-[118px] border border-[#ddd5c9] bg-white px-3 py-2.5 transition hover:border-[#b28a53] sm:min-w-0"
                        >
                            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                                Sin stock
                            </p>

                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="font-serif text-xl text-neutral-900">
                                    {outOfStockProducts}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                    productos
                                </span>
                            </div>
                        </Link>

                        <Link
                            href={buildProductsUrl({
                                destacado: "si",
                            })}
                            className="min-w-[118px] border border-[#ddd5c9] bg-white px-3 py-2.5 transition hover:border-[#b28a53] sm:min-w-0"
                        >
                            <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-400">
                                Destacados
                            </p>

                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="font-serif text-xl text-neutral-900">
                                    {featuredProducts}
                                </span>
                                <span className="text-[10px] text-neutral-500">
                                    en inicio
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Búsqueda y filtros compactos */}
                <section className="mt-4 border border-[#ddd5c9] bg-white">
                    <form
                        action="/administracion/productos"
                        method="get"
                        className="p-3 sm:p-4"
                    >
                        {params.linea && (
                            <input
                                type="hidden"
                                name="linea"
                                value={params.linea}
                            />
                        )}

                        {selectedCategory && (
                            <input
                                type="hidden"
                                name="categoria"
                                value={selectedCategory}
                            />
                        )}

                        {selectedStatus && (
                            <input
                                type="hidden"
                                name="estado"
                                value={selectedStatus}
                            />
                        )}

                        {selectedProductType && (
                            <input
                                type="hidden"
                                name="modalidad"
                                value={selectedProductType}
                            />
                        )}

                        {selectedStock && (
                            <input
                                type="hidden"
                                name="stock"
                                value={selectedStock}
                            />
                        )}

                        {selectedFeatured && (
                            <input
                                type="hidden"
                                name="destacado"
                                value={selectedFeatured}
                            />
                        )}

                        {selectedSort !== "recientes" && (
                            <input
                                type="hidden"
                                name="ordenar"
                                value={selectedSort}
                            />
                        )}

                        <div className="relative">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="6.5"
                                />
                                <path d="m16 16 4 4" />
                            </svg>

                            <input
                                type="search"
                                name="buscar"
                                defaultValue={searchTerm}
                                enterKeyHint="search"
                                placeholder="Buscar por nombre o material..."
                                className="h-10 w-full border border-neutral-300 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]"
                            />

                            <button
                                type="submit"
                                className="sr-only"
                            >
                                Buscar
                            </button>
                        </div>
                    </form>

                    <form
                        action="/administracion/productos"
                        method="get"
                        className="border-t border-neutral-100 p-3 sm:p-4"
                    >
                        {searchTerm && (
                            <input
                                type="hidden"
                                name="buscar"
                                value={searchTerm}
                            />
                        )}

                        {/* Filtros principales */}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div>
                                <label
                                    htmlFor="linea"
                                    className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                >
                                    Línea
                                </label>

                                <select
                                    id="linea"
                                    name="linea"
                                    defaultValue={params.linea ?? ""}
                                    className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                >
                                    <option value="">Todas</option>
                                    <option value="joyeria">Joyería</option>
                                    <option value="plateria">Platería</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="categoria"
                                    className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                >
                                    Categoría
                                </label>

                                <select
                                    id="categoria"
                                    name="categoria"
                                    defaultValue={selectedCategory}
                                    className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                >
                                    <option value="">Todas</option>

                                    {visibleCategories.map(
                                        (category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                                {!category.active
                                                    ? " (inactiva)"
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="estado"
                                    className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                >
                                    Estado
                                </label>

                                <select
                                    id="estado"
                                    name="estado"
                                    defaultValue={selectedStatus}
                                    className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="active">Publicados</option>
                                    <option value="draft">Borradores</option>
                                    <option value="hidden">Ocultos</option>
                                    <option value="archived">Archivados</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="stock"
                                    className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                >
                                    Stock
                                </label>

                                <select
                                    id="stock"
                                    name="stock"
                                    defaultValue={selectedStock}
                                    className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="disponible">Con stock</option>
                                    <option value="sin-stock">Sin stock</option>
                                </select>
                            </div>
                        </div>

                        {/* Filtros secundarios */}
                        <details
                            className="mt-3 border-t border-neutral-100 pt-3"
                            open={Boolean(
                                selectedProductType ||
                                selectedFeatured ||
                                selectedSort !== "recientes"
                            )}
                        >
                            <summary className="cursor-pointer list-none text-[10px] font-medium uppercase tracking-[0.14em] text-[#806037]">
                                Más filtros
                                <span className="ml-1 text-neutral-400">+</span>
                            </summary>

                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="modalidad"
                                        className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                    >
                                        Modalidad
                                    </label>

                                    <select
                                        id="modalidad"
                                        name="modalidad"
                                        defaultValue={selectedProductType}
                                        className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                    >
                                        <option value="">Todas</option>
                                        <option value="direct">Venta directa</option>
                                        <option value="unique">Pieza única</option>
                                        <option value="on_order">Por encargo</option>
                                        <option value="custom">Personalizado</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="destacado"
                                        className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                    >
                                        Destacado
                                    </label>

                                    <select
                                        id="destacado"
                                        name="destacado"
                                        defaultValue={selectedFeatured}
                                        className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                    >
                                        <option value="">Todos</option>
                                        <option value="si">Solo destacados</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="ordenar"
                                        className="mb-1 block text-[8px] uppercase tracking-[0.13em] text-neutral-400"
                                    >
                                        Ordenar
                                    </label>

                                    <select
                                        id="ordenar"
                                        name="ordenar"
                                        defaultValue={selectedSort}
                                        className="h-9 w-full border border-neutral-300 bg-white px-2 text-xs text-neutral-800 outline-none focus:border-[#9a7541] sm:text-sm"
                                    >
                                        <option value="recientes">Más recientes</option>
                                        <option value="antiguos">Más antiguos</option>
                                        <option value="nombre">Nombre A–Z</option>
                                        <option value="precio-menor">Precio: menor a mayor</option>
                                        <option value="precio-mayor">Precio: mayor a menor</option>
                                        <option value="stock-menor">Stock: menor a mayor</option>
                                        <option value="stock-mayor">Stock: mayor a menor</option>
                                        <option value="destacados">Destacados primero</option>
                                    </select>
                                </div>
                            </div>
                        </details>

                        <div className="mt-3 flex items-center gap-2">
                            <button
                                type="submit"
                                className="h-9 bg-neutral-900 px-4 text-xs font-medium text-white transition hover:bg-[#9a7541] sm:text-sm"
                            >
                                Aplicar filtros
                            </button>

                            {hasFilters && (
                                <Link
                                    href="/administracion/productos"
                                    className="inline-flex h-9 items-center px-2 text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                >
                                    Limpiar
                                </Link>
                            )}
                        </div>
                    </form>
                </section>

                {/* Resultados */}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-xs text-neutral-600 sm:text-sm">
                        {filteredCount === 0
                            ? "Sin resultados"
                            : `${firstVisibleProduct}–${lastVisibleProduct} de ${filteredCount} ${filteredCount === 1
                                ? "producto"
                                : "productos"
                            }`}
                    </p>

                    {filteredCount > PAGE_SIZE && (
                        <p className="text-[10px] text-neutral-400 sm:text-xs">
                            Página {currentPage} de {totalPages}
                        </p>
                    )}
                </div>

                {productList.length === 0 ? (
                    <div className="mt-3 border border-[#ddd5c9] bg-white px-5 py-10 text-center">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#9a7541]">
                            Catálogo
                        </p>

                        <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                            No encontramos productos
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                            Probá modificando alguno de los filtros o buscá otro producto.
                        </p>

                        {hasFilters ? (
                            <Link
                                href="/administracion/productos"
                                className="mt-5 inline-flex bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#9a7541]"
                            >
                                Ver todos
                            </Link>
                        ) : (
                            <Link
                                href="/administracion/productos/nuevo"
                                className="mt-5 inline-flex bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#9a7541]"
                            >
                                Cargar primer producto
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="mt-3 overflow-hidden border border-[#ddd5c9] bg-white">
                        {productList.map(
                            (
                                product,
                                index
                            ) => {
                                const category =
                                    Array.isArray(
                                        product.categories
                                    )
                                        ? product.categories[0]
                                        : product.categories;

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
                                        )
                                        .data.publicUrl
                                    : null;

                                const hasStock =
                                    product.stock > 0;

                                return (
                                    <article
                                        key={product.id}
                                        className={`p-3 ${index !==
                                            productList.length - 1
                                            ? "border-b border-neutral-200"
                                            : ""
                                            }`}
                                    >
                                        {/* Celular / tablet */}
                                        <div className="lg:hidden">
                                            <div className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-start gap-3">
                                                <Link
                                                    href={`/administracion/productos/${product.id}`}
                                                    className="group block h-[58px] w-[58px] overflow-hidden bg-neutral-100"
                                                >
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={
                                                                mainImage?.alt_text ||
                                                                product.name
                                                            }
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] text-neutral-400">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                                        <span className="text-[8px] uppercase tracking-[0.12em] text-[#9a7541]">
                                                            {getLineLabel(
                                                                category?.line
                                                            )}
                                                        </span>

                                                        <span className="text-[10px] text-neutral-300">
                                                            ·
                                                        </span>

                                                        <span className="truncate text-[10px] text-neutral-500">
                                                            {category?.name ??
                                                                "—"}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/administracion/productos/${product.id}`}
                                                        className="mt-0.5 block truncate font-serif text-lg leading-tight text-neutral-900"
                                                    >
                                                        {product.name}
                                                    </Link>

                                                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                        <span
                                                            className={`inline-flex border px-1.5 py-0.5 text-[8px] font-medium ${getStatusClasses(
                                                                product.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                product.status
                                                            )}
                                                        </span>

                                                        <span className="text-[9px] text-neutral-500">
                                                            {getProductTypeLabel(
                                                                product.product_type
                                                            )}
                                                        </span>

                                                        {product.is_featured && (
                                                            <span className="text-[9px] font-medium text-[#806037]">
                                                                ★ Destacado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/administracion/productos/${product.id}`}
                                                    className="inline-flex h-8 items-center justify-center border border-neutral-300 px-2.5 text-[10px] font-medium text-neutral-800 transition hover:border-neutral-900"
                                                >
                                                    Editar
                                                </Link>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[11px]">
                                                <span
                                                    className={
                                                        hasStock
                                                            ? "text-neutral-600"
                                                            : "font-medium text-amber-700"
                                                    }
                                                >
                                                    {hasStock
                                                        ? `Stock ${product.stock}`
                                                        : "Sin stock"}
                                                </span>

                                                <span className="font-medium text-neutral-900">
                                                    {product.price !== null
                                                        ? `$${Number(
                                                            product.price
                                                        ).toLocaleString(
                                                            "es-UY"
                                                        )}`
                                                        : "Sin precio"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Escritorio */}
                                        <div className="hidden items-center gap-4 lg:grid lg:grid-cols-[60px_minmax(220px,1.5fr)_150px_90px_110px_70px]">
                                            <Link
                                                href={`/administracion/productos/${product.id}`}
                                                className="group block h-[60px] w-[60px] overflow-hidden bg-neutral-100"
                                            >
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={
                                                            mainImage?.alt_text ||
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center px-1 text-center text-[8px] text-neutral-400">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] uppercase tracking-[0.13em] text-[#9a7541]">
                                                        {getLineLabel(
                                                            category?.line
                                                        )}
                                                    </span>

                                                    <span className="text-neutral-300">
                                                        ·
                                                    </span>

                                                    <span className="truncate text-[11px] text-neutral-500">
                                                        {category?.name ?? "—"}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/administracion/productos/${product.id}`}
                                                    className="mt-0.5 block truncate font-serif text-xl leading-tight text-neutral-900 transition hover:text-[#8a693c]"
                                                >
                                                    {product.name}
                                                </Link>

                                                {product.material && (
                                                    <p className="mt-0.5 truncate text-[10px] text-neutral-400">
                                                        {product.material}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <span
                                                    className={`inline-flex border px-2 py-1 text-[9px] font-medium ${getStatusClasses(
                                                        product.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        product.status
                                                    )}
                                                </span>

                                                <p className="mt-1 truncate text-[10px] text-neutral-500">
                                                    {getProductTypeLabel(
                                                        product.product_type
                                                    )}
                                                    {product.is_featured
                                                        ? " · ★ Destacado"
                                                        : ""}
                                                </p>
                                            </div>

                                            <div>
                                                <p
                                                    className={`text-xs font-medium ${hasStock
                                                        ? "text-neutral-900"
                                                        : "text-amber-700"
                                                        }`}
                                                >
                                                    {hasStock
                                                        ? product.stock
                                                        : "0"}
                                                </p>

                                                <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-neutral-400">
                                                    Stock
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-neutral-900">
                                                    {product.price !== null
                                                        ? `$${Number(
                                                            product.price
                                                        ).toLocaleString(
                                                            "es-UY"
                                                        )}`
                                                        : "—"}
                                                </p>

                                                <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-neutral-400">
                                                    Precio
                                                </p>
                                            </div>

                                            <Link
                                                href={`/administracion/productos/${product.id}`}
                                                className="inline-flex h-8 items-center justify-center border border-neutral-300 px-2 text-[10px] font-medium text-neutral-800 transition hover:border-neutral-900"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <nav
                        aria-label="Paginación de productos"
                        className="mt-4 flex flex-wrap items-center justify-center gap-1.5"
                    >
                        {currentPage > 1 && (
                            <Link
                                href={buildProductsUrl({
                                    ...paginationParams,
                                    pagina:
                                        currentPage -
                                        1,
                                })}
                                className="flex h-9 items-center justify-center border border-neutral-300 bg-white px-3 text-xs text-neutral-700 transition hover:border-neutral-900"
                            >
                                ← Anterior
                            </Link>
                        )}

                        {Array.from(
                            {
                                length:
                                    totalPages,
                            },
                            (
                                _,
                                index
                            ) =>
                                index + 1
                        )
                            .filter(
                                (
                                    page
                                ) => {
                                    if (
                                        totalPages <=
                                        7
                                    ) {
                                        return true;
                                    }

                                    if (
                                        page ===
                                        1 ||
                                        page ===
                                        totalPages
                                    ) {
                                        return true;
                                    }

                                    return (
                                        Math.abs(
                                            page -
                                            currentPage
                                        ) <=
                                        1
                                    );
                                }
                            )
                            .map(
                                (
                                    page,
                                    index,
                                    visiblePages
                                ) => {
                                    const previousPage =
                                        visiblePages[
                                        index -
                                        1
                                        ];

                                    const needsEllipsis =
                                        previousPage &&
                                        page -
                                        previousPage >
                                        1;

                                    return (
                                        <span
                                            key={
                                                page
                                            }
                                            className="flex items-center gap-1.5"
                                        >
                                            {needsEllipsis && (
                                                <span className="px-1 text-neutral-400">
                                                    …
                                                </span>
                                            )}

                                            <Link
                                                href={buildProductsUrl({
                                                    ...paginationParams,
                                                    pagina:
                                                        page,
                                                })}
                                                aria-current={
                                                    page ===
                                                        currentPage
                                                        ? "page"
                                                        : undefined
                                                }
                                                className={`flex h-9 min-w-9 items-center justify-center border px-2.5 text-xs transition ${page ===
                                                    currentPage
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900"
                                                    }`}
                                            >
                                                {
                                                    page
                                                }
                                            </Link>
                                        </span>
                                    );
                                }
                            )}

                        {currentPage < totalPages && (
                            <Link
                                href={buildProductsUrl({
                                    ...paginationParams,
                                    pagina:
                                        currentPage +
                                        1,
                                })}
                                className="flex h-9 items-center justify-center border border-neutral-300 bg-white px-3 text-xs text-neutral-700 transition hover:border-neutral-900"
                            >
                                Siguiente →
                            </Link>
                        )}
                    </nav>
                )}
            </section>
        </main>
    );
}
