import { signOut } from '@/app/lib/auth/actions'

export function LogoutButton() {
    return (
        <form action={signOut}>
            <button
                type="submit"
                className="text-sm underline"
            >
                Cerrar sesión
            </button>
        </form>
    )
}