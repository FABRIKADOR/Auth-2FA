import { createBrowserClient } from "@supabase/ssr"

// Variable global para almacenar la instancia única
let supabaseInstance: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  // Si ya existe una instancia, la reutilizamos
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Crear nueva instancia solo si no existe
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseInstance
}
