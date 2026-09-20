import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import { getActiveProductBySlug } from "@/app/lib/products";

import { ProductGallery } from "@/app/components/ProductGallery";
import { AddToCartButton } from "@/app/components/AddToCartButton";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const WHATSAPP_NUMBER = "59899726968";

function getWhatsAppUrl(message: string) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        message
    )}`;
}

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    const product =
        await getActiveProductBySlug(
            slug
        );

    if (!product) {
        notFound();
    }

    const supabase =
        await createClient();

    const category =
        Array.isArray(
            product.categories
        )
            ? product.categories[0]
            : product.categories;

    const orderedImages = [
        ...(product.product_images ??
            []),
    ].sort(
        (a, b) =>
            a.sort_order -
            b.sort_order
    );

    const galleryImages =
        orderedImages.map(
            (image) => {
                const { data } =
                    supabase.storage
                        .from(
                            "product-images"
                        )
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

    const modalityLabel =
        product.product_type ===
            "direct"
            ? "Venta directa"
            : product.product_type ===
                "unique"
                ? "Pieza única"
                : product.product_type ===
                    "on_order"
                    ? "Por encargo"
                    : "Trabajo personalizado";

    const whatsappUrl = getWhatsAppUrl(
        `Hola, estoy viendo la pieza "${product.name}" en la web de Joyería Lezcano y quería hacer una consulta.`
    );

    return (
        <main className="min-h-screen bg-[#f8f5ef]">
            {/* Navegación */}
            <div className="border-b border-[#e2d9cc] bg-[#fcfaf6]">
                <div className="mx-auto max-w-5xl px-4 py-2.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 overflow-hidden text-[11px] text-neutral-500 sm:text-xs">
                        <Link
                            href="/catalogo"
                            className="shrink-0 transition-colors hover:text-neutral-900"
                        >
                            Catálogo
                        </Link>

                        {category && (
                            <>
                                <span className="text-neutral-300">/</span>

                                <Link
                                    href={`/catalogo?categoria=${encodeURIComponent(
                                        category.slug
                                    )}`}
                                    className="hidden shrink-0 transition-colors hover:text-neutral-900 sm:inline"
                                >
                                    {category.name}
                                </Link>

                                <span className="hidden text-neutral-300 sm:inline">/</span>
                            </>
                        )}

                        <span className="truncate text-neutral-700">
                            {product.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Producto */}
            <section className="mx-auto max-w-5xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:items-start lg:gap-8">
                    {/* Galería */}
                    <div className="min-w-0">
                        <ProductGallery
                            images={galleryImages}
                            productName={product.name}
                        />
                    </div>

                    {/* Información */}
                    <div className="min-w-0 rounded-[22px] border border-[#e1d7c9] bg-white/80 p-4 shadow-[0_12px_34px_rgba(78,59,38,0.045)] sm:p-5 lg:sticky lg:top-24 lg:self-start lg:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {category ? (
                                <Link
                                    href={`/catalogo?categoria=${encodeURIComponent(
                                        category.slug
                                    )}`}
                                    className="inline-flex rounded-full bg-[#f1e7d7] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#966c32] transition hover:bg-[#eadbc5]"
                                >
                                    {category.name}
                                </Link>
                            ) : (
                                <span />
                            )}

                            {isConsultation && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3eadc] px-3 py-1 text-[10px] font-medium text-[#8e6a38]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#b28a53]" />
                                    Por encargo
                                </span>
                            )}

                            {canBuy && product.product_type === "unique" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
                                    Pieza única
                                </span>
                            )}

                            {canBuy && product.product_type === "direct" && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1e7d7] px-3 py-1 text-[10px] font-medium text-[#7d5d34]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#a87c3f]" />
                                    Disponible
                                </span>
                            )}

                            {isOutOfStock && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                    Sin stock
                                </span>
                            )}
                        </div>

                        <h1 className="mt-3 font-serif text-[28px] leading-[1.05] tracking-tight text-neutral-900 sm:text-[34px]">
                            {product.name}
                        </h1>

                        {product.material && (
                            <p className="mt-1.5 text-sm text-neutral-500">
                                {product.material}
                            </p>
                        )}

                        <div className="mt-4 border-y border-[#e2d9cc] py-3.5">
                            <div className="flex items-end justify-between gap-4">
                                {product.price !== null ? (
                                    <p className="font-serif text-[28px] leading-none text-neutral-900 sm:text-3xl">
                                        ${Number(product.price).toLocaleString("es-UY")}
                                    </p>
                                ) : (
                                    <p className="font-serif text-2xl text-neutral-900">
                                        Consultar precio
                                    </p>
                                )}

                                {canBuy && product.product_type === "unique" && (
                                    <p className="text-[11px] text-neutral-500">
                                        {product.stock} disponible
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CTA principal */}
                        <div className="mt-4">
                            {canBuy && product.price !== null && (
                                <AddToCartButton
                                    product={{
                                        id: product.id,
                                        slug: product.slug,
                                        name: product.name,
                                        price: Number(product.price),
                                        stock: product.stock,
                                        material: product.material,
                                        imageUrl: mainImage,
                                    }}
                                />
                            )}

                            {isOutOfStock && (
                                <div className="rounded-[14px] border border-neutral-200 bg-neutral-50 px-5 py-3.5 text-center text-sm text-neutral-500">
                                    Actualmente no disponible
                                </div>
                            )}

                            {isConsultation && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lezcano-button flex min-h-12 w-full items-center justify-center rounded-[14px] bg-neutral-900 px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-[#9a7541]"
                                >
                                    Consultar por WhatsApp
                                    <span className="ml-2">→</span>
                                </a>
                            )}
                        </div>

                        {/* Mensajes de confianza */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                            <div className="flex items-center gap-2 rounded-[12px] bg-[#f8f4ed] px-3 py-2.5">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <rect x="5" y="10" width="14" height="10" rx="1" />
                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>
                                Compra segura
                            </div>

                            <div className="flex items-center gap-2 rounded-[12px] bg-[#f8f4ed] px-3 py-2.5">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path d="M3 7h12v10H3z" />
                                    <path d="M15 10h3l3 3v4h-6" />
                                </svg>
                                Envíos Uruguay
                            </div>
                        </div>

                        {product.description && (
                            <div className="mt-5 border-t border-[#e2d9cc] pt-4">
                                <h2 className="font-serif text-lg text-neutral-900">
                                    Descripción
                                </h2>

                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-600">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        <div className="mt-5 border-t border-[#e2d9cc] pt-4">
                            <h2 className="font-serif text-lg text-neutral-900">
                                Detalles
                            </h2>

                            <dl className="mt-3 divide-y divide-[#eee7de] border-y border-[#eee7de] text-sm">
                                {category && (
                                    <div className="flex justify-between gap-6 py-2.5">
                                        <dt className="text-neutral-500">Categoría</dt>
                                        <dd className="text-right text-neutral-900">{category.name}</dd>
                                    </div>
                                )}

                                {product.material && (
                                    <div className="flex justify-between gap-6 py-2.5">
                                        <dt className="text-neutral-500">Material</dt>
                                        <dd className="text-right text-neutral-900">{product.material}</dd>
                                    </div>
                                )}

                                <div className="flex justify-between gap-6 py-2.5">
                                    <dt className="text-neutral-500">Modalidad</dt>
                                    <dd className="text-right text-neutral-900">{modalityLabel}</dd>
                                </div>
                            </dl>

                            {isConsultation && (
                                <p className="mt-4 text-xs leading-5 text-neutral-500">
                                    Las piezas por encargo y los trabajos personalizados se coordinan directamente con la joyería.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-t border-[#e2d9cc] bg-[#fcfaf6]">
                <div className="mx-auto max-w-5xl px-4 py-3.5 sm:px-6 lg:px-8">
                    <Link
                        href="/catalogo"
                        className="lezcano-arrow inline-flex items-center text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                    >
                        <span className="arrow">←</span>
                        Volver al catálogo
                    </Link>
                </div>
            </section>
        </main>
    );
}
