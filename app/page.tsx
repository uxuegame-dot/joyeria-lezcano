import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/app/components/Hero";
import { ImagePlaceholder } from "@/app/components/ImagePlaceholder";
import { getActiveProducts } from "@/app/lib/products";
import { createClient } from "@/app/lib/supabase/server";

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
    (a, b) => a.sort_order - b.sort_order
  )[0];
}

function getFeaturedGridClasses(count: number) {
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
  const products = await getActiveProducts();

  const featuredProducts = products
    .filter((product) => product.is_featured)
    .slice(0, 4);

  const supabase = await createClient();

  const featuredGridClasses = getFeaturedGridClasses(
    featuredProducts.length
  );

  return (
    <>
      {/* HERO */}
      <Hero />

      {/* PIEZAS DESTACADAS */}
      {featuredProducts.length > 0 && (
        <section className="border-b border-[#ddd5c9] bg-[#faf8f4]">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8 lg:py-10">

            {/* Encabezado */}
            <div className="flex flex-col gap-4 border-b border-[#ded7cc] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#9a7541] sm:text-[11px]">
                  Selección Lezcano
                </p>

                <h2 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                  Piezas para regalar, usar y conservar.
                </h2>
              </div>

              <Link
                href="/catalogo"
                className="group inline-flex shrink-0 items-center gap-3 self-start border-b border-[#b28a53] pb-1 text-sm font-medium text-neutral-900 transition hover:text-[#9a7541] sm:self-auto"
              >
                Ver todo el catálogo

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            {/* Productos */}
            <div className={featuredGridClasses}>
              {featuredProducts.map((product) => {
                const category = getCategory(product);
                const mainImage = getMainImage(product);

                const imageUrl = mainImage
                  ? supabase.storage
                    .from("product-images")
                    .getPublicUrl(mainImage.storage_path)
                    .data.publicUrl
                  : null;

                return (
                  <Link
                    key={product.id}
                    href={`/catalogo/${product.slug}`}
                    className="group block"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-square overflow-hidden bg-[#eee9e1] lg:mx-auto lg:w-full lg:max-w-[220px]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={mainImage?.alt_text || product.name}
                          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <ImagePlaceholder
                          label={product.name}
                          aspect="square"
                          className="h-full w-full"
                        />
                      )}

                      <div className="pointer-events-none absolute inset-0 border border-black/[0.06]" />

                      <div className="absolute bottom-3 right-3 hidden h-8 w-8 items-center justify-center bg-white/95 text-sm text-neutral-900 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 lg:flex">
                        →
                      </div>
                    </div>

                    {/* Información */}
                    <div className="pt-3 lg:mx-auto lg:max-w-[220px]">
                      {category && (
                        <p className="text-[9px] uppercase tracking-[0.22em] text-[#9a7541] sm:text-[10px]">
                          {category.name}
                        </p>
                      )}

                      <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                        <h3 className="font-serif text-base leading-tight text-neutral-900 transition group-hover:text-[#8a693c] sm:text-lg">
                          {product.name}
                        </h3>

                        {product.price !== null && (
                          <p className="shrink-0 text-xs text-neutral-600 sm:text-sm">
                            $
                            {Number(product.price).toLocaleString(
                              "es-UY"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* JOYERÍA Y PLATERÍA */}
      <section className="border-y border-[#ddd5c9] bg-[#f4f0e8] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#9a7541]">
              Dos expresiones de un mismo oficio
            </p>

            <h2 className="mt-3 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
              Joyería & Platería
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
              Piezas para usar, regalar y conservar. Joyería en plata
              y oro, junto a trabajos de platería realizados en
              nuestro taller.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">

            {/* JOYERÍA */}
            <Link
              href="/catalogo?linea=jewelry"
              className="group overflow-hidden bg-neutral-950 text-white"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                <Image
                  src="/images/lezcano/joyeria-anillos.jpg"
                  alt="Anillos de Joyería Lezcano"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                  style={{
                    objectPosition: "center center",
                  }}
                />
              </div>

              <div className="px-7 py-8 sm:px-9">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a66b]">
                  Lezcano
                </p>

                <div className="mt-2 flex items-end justify-between gap-6">
                  <div>
                    <h3 className="font-serif text-3xl text-white sm:text-4xl">
                      Joyería
                    </h3>

                    <p className="mt-3 max-w-md text-sm leading-6 text-neutral-400">
                      Anillos, cadenas, pulseras, dijes y otras piezas
                      en plata y oro.
                    </p>
                  </div>

                  <span className="hidden text-2xl text-[#c9a66b] transition duration-300 group-hover:translate-x-1 sm:block">
                    →
                  </span>
                </div>

                <span className="mt-6 inline-block border-b border-[#9a7541] pb-1 text-sm">
                  Explorar joyería →
                </span>
              </div>
            </Link>

            {/* PLATERÍA */}
            <Link
              href="/catalogo?linea=silverware"
              className="group overflow-hidden border border-[#d2c8b9] bg-[#ece5da]"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 lg:aspect-auto lg:h-[270px]">
                <Image
                  src="/images/lezcano/plateria-bombillas.jpg"
                  alt="Bombillas de Platería Lezcano"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                  style={{
                    objectPosition: "center 42%",
                  }}
                />
              </div>

              <div className="px-7 py-8">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#9a7541]">
                  Lezcano
                </p>

                <h3 className="mt-2 font-serif text-3xl text-neutral-900">
                  Platería
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Bombillas, cabos, boquillas y piezas realizadas por
                  encargo.
                </p>

                <span className="mt-6 inline-block border-b border-[#b28a53] pb-1 text-sm text-neutral-900">
                  Explorar platería →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* EL TALLER */}
      <section className="border-y border-neutral-800 bg-[#181817] text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="lg:pt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-[#c9a66b]">
                El taller
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                Un oficio que se construye con las manos.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400 sm:text-base">
                El taller es parte de la identidad de Lezcano. Allí
                se realizan trabajos de platería, reparaciones,
                encargos y piezas especiales, combinando
                herramientas, materiales, experiencia y trabajo
                manual.
              </p>

              <Link
                href="/la-joyeria"
                className="mt-8 inline-block border-b border-[#9a7541] pb-1 text-sm text-white transition hover:border-[#d1ad73]"
              >
                Conocer nuestra historia →
              </Link>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <Image
                  src="/images/lezcano/mesa-trabajo.jpg"
                  alt="Mesa de trabajo y herramientas del taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover transition duration-700 hover:scale-[1.015]"
                  style={{
                    objectPosition: "center 45%",
                  }}
                />
              </div>

              <div className="relative aspect-[3/4] overflow-hidden sm:mt-12">
                <Image
                  src="/images/lezcano/maquina.jpg"
                  alt="Máquina tradicional del taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 28vw"
                  className="object-cover transition duration-700 hover:scale-[1.015]"
                  style={{
                    objectPosition: "center center",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="border-y border-[#ddd5c9] bg-[#eee8de]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#9a7541]">
                El trabajo continúa
              </p>

              <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight text-neutral-900 sm:text-5xl">
                Reparar, transformar y crear.
              </h2>
            </div>

            <div>
              <p className="max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                No todo empieza con una pieza nueva. También
                trabajamos sobre piezas existentes y desarrollamos
                encargos especiales.
              </p>

              <div className="mt-8 divide-y divide-[#cec3b4] border-y border-[#cec3b4]">
                {[
                  "Reparaciones",
                  "Trabajos personalizados",
                  "Piezas por encargo",
                ].map((service) => (
                  <Link
                    key={service}
                    href="/servicios"
                    className="group flex items-center justify-between py-5"
                  >
                    <span className="font-serif text-2xl text-neutral-900">
                      {service}
                    </span>

                    <span className="text-[#9a7541] transition group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRABAJOS REALIZADOS */}
      <section className="bg-[#f7f4ef]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
            <div className="lg:pt-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#9a7541]">
                Hecho en el taller
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-neutral-900 sm:text-5xl">
                Trabajos realizados
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">
                Una mirada a piezas, procesos y trabajos que han
                pasado por nuestras manos.
              </p>

              <Link
                href="/trabajos"
                className="mt-7 inline-block border-b border-[#b28a53] pb-1 text-sm font-medium text-neutral-900 transition hover:text-[#9a7541]"
              >
                Ver trabajos →
              </Link>
            </div>

            <div className="grid max-w-2xl gap-3 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                <Image
                  src="/images/lezcano/trabajo-cuchilla.jpg"
                  alt="Trabajo de platería realizado por Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 32vw"
                  className="object-cover transition duration-700 hover:scale-[1.02]"
                  style={{
                    objectPosition: "center center",
                  }}
                />
              </div>

              <div className="grid gap-3">
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <Image
                    src="/images/lezcano/trabajo-cabo.jpg"
                    alt="Trabajo de platería en proceso en el taller de Lezcano"
                    fill
                    sizes="(max-width: 640px) 100vw, 28vw"
                    className="object-cover transition duration-700 hover:scale-[1.02]"
                    style={{
                      objectPosition: "center center",
                    }}
                  />
                </div>

                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                  <Image
                    src="/images/lezcano/trabajo-bombilla.jpg"
                    alt="Trabajo de bombilla en el taller de Lezcano"
                    fill
                    sizes="(max-width: 640px) 100vw, 28vw"
                    className="object-cover transition duration-700 hover:scale-[1.02]"
                    style={{
                      objectPosition: "center center",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <p className="text-xs uppercase tracking-[0.25em] text-[#c9a66b]">
            Lezcano · Paysandú
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
            ¿Tenés una pieza o una idea en mente?
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
            Consultanos por trabajos personalizados, encargos,
            reparaciones o piezas disponibles.
          </p>

          <Link
            href="/contacto"
            className="mt-9 inline-block bg-[#b28a53] px-8 py-4 text-sm font-medium text-white transition hover:bg-[#9a7541]"
          >
            Contactarnos
          </Link>
        </div>
      </section>
    </>
  );
}