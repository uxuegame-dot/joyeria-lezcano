"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    type CartItem,
    clearCart,
    getCart,
} from "@/app/lib/cart";
import { createOrder } from "@/app/lib/orders/actions";

export function CheckoutForm() {
    const router = useRouter();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [submitting, setSubmitting] =
        useState(false);
    const [error, setError] = useState("");
    const [deliveryMethod, setDeliveryMethod] =
        useState<"pickup" | "shipping">(
            "pickup"
        );

    useEffect(() => {
        setCart(getCart());
        setLoaded(true);
    }, []);

    const subtotal = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setError("");

        if (cart.length === 0) {
            setError(
                "Tu carrito está vacío."
            );
            return;
        }

        const formData = new FormData(
            event.currentTarget
        );

        setSubmitting(true);

        try {
            const result = await createOrder({
                firstName: String(
                    formData.get(
                        "first_name"
                    ) ?? ""
                ),
                lastName: String(
                    formData.get(
                        "last_name"
                    ) ?? ""
                ),
                email: String(
                    formData.get("email") ??
                    ""
                ),
                phone: String(
                    formData.get("phone") ??
                    ""
                ),
                deliveryMethod,
                address: String(
                    formData.get("address") ??
                    ""
                ),
                city: String(
                    formData.get("city") ??
                    ""
                ),
                department: String(
                    formData.get(
                        "department"
                    ) ?? ""
                ),
                notes: String(
                    formData.get("notes") ??
                    ""
                ),
                items: cart.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
            });

            if (!result.success) {
                setError(result.error);
                setSubmitting(false);
                return;
            }

            clearCart();

            router.push(
                `/pedido-confirmado?numero=${encodeURIComponent(
                    String(
                        result.orderNumber
                    )
                )}`
            );
        } catch {
            setError(
                "Ocurrió un error al confirmar el pedido. Intentá nuevamente."
            );
            setSubmitting(false);
        }
    }

    if (!loaded) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-neutral-500 sm:px-6 lg:px-8">
                Cargando...
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
                <h1 className="font-serif text-3xl text-neutral-900">
                    No hay productos para comprar
                </h1>

                <p className="mt-4 text-sm text-neutral-600">
                    Tu carrito está vacío.
                </p>

                <Link
                    href="/catalogo"
                    className="mt-7 inline-block bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div>
                <Link
                    href="/carrito"
                    className="text-sm text-neutral-500 transition hover:text-neutral-900"
                >
                    ← Volver al carrito
                </Link>

                <h1 className="mt-5 font-serif text-4xl text-neutral-900">
                    Finalizar pedido
                </h1>

                <p className="mt-3 text-sm text-neutral-600">
                    Completá tus datos para
                    registrar el pedido.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16"
            >
                <div className="space-y-10">
                    {/* Datos personales */}
                    <section>
                        <h2 className="font-serif text-2xl text-neutral-900">
                            Tus datos
                        </h2>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="first_name"
                                    className="mb-2 block text-sm font-medium text-neutral-800"
                                >
                                    Nombre *
                                </label>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    required
                                    autoComplete="given-name"
                                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="last_name"
                                    className="mb-2 block text-sm font-medium text-neutral-800"
                                >
                                    Apellido *
                                </label>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    required
                                    autoComplete="family-name"
                                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-neutral-800"
                                >
                                    Email *
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-sm font-medium text-neutral-800"
                                >
                                    Teléfono / WhatsApp *
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Entrega */}
                    <section className="border-t border-neutral-200 pt-10">
                        <h2 className="font-serif text-2xl text-neutral-900">
                            Forma de entrega
                        </h2>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <label
                                className={`cursor-pointer border p-5 transition ${deliveryMethod ===
                                    "pickup"
                                    ? "border-neutral-900 bg-neutral-50"
                                    : "border-neutral-300 bg-white"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="delivery_method"
                                    value="pickup"
                                    checked={
                                        deliveryMethod ===
                                        "pickup"
                                    }
                                    onChange={() =>
                                        setDeliveryMethod(
                                            "pickup"
                                        )
                                    }
                                    className="mr-3"
                                />

                                <span className="text-sm font-medium text-neutral-900">
                                    Retiro en la
                                    joyería
                                </span>

                                <p className="mt-2 pl-6 text-xs leading-5 text-neutral-500">
                                    Coordinaremos
                                    contigo cuándo
                                    retirar el pedido.
                                </p>
                            </label>

                            <label
                                className={`cursor-pointer border p-5 transition ${deliveryMethod ===
                                    "shipping"
                                    ? "border-neutral-900 bg-neutral-50"
                                    : "border-neutral-300 bg-white"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="delivery_method"
                                    value="shipping"
                                    checked={
                                        deliveryMethod ===
                                        "shipping"
                                    }
                                    onChange={() =>
                                        setDeliveryMethod(
                                            "shipping"
                                        )
                                    }
                                    className="mr-3"
                                />

                                <span className="text-sm font-medium text-neutral-900">
                                    Envío
                                </span>

                                <p className="mt-2 pl-6 text-xs leading-5 text-neutral-500">
                                    El costo y la
                                    modalidad se
                                    coordinarán luego
                                    de realizar el
                                    pedido.
                                </p>
                            </label>
                        </div>

                        {deliveryMethod ===
                            "shipping" && (
                                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="address"
                                            className="mb-2 block text-sm font-medium text-neutral-800"
                                        >
                                            Dirección *
                                        </label>

                                        <input
                                            id="address"
                                            name="address"
                                            required
                                            autoComplete="street-address"
                                            className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="mb-2 block text-sm font-medium text-neutral-800"
                                        >
                                            Ciudad
                                        </label>

                                        <input
                                            id="city"
                                            name="city"
                                            autoComplete="address-level2"
                                            className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="department"
                                            className="mb-2 block text-sm font-medium text-neutral-800"
                                        >
                                            Departamento
                                        </label>

                                        <input
                                            id="department"
                                            name="department"
                                            autoComplete="address-level1"
                                            className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                                        />
                                    </div>
                                </div>
                            )}
                    </section>

                    {/* Observaciones */}
                    <section className="border-t border-neutral-200 pt-10">
                        <label
                            htmlFor="notes"
                            className="block font-serif text-2xl text-neutral-900"
                        >
                            Observaciones
                        </label>

                        <p className="mt-2 text-sm text-neutral-500">
                            Opcional. Podés agregar
                            cualquier comentario
                            relevante sobre el
                            pedido.
                        </p>

                        <textarea
                            id="notes"
                            name="notes"
                            rows={4}
                            className="mt-5 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
                        />
                    </section>
                </div>

                {/* Resumen */}
                <aside className="h-fit border border-neutral-200 bg-white p-6 lg:sticky lg:top-28">
                    <h2 className="font-serif text-2xl text-neutral-900">
                        Tu pedido
                    </h2>

                    <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between gap-4 py-4 text-sm"
                            >
                                <div>
                                    <p className="text-neutral-900">
                                        {
                                            item.name
                                        }
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                        Cantidad:{" "}
                                        {
                                            item.quantity
                                        }
                                    </p>
                                </div>

                                <p className="shrink-0 text-neutral-900">
                                    $
                                    {(
                                        item.price *
                                        item.quantity
                                    ).toLocaleString(
                                        "es-UY"
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex justify-between text-sm">
                        <span className="text-neutral-600">
                            Subtotal
                        </span>

                        <span className="font-medium text-neutral-900">
                            $
                            {subtotal.toLocaleString(
                                "es-UY"
                            )}
                        </span>
                    </div>

                    {deliveryMethod ===
                        "shipping" && (
                            <p className="mt-4 text-xs leading-5 text-neutral-500">
                                El costo del envío no
                                está incluido y se
                                coordinará con la
                                joyería.
                            </p>
                        )}

                    {error && (
                        <div
                            role="alert"
                            className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 w-full bg-neutral-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                    >
                        {submitting
                            ? "Confirmando..."
                            : "Confirmar pedido"}
                    </button>

                    <p className="mt-4 text-xs leading-5 text-neutral-500">
                        Al confirmar, registraremos
                        tu pedido para coordinar los
                        siguientes pasos.
                    </p>
                </aside>
            </form>
        </div>
    );
}