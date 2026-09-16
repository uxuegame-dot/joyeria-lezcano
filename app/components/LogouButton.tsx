import { signOut } from '@/app/lib/auth/actions'

export function LogoutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="text-sm text-neutral-700 underline transition hover:text-neutral-900"
            >
                Cerrar sesión
            </button>
        </form>
    )
}