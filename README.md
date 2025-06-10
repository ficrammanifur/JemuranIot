# Jemuran IoT - Rain Notification Worker

Worker Node.js untuk mengirim notifikasi Telegram ketika hujan terdeteksi pada sistem Jemuran IoT.

## 🚀 Fitur

- ✅ **Real-time monitoring** data cuaca dari Firebase
- 🌧️ **Deteksi hujan otomatis** dengan level intensitas
- 📱 **Notifikasi Telegram** dengan format rich text
- 🔄 **Auto-reconnect** jika koneksi terputus
- 📊 **Health monitoring** dan logging
- ⏰ **Cooldown system** untuk mencegah spam notifikasi
- 🛡️ **Error handling** yang robust

## 📋 Prerequisites

- Node.js 18+
- Firebase Realtime Database
- Telegram Bot Token
- Chat ID Telegram

## 🔧 Setup

1. **Clone dan install dependencies:**
\`\`\`bash
npm install
\`\`\`

2. **Setup environment variables:**
\`\`\`bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
\`\`\`

3. **Konfigurasi Firebase:**
   - Buat project di Firebase Console
   - Enable Realtime Database
   - Copy konfigurasi ke .env

4. **Setup Telegram Bot:**
   - Chat dengan @BotFather di Telegram
   - Buat bot baru dengan `/newbot`
   - Copy token ke .env
   - Dapatkan Chat ID dengan chat ke bot Anda

5. **Jalankan worker:**
\`\`\`bash
npm start
\`\`\`

## 📊 Struktur Data Firebase

\`\`\`json
{
  "jemuran": {
    "data": {
      "timestamp": {
        "isRaining": true,
        "rainLevel": 75,
        "temperature": 26.5,
        "humidity": 80,
        "lightIntensity": 30,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    },
    "system": {
      "status": {
        "isOnline": true,
        "lastUpdate": "timestamp",
        "lastRainStatus": false
      }
    }
  }
}
\`\`\`

## 🔔 Format Notifikasi

**Saat Hujan Terdeteksi:**
\`\`\`
⛈️ PERINGATAN HUJAN!

🌧️ Status: Hujan deras terdeteksi
📊 Level Hujan: 75%
🌡️ Suhu: 26.5°C
💧 Kelembaban: 80%
⏰ Waktu: 15/01/2024 10:30:00

⚠️ Segera angkat jemuran Anda!
\`\`\`

## 🛠️ Monitoring

Worker menyediakan:
- **Health check** setiap 5 menit
- **System logs** tersimpan di Firebase
- **Status monitoring** real-time
- **Error alerts** via Telegram

## 🚀 Production Deployment

Untuk production, gunakan process manager seperti PM2:

\`\`\`bash
npm install -g pm2
pm2 start scripts/telegram-rain-notifier.js --name "jemuran-worker"
pm2 startup
pm2 save
\`\`\`

## 🔧 Troubleshooting

**Worker tidak terhubung ke Firebase:**
- Periksa konfigurasi Firebase di .env
- Pastikan Realtime Database rules mengizinkan read/write

**Notifikasi Telegram tidak terkirim:**
- Verifikasi Bot Token dan Chat ID
- Pastikan bot sudah di-start dengan `/start`
- Cek koneksi internet

**Data tidak ter-update:**
- Periksa struktur data di Firebase Console
- Pastikan sensor IoT mengirim data ke path yang benar
