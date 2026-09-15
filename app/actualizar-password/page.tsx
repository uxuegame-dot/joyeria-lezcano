import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { UpdatePasswordForm } from './UpdatePasswordForm'

export default async function ActualizarPasswordPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?error=recovery_link_invalid')
    }

    return (
        <main className="mx-auto max-w-sm p-6">
            <h1 className="text-xl font-semibold">
                Nueva contraseña
            </h1>

            <UpdatePasswordForm />
        </main>
    )
}
