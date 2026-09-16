import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getActiveProductBySlug } from "@/app/lib/products";
import { ProductGallery } from "@/app/components/ProductGallery";
import { AddToCartButton } from "@/app/components/AddToCartButton";

type ProductPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    const product = await getActiveProductBySlug(slug);

    if (!product) {
        notFound();
    }

    const supabase = await createClient();

    const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

    const orderedImages = [
        ...(product.product_images ?? []),
    ].sort(
        (a, b) =>
            a.sort_order - b.sort_order
    );

    const galleryImages = orderedImages.map(
        (image) => {
            const { data } = supabase.storage
                .from("product-images")
                .getPublicUrl(
                    image.storage_path
                );

            return {
                id: image.id,
                url: data.publicUrl,
                alt:
                    image.alt_text ||
                    product.name,
            };
        }
    );

    const mainImage =
        galleryImages.length > 0
            ? galleryImages[0].url
            : null;

    const canBuy =
        (product.product_type ===
            "direct" ||
            product.product_type ===
            "unique") &&
        product.stock > 0 &&
        product.price !== null;

    const isConsultation =
        product.product_type ===
        "on_order" ||
        product.product_type ===
        "custom";

    const isOutOfStock =
        (product.product_type ===
            "direct" ||
            product.product_type ===
            "unique") &&
        product.stock === 0;

    return (
        <main>
            {/* Navegación */}
            <div className="border-b border-neutral-200">
                <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                        <Link
                            href="/catalogo"
                            className="transition hover:text-neutral-900"
                        >
                            Catálogo
                        </Link>

                        {category && (
                            <>
                                <span>/</span>

                                <Link
                                    href={`/catalogo?categoria=${encodeURIComponent(
                                        category.slug
                                    )}`}
                                    className="transition hover:text-neutral-900"
                                >
                                    {
                                        category.name
                                    }
                                </Link>
                            </>
                        )}

                        <span>/</span>

                        <span className="text-neutral-900">
                            {product.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Producto */}
            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <ProductGallery
                        images={
                            galleryImages
                        }
                        productName={
                            product.name
                        }
                    />

                    <div className="flex flex-col justify-center">
                        {category && (
                            <Link
                                href={`/catalogo?categoria=${encodeURIComponent(
                                    category.slug
                                )}`}
                                className="w-fit text-xs uppercase tracking-[0.2em] text-neutral-500 transition hover:text-neutral-900"
                            >
                                {
                                    category.name
                                }
                            </Link>
                        )}

                        <h1 className="mt-3 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
                            {product.name}
                        </h1>

                        {product.material && (
                            <p className="mt-4 text-sm text-neutral-500">
                                {
                                    product.material
                                }
                            </p>
                        )}

                        <div className="mt-6">
                            {product.price !==
                                null ? (
                                <p className="text-2xl text-neutral-900">
                                    $
                                    {Number(
                                        product.price
                                    ).toLocaleString(
                                        "es-UY"
                                    )}
                                </p>
                            ) : (
                                <p className="text-lg font-medium text-neutral-900">
                                    Consultar
                                    precio
                                </p>
                            )}

                            <div className="mt-3">
                                {isConsultation && (
                                    <p className="text-sm text-neutral-600">
                                        Pieza
                                        disponible
                                        por encargo.
                                    </p>
                                )}

                                {canBuy &&
                                    product.product_type ===
                                    "unique" && (
                                        <p className="text-sm text-neutral-600">
                                            Pieza
                                            única ·{" "}
                                            {
                                                product.stock
                                            }{" "}
                                            disponible
                                        </p>
                                    )}

                                {canBuy &&
                                    product.product_type ===
                                    "direct" && (
                                        <p className="text-sm text-neutral-600">
                                            Disponible
                                        </p>
                                    )}

                                {isOutOfStock && (
                                    <p className="text-sm text-neutral-500">
                                        Actualmente
                                        no
                                        disponible
                                    </p>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <div className="mt-8 border-t border-neutral-200 pt-8">
                                <h2 className="text-sm font-medium text-neutral-900">
                                    Descripción
                                </h2>

                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
                                    {
                                        product.description
                                    }
                                </p>
                            </div>
                        )}

                        <div className="mt-8">
                            {canBuy &&
                                product.price !==
                                null && (
                                    <AddToCartButton
                                        product={{
                                            id: product.id,
                                            slug: product.slug,
                                            name: product.name,
                                            price: Number(
                                                product.price
                                            ),
                                            stock:
                                                product.stock,
                                            material:
                                                product.material,
                                            imageUrl:
                                                mainImage,
                                        }}
                                    />
                                )}

                            {isOutOfStock && (
                                <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-center text-sm text-neutral-500">
                                    Actualmente no
                                    disponible
                                </div>
                            )}

                            {isConsultation && (
                                <Link
                                    href="/contacto"
                                    className="block w-full bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
                                >
                                    Consultar por
                                    WhatsApp
                                </Link>
                            )}
                        </div>

                        <div className="mt-8 border-t border-neutral-200 pt-6">
                            <dl className="space-y-3 text-sm">
                                {category && (
                                    <div className="flex justify-between gap-6">
                                        <dt className="text-neutral-500">
                                            Categoría
                                        </dt>

                                        <dd className="text-right text-neutral-900">
                                            {
                                                category.name
                                            }
                                        </dd>
                                    </div>
                                )}

                                {product.material && (
                                    <div className="flex justify-between gap-6">
                                        <dt className="text-neutral-500">
                                            Material
                                        </dt>

                                        <dd className="text-right text-neutral-900">
                                            {
                                                product.material
                                            }
                                        </dd>
                                    </div>
                                )}

                                <div className="flex justify-between gap-6">
                                    <dt className="text-neutral-500">
                                        Modalidad
                                    </dt>

                                    <dd className="text-right text-neutral-900">
                                        {product.product_type ===
                                            "direct" &&
                                            "Venta directa"}

                                        {product.product_type ===
                                            "unique" &&
                                            "Pieza única"}

                                        {product.product_type ===
                                            "on_order" &&
                                            "Por encargo"}

                                        {product.product_type ===
                                            "custom" &&
                                            "Trabajo personalizado"}
                                    </dd>
                                </div>
                            </dl>

                            <p className="mt-6 text-xs leading-5 text-neutral-500">
                                Las piezas por
                                encargo y los
                                trabajos
                                personalizados se
                                coordinan
                                directamente con la
                                joyería.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-neutral-200">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <Link
                        href="/catalogo"
                        className="text-sm font-medium text-neutral-900 underline underline-offset-4"
                    >
                        ← Volver al catálogo
                    </Link>
                </div>
            </section>
        </main>
    );
}