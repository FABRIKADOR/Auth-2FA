"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import {
  Shield,
  Smartphone,
  Lock,
  CheckCircle,
  ArrowRight,
  LogIn,
  UserPlus,
  FileImage,
  Upload,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SecureApp</h1>
            </div>
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-9 w-24 rounded"></div>
              ) : user ? (
                <Link href="/dashboard">
                  <Button>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline">
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Aplicación Segura con 2FA</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Una aplicación completa con autenticación de dos factores, gestión de usuarios y galería personal de
            imágenes. Construida con Next.js y Supabase.
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Security Features */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Shield className="w-6 h-6" />
                <span>Seguridad Avanzada</span>
              </CardTitle>
              <CardDescription className="text-blue-700">
                Protección completa con autenticación de dos factores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Autenticación 2FA con TOTP</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Códigos de respaldo</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Sesiones seguras</span>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Features */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <FileImage className="w-6 h-6" />
                <span>Galería Personal</span>
              </CardTitle>
              <CardDescription className="text-purple-700">
                Gestiona tu colección de imágenes de forma segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-purple-800">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Subida de imágenes</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-800">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Vista de galería</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-800">
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edición de metadatos</span>
              </div>
            </CardContent>
          </Card>

          {/* Technical Features */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-900">
                <Lock className="w-6 h-6" />
                <span>Tecnología Moderna</span>
              </CardTitle>
              <CardDescription className="text-green-700">Construido con las mejores tecnologías</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Next.js 15</span>
              </div>
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Supabase Backend</span>
              </div>
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">TypeScript</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Showcase */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Galería de Arte Personal</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sube, organiza y gestiona tu colección de imágenes con metadatos completos. Cada imagen se almacena de
              forma segura en Supabase Storage con el nombre del título.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Subida Inteligente</h3>
                  <p className="text-gray-600 text-sm">
                    Las imágenes se guardan con el nombre del título en el bucket "container"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <FileImage className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Metadatos Completos</h3>
                  <p className="text-gray-600 text-sm">Título, artista, descripción, dimensiones y más información</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Privacidad Total</h3>
                  <p className="text-gray-600 text-sm">Solo tú puedes ver y gestionar tus imágenes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6 text-center">
              <FileImage className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu Galería Te Espera</h3>
              <p className="text-gray-600 text-sm mb-4">Comienza a construir tu colección personal de arte digital</p>
              {user ? (
                <Link href="/gallery">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <FileImage className="w-4 h-4 mr-2" />
                    Abrir Galería
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Crear Cuenta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Cómo Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Regístrate</h3>
              <p className="text-gray-600">Crea tu cuenta de forma rápida y segura</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Configura 2FA</h3>
              <p className="text-gray-600">Habilita la autenticación de dos factores para mayor seguridad</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Sube Imágenes</h3>
              <p className="text-gray-600">Comienza a construir tu galería personal de arte</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-blue-100 mb-6">Únete a miles de usuarios que ya confían en nuestra plataforma segura</p>
            <div className="flex justify-center space-x-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Cuenta Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SecureApp. Construido con Next.js y Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
