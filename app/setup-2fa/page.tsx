"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function Setup2FAPage() {
  const [user, setUser] = useState<any>(null)
  const [step, setStep] = useState<"initial" | "setup" | "verify">("initial")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationToken, setVerificationToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)

        // Verificar si ya tiene 2FA habilitado
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_2fa_enabled, email")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error obteniendo perfil:", profileError)
          setError("Error obteniendo información del usuario")
          return
        }

        if (profile?.is_2fa_enabled) {
          setIs2FAEnabled(true)
        }
      } catch (error) {
        console.error("Error en getUser:", error)
        setError("Error de conexión")
      }
    }
    getUser()
  }, [router, supabase])

  const handleEnable2FA = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error configurando 2FA")
      }

      setSecret(data.secret)
      setQrCodeUrl(data.qrCodeUrl)
      setStep("setup")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      console.log("Verificando código para usuario:", user.id)

      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          token: verificationToken.replace(/\s/g, ""),
        }),
      })

      const data = await response.json()
      console.log("Respuesta de verificación:", data)

      if (!response.ok) {
        throw new Error(data.error || "Error de verificación")
      }

      if (data.valid) {
        // Activar 2FA en la base de datos
        const { error } = await supabase.from("profiles").update({ is_2fa_enabled: true }).eq("id", user.id)

        if (error) {
          console.error("Error activando 2FA:", error)
          throw error
        }

        console.log("2FA activado exitosamente")
        setIs2FAEnabled(true)
        setStep("verify")
      } else {
        setError("Código inválido. Verifica que el código sea correcto y no haya expirado.")
      }
    } catch (error: any) {
      console.error("Error en verificación:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_2fa_enabled: false,
          two_factor_secret: null,
        })
        .eq("id", user.id)

      if (error) throw error

      setIs2FAEnabled(false)
      setStep("initial")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatToken = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    if (cleaned.length >= 4) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3)
    }
    return cleaned
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo retro */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-pink-500/30 rounded-full blur-3xl animate-spin-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-pink-500/30 to-yellow-500/30 rounded-full blur-3xl animate-spin-slow delay-2000"></div>
        </div>
      </div>

      <Card className="w-full max-w-lg bg-black/80 border-2 border-yellow-400 shadow-2xl shadow-yellow-400/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            CONFIGURACIÓN 2FA
          </CardTitle>
          <div className="text-yellow-300 text-sm font-mono">{"> SISTEMA DE SEGURIDAD AVANZADO <"}</div>
        </CardHeader>
        <CardContent>
          {step === "initial" && (
            <div className="space-y-6">
              {is2FAEnabled ? (
                <div className="text-center space-y-4">
                  <div className="text-green-400 font-mono text-lg">✓ 2FA ACTIVADO</div>
                  <div className="text-cyan-300 text-sm">
                    Tu cuenta está protegida con autenticación de dos factores
                  </div>
                  <Button
                    onClick={handleDisable2FA}
                    disabled={loading}
                    variant="destructive"
                    className="w-full font-mono"
                  >
                    {loading ? "DESACTIVANDO..." : "DESACTIVAR 2FA"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="text-yellow-300 text-lg font-mono">🛡️ PROTEGE TU CUENTA</div>
                    <div className="text-cyan-300 text-sm font-mono text-center">
                      La autenticación de dos factores añade una capa extra de seguridad a tu cuenta
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-400/50 rounded p-4 space-y-2">
                    <div className="text-yellow-300 font-mono text-sm font-bold">BENEFICIOS:</div>
                    <ul className="text-cyan-300 font-mono text-xs space-y-1">
                      <li>• Protección contra acceso no autorizado</li>
                      <li>• Compatible con Google Authenticator</li>
                      <li>• Códigos que cambian cada 30 segundos</li>
                      <li>• Funciona sin conexión a internet</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleEnable2FA}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-black font-bold py-3 text-lg shadow-lg shadow-yellow-400/50 hover:shadow-pink-400/50 transition-all duration-300 font-mono"
                  >
                    {loading ? "CONFIGURANDO..." : "ACTIVAR 2FA"}
                  </Button>

                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono"
                  >
                    CONFIGURAR MÁS TARDE
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="text-yellow-300 font-mono text-sm">
                  1. Escanea este código QR con tu app autenticadora
                </div>

                {qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code para 2FA" width={200} height={200} />
                  </div>
                )}

                <div className="text-cyan-300 font-mono text-xs">O ingresa manualmente: {secret}</div>

                <div className="text-yellow-300 font-mono text-sm">2. Ingresa el código generado para verificar</div>
              </div>

              <form onSubmit={handleVerifyAndEnable} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-token" className="text-yellow-300 font-mono text-sm">
                    CÓDIGO_VERIFICACIÓN
                  </Label>
                  <Input
                    id="verification-token"
                    type="text"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(formatToken(e.target.value))}
                    required
                    maxLength={7}
                    className="bg-gray-900/50 border-yellow-400 text-yellow-100 placeholder-yellow-500/50 focus:border-pink-400 focus:ring-pink-400/50 font-mono text-center text-2xl tracking-widest"
                    placeholder="000 000"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || verificationToken.replace(/\s/g, "").length !== 6}
                  className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-black font-bold py-3 text-lg shadow-lg shadow-yellow-400/50 hover:shadow-pink-400/50 transition-all duration-300 font-mono"
                >
                  {loading ? "VERIFICANDO..." : "VERIFICAR Y ACTIVAR"}
                </Button>
              </form>
            </div>
          )}

          {step === "verify" && (
            <div className="text-center space-y-4">
              <div className="text-green-400 font-mono text-2xl">✓ 2FA ACTIVADO EXITOSAMENTE</div>
              <div className="text-cyan-300 text-sm">
                Tu cuenta ahora está protegida con autenticación de dos factores
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-black font-bold py-3 text-lg shadow-lg shadow-green-400/50 hover:shadow-cyan-400/50 transition-all duration-300 font-mono"
              >
                IR AL DASHBOARD
              </Button>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-400/50 rounded p-2 text-center mt-4">
              ERROR: {error}
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
