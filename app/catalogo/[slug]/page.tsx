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
        <main className="bg-[#f7f4ef]">

            {/* Navegación */}
            <div className="border-b border-[#ddd5c9] bg-[#faf8f4]">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
                    <div className="flex items-center gap-2 overflow-hidden text-xs text-neutral-500 sm:text-sm">

                        <Link
                            href="/catalogo"
                            className="shrink-0 transition-colors hover:text-neutral-900"
                        >
                            Catálogo
                        </Link>

                        {category && (
                            <>
                                <span className="text-neutral-300">
                                    /
                                </span>

                                <Link
                                    href={`/catalogo?categoria=${encodeURIComponent(
                                        category.slug
                                    )}`}
                                    className="hidden shrink-0 transition-colors hover:text-neutral-900 sm:inline"
                                >
                                    {
                                        category.name
                                    }
                                </Link>

                                <span className="hidden text-neutral-300 sm:inline">
                                    /
                                </span>
                            </>
                        )}

                        <span className="truncate text-neutral-700">
                            {
                                product.name
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Producto */}
            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">

                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">

                    {/* Galería */}
                    <div className="min-w-0">
                        <ProductGallery
                            images={
                                galleryImages
                            }
                            productName={
                                product.name
                            }
                        />
                    </div>

                    {/* Información */}
                    <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">

                        {/* Categoría */}
                        {category && (
                            <Link
                                href={`/catalogo?categoria=${encodeURIComponent(
                                    category.slug
                                )}`}
                                className="inline-block text-[10px] uppercase tracking-[0.22em] text-[#9a7541] transition-colors hover:text-[#7d5d34] sm:text-xs"
                            >
                                {
                                    category.name
                                }
                            </Link>
                        )}

                        {/* Nombre */}
                        <h1 className="mt-2 font-serif text-3xl leading-tight tracking-tight text-neutral-900 sm:mt-3 sm:text-4xl lg:text-5xl">
                            {
                                product.name
                            }
                        </h1>

                        {/* Material */}
                        {product.material && (
                            <p className="mt-2 text-sm text-neutral-500">
                                {
                                    product.material
                                }
                            </p>
                        )}

                        {/* Precio + disponibilidad */}
                        <div className="mt-5 border-y border-[#ddd5c9] py-5 sm:mt-6">

                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    {product.price !==
                                        null ? (
                                        <p className="font-serif text-3xl leading-none text-neutral-900">
                                            $
                                            {Number(
                                                product.price
                                            ).toLocaleString(
                                                "es-UY"
                                            )}
                                        </p>
                                    ) : (
                                        <p className="font-serif text-2xl text-neutral-900">
                                            Consultar
                                            precio
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    {isConsultation && (
                                        <span className="inline-flex items-center gap-2 text-xs text-[#9a7541]">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#9a7541]" />

                                            Por encargo
                                        </span>
                                    )}

                                    {canBuy &&
                                        product.product_type ===
                                        "unique" && (
                                            <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />

                                                Pieza única
                                            </span>
                                        )}

                                    {canBuy &&
                                        product.product_type ===
                                        "direct" && (
                                            <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#9a7541]" />

                                                Disponible
                                            </span>
                                        )}

                                    {isOutOfStock && (
                                        <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />

                                            Sin stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            {canBuy &&
                                product.product_type ===
                                "unique" && (
                                    <p className="mt-3 text-xs text-neutral-500">
                                        {
                                            product.stock
                                        }{" "}
                                        disponible
                                    </p>
                                )}
                        </div>

                        {/* CTA principal */}
                        <div className="mt-5 sm:mt-6">
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
                                <div className="border border-neutral-200 bg-white px-5 py-4 text-center text-sm text-neutral-500">
                                    Actualmente no
                                    disponible
                                </div>
                            )}

                            {isConsultation && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="lezcano-button flex min-h-14 w-full items-center justify-center bg-neutral-900 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-[#9a7541]"
                                >
                                    Consultar por
                                    WhatsApp

                                    <span className="ml-2">
                                        →
                                    </span>
                                </a>
                            )}
                        </div>

                        {/* Mensajes de confianza */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.1em] text-neutral-400 sm:flex sm:gap-6">

                            <div className="flex items-center gap-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <rect
                                        x="5"
                                        y="10"
                                        width="14"
                                        height="10"
                                        rx="1"
                                    />

                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>

                                Compra segura
                            </div>

                            <div className="flex items-center gap-2">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                >
                                    <path d="M3 7h12v10H3z" />

                                    <path d="M15 10h3l3 3v4h-6" />
                                </svg>

                                Envíos Uruguay
                            </div>
                        </div>

                        {/* Descripción */}
                        {product.description && (
                            <div className="mt-8 border-t border-[#ddd5c9] pt-7">
                                <h2 className="font-serif text-xl text-neutral-900">
                                    Descripción
                                </h2>

                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-600">
                                    {
                                        product.description
                                    }
                                </p>
                            </div>
                        )}

                        {/* Detalles */}
                        <div className="mt-8 border-t border-[#ddd5c9] pt-7">
                            <h2 className="font-serif text-xl text-neutral-900">
                                Detalles
                            </h2>

                            <dl className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200 text-sm">

                                {category && (
                                    <div className="flex justify-between gap-6 py-3.5">
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
                                    <div className="flex justify-between gap-6 py-3.5">
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

                                <div className="flex justify-between gap-6 py-3.5">
                                    <dt className="text-neutral-500">
                                        Modalidad
                                    </dt>

                                    <dd className="text-right text-neutral-900">
                                        {
                                            modalityLabel
                                        }
                                    </dd>
                                </div>
                            </dl>

                            {isConsultation && (
                                <p className="mt-5 text-xs leading-5 text-neutral-500">
                                    Las piezas por
                                    encargo y los
                                    trabajos
                                    personalizados se
                                    coordinan
                                    directamente con
                                    la joyería.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Volver */}
            <section className="border-t border-[#ddd5c9] bg-[#faf8f4]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link
                        href="/catalogo"
                        className="lezcano-arrow inline-flex items-center text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
                    >
                        <span className="arrow">
                            ←
                        </span>

                        Volver al catálogo
                    </Link>
                </div>
            </section>
        </main>
    );
}