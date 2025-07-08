"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import {
  User,
  Shield,
  Activity,
  Clock,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  FileImage,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  email: string
  created_at: string
  two_factor_enabled: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.push("/login")
        return
      }

      // Obtener información del perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        created_at: authUser.created_at || "",
        two_factor_enabled: profile?.two_factor_enabled || false,
      })
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta!</h2>
          <p className="text-gray-600">Gestiona tu cuenta y configuraciones de seguridad</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Información de la Cuenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">ID de Usuario</label>
                <p className="text-gray-600 text-sm font-mono break-all">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Autenticación de Dos Factores</label>
                <div className="flex items-center space-x-2 mt-1">
                  {user.two_factor_enabled ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Habilitado
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        Deshabilitado
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Configuraciones de Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Autenticación de Dos Factores</h3>
                <p className="text-blue-800 text-sm mb-4">Añade una capa extra de seguridad a tu cuenta con 2FA.</p>
                <Link href="/setup-2fa">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {user.two_factor_enabled ? "Gestionar 2FA" : "Habilitar 2FA"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileImage className="w-5 h-5 text-purple-600" />
                <span>Galería de Arte</span>
              </CardTitle>
              <CardDescription>Gestiona tu colección personal de imágenes y obras de arte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">Tu Galería Personal</h3>
                    <p className="text-purple-800 text-sm mb-4">
                      Sube, organiza y gestiona tus imágenes en tu galería privada. Las imágenes se almacenan de forma
                      segura en Supabase Storage.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-purple-700">
                      <span>✨ Subida segura</span>
                      <span>🎨 Metadatos completos</span>
                      <span>📱 Responsive</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/gallery">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <FileImage className="w-4 h-4 mr-2" />
                        Abrir Galería
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Statistics */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de la Cuenta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Sesiones Activas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Seguridad de la Cuenta</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-sm text-gray-600">Monitoreo</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Inicio de sesión exitoso</p>
                    <p className="text-xs text-gray-600">Hace unos minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Cuenta creada</p>
                    <p className="text-xs text-gray-600">
                      Hace {accountAge} {accountAge === 1 ? "día" : "días"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
