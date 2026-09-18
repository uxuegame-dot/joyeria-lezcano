"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { saveDefaultAddress } from "@/app/lib/addresses/actions";

type AddressData = {
    address_line: string;
    city: string;
    department: string;
};

type AddressEditorProps = {
    initialAddress: AddressData | null;
    recipientName: string;
    phone: string;
};

export function AddressEditor({
    initialAddress,
    recipientName,
    phone,
}: AddressEditorProps) {
    const router = useRouter();

    const [currentAddress, setCurrentAddress] =
        useState<AddressData | null>(initialAddress);

    const [editing, setEditing] =
        useState(!initialAddress);

    const [addressLine, setAddressLine] =
        useState(initialAddress?.address_line ?? "");

    const [city, setCity] =
        useState(initialAddress?.city ?? "");

    const [department, setDepartment] =
        useState(initialAddress?.department ?? "");

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    function handleEdit() {
        setError("");
        setMessage("");
        setEditing(true);
    }

    function handleCancel() {
        if (!currentAddress) {
            return;
        }

        setAddressLine(
            currentAddress.address_line
        );
        setCity(currentAddress.city);
        setDepartment(
            currentAddress.department
        );
        setError("");
        setMessage("");
        setEditing(false);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setError("");
        setMessage("");
        setSaving(true);

        const result = await saveDefaultAddress({
            recipientName,
            phone,
            addressLine,
            city,
            department,
        });

        if (!result.success) {
            setError(result.error);
            setSaving(false);
            return;
        }

        const nextAddress = {
            address_line: addressLine.trim(),
            city: city.trim(),
            department: department.trim(),
        };

        setCurrentAddress(nextAddress);
        setAddressLine(nextAddress.address_line);
        setCity(nextAddress.city);
        setDepartment(nextAddress.department);
        setEditing(false);
        setSaving(false);
        setMessage("Dirección guardada.");

        router.refresh();
    }

    return (
        <section className="border border-[#d8cfc1] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#9a7541] sm:text-[10px]">
                        Envíos
                    </p>

                    <h2 className="mt-2 font-serif text-2xl text-neutral-900">
                        Dirección de envío
                    </h2>
                </div>

                {currentAddress && !editing && (
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900"
                    >
                        Editar
                    </button>
                )}
            </div>

            {!editing && currentAddress ? (
                <div className="mt-5">
                    <p className="text-sm font-medium text-neutral-900">
                        {currentAddress.address_line}
                    </p>

                    <p className="mt-1 text-sm text-neutral-600">
                        {currentAddress.city}, {currentAddress.department}
                    </p>

                    <p className="mt-5 border-t border-neutral-100 pt-4 text-xs leading-5 text-neutral-500">
                        Esta dirección se completa automáticamente cuando elegís envío en una nueva compra.
                    </p>

                    {message && (
                        <p className="mt-3 text-xs font-medium text-[#8a693c]">
                            {message}
                        </p>
                    )}
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                >
                    <div>
                        <label
                            htmlFor="account-address"
                            className="mb-1.5 block text-xs font-medium text-neutral-700"
                        >
                            Dirección *
                        </label>

                        <input
                            id="account-address"
                            value={addressLine}
                            onChange={(event) =>
                                setAddressLine(
                                    event.target.value
                                )
                            }
                            required
                            autoComplete="street-address"
                            placeholder="Calle y número"
                            className="h-11 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#9a7541]"
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="account-city"
                                className="mb-1.5 block text-xs font-medium text-neutral-700"
                            >
                                Ciudad *
                            </label>

                            <input
                                id="account-city"
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                required
                                autoComplete="address-level2"
                                className="h-11 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="account-department"
                                className="mb-1.5 block text-xs font-medium text-neutral-700"
                            >
                                Departamento *
                            </label>

                            <input
                                id="account-department"
                                value={department}
                                onChange={(event) =>
                                    setDepartment(
                                        event.target.value
                                    )
                                }
                                required
                                autoComplete="address-level1"
                                className="h-11 w-full border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-[#9a7541]"
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#9a7541] disabled:cursor-not-allowed disabled:bg-neutral-400"
                        >
                            {saving
                                ? "Guardando..."
                                : currentAddress
                                    ? "Guardar cambios"
                                    : "Guardar dirección"}
                        </button>

                        {currentAddress && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={saving}
                                className="text-sm text-neutral-500 underline underline-offset-4 transition hover:text-neutral-900 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    {!currentAddress && (
                        <p className="text-xs leading-5 text-neutral-500">
                            También podés cargarla directamente durante tu próxima compra.
                        </p>
                    )}
                </form>
            )}
        </section>
    );
}