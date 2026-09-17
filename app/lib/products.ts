import { createClient } from "@/app/lib/supabase/server";

export async function getActiveCategories() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, line, sort_order")
        .eq("active", true)
        .order("line", { ascending: true })
        .order("sort_order", { ascending: true });

    if (error) {
        throw new Error(
            `Error al obtener categorías: ${error.message}`
        );
    }

    return data ?? [];
}

export async function getActiveProducts() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            description,
            material,
            price,
            stock,
            product_type,
            status,
            is_featured,
            sort_order,
            category_id,
            created_at,
            categories (
                id,
                name,
                slug,
                line
            ),
            product_images (
                id,
                storage_path,
                alt_text,
                sort_order
            )
        `)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(
            `Error al obtener productos: ${error.message}`
        );
    }

    return data ?? [];
}

export async function getActiveProductBySlug(
    slug: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            description,
            material,
            price,
            stock,
            product_type,
            status,
            is_featured,
            sort_order,
            category_id,
            created_at,
            categories (
                id,
                name,
                slug,
                line
            ),
            product_images (
                id,
                storage_path,
                alt_text,
                sort_order
            )
        `)
        .eq("slug", slug)
        .eq("status", "active")
        .single();

    if (error) {
        return null;
    }

    return data;
}