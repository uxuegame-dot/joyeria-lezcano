import Image from "next/image";
import Link from "next/link";

import { Hero } from "@/app/components/Hero";
import { ImagePlaceholder } from "@/app/components/ImagePlaceholder";
import { Reveal } from "@/app/components/Reveal";

import { getActiveProducts } from "@/app/lib/products";
import { createClient } from "@/app/lib/supabase/server";

const WHATSAPP_URL =
  "https://wa.me/59899726968?text=" +
  encodeURIComponent(
    "Hola, estoy visitando la web de Joyería Lezcano y quería hacer una consulta."
  );

function getCategory(product: any) {
  return Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories;
}

function getMainImage(product: any) {
  if (
    !product.product_images ||
    product.product_images.length === 0
  ) {
    return null;
  }

  return [...product.product_images].sort(
    (a, b) =>
      a.sort_order -
      b.sort_order
  )[0];
}

function getFeaturedGridClasses(
  count: number
) {
  if (count === 1) {
    return "mx-auto mt-6 grid max-w-[220px] grid-cols-1";
  }

  if (count === 2) {
    return "mx-auto mt-6 grid max-w-[500px] grid-cols-2 gap-x-5 gap-y-7";
  }

  if (count === 3) {
    return "mx-auto mt-6 grid max-w-[760px] grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5";
  }

  return "mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6";
}

