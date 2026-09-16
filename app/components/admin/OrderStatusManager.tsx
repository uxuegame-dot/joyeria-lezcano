"use client";

import { useState } from "react";
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
        value: "cancelled",
        label: "Cancelado",
    },
    {
        value: "payment_rejected",
        label: "Pago rechazado",
    },
];

export function OrderStatusManager({
    orderId,
    currentStatus,
}: OrderStatusManagerProps) {
    const router = useRouter();

    const [selectedStatus, setSelectedStatus] =
        useState(currentStatus);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const isFinal =
        currentStatus === "cancelled" ||
        currentStatus === "completed";

    async function handleSave() {
        if (
            saving ||
            selectedStatus === currentStatus
        ) {
            return;
        }

        if (
            selectedStatus === "cancelled"
        ) {
            const confirmed =
                window.confirm(
                    "¿Seguro que querés cancelar este pedido? El stock de los productos será devuelto automáticamente."
                );

            if (!confirmed) {
                return;
            }
        }

        if (
            selectedStatus === "completed"
        ) {
            const confirmed =
                window.confirm(
                    "¿Confirmás que este pedido fue completado? Luego no podrá modificarse."
                );

            if (!confirmed) {
                return;
            }
        }

        setSaving(true);
        setError("");

        const result =
            await updateOrderStatus(
                orderId,
                selectedStatus
            );

        if (!result.success) {
            setError(result.error);
            setSaving(false);
            return;
        }

        router.refresh();
        setSaving(false);
    }

    if (isFinal) {
        return (
            <div className="border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-sm font-medium text-neutral-900">
                    Estado final
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Este pedido ya no puede
                    modificarse.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-neutral-200 bg-white p-6">
            <h2 className="font-serif text-2xl text-neutral-900">
                Gestionar pedido
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
                Actualizá el estado según avance
                la preparación y entrega.
            </p>

            <label
                htmlFor="order-status"
                className="mt-6 block text-xs font-medium uppercase tracking-wide text-neutral-500"
            >
                Estado
            </label>

            <select
                id="order-status"
                value={selectedStatus}
                onChange={(event) =>
                    setSelectedStatus(
                        event.target.value
                    )
                }
                className="mt-2 w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            >
                {STATUS_OPTIONS.map(
                    (status) => (
                        <option
                            key={status.value}
                            value={status.value}
                        >
                            {status.label}
                        </option>
                    )
                )}
            </select>

            {error && (
                <div
                    role="alert"
                    className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleSave}
                disabled={
                    saving ||
                    selectedStatus ===
                    currentStatus
                }
                className="mt-4 w-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
                {saving
                    ? "Guardando..."
                    : "Guardar estado"}
            </button>
        </div>
    );
}
