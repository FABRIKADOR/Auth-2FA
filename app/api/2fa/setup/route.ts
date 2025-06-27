import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { TOTP } from "@/utils/totp"
import * as QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "user_id es requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Obtener información del usuario autenticado
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

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Perfil de usuario no encontrado" }, { status: 404 })
    }

    // Generar secreto TOTP único usando nuestra implementación
    const secret = TOTP.generateSecret(32)
    const email = profile.email || user.email
    const name = profile.full_name || email?.split("@")[0] || "Usuario"

    console.log("Secreto generado para usuario:", user_id, "Email:", email)
    console.log("Secreto base32:", secret)

    // Guardar el secreto en la base de datos
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        two_factor_secret: secret,
        email: email,
      })
      .eq("id", user_id)

    if (updateError) {
      console.error("Error actualizando perfil:", updateError)
      throw updateError
    }

    // Generar URL para QR code
    const qrUrl = TOTP.generateQRUrl(secret, "CyberApp", `${name} (${email})`)

    // Generar código QR
    const qrCodeUrl = await QRCode.toDataURL(qrUrl)

    return NextResponse.json({
      secret,
      qrCodeUrl,
    })
  } catch (error) {
    console.error("Error configurando 2FA:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
