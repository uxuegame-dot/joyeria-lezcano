import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

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

function getProductTypeLabel(productType: string) {
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

function getLineLabel(line?: string | null) {
    switch (line) {
        case "jewelry":
            return "Joyería";
        case "silverware":
            return "Platería";
        default:
            return "—";
    }
}

export default async function ProductosAdministracionPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (profileError || !profile?.is_admin) {
        return (
            <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl text-neutral-900">
                    Acceso no autorizado
                </h1>

                <p className="mt-4 text-sm leading-6 text-neutral-600">
                    Esta sección está reservada para los administradores de
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

    const { data: products, error: productsError } = await supabase
        .from("products")
        .select(`
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
        `)
        .order("created_at", {
            ascending: false,
        });

    if (productsError) {
        throw new Error(
            `Error al obtener productos: ${productsError.message}`
        );
    }

    const productList = products ?? [];

    return (
        <div>
            <section className="border-b border-neutral-200">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link
                        href="/administracion"
                        className="text-sm text-neutral-500 transition hover:text-neutral-900"
                    >
                        ← Administración
                    </Link>

                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                                Administración
                            </p>

                            <h1 className="mt-2 font-serif text-4xl tracking-tight text-neutral-900">
                                Productos
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                Administrá las piezas de Joyería y Platería
                                Lezcano.
                            </p>
                        </div>

                        <Link
                            href="/administracion/productos/nuevo"
                            className="inline-flex items-center justify-center bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            + Nuevo producto
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {productList.length === 0 ? (
                    <div className="border border-neutral-200 bg-white px-6 py-16 text-center">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            Catálogo
                        </p>

                        <h2 className="mt-3 font-serif text-3xl text-neutral-900">
                            No hay productos cargados
                        </h2>

                        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-600">
                            Cuando cargues una pieza va a aparecer acá,
                            independientemente de que esté publicada, oculta o
                            en borrador.
                        </p>

                        <Link
                            href="/administracion/productos/nuevo"
                            className="mt-7 inline-flex bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                            Cargar primer producto
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600">
                                {productList.length}{" "}
                                {productList.length === 1
                                    ? "producto"
                                    : "productos"}
                            </p>
                        </div>

                        <div className="overflow-hidden border border-neutral-200 bg-white">
                            {productList.map((product, index) => {
                                const category = Array.isArray(
                                    product.categories
                                )
                                    ? product.categories[0]
                                    : product.categories;

                                const images = [
                                    ...(product.product_images ?? []),
                                ].sort(
                                    (a, b) =>
                                        a.sort_order - b.sort_order
                                );

                                const mainImage = images[0];

                                const imageUrl = mainImage
                                    ? supabase.storage
                                        .from("product-images")
                                        .getPublicUrl(
                                            mainImage.storage_path
                                        ).data.publicUrl
                                    : null;

                                return (
                                    <div
                                        key={product.id}
                                        className={`grid gap-5 p-5 sm:grid-cols-[96px_1fr_auto] sm:items-center ${index !==
                                            productList.length - 1
                                            ? "border-b border-neutral-200"
                                            : ""
                                            }`}
                                    >
                                        <div className="aspect-square w-24 overflow-hidden bg-neutral-100">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={
                                                        mainImage?.alt_text ||
                                                        product.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] leading-4 text-neutral-400">
                                                    Sin imagen
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                                                    {getLineLabel(
                                                        category?.line
                                                    )}
                                                </p>

                                                <span className="text-neutral-300">
                                                    ·
                                                </span>

                                                <p className="text-xs text-neutral-500">
                                                    {category?.name ?? "—"}
                                                </p>
                                            </div>

                                            <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                                                {product.name}
                                            </h2>

                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500">
                                                <span>
                                                    {getStatusLabel(
                                                        product.status
                                                    )}
                                                </span>

                                                <span>
                                                    {getProductTypeLabel(
                                                        product.product_type
                                                    )}
                                                </span>

                                                <span>
                                                    Stock: {product.stock}
                                                </span>

                                                {product.price !== null && (
                                                    <span>
                                                        $
                                                        {Number(
                                                            product.price
                                                        ).toLocaleString(
                                                            "es-UY"
                                                        )}
                                                    </span>
                                                )}

                                                {product.is_featured && (
                                                    <span>Destacado</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Link
                                                href={`/administracion/productos/${product.id}`}
                                                className="inline-flex border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
                                            >
                                                Editar
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}