"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Shield, ArrowLeft } from "lucide-react"

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
        throw new Error(data.error || "Verification error")
      }

      if (data.valid) {
        router.push("/dashboard")
      } else {
        setError("Invalid code. Please try again.")
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Cloud className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Two-Factor Authentication</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the verification code from your authenticator app
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Verification Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Please enter the 6-digit code from your authenticator app</p>

                <div>
                  <Label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(formatToken(e.target.value))}
                    required
                    maxLength={7} // 6 dígitos + 1 espacio
                    className="text-center text-2xl tracking-widest"
                    placeholder="000 000"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || token.replace(/\s/g, "").length !== 6}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
