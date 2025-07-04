"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Shield, CheckCircle, ArrowLeft } from "lucide-react"
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
          setError("Error getting user information")
          return
        }

        if (profile?.is_2fa_enabled) {
          setIs2FAEnabled(true)
        }
      } catch (error) {
        console.error("Error en getUser:", error)
        setError("Connection error")
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
        throw new Error(data.error || "Error setting up 2FA")
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

      if (!response.ok) {
        throw new Error(data.error || "Verification error")
      }

      if (data.valid) {
        // Activar 2FA en la base de datos
        const { error } = await supabase.from("profiles").update({ is_2fa_enabled: true }).eq("id", user.id)

        if (error) {
          console.error("Error activando 2FA:", error)
          throw error
        }

        setIs2FAEnabled(true)
        setStep("verify")
      } else {
        setError("Invalid code. Please check that the code is correct and hasn't expired.")
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Cloud className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "initial" && (
              <div className="space-y-6">
                {is2FAEnabled ? (
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-medium text-green-900">2FA Enabled</span>
                      </div>
                      <p className="text-sm text-green-700">Your account is protected with two-factor authentication</p>
                    </div>
                    <Button onClick={handleDisable2FA} disabled={loading} variant="destructive" className="w-full">
                      {loading ? "Disabling..." : "Disable 2FA"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Your Account</h3>
                      <p className="text-gray-600">
                        Two-factor authentication adds an extra layer of security to your account
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Benefits:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Protection against unauthorized access</li>
                        <li>• Compatible with Google Authenticator</li>
                        <li>• Codes change every 30 seconds</li>
                        <li>• Works offline</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleEnable2FA}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? "Setting up..." : "Enable 2FA"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === "setup" && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
                  <p className="text-sm text-gray-600">1. Scan this QR code with your authenticator app</p>

                  {qrCodeUrl && (
                    <div className="flex justify-center p-6 bg-white border border-gray-200 rounded-lg">
                      <Image src={qrCodeUrl || "/placeholder.svg"} alt="QR Code for 2FA" width={200} height={200} />
                    </div>
                  )}

                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-xs text-gray-600 mb-1">Or enter manually:</p>
                    <code className="text-sm font-mono text-gray-900">{secret}</code>
                  </div>

                  <p className="text-sm text-gray-600">2. Enter the verification code to complete setup</p>
                </div>

                <form onSubmit={handleVerifyAndEnable} className="space-y-4">
                  <div>
                    <Label htmlFor="verification-token" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </Label>
                    <Input
                      id="verification-token"
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(formatToken(e.target.value))}
                      required
                      maxLength={7}
                      className="mt-1 text-center text-lg tracking-widest"
                      placeholder="000 000"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || verificationToken.replace(/\s/g, "").length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Verifying..." : "Verify and Enable"}
                  </Button>
                </form>
              </div>
            )}

            {step === "verify" && (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-900 mb-2">2FA Successfully Enabled</h3>
                  <p className="text-sm text-green-700">Your account is now protected with two-factor authentication</p>
                </div>
                <Button onClick={() => router.push("/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
