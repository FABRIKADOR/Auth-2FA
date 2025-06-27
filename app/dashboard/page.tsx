"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

      // Obtener perfil del usuario
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profile)
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-xl">CARGANDO...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-black/80 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/50">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              CYBER DASHBOARD
            </CardTitle>
            <div className="text-cyan-300 text-sm font-mono">{"> SISTEMA OPERATIVO NEURAL <"}</div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400 font-mono">INFORMACIÓN DEL USUARIO</h3>
                <div className="space-y-2 text-cyan-300 font-mono text-sm">
                  <div>EMAIL: {user?.email}</div>
                  <div>ID: {user?.id}</div>
                  <div>
                    2FA:{" "}
                    {profile?.is_2fa_enabled ? (
                      <span className="text-green-400">✓ ACTIVADO</span>
                    ) : (
                      <span className="text-red-400">✗ DESACTIVADO</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-pink-400 font-mono">ACCIONES RÁPIDAS</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/setup-2fa")}
                    className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-black font-bold font-mono"
                  >
                    CONFIGURAR 2FA
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-400 text-red-400 hover:bg-red-400/10 font-mono bg-transparent"
                  >
                    CERRAR SESIÓN
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas ficticias con estilo retro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/60 border border-cyan-400/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 font-mono">128</div>
              <div className="text-cyan-300 text-sm font-mono">CONEXIONES ACTIVAS</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-pink-400/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-pink-400 font-mono">99.9%</div>
              <div className="text-pink-300 text-sm font-mono">UPTIME DEL SISTEMA</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border border-yellow-400/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 font-mono">2048</div>
              <div className="text-yellow-300 text-sm font-mono">NIVEL DE SEGURIDAD</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
