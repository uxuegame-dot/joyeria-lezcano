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
import { createClient } from "@/app/lib/supabase/client";

type DeliveryMethod =
    | "pickup"
    | "shipping";

export function CheckoutForm() {
    const router = useRouter();

    const [cart, setCart] =
        useState<CartItem[]>([]);

    const [loaded, setLoaded] =
        useState(false);

    const [userLoaded, setUserLoaded] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        deliveryMethod,
        setDeliveryMethod,
    ] = useState<DeliveryMethod>(
        "pickup"
    );

    /*
     * Datos personales
     */
    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [phone, setPhone] =
        useState("");

    /*
     * Estado de sesión
     */
    const [isLoggedIn, setIsLoggedIn] =
        useState(false);

    const [
        editingPersonalData,
        setEditingPersonalData,
    ] = useState(true);

    /*
     * Cargar carrito
     */
    useEffect(() => {
        setCart(getCart());
        setLoaded(true);
    }, []);

    /*
     * Cargar datos del usuario registrado
     */
    useEffect(() => {
        let active = true;

        async function loadUser() {
            const supabase =
                createClient();

            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!active) {
                return;
            }

            /*
             * Usuario no autenticado:
             * dejamos el formulario abierto.
             */
            if (!user) {
                setIsLoggedIn(false);
                setEditingPersonalData(
                    true
                );
                setUserLoaded(true);

                return;
            }

            setIsLoggedIn(true);

            /*
             * Email viene directamente
             * de Supabase Auth.
             */
            const authEmail =
                user.email ?? "";

            setEmail(authEmail);

            /*
             * Nombre, apellido y teléfono
             * vienen de profiles.
             */
            const {
                data: profile,
            } = await supabase
                .from("profiles")
                .select(
                    "first_name, last_name, phone"
                )
                .eq("id", user.id)
                .maybeSingle();

            if (!active) {
                return;
            }

            const profileFirstName =
                profile?.first_name ?? "";

            const profileLastName =
                profile?.last_name ?? "";

            const profilePhone =
                profile?.phone ?? "";

            setFirstName(
                profileFirstName
            );

            setLastName(
                profileLastName
            );

            setPhone(
                profilePhone
            );

            /*
             * Si tenemos todos los datos,
             * mostramos el resumen compacto.
             *
             * Si falta alguno, abrimos
             * automáticamente el formulario.
             */
            const hasCompleteData =
                Boolean(
                    profileFirstName.trim()
                ) &&
                Boolean(
                    profileLastName.trim()
                ) &&
                Boolean(
                    authEmail.trim()
                ) &&
                Boolean(
                    profilePhone.trim()
                );

            setEditingPersonalData(
                !hasCompleteData
            );

            setUserLoaded(true);
        }

        loadUser();

        return () => {
            active = false;
        };
    }, []);

    const subtotal =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.price *
                item.quantity,
            0
        );

    const totalItems =
        cart.reduce(
            (
                total,
                item
            ) =>
                total +
                item.quantity,
            0
        );

    const personalDataComplete =
        Boolean(firstName.trim()) &&
        Boolean(lastName.trim()) &&
        Boolean(email.trim()) &&
        Boolean(phone.trim());

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

        if (!personalDataComplete) {
            setEditingPersonalData(
                true
            );

            setError(
                "Completá tus datos personales antes de confirmar el pedido."
            );

            return;
        }

        const formData =
            new FormData(
                event.currentTarget
            );

        setSubmitting(true);

        try {
            const result =
                await createOrder({
                    firstName:
                        firstName.trim(),

                    lastName:
                        lastName.trim(),

                    email:
                        email.trim(),

                    phone:
                        phone.trim(),

                    deliveryMethod,

                    address: String(
                        formData.get(
                            "address"
                        ) ?? ""
                    ),

                    city: String(
                        formData.get(
                            "city"
                        ) ?? ""
                    ),

                    department: String(
                        formData.get(
                            "department"
                        ) ?? ""
                    ),

                    notes: String(
                        formData.get(
                            "notes"
                        ) ?? ""
                    ),

                    items: cart.map(
                        (item) => ({
                            product_id:
                                item.id,

                            quantity:
                                item.quantity,
                        })
                    ),
                });

            if (!result.success) {
                setError(
                    result.error
                );

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

    /*
     * Esperamos carrito y usuario.
     */
    if (!loaded || !userLoaded) {
        return (
            <main className="bg-[#f7f4ef]">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex min-h-[220px] items-center justify-center">
                        <p className="text-sm text-neutral-500">
                            Preparando tu
                            pedido...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    /*
     * Carrito vacío
     */
    if (cart.length === 0) {
        return (
            <main className="bg-[#f7f4ef]">
                <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
                    <div className="border border-[#ddd5c9] bg-white px-6 py-14">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[#9a7541]">
                            Tu selección
                        </p>

                        <h1 className="mt-3 font-serif text-3xl text-neutral-900 sm:text-4xl">
                            No hay productos
                            para comprar
                        </h1>

                        <p className="mt-4 text-sm text-neutral-600">
                            Tu carrito está
                            vacío.
                        </p>

                        <Link
                            href="/catalogo"
                            className="lezcano-button mt-7 inline-flex min-h-12 items-center justify-center bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-[#9a7541]"
                        >
                            Volver al catálogo
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#f7f4ef]">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">

                {/* Encabezado */}
                <div className="border-b border-[#ddd5c9] pb-6">
                    <Link
                        href="/carrito"
                        className="lezcano-arrow inline-flex items-center text-xs text-neutral-500 transition-colors hover:text-neutral-900 sm:text-sm"
                    >
                        <span className="arrow">
                            ←
                        </span>

                        Volver al carrito
                    </Link>

                    <div className="mt-5 flex items-end justify-between gap-5">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-[#9a7541]">
                                Último paso
                            </p>

                            <h1 className="mt-2 font-serif text-3xl leading-tight text-neutral-900 sm:text-4xl">
                                Finalizar pedido
                            </h1>
                        </div>

                        <p className="hidden pb-1 text-xs text-neutral-500 sm:block">
                            {totalItems}{" "}
                            {totalItems === 1
                                ? "pieza"
                                : "piezas"}
                        </p>
                    </div>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">
                        Revisá tus datos,
                        elegí cómo recibir
                        tu compra y confirmá
                        el pedido.
                    </p>
                </div>

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14"
                >
                    <div className="space-y-7">

                        {/* Datos personales */}
                        <section className="border border-[#ddd5c9] bg-white p-5 sm:p-6">

                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                                        01
                                    </p>

                                    <h2 className="mt-1 font-serif text-2xl text-neutral-900">
                                        Tus datos
                                    </h2>
                                </div>

                                {isLoggedIn &&
                                    !editingPersonalData && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingPersonalData(
                                                    true
                                                )
                                            }
                                            className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                        >
                                            Editar
                                        </button>
                                    )}
                            </div>

                            {/* Usuario registrado con datos completos */}
                            {isLoggedIn &&
                                !editingPersonalData ? (
                                <div className="mt-5">
                                    <div className="space-y-3 text-sm">

                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                {
                                                    firstName
                                                }{" "}
                                                {
                                                    lastName
                                                }
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 text-neutral-600">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="h-4 w-4 shrink-0 text-neutral-400"
                                                aria-hidden="true"
                                            >
                                                <path d="M3 5h18v14H3z" />

                                                <path d="m3 6 9 7 9-7" />
                                            </svg>

                                            <span className="break-all">
                                                {
                                                    email
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-neutral-600">
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="h-4 w-4 shrink-0 text-neutral-400"
                                                aria-hidden="true"
                                            >
                                                <path d="M6.5 3h3l1.5 4-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.4 19.5 4.5 13.6 4.5 5c0-1.1.9-2 2-2Z" />
                                            </svg>

                                            <span>
                                                {
                                                    phone
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-start gap-2 border-t border-neutral-100 pt-4">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7541]"
                                            aria-hidden="true"
                                        >
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>

                                        <p className="text-xs leading-5 text-neutral-500">
                                            Datos obtenidos
                                            de tu cuenta.
                                            Podés editarlos
                                            para este pedido
                                            si lo necesitás.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /*
                                 * Usuario sin sesión,
                                 * datos incompletos
                                 * o edición manual.
                                 */
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">

                                    <div>
                                        <label
                                            htmlFor="first_name"
                                            className="mb-1.5 block text-xs font-medium text-neutral-700"
                                        >
                                            Nombre *
                                        </label>

                                        <input
                                            id="first_name"
                                            name="first_name"
                                            required
                                            value={
                                                firstName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setFirstName(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="given-name"
                                            className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="last_name"
                                            className="mb-1.5 block text-xs font-medium text-neutral-700"
                                        >
                                            Apellido *
                                        </label>

                                        <input
                                            id="last_name"
                                            name="last_name"
                                            required
                                            value={
                                                lastName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setLastName(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="family-name"
                                            className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1.5 block text-xs font-medium text-neutral-700"
                                        >
                                            Email *
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={
                                                email
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setEmail(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="email"
                                            className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-1.5 block text-xs font-medium text-neutral-700"
                                        >
                                            Teléfono /
                                            WhatsApp *
                                        </label>

                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            value={
                                                phone
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setPhone(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            autoComplete="tel"
                                            className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                        />
                                    </div>

                                    {isLoggedIn && (
                                        <div className="sm:col-span-2">
                                            <button
                                                type="button"
                                                disabled={
                                                    !personalDataComplete
                                                }
                                                onClick={() =>
                                                    setEditingPersonalData(
                                                        false
                                                    )
                                                }
                                                className="text-xs font-medium text-[#8a693c] underline underline-offset-4 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
                                            >
                                                Confirmar
                                                estos datos
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Forma de entrega */}
                        <section className="border border-[#ddd5c9] bg-white p-5 sm:p-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                                    02
                                </p>

                                <h2 className="mt-1 font-serif text-2xl text-neutral-900">
                                    Forma de entrega
                                </h2>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">

                                {/* Retiro */}
                                <label
                                    className={`cursor-pointer border p-4 transition ${deliveryMethod ===
                                        "pickup"
                                        ? "border-neutral-900 bg-[#f8f5ef]"
                                        : "border-neutral-300 bg-white hover:border-neutral-500"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
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
                                            className="mt-1"
                                        />

                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">
                                                Retiro en
                                                la joyería
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                Sin costo.
                                                Coordinaremos
                                                cuándo podés
                                                retirarlo.
                                            </p>
                                        </div>
                                    </div>
                                </label>

                                {/* Envío */}
                                <label
                                    className={`cursor-pointer border p-4 transition ${deliveryMethod ===
                                        "shipping"
                                        ? "border-neutral-900 bg-[#f8f5ef]"
                                        : "border-neutral-300 bg-white hover:border-neutral-500"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
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
                                            className="mt-1"
                                        />

                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">
                                                Envío
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-neutral-500">
                                                A todo
                                                Uruguay.
                                                El costo se
                                                coordina
                                                después.
                                            </p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Dirección */}
                            {deliveryMethod ===
                                "shipping" && (
                                    <div className="mt-5 grid gap-4 border-t border-neutral-100 pt-5 sm:grid-cols-2">

                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="address"
                                                className="mb-1.5 block text-xs font-medium text-neutral-700"
                                            >
                                                Dirección *
                                            </label>

                                            <input
                                                id="address"
                                                name="address"
                                                required
                                                autoComplete="street-address"
                                                placeholder="Calle, número, apartamento..."
                                                className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="city"
                                                className="mb-1.5 block text-xs font-medium text-neutral-700"
                                            >
                                                Ciudad
                                            </label>

                                            <input
                                                id="city"
                                                name="city"
                                                autoComplete="address-level2"
                                                className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="department"
                                                className="mb-1.5 block text-xs font-medium text-neutral-700"
                                            >
                                                Departamento
                                            </label>

                                            <input
                                                id="department"
                                                name="department"
                                                autoComplete="address-level1"
                                                className="h-12 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                                            />
                                        </div>
                                    </div>
                                )}
                        </section>

                        {/* Observaciones */}
                        <section className="border border-[#ddd5c9] bg-white p-5 sm:p-6">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9a7541]">
                                    03
                                </p>

                                <h2 className="mt-1 font-serif text-2xl text-neutral-900">
                                    Observaciones
                                </h2>
                            </div>

                            <p className="mt-2 text-xs leading-5 text-neutral-500">
                                Opcional. Agregá
                                cualquier comentario
                                importante sobre el
                                pedido.
                            </p>

                            <textarea
                                id="notes"
                                name="notes"
                                rows={3}
                                placeholder="Escribí acá si necesitás aclarar algo..."
                                className="mt-4 w-full resize-y border border-neutral-300 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]"
                            />
                        </section>
                    </div>

                    {/* Resumen */}
                    <aside className="border border-[#d8cfc1] bg-white p-5 sm:p-6 lg:sticky lg:top-36">

                        <div className="flex items-center justify-between">
                            <h2 className="font-serif text-2xl text-neutral-900">
                                Tu pedido
                            </h2>

                            <span className="text-xs text-neutral-400">
                                {totalItems}{" "}
                                {totalItems === 1
                                    ? "pieza"
                                    : "piezas"}
                            </span>
                        </div>

                        {/* Productos */}
                        <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                            {cart.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="flex gap-3 py-4"
                                    >
                                        {item.imageUrl && (
                                            <div className="h-14 w-14 shrink-0 overflow-hidden bg-neutral-100">
                                                <img
                                                    src={
                                                        item.imageUrl
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <p className="text-sm text-neutral-900">
                                                        {
                                                            item.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-[11px] text-neutral-500">
                                                        Cantidad:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm text-neutral-900">
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toLocaleString(
                                                        "es-UY"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Total */}
                        <div className="mt-5">
                            <div className="flex items-center justify-between text-sm">
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
                                    <div className="mt-4 flex items-start gap-2 border-t border-neutral-100 pt-4">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#9a7541]"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 7h12v10H3z" />

                                            <path d="M15 10h3l3 3v4h-6" />
                                        </svg>

                                        <p className="text-xs leading-5 text-neutral-500">
                                            El costo del
                                            envío no está
                                            incluido y se
                                            coordinará con
                                            la joyería.
                                        </p>
                                    </div>
                                )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {/* Confirmar */}
                        <button
                            type="submit"
                            disabled={
                                submitting
                            }
                            className="lezcano-button mt-6 flex min-h-14 w-full items-center justify-center bg-neutral-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-[#9a7541] disabled:cursor-not-allowed disabled:bg-neutral-400"
                        >
                            {submitting
                                ? "Confirmando..."
                                : "Confirmar pedido"}

                            {!submitting && (
                                <span className="ml-2">
                                    →
                                </span>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                className="h-3.5 w-3.5"
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

                            Pedido protegido
                        </div>

                        <p className="mt-4 text-center text-[11px] leading-5 text-neutral-500">
                            Al confirmar,
                            registraremos el
                            pedido y la joyería
                            coordinará contigo
                            los siguientes pasos.
                        </p>
                    </aside>
                </form>
            </div>
        </main>
    );
}