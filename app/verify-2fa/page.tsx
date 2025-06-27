"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Verify2FAPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
    }
    getUser()
  }, [router, supabase.auth])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          token: token.replace(/\s/g, ""), // Remover espacios
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error de verificación")
      }

      if (data.valid) {
        router.push("/dashboard")
      } else {
        setError("Código inválido. Intenta nuevamente.")
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatToken = (value: string) => {
    // Formatear como XXX XXX para mejor legibilidad
    const cleaned = value.replace(/\D/g, "").slice(0, 6)
    if (cleaned.length >= 4) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3)
    }
    return cleaned
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md bg-black/80 border-2 border-pink-400 shadow-2xl shadow-pink-400/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            VERIFICACIÓN 2FA
          </CardTitle>
          <div className="text-pink-300 text-sm font-mono">{"> CÓDIGO DE AUTENTICACIÓN REQUERIDO <"}</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-cyan-300 font-mono text-sm">
                Ingresa el código de 6 dígitos de tu aplicación autenticadora
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-pink-300 font-mono text-sm">
                  CÓDIGO_2FA
                </Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(formatToken(e.target.value))}
                  required
                  maxLength={7} // 6 dígitos + 1 espacio
                  className="bg-gray-900/50 border-pink-400 text-pink-100 placeholder-pink-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 font-mono text-center text-2xl tracking-widest"
                  placeholder="000 000"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-400/50 rounded p-2 text-center">
                ERROR: {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading || token.replace(/\s/g, "").length !== 6}
                className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-black font-bold py-3 text-lg shadow-lg shadow-pink-400/50 hover:shadow-cyan-400/50 transition-all duration-300 font-mono"
              >
                {loading ? "VERIFICANDO..." : "VERIFICAR CÓDIGO"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono"
              >
                VOLVER AL LOGIN
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
