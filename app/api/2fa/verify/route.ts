import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { TOTP } from "@/utils/totp"

export async function POST(request: NextRequest) {
  try {
    const { user_id, token } = await request.json()

    if (!user_id || !token) {
      return NextResponse.json({ error: "user_id y token son requeridos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verificar que el usuario está autenticado
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    // Verificar que el user_id coincide con el usuario autenticado
    if (user.id !== user_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el secreto 2FA del usuario
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("two_factor_secret, is_2fa_enabled")
      .eq("id", user_id)
      .single()

    if (error || !profile) {
      console.error("Error obteniendo perfil:", error)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (!profile.two_factor_secret) {
      return NextResponse.json({ error: "Secreto 2FA no configurado" }, { status: 400 })
    }

    console.log("Verificando token para usuario:", user_id)
    console.log("Token recibido:", token)

    // Verificar el token TOTP usando nuestra implementación
    const verified = await TOTP.verify(profile.two_factor_secret, token, 2)

    console.log("Resultado de verificación:", verified)

    return NextResponse.json({ valid: verified })
  } catch (error) {
    console.error("Error verificando 2FA:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
