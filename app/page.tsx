"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cloud, Sun, CloudRain, CloudSnow, Eye, Wind, Droplets, Thermometer } from "lucide-react"
import Link from "next/link"

interface WeatherData {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  visibility: number
  cod: number
  message?: string
}

export default function HomePage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ciudad, setCiudad] = useState("Mexico City")
  const [apiKey, setApiKey] = useState("")

  const obtenerClima = async () => {
    if (!apiKey.trim()) {
      setError("Por favor ingresa tu API Key de OpenWeatherMap")
      return
    }

    if (!ciudad.trim()) {
      setError("Por favor ingresa una ciudad")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pais = "MX"
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)},${pais}&units=metric&lang=es&appid=${apiKey}`

      const respuesta = await fetch(url)
      const datos = await respuesta.json()

      if (datos.cod !== 200) {
        throw new Error(datos.message || "No se pudo obtener el clima")
      }

      setWeatherData(datos)
    } catch (error) {
      const err = error as Error
      console.error(err)
      setError(`Error al obtener el clima: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string, main: string) => {
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className="w-16 h-16 text-yellow-400" />
      case "clouds":
        return <Cloud className="w-16 h-16 text-gray-400" />
      case "rain":
        return <CloudRain className="w-16 h-16 text-blue-400" />
      case "snow":
        return <CloudSnow className="w-16 h-16 text-white" />
      default:
        return <Cloud className="w-16 h-16 text-gray-400" />
    }
  }

  useEffect(() => {
    // Auto-cargar clima de Ciudad de México si hay API key
    if (apiKey && ciudad) {
      obtenerClima()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Fondo animado estilo retro */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-500/20 to-cyan-500/20 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 font-mono">
            WEATHER STATION
          </h1>
          <p className="text-cyan-300 text-xl font-mono">
            {">"} SISTEMA METEOROLÓGICO AVANZADO {"<"}
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-mono border-2 border-pink-400 shadow-lg shadow-pink-500/25">
                LOGIN
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-mono border-2 border-cyan-400 shadow-lg shadow-cyan-500/25">
                REGISTER
              </Button>
            </Link>
          </div>
        </div>

        {/* Configuración API */}
        <Card className="mb-8 bg-black/40 border-2 border-cyan-400 shadow-lg shadow-cyan-500/25 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-xl">
              {">"} CONFIGURACIÓN API {"<"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apikey" className="text-pink-400 font-mono">
                OpenWeatherMap API Key:
              </Label>
              <Input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API Key"
                className="bg-black/50 border-pink-400 text-white font-mono focus:border-cyan-400 focus:ring-cyan-400"
              />
              <p className="text-xs text-gray-400 mt-1 font-mono">Obtén tu API key gratis en: openweathermap.org/api</p>
            </div>
            <div>
              <Label htmlFor="ciudad" className="text-pink-400 font-mono">
                Ciudad:
              </Label>
              <Input
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ej: Mexico City, Guadalajara, Monterrey"
                className="bg-black/50 border-pink-400 text-white font-mono focus:border-cyan-400 focus:ring-cyan-400"
              />
            </div>
            <Button
              onClick={obtenerClima}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-mono font-bold border-2 border-yellow-400 shadow-lg shadow-yellow-500/25"
            >
              {loading ? "OBTENIENDO DATOS..." : "OBTENER CLIMA"}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-8 bg-red-900/40 border-2 border-red-400 shadow-lg shadow-red-500/25">
            <CardContent className="p-4">
              <p className="text-red-400 font-mono text-center">ERROR: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Datos del clima */}
        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Información principal */}
            <Card className="bg-black/40 border-2 border-purple-400 shadow-lg shadow-purple-500/25 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-400 font-mono text-2xl text-center">
                  {weatherData.name.toUpperCase()}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="flex justify-center">
                  {getWeatherIcon(weatherData.weather[0].icon, weatherData.weather[0].main)}
                </div>
                <div>
                  <p className="text-6xl font-bold text-white font-mono mb-2">{Math.round(weatherData.main.temp)}°C</p>
                  <p className="text-cyan-400 text-xl font-mono capitalize">{weatherData.weather[0].description}</p>
                </div>
                <div className="text-pink-400 font-mono">
                  <p>Sensación térmica: {Math.round(weatherData.main.feels_like)}°C</p>
                </div>
              </CardContent>
            </Card>

            {/* Detalles adicionales */}
            <Card className="bg-black/40 border-2 border-green-400 shadow-lg shadow-green-500/25 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-green-400 font-mono text-xl">
                  {">"} DATOS ADICIONALES {"<"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 font-mono text-sm">HUMEDAD</p>
                      <p className="text-white font-mono font-bold">{weatherData.main.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-cyan-400 font-mono text-sm">VIENTO</p>
                      <p className="text-white font-mono font-bold">{weatherData.wind.speed} m/s</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-red-400 font-mono text-sm">PRESIÓN</p>
                      <p className="text-white font-mono font-bold">{weatherData.main.pressure} hPa</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-yellow-400 font-mono text-sm">VISIBILIDAD</p>
                      <p className="text-white font-mono font-bold">{(weatherData.visibility / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 font-mono text-sm">POWERED BY OPENWEATHERMAP API • RETRO WEATHER STATION v2.0</p>
          <div className="flex justify-center space-x-8 mt-4 text-xs font-mono">
            <span className="text-pink-400">TEMP</span>
            <span className="text-cyan-400">WIND</span>
            <span className="text-yellow-400">HUMIDITY</span>
            <span className="text-green-400">PRESSURE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
