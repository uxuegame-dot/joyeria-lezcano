import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/app/components/Hero";
import { ImagePlaceholder } from "@/app/components/ImagePlaceholder";
import { SectionTitle } from "@/app/components/SectionTitle";
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

export default async function HomePage() {
  const products = await getActiveProducts();

  const featuredProducts = products
    .filter((product) => product.is_featured)
    .slice(0, 4);

  const supabase = await createClient();

  return (
    <>
      <Hero />

      {/* Joyería / Platería */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Encabezado */}
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Dos expresiones de un mismo oficio
            </p>

            <h2 className="mt-3 font-serif text-4xl tracking-tight text-neutral-900 sm:text-5xl">
              Joyería & Platería
            </h2>

            <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-base">
              Piezas para usar, regalar y conservar. Joyería en plata y oro,
              junto a trabajos de platería y piezas realizadas en nuestro taller.
            </p>
          </div>

          {/* Bloques compactos */}
          <div className="mx-auto mt-8 max-w-5xl space-y-4">
            {/* Joyería */}
            <Link
              href="/catalogo?linea=jewelry"
              className="group grid overflow-hidden bg-neutral-900 text-white md:grid-cols-[1.15fr_0.85fr]"
            >
              {/* Imagen */}
              <div className="relative min-h-[210px] overflow-hidden bg-neutral-100 sm:min-h-[230px] md:h-[235px]">
                <Image
                  src="/images/lezcano/joyeria-anillos.jpg"
                  alt="Anillos de Joyería Lezcano"
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  style={{
                    objectPosition: "center center",
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="flex flex-col justify-center px-7 py-6 sm:px-8 md:px-10">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
                  Lezcano
                </p>

                <h3 className="mt-2 font-serif text-3xl text-white">
                  Joyería
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
                  Anillos, cadenas, pulseras, dijes y otras piezas de joyería.
                </p>

                <span className="mt-5 w-fit border-b border-neutral-500 pb-1 text-sm text-white transition group-hover:border-white">
                  Explorar joyería →
                </span>
              </div>
            </Link>

            {/* Platería */}
            <Link
              href="/catalogo?linea=silverware"
              className="group grid overflow-hidden border border-neutral-300 bg-[#f1efe9] md:grid-cols-[0.85fr_1.15fr]"
            >
              {/* Contenido */}
              <div className="order-2 flex flex-col justify-center px-7 py-6 sm:px-8 md:order-1 md:px-10">
                <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
                  Lezcano
                </p>

                <h3 className="mt-2 font-serif text-3xl text-neutral-900">
                  Platería
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-600">
                  Bombillas, cabos, boquillas y otras piezas de platería.
                </p>

                <span className="mt-5 w-fit border-b border-neutral-400 pb-1 text-sm text-neutral-900 transition group-hover:border-neutral-900">
                  Explorar platería →
                </span>
              </div>

              {/* Imagen */}
              <div className="relative order-1 min-h-[210px] overflow-hidden bg-neutral-100 sm:min-h-[230px] md:order-2 md:h-[235px]">
                <Image
                  src="/images/lezcano/plateria-bombillas.jpg"
                  alt="Bombillas de Platería Lezcano"
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  style={{
                    objectPosition: "center 42%",
                  }}
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* El taller */}
      <section className="border-y border-neutral-300 bg-[#1c1c1c] text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            {/* Texto */}
            <div className="lg:pt-8">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                El taller
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
                Un oficio que se construye con las manos.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-neutral-400 sm:text-base">
                El taller es parte de la identidad de Lezcano. Allí se realizan
                trabajos de platería, reparaciones, encargos y piezas especiales,
                combinando herramientas, materiales, experiencia y trabajo manual.
              </p>

              <Link
                href="/la-joyeria"
                className="mt-8 inline-block border-b border-neutral-500 pb-1 text-sm text-white transition hover:border-white"
              >
                Conocer nuestra historia →
              </Link>
            </div>

            {/* Fotografías del taller */}
            <div className="grid items-start gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              {/* Mesa de trabajo */}
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <Image
                  src="/images/lezcano/mesa-trabajo.jpg"
                  alt="Mesa de trabajo y herramientas del taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 40vw"
                  className="object-cover"
                  style={{ objectPosition: "center 45%" }}
                />
              </div>

              {/* Máquina antigua */}
              <div className="relative aspect-[3/4] overflow-hidden sm:mt-12">
                <Image
                  src="/images/lezcano/maquina.jpg"
                  alt="Máquina tradicional del taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 28vw"
                  className="object-cover"
                  style={{ objectPosition: "center center" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Selección Lezcano"
              title="Piezas destacadas"
              description="Una selección de piezas disponibles actualmente."
            />

            <Link
              href="/catalogo"
              className="w-fit border-b border-neutral-400 pb-1 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
            >
              Ver todo el catálogo →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
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
                  className="group"
                >
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={mainImage?.alt_text || product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <ImagePlaceholder
                        label={product.name}
                        aspect="square"
                        className="h-full w-full"
                      />
                    )}
                  </div>

                  <div className="mt-4">
                    {category && (
                      <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                        {category.name}
                      </p>
                    )}

                    <h3 className="mt-1 font-serif text-xl text-neutral-900">
                      {product.name}
                    </h3>

                    {product.price !== null && (
                      <p className="mt-2 text-sm text-neutral-700">
                        $
                        {Number(product.price).toLocaleString("es-UY")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Servicios */}
      <section className="border-y border-neutral-300 bg-[#f1efe9]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                El trabajo continúa
              </p>

              <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight text-neutral-900 sm:text-5xl">
                Reparar, transformar y crear.
              </h2>
            </div>

            <div>
              <p className="max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                No todo empieza con una pieza nueva. También trabajamos sobre
                piezas existentes y desarrollamos encargos especiales.
              </p>

              <div className="mt-8 divide-y divide-neutral-300 border-y border-neutral-300">
                <Link
                  href="/servicios"
                  className="group flex items-center justify-between py-5"
                >
                  <span className="font-serif text-2xl text-neutral-900">
                    Reparaciones
                  </span>

                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/servicios"
                  className="group flex items-center justify-between py-5"
                >
                  <span className="font-serif text-2xl text-neutral-900">
                    Trabajos personalizados
                  </span>

                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/servicios"
                  className="group flex items-center justify-between py-5"
                >
                  <span className="font-serif text-2xl text-neutral-900">
                    Piezas por encargo
                  </span>

                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trabajos realizados */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">
          {/* Texto */}
          <div className="lg:pt-5">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Hecho en el taller
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-neutral-900 sm:text-5xl">
              Trabajos realizados
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">
              Una mirada a piezas, procesos y trabajos que han pasado por
              nuestras manos.
            </p>

            <Link
              href="/trabajos"
              className="mt-7 inline-block border-b border-neutral-400 pb-1 text-sm font-medium text-neutral-900 transition hover:border-neutral-900"
            >
              Ver trabajos →
            </Link>
          </div>

          {/* Galería */}
          <div className="grid max-w-2xl gap-3 sm:grid-cols-[1.05fr_0.95fr]">
            {/* Cuchilla */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image
                src="/images/lezcano/trabajo-cuchilla.jpg"
                alt="Trabajo de platería realizado por Lezcano"
                fill
                sizes="(max-width: 640px) 100vw, 32vw"
                className="object-cover transition duration-700 hover:scale-[1.02]"
                style={{ objectPosition: "center center" }}
              />
            </div>

            <div className="grid gap-3">
              {/* Cabo */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                  src="/images/lezcano/trabajo-cabo.jpg"
                  alt="Trabajo de platería en proceso en el taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 28vw"
                  className="object-cover transition duration-700 hover:scale-[1.02]"
                  style={{ objectPosition: "center center" }}
                />
              </div>

              {/* Bombilla */}
              <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                <Image
                  src="/images/lezcano/trabajo-bombilla.jpg"
                  alt="Trabajo de bombilla en el taller de Lezcano"
                  fill
                  sizes="(max-width: 640px) 100vw, 28vw"
                  className="object-cover transition duration-700 hover:scale-[1.02]"
                  style={{ objectPosition: "center center" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
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
            className="mt-9 inline-block bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
          >
            Contactarnos
          </Link>
        </div>
      </section>
    </>
  );
}