export default async function HomePage() {
  const products =
    await getActiveProducts();

  const featuredProducts =
    products
      .filter(
        (product) =>
          product.is_featured
      )
      .slice(0, 4);

  const supabase =
    await createClient();

  const featuredGridClasses =
    getFeaturedGridClasses(
      featuredProducts.length
    );

  return (
    <>
      {/* HERO */}
      <Hero />

      {/* DESTACADOS */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-[#dfd4c5] bg-gradient-to-b from-[#fbf8f2] via-[#faf5ec] to-[#f6efe4]">
          <Reveal soft>
            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dec9a9] bg-white/70 px-3 py-1.5 shadow-[0_6px_18px_rgba(90,67,34,0.04)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b78949]" />

                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                      Selección Lezcano
                    </p>
                  </div>

                  <h2 className="mt-3 max-w-2xl font-serif text-[28px] leading-[1.04] tracking-tight text-neutral-900 sm:text-[32px]">
                    Piezas para regalar, usar y conservar.
                  </h2>
                </div>

                <Link
                  href="/catalogo"
                  className="lezcano-arrow inline-flex w-fit shrink-0 items-center rounded-full border border-[#d8c4a4] bg-white/75 px-4 py-2.5 text-sm font-medium text-[#7f5b2e] shadow-[0_6px_18px_rgba(90,67,34,0.04)] transition hover:border-[#b28a53] hover:bg-white hover:text-neutral-900"
                >
                  Ver todo el catálogo

                  <span className="arrow">
                    →
                  </span>
                </Link>
              </div>

              <div
                className={
                  featuredGridClasses
                }
              >
                {featuredProducts.map(
                  (
                    product,
                    index
                  ) => {
                    const category =
                      getCategory(
                        product
                      );

                    const mainImage =
                      getMainImage(
                        product
                      );

                    const imageUrl =
                      mainImage
                        ? supabase.storage
                          .from(
                            "product-images"
                          )
                          .getPublicUrl(
                            mainImage.storage_path
                          )
                          .data.publicUrl
                        : null;

                    return (
                      <Reveal
                        key={
                          product.id
                        }
                        soft
                        delay={
                          index * 70
                        }
                      >
                        <Link
                          href={`/catalogo/${product.slug}`}
                          className="group block h-full overflow-hidden rounded-[20px] border border-[#dfd3c2] bg-white/85 p-2.5 shadow-[0_10px_28px_rgba(72,52,28,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c9a975] hover:bg-white hover:shadow-[0_16px_34px_rgba(72,52,28,0.08)]"
                        >
                          <div className="relative aspect-square overflow-hidden rounded-[15px] bg-[#eee9e1]">
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

                            <div className="pointer-events-none absolute inset-0 rounded-[15px] border border-black/[0.05]" />

                            <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/90 text-sm text-[#7d592c] opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                              →
                            </div>
                          </div>

                          <div className="px-1 pb-1 pt-3">
                            {category && (
                              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#aa7f44]">
                                {
                                  category.name
                                }
                              </p>
                            )}

                            <div className="mt-1.5 flex items-end justify-between gap-3">
                              <h3 className="min-w-0 font-serif text-[17px] leading-tight text-neutral-900 transition duration-300 group-hover:text-[#8a693c] sm:text-[18px]">
                                {
                                  product.name
                                }
                              </h3>

                              {product.price !==
                                null && (
                                  <p className="shrink-0 text-[12px] font-medium text-neutral-600 sm:text-[13px]">
                                    $
                                    {Number(
                                      product.price
                                    ).toLocaleString(
                                      "es-UY"
                                    )}
                                  </p>
                                )}
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  }
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* JOYERÍA Y PLATERÍA */}
      <section className="border-y border-[#e1d8ca] bg-[#f7f2e9]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#a47a3c] sm:text-[10px]">
                  Dos expresiones de un mismo oficio
                </p>

                <h2 className="mt-2 font-serif text-[30px] leading-none tracking-tight text-neutral-900 sm:text-4xl">
                  Joyería & Platería
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                  Dos líneas distintas, unidas por una misma tradición de oficio y atención al detalle.
                </p>
              </div>

              <Link
                href="/catalogo"
                className="lezcano-arrow inline-flex w-fit items-center text-sm font-medium text-[#8b642f] transition hover:text-neutral-900"
              >
                Ver catálogo
                <span className="arrow">→</span>
              </Link>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Reveal soft>
              <Link
                href="/catalogo?linea=joyeria"
                className="group grid overflow-hidden rounded-[22px] border border-[#dfd4c5] bg-white shadow-[0_12px_34px_rgba(68,51,31,0.05)] sm:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-auto sm:min-h-[255px]">
                  <Image
                    src="/images/lezcano/joyeria-anillos.jpg"
                    alt="Anillos de Joyería Lezcano"
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="lezcano-image object-cover"
                    style={{ objectPosition: "center center" }}
                  />
                </div>

                <div className="flex flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
                  <span className="inline-flex w-fit rounded-full bg-[#f2e8d8] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#956b31]">
                    Lezcano
                  </span>

                  <h3 className="mt-3 font-serif text-2xl leading-none text-neutral-900 sm:text-[28px]">
                    Joyería
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Anillos, aros, cadenas, pulseras, dijes y otras piezas en plata y oro.
                  </p>

                  <span className="lezcano-arrow mt-4 inline-flex w-fit text-sm font-medium text-[#8b642f]">
                    Explorar joyería
                    <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal soft delay={70}>
              <Link
                href="/catalogo?linea=plateria"
                className="group grid overflow-hidden rounded-[22px] border border-[#dfd4c5] bg-[#efe7da] shadow-[0_12px_34px_rgba(68,51,31,0.05)] sm:grid-cols-[1.05fr_0.95fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 sm:aspect-auto sm:min-h-[255px]">
                  <Image
                    src="/images/lezcano/plateria-bombillas.jpg"
                    alt="Bombillas de Platería Lezcano"
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="lezcano-image object-cover"
                    style={{ objectPosition: "center 42%" }}
                  />
                </div>

                <div className="flex flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
                  <span className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-[#956b31]">
                    Oficio
                  </span>

                  <h3 className="mt-3 font-serif text-2xl leading-none text-neutral-900 sm:text-[28px]">
                    Platería
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Bombillas, cabos, boquillas y trabajos realizados por encargo.
                  </p>

                  <span className="lezcano-arrow mt-4 inline-flex w-fit text-sm font-medium text-[#8b642f]">
                    Explorar platería
                    <span className="arrow">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TALLER */}
      <section className="border-y border-neutral-800 bg-[#171716] text-white">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
          <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <Reveal>
              <div className="max-w-md">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#d1aa6e] sm:text-[10px]">
                  El taller
                </p>

                <h2 className="mt-2.5 font-serif text-[30px] leading-[1.08] tracking-tight sm:text-4xl">
                  Un oficio que se construye con las manos.
                </h2>

                <p className="mt-3.5 text-sm leading-6 text-neutral-400">
                  El taller es parte de la identidad de Lezcano. Allí se realizan trabajos de platería, reparaciones, encargos y piezas especiales.
                </p>

                <Link
                  href="/la-joyeria"
                  className="lezcano-arrow mt-5 inline-flex w-fit items-center text-sm font-medium text-[#d1aa6e] transition hover:text-white"
                >
                  Conocer nuestra historia
                  <span className="arrow">→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal soft delay={80}>
              <div className="grid grid-cols-[1.08fr_0.92fr] gap-2.5 sm:gap-3">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-neutral-900 sm:aspect-[5/4]">
                  <Image
                    src="/images/lezcano/mesa-trabajo.jpg"
                    alt="Mesa de trabajo y herramientas del taller de Lezcano"
                    fill
                    sizes="(max-width: 640px) 58vw, 38vw"
                    className="lezcano-image object-cover"
                    style={{ objectPosition: "center 45%" }}
                  />
                </div>

                <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-neutral-900 sm:aspect-[5/4] sm:translate-y-5">
                  <Image
                    src="/images/lezcano/maquina.jpg"
                    alt="Máquina tradicional del taller de Lezcano"
                    fill
                    sizes="(max-width: 640px) 42vw, 30vw"
                    className="lezcano-image object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="border-y border-[#dfd5c6] bg-[#f0e8db]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                  El trabajo continúa
                </p>

                <h2 className="mt-2 font-serif text-[30px] leading-none tracking-tight text-neutral-900 sm:text-4xl">
                  Reparar, transformar y crear.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-neutral-600 sm:text-right">
                Trabajamos sobre piezas existentes y desarrollamos encargos especiales.
              </p>
            </div>
          </Reveal>

          <Reveal soft delay={70}>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Reparaciones", "Recuperamos y ponemos a punto piezas que querés seguir usando."],
                ["02", "Trabajos personalizados", "Desarrollamos soluciones a medida según tu idea o necesidad."],
                ["03", "Piezas por encargo", "Coordinamos piezas especiales y trabajos de taller por encargo."],
              ].map(([number, title, description]) => (
                <Link
                  key={title}
                  href="/servicios"
                  className="group rounded-[18px] border border-[#d9cdbd] bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#b99158] hover:bg-white sm:p-5"
                >
                  <span className="text-[9px] font-semibold tracking-[0.18em] text-[#ad8650]">
                    {number}
                  </span>

                  <h3 className="mt-3 font-serif text-xl leading-tight text-neutral-900 sm:text-[22px]">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-[1.45] text-neutral-600">
                    {description}
                  </p>

                  <span className="lezcano-arrow mt-4 inline-flex text-sm font-medium text-[#8b642f]">
                    Ver servicio
                    <span className="arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRABAJOS */}
      <section className="bg-[#faf7f2]">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8 lg:py-14">
          <div className="grid items-center gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
            <Reveal>
              <div className="max-w-sm">
                <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                  Hecho en el taller
                </p>

                <h2 className="mt-2.5 font-serif text-[30px] leading-[1.05] tracking-tight text-neutral-900 sm:text-4xl">
                  Trabajos realizados
                </h2>

                <p className="mt-3.5 text-sm leading-6 text-neutral-600">
                  Una selección de piezas, procesos y trabajos realizados en Lezcano.
                </p>

                <Link
                  href="/trabajos"
                  className="lezcano-arrow mt-5 inline-flex w-fit items-center text-sm font-medium text-[#8b642f] transition hover:text-neutral-900"
                >
                  Ver trabajos
                  <span className="arrow">→</span>
                </Link>
              </div>
            </Reveal>

            <Reveal soft delay={80}>
              <div className="grid grid-cols-[1.05fr_0.95fr] gap-2.5 sm:gap-3">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-[18px] bg-neutral-100 sm:aspect-[5/4]">
                  <Image
                    src="/images/lezcano/trabajo-cuchilla.jpg"
                    alt="Trabajo de platería realizado por Lezcano"
                    fill
                    sizes="(max-width: 640px) 54vw, 34vw"
                    className="lezcano-image object-cover"
                  />
                </div>

                <div className="grid gap-2.5 sm:gap-3">
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-neutral-100">
                    <Image
                      src="/images/lezcano/trabajo-cabo.jpg"
                      alt="Trabajo de platería realizado en el taller"
                      fill
                      sizes="(max-width: 640px) 46vw, 30vw"
                      className="lezcano-image object-cover"
                    />
                  </div>

                  <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-neutral-100">
                    <Image
                      src="/images/lezcano/trabajo-bombilla.jpg"
                      alt="Trabajo de bombilla realizado en Lezcano"
                      fill
                      sizes="(max-width: 640px) 46vw, 30vw"
                      className="lezcano-image object-cover"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="border-t border-[#e2d8ca] bg-[#f7f2e9] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-11">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[24px] bg-[#151514] px-5 py-8 text-center text-white shadow-[0_18px_45px_rgba(0,0,0,0.12)] sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#b28a53]/15 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#d0aa70] sm:text-[10px]">
                Lezcano · Paysandú
              </p>

              <h2 className="mt-2.5 font-serif text-[30px] leading-[1.05] tracking-tight sm:text-4xl">
                ¿Tenés una pieza o una idea en mente?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-400">
                Consultanos por reparaciones, encargos o trabajos personalizados.
              </p>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lezcano-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b78e55] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#9b743f]"
              >
                Consultar por WhatsApp
                <span>→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}