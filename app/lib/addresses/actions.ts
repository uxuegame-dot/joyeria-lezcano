"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";

type SaveDefaultAddressInput = {
    recipientName: string;
    phone?: string;
    addressLine: string;
    city: string;
    department: string;
};

type SaveDefaultAddressResult =
    | {
        success: true;
    }
    | {
        success: false;
        error: string;
    };

export async function saveDefaultAddress(
    input: SaveDefaultAddressInput
): Promise<SaveDefaultAddressResult> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            success: false,
            error: "Tenés que iniciar sesión para guardar una dirección.",
        };
    }

    const recipientName =
        input.recipientName.trim();

    const phone =
        input.phone?.trim() || null;

    const addressLine =
        input.addressLine.trim();

    const city =
        input.city.trim();

    const department =
        input.department.trim();

    if (!recipientName) {
        return {
            success: false,
            error: "No pudimos identificar a la persona que recibe el pedido.",
        };
    }

    if (!addressLine) {
        return {
            success: false,
            error: "Ingresá una dirección.",
        };
    }

    if (!city) {
        return {
            success: false,
            error: "Ingresá la ciudad.",
        };
    }

    if (!department) {
        return {
            success: false,
            error: "Ingresá el departamento.",
        };
    }

    const {
        data: existingAddress,
        error: existingAddressError,
    } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle();

    if (existingAddressError) {
        console.error(
            "Error al buscar la dirección principal:",
            existingAddressError
        );

        return {
            success: false,
            error: "No pudimos consultar tu dirección guardada.",
        };
    }

    const addressData = {
        recipient_name: recipientName,
        phone,
        department,
        city,
        address_line: addressLine,
        is_default: true,
        updated_at: new Date().toISOString(),
    };

    if (existingAddress) {
        const { error } = await supabase
            .from("addresses")
            .update(addressData)
            .eq("id", existingAddress.id)
            .eq("user_id", user.id);

        if (error) {
            console.error(
                "Error al actualizar la dirección principal:",
                error
            );

            return {
                success: false,
                error: "No pudimos actualizar tu dirección.",
            };
        }
    } else {
        const { error } = await supabase
            .from("addresses")
            .insert({
                ...addressData,
                user_id: user.id,
            });

        if (error) {
            console.error(
                "Error al guardar la dirección principal:",
                error
            );

            return {
                success: false,
                error: "No pudimos guardar tu dirección.",
            };
        }
    }

    revalidatePath("/mi-cuenta");
    revalidatePath("/checkout");

    return {
        success: true,
    };
}