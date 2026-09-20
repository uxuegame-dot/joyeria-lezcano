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
import { saveDefaultAddress } from "@/app/lib/addresses/actions";
import { createClient } from "@/app/lib/supabase/client";

type DeliveryMethod =
    | "pickup"
    | "shipping";

type SavedShippingAddress = {
    address_line: string;
    city: string;
    department: string;
};

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
     * Dirección de envío
     */
    const [address, setAddress] =
        useState("");

    const [city, setCity] =
        useState("");

    const [department, setDepartment] =
        useState("");

    const [
        savedShippingAddress,
        setSavedShippingAddress,
    ] = useState<SavedShippingAddress | null>(
        null
    );

    const [
        editingShippingAddress,
        setEditingShippingAddress,
    ] = useState(true);

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

            const {
                data: savedAddress,
                error: savedAddressError,
            } = await supabase
                .from("addresses")
                .select(
                    "address_line, city, department"
                )
                .eq("user_id", user.id)
                .eq("is_default", true)
                .maybeSingle();

            if (savedAddressError) {
                console.error(
                    "No se pudo cargar la dirección guardada:",
                    savedAddressError
                );
            }

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

            if (savedAddress) {
                const normalizedAddress = {
                    address_line:
                        savedAddress.address_line ?? "",
                    city:
                        savedAddress.city ?? "",
                    department:
                        savedAddress.department ?? "",
                };

                setAddress(
                    normalizedAddress.address_line
                );
                setCity(
                    normalizedAddress.city
                );
                setDepartment(
                    normalizedAddress.department
                );
                setSavedShippingAddress(
                    normalizedAddress
                );
                setEditingShippingAddress(
                    false
                );
            } else {
                setSavedShippingAddress(
                    null
                );
                setEditingShippingAddress(
                    true
                );
            }

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

    const shippingAddressComplete =
        Boolean(address.trim()) &&
        Boolean(city.trim()) &&
        Boolean(department.trim());

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

        if (
            deliveryMethod === "shipping" &&
            !shippingAddressComplete
        ) {
            setEditingShippingAddress(
                true
            );

            setError(
                "Completá la dirección, ciudad y departamento para el envío."
            );

            return;
        }

        const formData =
            new FormData(
                event.currentTarget
            );

        setSubmitting(true);

        try {
            if (
                deliveryMethod === "shipping" &&
                isLoggedIn
            ) {
                const addressResult =
                    await saveDefaultAddress({
                        recipientName:
                            `${firstName.trim()} ${lastName.trim()}`.trim(),
                        phone:
                            phone.trim(),
                        addressLine:
                            address.trim(),
                        city:
                            city.trim(),
                        department:
                            department.trim(),
                    });

                if (!addressResult.success) {
                    setError(
                        addressResult.error
                    );
                    setSubmitting(false);
                    return;
                }

                const normalizedAddress = {
                    address_line:
                        address.trim(),
                    city:
                        city.trim(),
                    department:
                        department.trim(),
                };

                setSavedShippingAddress(
                    normalizedAddress
                );
                setEditingShippingAddress(
                    false
                );
            }

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

                    address:
                        deliveryMethod === "shipping"
                            ? address.trim()
                            : "",

                    city:
                        deliveryMethod === "shipping"
                            ? city.trim()
                            : "",

                    department:
                        deliveryMethod === "shipping"
                            ? department.trim()
                            : "",

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

            /*
             * Retiro:
             * si Mercado Pago quedó pronto,
             * salimos al checkout seguro.
             *
             * Envío:
             * primero se registra el pedido
             * porque todavía falta confirmar
             * el costo de envío.
             */
            if (
                result.checkoutUrl
            ) {
                window.location.assign(
                    result.checkoutUrl
                );

                return;
            }

            const confirmationParams =
                new URLSearchParams({
                    numero:
                        String(
                            result.orderNumber
                        ),
                });

            if (
                result.paymentError
            ) {
                confirmationParams.set(
                    "pago",
                    "error"
                );
            }

            router.push(
                `/pedido-confirmado?${confirmationParams.toString()}`
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
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
                <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 sm:py-10 lg:px-8">
                    <div className="rounded-[24px] border border-[#ddcfbc] bg-[linear-gradient(145deg,#fffdfa_0%,#faf4e9_100%)] px-6 py-10 shadow-[0_12px_30px_rgba(61,45,28,0.05)]">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a87636]">
                            Tu selección
                        </p>

                        <h1 className="mt-2 font-serif text-[29px] tracking-[-0.03em] text-[#211c19] sm:text-[34px]">
                            No hay productos
                            para comprar
                        </h1>

                        <p className="mt-4 text-sm text-neutral-600">
                            Tu carrito está
                            vacío.
                        </p>

                        <Link
                            href="/catalogo"
                            className="lezcano-button mt-6 inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[#1d1b19] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9a6c31]"
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
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">

                {/* Encabezado */}
                <div className="border-b border-[#dfd3c3] pb-4">
                    <Link
                        href="/carrito"
                        className="lezcano-arrow inline-flex items-center text-xs text-neutral-500 transition-colors hover:text-neutral-900 sm:text-sm"
                    >
                        <span className="arrow">
                            ←
                        </span>

                        Volver al carrito
                    </Link>

                    <div className="mt-4 flex items-end justify-between gap-5">
                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#a87636]">
                                Último paso
                            </p>

                            <h1 className="mt-1.5 font-serif text-[29px] leading-tight tracking-[-0.035em] text-[#211c19] sm:text-[34px]">
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

                    <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#6d625a]">
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
                    className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start lg:gap-8"
                >
                    <div className="space-y-4">

                        {/* Datos personales */}
                        <section className="rounded-[20px] border border-[#dfd3c3] bg-white/90 p-[18px] shadow-[0_8px_22px_rgba(61,45,28,0.035)] sm:p-5">

                            <div className="flex items-start justify-between gap-5">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a87636]">
                                        01
                                    </p>

                                    <h2 className="mt-1 font-serif text-[22px] tracking-[-0.02em] text-[#241f1c]">
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
                                <div className="mt-5 grid gap-3.5 sm:grid-cols-2">

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
                                            className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
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
                                            className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
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
                                            className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
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
                                            className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
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
                        <section className="rounded-[20px] border border-[#dfd3c3] bg-white/90 p-[18px] shadow-[0_8px_22px_rgba(61,45,28,0.035)] sm:p-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a87636]">
                                    02
                                </p>

                                <h2 className="mt-1 font-serif text-[22px] tracking-[-0.02em] text-[#241f1c]">
                                    Forma de entrega
                                </h2>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                {/* Retiro */}
                                <label
                                    className={`cursor-pointer rounded-[15px] border p-3.5 transition ${deliveryMethod ===
                                        "pickup"
                                        ? "border-[#b98a48] bg-[#fbf3e5] shadow-[0_6px_16px_rgba(87,61,30,0.06)]"
                                        : "border-[#ddd3c5] bg-white hover:border-[#c8a875]"
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
                                    className={`cursor-pointer rounded-[15px] border p-3.5 transition ${deliveryMethod ===
                                        "shipping"
                                        ? "border-[#b98a48] bg-[#fbf3e5] shadow-[0_6px_16px_rgba(87,61,30,0.06)]"
                                        : "border-[#ddd3c5] bg-white hover:border-[#c8a875]"
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
                                    <div className="mt-4 border-t border-[#eee5da] pt-4">
                                        {isLoggedIn &&
                                            savedShippingAddress &&
                                            !editingShippingAddress ? (
                                            <div className="rounded-[15px] border border-[#dfd3c3] bg-[#fbf7f0] p-3.5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a7541]">
                                                            Dirección de envío
                                                        </p>

                                                        <p className="mt-2 text-sm font-medium text-neutral-900">
                                                            {savedShippingAddress.address_line}
                                                        </p>

                                                        <p className="mt-1 text-xs text-neutral-500">
                                                            {savedShippingAddress.city}, {savedShippingAddress.department}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingShippingAddress(
                                                                true
                                                            )
                                                        }
                                                        className="shrink-0 text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                                    >
                                                        Editar
                                                    </button>
                                                </div>

                                                <p className="mt-3 border-t border-[#e7ded2] pt-3 text-[11px] leading-5 text-neutral-500">
                                                    Usaremos esta dirección para el pedido. Podés cambiarla sin salir del checkout.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3.5 sm:grid-cols-2">
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
                                                        value={address}
                                                        onChange={(event) =>
                                                            setAddress(
                                                                event.target.value
                                                            )
                                                        }
                                                        autoComplete="street-address"
                                                        placeholder="Calle y número"
                                                        className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="city"
                                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                                    >
                                                        Ciudad *
                                                    </label>

                                                    <input
                                                        id="city"
                                                        name="city"
                                                        required
                                                        value={city}
                                                        onChange={(event) =>
                                                            setCity(
                                                                event.target.value
                                                            )
                                                        }
                                                        autoComplete="address-level2"
                                                        className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="department"
                                                        className="mb-1.5 block text-xs font-medium text-neutral-700"
                                                    >
                                                        Departamento *
                                                    </label>

                                                    <input
                                                        id="department"
                                                        name="department"
                                                        required
                                                        value={department}
                                                        onChange={(event) =>
                                                            setDepartment(
                                                                event.target.value
                                                            )
                                                        }
                                                        autoComplete="address-level1"
                                                        className="h-11 w-full rounded-[11px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
                                                    />
                                                </div>

                                                <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
                                                    {isLoggedIn &&
                                                        savedShippingAddress && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAddress(
                                                                        savedShippingAddress.address_line
                                                                    );
                                                                    setCity(
                                                                        savedShippingAddress.city
                                                                    );
                                                                    setDepartment(
                                                                        savedShippingAddress.department
                                                                    );
                                                                    setEditingShippingAddress(
                                                                        false
                                                                    );
                                                                }}
                                                                className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                                                            >
                                                                Cancelar edición
                                                            </button>
                                                        )}

                                                    {isLoggedIn && (
                                                        <p className="text-[11px] leading-5 text-neutral-500">
                                                            Esta dirección quedará guardada en Mi cuenta para futuras compras.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </section>

                        {/* Observaciones */}
                        <section className="rounded-[20px] border border-[#dfd3c3] bg-white/90 p-[18px] shadow-[0_8px_22px_rgba(61,45,28,0.035)] sm:p-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a87636]">
                                    03
                                </p>

                                <h2 className="mt-1 font-serif text-[22px] tracking-[-0.02em] text-[#241f1c]">
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
                                className="mt-3.5 w-full resize-y rounded-[12px] border border-[#d8cfc1] bg-[#fffdfa] px-3.5 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#b98a48] focus:ring-2 focus:ring-[#b98a48]/10"
                            />
                        </section>
                    </div>

                    {/* Resumen */}
                    <aside className="rounded-[22px] border border-[#d8c8b2] bg-[linear-gradient(145deg,#fffdfa_0%,#faf5ec_100%)] p-5 shadow-[0_12px_30px_rgba(61,45,28,0.055)] lg:sticky lg:top-28">

                        <div className="flex items-center justify-between">
                            <h2 className="font-serif text-[23px] tracking-[-0.025em] text-[#241f1c]">
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
                        <div className="mt-4 divide-y divide-[#e6ddd1] border-y border-[#e6ddd1]">
                            {cart.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className="flex gap-3 py-3.5"
                                    >
                                        {item.imageUrl && (
                                            <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[11px] bg-neutral-100">
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
                                    <div className="mt-3.5 rounded-[13px] border border-[#e5d6c0] bg-white/65 p-3">
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
                                className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
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
                            className="lezcano-button mt-5 flex min-h-12 w-full items-center justify-center rounded-[12px] bg-[#1d1b19] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(29,27,25,0.12)] transition hover:bg-[#9a6c31] disabled:cursor-not-allowed disabled:bg-neutral-400"
                        >
                            {submitting
                                ? deliveryMethod ===
                                    "pickup"
                                    ? "Preparando pago..."
                                    : "Confirmando..."
                                : deliveryMethod ===
                                    "pickup"
                                    ? "Continuar a Mercado Pago"
                                    : "Confirmar pedido"}

                            {!submitting && (
                                <span className="ml-2">
                                    →
                                </span>
                            )}
                        </button>

                        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.1em] text-neutral-400">
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

                        <p className="mt-3 text-center text-[11px] leading-5 text-neutral-500">
                            {deliveryMethod ===
                                "pickup"
                                ? "Primero registraremos el pedido y luego te llevaremos a Mercado Pago para completar el pago de forma segura."
                                : "Registraremos el pedido y la joyería confirmará el costo de envío antes de habilitar el pago."}
                        </p>
                    </aside>
                </form>
            </div>
        </main>
    );
}