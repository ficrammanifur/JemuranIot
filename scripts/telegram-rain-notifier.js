import { initializeApp } from "firebase/app"
import { getDatabase, ref, onValue, serverTimestamp, set } from "firebase/database"
import fetch from "node-fetch"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-db-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "your-app-id",
}

// Telegram Configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN"
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "123456789"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// State tracking
let lastRainStatus = false
let lastNotificationTime = 0
let isConnected = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000 // 5 minutes cooldown

// Logging function
function log(level, message, data = null) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

  console.log(logMessage)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }

  // Optional: Save logs to Firebase
  if (isConnected) {
    const logRef = ref(db, `jemuran/logs/${Date.now()}`)
    set(logRef, {
      timestamp: serverTimestamp(),
      level,
      message,
      data: data || null,
    }).catch((err) => console.error("Failed to save log:", err))
  }
}

// Send Telegram notification
async function sendTelegramAlert(message, options = {}) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
      disable_notification: options.silent || false,
      ...options,
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Jemuran-IoT-Bot/1.0",
      },
      body: JSON.stringify(payload),
      timeout: 10000, // 10 second timeout
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.ok) {
      log("info", "Telegram notification sent successfully", { message })
      return true
    } else {
      throw new Error(`Telegram API returned error: ${result.description}`)
    }
  } catch (error) {
    log("error", "Failed to send Telegram notification", {
      error: error.message,
      message,
    })
    return false
  }
}

// Process weather data
function processWeatherData(data) {
  if (!data) {
    log("warn", "No weather data received")
    return
  }

  // Get latest data entry
  const entries = Object.entries(data)
  if (entries.length === 0) {
    log("warn", "Weather data is empty")
    return
  }

  // Sort by timestamp and get latest
  const sortedEntries = entries.sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
  const [timestamp, latest] = sortedEntries[0]

  log("debug", "Processing weather data", {
    timestamp,
    data: latest,
    totalEntries: entries.length,
  })

  // Check for rain detection
  const isRaining = latest?.isRaining || latest?.rain || false
  const rainLevel = latest?.rainLevel || 0
  const temperature = latest?.temperature || 0
  const humidity = latest?.humidity || 0

  // Rain detection logic
  if (isRaining && !lastRainStatus) {
    const now = Date.now()

    // Check cooldown period
    if (now - lastNotificationTime < NOTIFICATION_COOLDOWN) {
      log("info", "Rain detected but notification is in cooldown period")
      return
    }

    // Determine rain intensity
    let intensity = "ringan"
    let emoji = "🌦️"

    if (rainLevel > 70) {
      intensity = "deras"
      emoji = "⛈️"
    } else if (rainLevel > 40) {
      intensity = "sedang"
      emoji = "🌧️"
    }

    // Create detailed message
    const message = `
${emoji} <b>PERINGATAN HUJAN!</b>

🌧️ <b>Status:</b> Hujan ${intensity} terdeteksi
📊 <b>Level Hujan:</b> ${rainLevel}%
🌡️ <b>Suhu:</b> ${temperature}°C
💧 <b>Kelembaban:</b> ${humidity}%
⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID")}

⚠️ <b>Segera angkat jemuran Anda!</b>

#JemuranIoT #HujanAlert
    `.trim()

    // Send notification
    sendTelegramAlert(message).then((success) => {
      if (success) {
        lastNotificationTime = now

        // Update notification status in Firebase
        const notifRef = ref(db, `jemuran/notifications/${now}`)
        set(notifRef, {
          timestamp: serverTimestamp(),
          type: "rain_alert",
          sent: true,
          rainLevel,
          temperature,
          humidity,
          message,
        })
      }
    })
  } else if (!isRaining && lastRainStatus) {
    // Rain stopped
    const message = `
☀️ <b>Hujan Berhenti</b>

✅ Kondisi cuaca sudah membaik
🌡️ <b>Suhu:</b> ${temperature}°C
💧 <b>Kelembaban:</b> ${humidity}%
⏰ <b>Waktu:</b> ${new Date().toLocaleString("id-ID")}

💡 Anda bisa mulai menjemur kembali!

#JemuranIoT #CuacaCerah
    `.trim()

    sendTelegramAlert(message, { silent: true })
  }

  // Update last status
  lastRainStatus = isRaining

  // Update system status
  const statusRef = ref(db, "jemuran/system/status")
  set(statusRef, {
    lastUpdate: serverTimestamp(),
    isOnline: true,
    lastRainStatus: isRaining,
    workerVersion: "1.0.0",
  })
}

