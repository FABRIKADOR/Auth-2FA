"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, Smartphone, Lock } from "lucide-react"

export default function WelcomePage() {
  const [user, setUser] = useState<any>(null)
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
      setLoading(false)
    }
    getUser()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-cyan-400 font-mono text-xl">INICIALIZANDO SISTEMA...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-3/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent font-mono">
            ¡BIENVENIDO AL FUTURO!
          </h1>
          <div className="text-cyan-300 font-mono text-lg">{"> SISTEMA NEURAL ACTIVADO <"}</div>
          <div className="text-pink-300 font-mono">Hola {user?.user_metadata?.full_name || user?.email} 👋</div>
        </div>

        {/* Pasos de configuración */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-black/60 border-2 border-green-400 shadow-lg shadow-green-400/30">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-green-400 font-mono">PASO 1: COMPLETADO</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-cyan-300 font-mono text-sm">✓ Cuenta creada exitosamente</div>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-2 border-yellow-400 shadow-lg shadow-yellow-400/30">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <CardTitle className="text-yellow-400 font-mono">PASO 2: SEGURIDAD</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="text-cyan-300 font-mono text-sm">Configura 2FA para máxima protección</div>
              <Button
                onClick={() => router.push("/setup-2fa?from=welcome")}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-mono font-bold"
              >
                CONFIGURAR 2FA
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-black/60 border-2 border-pink-400 shadow-lg shadow-pink-400/30">
            <CardHeader className="text-center">
              <Smartphone className="w-12 h-12 text-pink-400 mx-auto mb-2" />
              <CardTitle className="text-pink-400 font-mono">PASO 3: EXPLORAR</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <div className="text-cyan-300 font-mono text-sm">Explora tu dashboard personal</div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-mono font-bold"
              >
                IR AL DASHBOARD
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card className="bg-black/80 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent font-mono text-center">
              CARACTERÍSTICAS DEL SISTEMA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-green-400" />
                  <div>
                    <div className="text-green-400 font-mono font-bold">SEGURIDAD AVANZADA</div>
                    <div className="text-cyan-300 font-mono text-sm">Autenticación de dos factores</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-blue-400 font-mono font-bold">PROTECCIÓN DE DATOS</div>
                    <div className="text-cyan-300 font-mono text-sm">Encriptación de extremo a extremo</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-6 h-6 text-pink-400" />
                  <div>
                    <div className="text-pink-400 font-mono font-bold">COMPATIBILIDAD MÓVIL</div>
                    <div className="text-cyan-300 font-mono text-sm">Google Authenticator, Authy</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-yellow-400" />
                  <div>
                    <div className="text-yellow-400 font-mono font-bold">FÁCIL DE USAR</div>
                    <div className="text-cyan-300 font-mono text-sm">Interfaz intuitiva y moderna</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón de continuar */}
        <div className="text-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 hover:from-cyan-600 hover:via-pink-600 hover:to-yellow-600 text-black font-bold py-4 px-8 text-xl shadow-2xl shadow-cyan-400/50 hover:shadow-pink-400/50 transition-all duration-300 font-mono"
          >
            COMENZAR AVENTURA CYBER
          </Button>
        </div>
      </div>
    </div>
  )
}
