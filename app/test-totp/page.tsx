"use client"

import { useState } from "react"
import { TOTP } from "@/utils/totp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestTOTPPage() {
  const [secret, setSecret] = useState("")
  const [currentCode, setCurrentCode] = useState("")
  const [testToken, setTestToken] = useState("")
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)

  const generateSecret = () => {
    const newSecret = TOTP.generateSecret()
    setSecret(newSecret)
  }

  const generateCurrentCode = async () => {
    if (!secret) return
    const code = await TOTP.generate(secret)
    setCurrentCode(code)
  }

  const verifyToken = async () => {
    if (!secret || !testToken) return
    const result = await TOTP.verify(secret, testToken)
    setVerificationResult(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-black/80 border-2 border-cyan-400">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono">PRUEBA TOTP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={generateSecret} className="mb-2">
                Generar Secreto
              </Button>
              <div className="text-cyan-300 font-mono text-sm break-all">Secreto: {secret}</div>
            </div>

            <div>
              <Button onClick={generateCurrentCode} disabled={!secret} className="mb-2">
                Generar Código Actual
              </Button>
              <div className="text-green-400 font-mono text-2xl">Código: {currentCode}</div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Ingresa código para verificar"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="font-mono"
              />
              <Button onClick={verifyToken} disabled={!secret || !testToken}>
                Verificar
              </Button>
              {verificationResult !== null && (
                <div className={`font-mono ${verificationResult ? "text-green-400" : "text-red-400"}`}>
                  Resultado: {verificationResult ? "VÁLIDO" : "INVÁLIDO"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