// Connection error handler
function handleConnectionError(error) {
  log("error", "Firebase connection error", { error: error.message })
  isConnected = false

  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Exponential backoff

    log(
      "info",
      `Attempting to reconnect in ${delay / 1000} seconds... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
    )

    setTimeout(() => {
      startMonitoring()
    }, delay)
  } else {
    log("error", "Max reconnection attempts reached. Manual intervention required.")

    // Send critical alert
    sendTelegramAlert(`
🚨 <b>SISTEM ERROR</b>

❌ Worker jemuran IoT terputus dari Firebase
🔄 Gagal reconnect setelah ${MAX_RECONNECT_ATTEMPTS} percobaan
⚠️ Monitoring hujan tidak aktif!

Silakan restart worker secara manual.

#JemuranIoT #SystemError
    `)
  }
}

// Start monitoring
function startMonitoring() {
  try {
    log("info", "Starting weather monitoring...")

    // Listen to Firebase data changes
    const weatherRef = ref(db, "jemuran/data")

    onValue(
      weatherRef,
      (snapshot) => {
        if (!isConnected) {
          isConnected = true
          reconnectAttempts = 0
          log("info", "Successfully connected to Firebase")

          // Send startup notification
          sendTelegramAlert(
            `
🟢 <b>Worker Started</b>

✅ Jemuran IoT monitoring aktif
📡 Terhubung ke Firebase
🤖 Bot Telegram siap
⏰ ${new Date().toLocaleString("id-ID")}

Sistem siap memantau cuaca!

#JemuranIoT #SystemOnline
        `,
            { silent: true },
          )
        }

        const data = snapshot.val()
        processWeatherData(data)
      },
      handleConnectionError,
    )

    // Health check every 5 minutes
    setInterval(
      () => {
        if (isConnected) {
          const healthRef = ref(db, "jemuran/system/health")
          set(healthRef, {
            timestamp: serverTimestamp(),
            status: "healthy",
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid,
          })
        }
      },
      5 * 60 * 1000,
    )
  } catch (error) {
    log("error", "Failed to start monitoring", { error: error.message })
    handleConnectionError(error)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  log("info", "Shutting down worker...")

  if (isConnected) {
    const statusRef = ref(db, "jemuran/system/status")
    await set(statusRef, {
      lastUpdate: serverTimestamp(),
      isOnline: false,
      shutdownTime: serverTimestamp(),
    })

    await sendTelegramAlert(
      `
🔴 <b>Worker Stopped</b>

⏹️ Jemuran IoT monitoring dihentikan
⏰ ${new Date().toLocaleString("id-ID")}

⚠️ Monitoring hujan tidak aktif!

#JemuranIoT #SystemOffline
    `,
      { silent: true },
    )
  }

  process.exit(0)
})

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  log("error", "Uncaught exception", { error: error.message, stack: error.stack })

  sendTelegramAlert(`
🚨 <b>CRITICAL ERROR</b>

💥 Worker mengalami error fatal
📝 ${error.message}
⏰ ${new Date().toLocaleString("id-ID")}

Worker akan restart otomatis.

#JemuranIoT #CriticalError
  `)

  process.exit(1)
})

// Start the worker
log("info", "Initializing Jemuran IoT Rain Notification Worker v1.0.0")
log("info", "Configuration loaded", {
  firebaseProject: firebaseConfig.projectId,
  telegramConfigured: !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID,
})

startMonitoring()
