"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Eye,
  Wind,
  Droplets,
  Thermometer,
  Settings,
  LogIn,
  UserPlus,
} from "lucide-react"
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
      setError("Please enter your OpenWeatherMap API Key")
      return
    }

    if (!ciudad.trim()) {
      setError("Please enter a city name")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pais = "MX"
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)},${pais}&units=metric&lang=en&appid=${apiKey}`

      const respuesta = await fetch(url)
      const datos = await respuesta.json()

      if (datos.cod !== 200) {
        throw new Error(datos.message || "Unable to fetch weather data")
      }

      setWeatherData(datos)
    } catch (error) {
      const err = error as Error
      console.error(err)
      setError(`Error fetching weather: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (iconCode: string, main: string) => {
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className="w-12 h-12 text-yellow-500" />
      case "clouds":
        return <Cloud className="w-12 h-12 text-gray-500" />
      case "rain":
        return <CloudRain className="w-12 h-12 text-blue-500" />
      case "snow":
        return <CloudSnow className="w-12 h-12 text-blue-300" />
      default:
        return <Cloud className="w-12 h-12 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cloud className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Weather Station</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <LogIn className="w-4 h-4" />
                  <span>Sign in</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700">
                  <UserPlus className="w-4 h-4" />
                  <span>Sign up</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Weather Analytics</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get real-time weather data and insights for any location worldwide with our enterprise-grade weather
            platform.
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Settings className="w-5 h-5" />
              <span>API Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apikey" className="text-sm font-medium text-gray-700">
                OpenWeatherMap API Key
              </Label>
              <Input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your free API key at{" "}
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  openweathermap.org/api
                </a>
              </p>
            </div>
            <div>
              <Label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
                City
              </Label>
              <Input
                id="ciudad"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="e.g., Mexico City, Guadalajara, Monterrey"
                className="mt-1"
              />
            </div>
            <Button onClick={obtenerClima} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Fetching data..." : "Get Weather Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Main Weather Card */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">{weatherData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-gray-900 mb-2">{Math.round(weatherData.main.temp)}°C</div>
                      <p className="text-lg text-gray-600 capitalize mb-1">{weatherData.weather[0].description}</p>
                      <p className="text-sm text-gray-500">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
                    </div>
                    <div className="text-right">
                      {getWeatherIcon(weatherData.weather[0].icon, weatherData.weather[0].main)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weather Details */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Humidity</p>
                      <p className="text-lg font-semibold text-gray-700">{weatherData.main.humidity}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Wind Speed</p>
                      <p className="text-lg font-semibold text-gray-700">{weatherData.wind.speed} m/s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pressure</p>
                      <p className="text-lg font-semibold text-gray-700">{weatherData.main.pressure} hPa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Visibility</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {(weatherData.visibility / 1000).toFixed(1)} km
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Features</h3>
            <p className="text-gray-600">Powerful tools for weather data analysis and monitoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Data</h4>
              <p className="text-gray-600">Get up-to-date weather information from reliable sources worldwide.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
              <p className="text-gray-600">Comprehensive weather metrics and detailed atmospheric data.</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Global Coverage</h4>
              <p className="text-gray-600">Access weather data for any location around the globe.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">Powered by OpenWeatherMap API • Weather Station v2.0</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
