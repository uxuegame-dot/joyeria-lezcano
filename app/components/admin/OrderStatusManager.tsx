"use client";

import {
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";

import { updateOrderStatus } from "@/app/lib/orders/actions";

type OrderStatusManagerProps = {
    orderId: string;
    currentStatus: string;
};

const STATUS_OPTIONS = [
    {
        value: "pending_confirmation",
        label: "Pendiente de confirmación",
    },
    {
        value: "pending_payment",
        label: "Pendiente de pago",
    },
    {
        value: "payment_confirmed",
        label: "Pago confirmado",
    },
    {
        value: "preparing",
        label: "En preparación",
    },
    {
        value: "ready_for_pickup",
        label: "Listo para retirar",
    },
    {
        value: "shipped",
        label: "Enviado",
    },
    {
        value: "completed",
        label: "Completado",
    },
    {
        value: "payment_rejected",
        label: "Pago rechazado",
    },
    {
        value: "cancelled",
        label: "Cancelado",
    },
];

function getStatusLabel(
    status: string
) {
    return (
        STATUS_OPTIONS.find(
            (option) =>
                option.value === status
        )?.label ?? status
    );
}

function getConfirmationMessage(
    currentStatus: string,
    nextStatus: string
) {
    if (
        nextStatus ===
        "payment_confirmed"
    ) {
        return (
            "¿Confirmás que el pago fue recibido?\n\n" +
            "Al marcar el pedido como Pago confirmado, " +
            "se descontará el stock de los productos del pedido."
        );
    }

    if (
        nextStatus ===
        "payment_rejected"
    ) {
        return (
            "¿Confirmás que el pago fue rechazado?\n\n" +
            "Si el stock ya había sido descontado, " +
            "el sistema lo devolverá automáticamente."
        );
    }

    if (
        nextStatus === "cancelled"
    ) {
        return (
            "¿Seguro que querés cancelar este pedido?\n\n" +
            "Esta acción cierra el pedido. " +
            "Si el stock ya había sido descontado, " +
            "el sistema lo devolverá automáticamente."
        );
    }

    if (
        nextStatus === "completed"
    ) {
        return (
            "¿Confirmás que este pedido ya fue entregado o retirado?\n\n" +
            "Una vez completado, el pedido queda finalizado."
        );
    }

    if (
        currentStatus ===
        "payment_confirmed" &&
        nextStatus === "preparing"
    ) {
        return (
            "¿Confirmás que la pieza ya fue reservada " +
            "y el pedido comenzó a prepararse?"
        );
    }

    return null;
}

export function OrderStatusManager({
    orderId,
    currentStatus,
}: OrderStatusManagerProps) {
    const router = useRouter();

    const [
        activeStatus,
        setActiveStatus,
    ] = useState(
        currentStatus
    );

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState(
        currentStatus
    );

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    /*
     * Cuando router.refresh() trae el nuevo estado
     * desde el servidor, sincronizamos el componente.
     */
    useEffect(() => {
        setActiveStatus(
            currentStatus
        );

        setSelectedStatus(
            currentStatus
        );
    }, [currentStatus]);

    const isTerminal =
        activeStatus ===
        "completed" ||
        activeStatus ===
        "cancelled";

    const hasChange =
        selectedStatus !==
        activeStatus;

    async function handleUpdate() {
        if (
            submitting ||
            !hasChange ||
            isTerminal
        ) {
            return;
        }

        setError("");
        setMessage("");

        const confirmationMessage =
            getConfirmationMessage(
                activeStatus,
                selectedStatus
            );

        if (
            confirmationMessage &&
            !window.confirm(
                confirmationMessage
            )
        ) {
            return;
        }

        setSubmitting(true);

        try {
            const result =
                await updateOrderStatus(
                    orderId,
                    selectedStatus
                );

            if (!result.success) {
                setError(
                    result.error
                );
                return;
            }

            const newStatus =
                selectedStatus;

            /*
             * Actualización inmediata de la interfaz.
             * No mandamos al usuario al listado.
             */
            setActiveStatus(
                newStatus
            );

            setSelectedStatus(
                newStatus
            );

            setMessage(
                "Estado actualizado. Podés seguir gestionando este pedido."
            );

            /*
             * Refresca los Server Components de ESTA MISMA
             * página para actualizar:
             * - estado superior
             * - bloque “Qué hacer ahora”
             * - información relacionada con stock
             *
             * Importante: NO usamos router.push().
             */
            router.refresh();
        } catch {
            setError(
                "No se pudo actualizar el estado del pedido. Intentá nuevamente."
            );
        } finally {
            setSubmitting(
                false
            );
        }
    }

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                    <label
                        htmlFor={`order-status-${orderId}`}
                        className="block text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500"
                    >
                        Cambiar estado
                    </label>

                    <select
                        id={`order-status-${orderId}`}
                        value={
                            selectedStatus
                        }
                        disabled={
                            submitting ||
                            isTerminal
                        }
                        onChange={(
                            event
                        ) => {
                            setSelectedStatus(
                                event
                                    .target
                                    .value
                            );

                            setMessage(
                                ""
                            );

                            setError(
                                ""
                            );
                        }}
                        className="mt-2 h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500"
                    >
                        {STATUS_OPTIONS.map(
                            (
                                option
                            ) => (
                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </option>
                            )
                        )}
                    </select>
                </div>

                <button
                    type="button"
                    disabled={
                        submitting ||
                        !hasChange ||
                        isTerminal
                    }
                    onClick={
                        handleUpdate
                    }
                    className="h-11 shrink-0 bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-[#9a7541] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                >
                    {submitting
                        ? "Guardando..."
                        : "Actualizar estado"}
                </button>
            </div>

            {isTerminal && (
                <p className="mt-3 text-xs leading-5 text-neutral-500">
                    Este pedido está{" "}
                    <span className="font-medium text-neutral-700">
                        {getStatusLabel(
                            activeStatus
                        ).toLowerCase()}
                    </span>
                    {" "}y ya no admite nuevos cambios.
                </p>
            )}

            {message && (
                <div
                    role="status"
                    className="mt-3 border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-700"
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mt-3 border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700"
                >
                    {error}
                </div>
            )}

            {!isTerminal && (
                <p className="mt-3 text-[11px] leading-5 text-neutral-500">
                    Después de guardar,
                    vas a permanecer en
                    este pedido para poder
                    continuar con el
                    siguiente paso.
                </p>
            )}
        </div>
    );
}