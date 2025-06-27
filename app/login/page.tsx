"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Verificar si el usuario tiene 2FA habilitado
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_2fa_enabled")
          .eq("id", data.user.id)
          .single()

        if (profileError) throw profileError

        if (profile?.is_2fa_enabled) {
          // Redirigir a verificación 2FA
          router.push("/verify-2fa")
        } else {
          // Redirigir al dashboard
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado estilo retro */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/20 to-pink-500/20 animate-pulse"></div>
        <div className="grid-pattern absolute inset-0"></div>
      </div>

      <Card className="w-full max-w-md bg-black/80 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            CYBER LOGIN
          </CardTitle>
          <div className="text-cyan-300 text-sm font-mono">{"> SISTEMA DE AUTENTICACIÓN <"}</div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cyan-300 font-mono text-sm">
                EMAIL_ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-900/50 border-cyan-400 text-cyan-100 placeholder-cyan-500/50 focus:border-pink-400 focus:ring-pink-400/50 font-mono"
                placeholder="usuario@cyber.net"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-cyan-300 font-mono text-sm">
                PASSWORD_KEY
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-900/50 border-cyan-400 text-cyan-100 placeholder-cyan-500/50 focus:border-pink-400 focus:ring-pink-400/50 font-mono"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-mono bg-red-900/20 border border-red-400/50 rounded p-2">
                ERROR: {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-black font-bold py-3 text-lg shadow-lg shadow-cyan-400/50 hover:shadow-pink-400/50 transition-all duration-300 font-mono"
            >
              {loading ? "CONECTANDO..." : "INICIAR SESIÓN"}
            </Button>

            <div className="text-center space-y-2">
              <div className="text-cyan-300 font-mono text-sm">¿No tienes cuenta?</div>
              <Link
                href="/register"
                className="text-pink-400 hover:text-pink-300 font-mono text-sm underline transition-colors"
              >
                CREAR CUENTA
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}
