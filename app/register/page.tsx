"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Eye, EyeOff, Shield, Zap } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [enable2FA, setEnable2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "MUY DÉBIL", color: "text-red-400", bg: "bg-red-400" }
      case 2:
        return { text: "DÉBIL", color: "text-orange-400", bg: "bg-orange-400" }
      case 3:
        return { text: "MEDIA", color: "text-yellow-400", bg: "bg-yellow-400" }
      case 4:
        return { text: "FUERTE", color: "text-green-400", bg: "bg-green-400" }
      case 5:
        return { text: "MUY FUERTE", color: "text-cyan-400", bg: "bg-cyan-400" }
      default:
        return { text: "", color: "", bg: "" }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Redirigir según la preferencia de 2FA
        if (enable2FA) {
          router.push("/setup-2fa?from=register")
        } else {
          router.push("/welcome")
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthInfo = getPasswordStrengthText(passwordStrength)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efectos de fondo retro */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 animate-pulse"></div>
        <div className="grid-pattern absolute inset-0"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/30 to-pink-500/30 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <Card className="w-full max-w-lg bg-black/80 border-2 border-pink-400 shadow-2xl shadow-pink-400/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            CREAR CUENTA
          </CardTitle>
          <div className="text-pink-300 text-sm font-mono">{"> REGISTRO EN EL SISTEMA NEURAL <"}</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-pink-300 font-mono text-sm">
                NOMBRE_COMPLETO
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-gray-900/50 border-pink-400 text-pink-100 placeholder-pink-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 font-mono"
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-pink-300 font-mono text-sm">
                EMAIL_ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-900/50 border-pink-400 text-pink-100 placeholder-pink-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 font-mono"
                placeholder="usuario@cyber.net"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-pink-300 font-mono text-sm">
                PASSWORD_KEY
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-900/50 border-pink-400 text-pink-100 placeholder-pink-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 font-mono pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-pink-300">FORTALEZA:</span>
                    <span className={`text-xs font-mono font-bold ${strengthInfo.color}`}>{strengthInfo.text}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bg}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-pink-300 font-mono text-sm">
                CONFIRMAR_PASSWORD
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-900/50 border-pink-400 text-pink-100 placeholder-pink-500/50 focus:border-cyan-400 focus:ring-cyan-400/50 font-mono pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pink-400 hover:text-cyan-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <div className="text-red-400 text-xs font-mono">⚠ Las contraseñas no coinciden</div>
              )}
            </div>

            {/* Opción 2FA */}
            <div className="bg-yellow-900/20 border border-yellow-400/50 rounded p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-yellow-400" />
                <div className="text-yellow-300 font-mono font-bold">SEGURIDAD AVANZADA</div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="enable2fa"
                  checked={enable2FA}
                  onCheckedChange={(checked) => setEnable2FA(checked as boolean)}
                  className="mt-1 border-yellow-400 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-black"
                />
                <div className="space-y-1">
                  <Label htmlFor="enable2fa" className="text-yellow-300 font-mono text-sm cursor-pointer">
                    Activar autenticación de dos factores (2FA)
                  </Label>
                  <div className="text-cyan-300 font-mono text-xs">
                    Recomendado para máxima seguridad. Compatible con Google Authenticator.
                  </div>
                </div>
              </div>

              {enable2FA && (
                <div className="flex items-center space-x-2 text-green-400 font-mono text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Se configurará 2FA después del registro</span>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-400/50 rounded p-2">
                ERROR: {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 8}
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-black font-bold py-3 text-lg shadow-lg shadow-pink-400/50 hover:shadow-cyan-400/50 transition-all duration-300 font-mono"
            >
              {loading ? "CREANDO CUENTA..." : "CREAR CUENTA"}
            </Button>

            <div className="text-center space-y-2">
              <div className="text-pink-300 font-mono text-sm">¿Ya tienes cuenta?</div>
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-mono text-sm underline transition-colors"
              >
                INICIAR SESIÓN
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 20, 147, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 20, 147, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 25s linear infinite;
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
