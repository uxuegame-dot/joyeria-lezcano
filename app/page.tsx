import { supabase } from './lib/supabase'

export default async function Home() {
  const { error } = await supabase
    .from('products')
    .select('id')
    .limit(1)

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold">
        Joyería Lezcano
      </h1>

      <p className="mt-4">
        {error
          ? `Error de conexión: ${error.message}`
          : 'Conexión con Supabase funcionando correctamente.'}
      </p>
    </main>
  )
}