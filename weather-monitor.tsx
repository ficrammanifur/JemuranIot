"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, Droplets, Thermometer, Eye, Zap, AlertTriangle, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Simulasi data sensor
const generateSensorData = () => ({
  temperature: Math.round((Math.random() * 15 + 20) * 10) / 10, // 20-35°C
  humidity: Math.round((Math.random() * 40 + 40) * 10) / 10, // 40-80%
  lightIntensity: Math.round(Math.random() * 100), // 0-100%
  rainLevel: Math.round(Math.random() * 100), // 0-100%
  isRaining: Math.random() > 0.7, // 30% chance of rain
  timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
})

export default function Component() {
  const [sensorData, setSensorData] = useState(generateSensorData())
  const [isOnline, setIsOnline] = useState(true)
  const [historicalData, setHistoricalData] = useState([
    { time: "08:00", temp: 25.2, humidity: 65, light: 45 },
    { time: "09:00", temp: 26.8, humidity: 62, light: 68 },
    { time: "10:00", temp: 28.1, humidity: 58, light: 85 },
    { time: "11:00", temp: 29.5, humidity: 55, light: 92 },
    { time: "12:00", temp: 31.2, humidity: 52, light: 98 },
    { time: "13:00", temp: 32.1, humidity: 48, light: 95 },
  ])

  // Simulasi update data real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(generateSensorData())
      setIsOnline(Math.random() > 0.1) // 90% uptime
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getWeatherStatus = () => {
    if (sensorData.isRaining) {
      return {
        status: "Hujan",
        icon: <Cloud className="h-8 w-8 text-blue-500" />,
        color: "bg-blue-50 border-blue-200",
        recommendation: "Segera angkat jemuran!",
      }
    } else if (sensorData.lightIntensity > 70) {
      return {
        status: "Cerah",
        icon: <Sun className="h-8 w-8 text-yellow-500" />,
        color: "bg-yellow-50 border-yellow-200",
        recommendation: "Waktu yang tepat untuk menjemur",
      }
    } else {
      return {
        status: "Berawan",
        icon: <Cloud className="h-8 w-8 text-gray-500" />,
        color: "bg-gray-50 border-gray-200",
        recommendation: "Pantau kondisi cuaca",
      }
    }
  }

  const weather = getWeatherStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoring Jemuran IoT</h1>
            <p className="text-gray-600">Sistem pemantauan cuaca real-time untuk jemuran pintar</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <span className="text-sm text-gray-500">Update: {sensorData.timestamp}</span>
          </div>
        </div>

        {/* Alert untuk kondisi hujan */}
        {sensorData.isRaining && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Peringatan Hujan!</strong> Segera angkat jemuran Anda untuk menghindari basah.
            </AlertDescription>
          </Alert>
        )}

        {/* Status Cuaca Utama */}
        <Card className={`${weather.color} border-2`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {weather.icon}
                <div>
                  <CardTitle className="text-2xl">{weather.status}</CardTitle>
                  <CardDescription className="text-lg font-medium">{weather.recommendation}</CardDescription>
                </div>
              </div>
              <Button variant={sensorData.isRaining ? "destructive" : "default"} size="lg">
                {sensorData.isRaining ? "Angkat Jemuran" : "Jemur Sekarang"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Sensor Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Temperature */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suhu</CardTitle>
              <Thermometer className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.temperature}°C</div>
              <Progress value={((sensorData.temperature - 20) * 100) / 15} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {sensorData.temperature > 30 ? "Panas" : sensorData.temperature > 25 ? "Hangat" : "Sejuk"}
              </p>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kelembaban</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.humidity}%</div>
              <Progress value={sensorData.humidity} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {sensorData.humidity > 70 ? "Lembab" : sensorData.humidity > 50 ? "Normal" : "Kering"}
              </p>
            </CardContent>
          </Card>

          {/* Light Intensity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Intensitas Cahaya</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.lightIntensity}%</div>
              <Progress value={sensorData.lightIntensity} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {sensorData.lightIntensity > 80 ? "Sangat Terang" : sensorData.lightIntensity > 50 ? "Terang" : "Redup"}
              </p>
            </CardContent>
          </Card>

          {/* Rain Level */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level Hujan</CardTitle>
              <Zap className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.rainLevel}%</div>
              <Progress value={sensorData.rainLevel} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {sensorData.rainLevel > 70 ? "Hujan Deras" : sensorData.rainLevel > 30 ? "Hujan Ringan" : "Tidak Hujan"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Historical Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Suhu & Kelembaban</CardTitle>
              <CardDescription>Data 6 jam terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  temp: {
                    label: "Suhu (°C)",
                    color: "hsl(var(--chart-1))",
                  },
                  humidity: {
                    label: "Kelembaban (%)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="var(--color-temp)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-temp)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="var(--color-humidity)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-humidity)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grafik Intensitas Cahaya</CardTitle>
              <CardDescription>Tingkat pencahayaan sepanjang hari</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  light: {
                    label: "Cahaya (%)",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="light"
                      stroke="var(--color-light)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-light)" }}
                      fill="var(--color-light)"
                      fillOpacity={0.1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Rekomendasi */}
        <Card>
          <CardHeader>
            <CardTitle>Rekomendasi Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Sun className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Waktu Optimal Menjemur</h4>
                  <p className="text-sm text-green-700">10:00 - 15:00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Cloud className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Prediksi Cuaca</h4>
                  <p className="text-sm text-blue-700">
                    {sensorData.isRaining ? "Hujan berlanjut" : "Cerah hingga sore"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900">Status Jemuran</h4>
                  <p className="text-sm text-orange-700">{sensorData.isRaining ? "Segera angkat!" : "Aman dijemur"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
