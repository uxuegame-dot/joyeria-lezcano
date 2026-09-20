import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default async function ActualizarPasswordPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?error=recovery_link_invalid");
    }

    return (
        <main className="min-h-[68vh] bg-[#f6f2eb]">
            <section className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                <div className="overflow-hidden rounded-[20px] border border-[#d9ccba] bg-[#fffdf9] shadow-[0_16px_44px_rgba(65,48,29,0.06)]">
                    <div className="border-b border-[#eadfce] bg-gradient-to-r from-[#f3e8d8] via-[#fbf7f0] to-[#efe7dc] px-5 py-5 sm:px-7 sm:py-6">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#976a38]">
                            Seguridad
                        </p>

                        <h1 className="mt-1.5 font-serif text-3xl text-[#211d18] sm:text-[34px]">
                            Nueva contraseña
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-[#6e6358]">
                            Elegí una contraseña nueva de al menos 8 caracteres.
                        </p>
                    </div>

                    <div className="p-5 sm:p-7">
                        <UpdatePasswordForm />
                    </div>
                </div>
            </section>
        </main>
    );
}
