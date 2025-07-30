<h1 align="center">🌧️ Jemuran IoT - Rain Notification Worker</h1>

<p align="center">Worker Node.js untuk mengirim notifikasi Telegram ketika hujan terdeteksi pada sistem Jemuran IoT.</p>

<p align="center">
  <img src="https://img.shields.io/badge/last%20commit-today-brightgreen" />
  <img src="https://img.shields.io/badge/language-JavaScript-yellow" />
  <img src="https://img.shields.io/badge/runtime-Node.js%2018%2B-green" />
  <img src="https://img.shields.io/badge/database-Firebase-orange" />
  <img src="https://img.shields.io/badge/notification-Telegram-blue" />
  <img src="https://img.shields.io/badge/platform-IoT-informational" />
</p>

---

## 🚀 Fitur

- ✅ **Real-time monitoring** data cuaca dari Firebase
- 🌧️ **Deteksi hujan otomatis** dengan level intensitas
- 📱 **Notifikasi Telegram** dengan format rich text
- 🔄 **Auto-reconnect** jika koneksi terputus
- 📊 **Health monitoring** dan logging
- ⏰ **Cooldown system** untuk mencegah spam notifikasi
- 🛡️ **Error handling** yang robust

---

## 📋 Prerequisites

- **Node.js 18+**
- **Firebase Realtime Database**
- **Telegram Bot Token**
- **Chat ID Telegram**

---

## 🔧 Setup

### 1. Clone dan install dependencies:

```bash
git clone <repository-url>
cd jemuran-iot-worker
npm install
```

### 2. Setup environment variables:

```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

**Contoh file `.env`:**

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Worker Configuration
COOLDOWN_MINUTES=5
HEALTH_CHECK_INTERVAL=300000
```

### 3. Konfigurasi Firebase:

- Buat project di [Firebase Console](https://console.firebase.google.com/)
- Enable Realtime Database
- Copy konfigurasi ke `.env`
- Set database rules:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 4. Setup Telegram Bot:

1. Chat dengan [@BotFather](https://t.me/BotFather) di Telegram
2. Buat bot baru dengan `/newbot`
3. Copy token ke `.env`
4. Dapatkan Chat ID dengan chat ke bot Anda
5. Start bot dengan `/start`

### 5. Jalankan worker:

```bash
npm start
```

---

## 📊 Struktur Data Firebase

```json
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
```

---

## 🔔 Format Notifikasi

### Saat Hujan Terdeteksi:

```
⛈️ PERINGATAN HUJAN!

🌧️ Status: Hujan deras terdeteksi
📊 Level Hujan: 75%
🌡️ Suhu: 26.5°C
💧 Kelembaban: 80%
⏰ Waktu: 15/01/2024 10:30:00

⚠️ Segera angkat jemuran Anda!
```

### Saat Hujan Berhenti:

```
☀️ HUJAN TELAH BERHENTI

🌤️ Status: Cuaca cerah
📊 Level Hujan: 0%
🌡️ Suhu: 28.2°C
💧 Kelembaban: 65%
⏰ Waktu: 15/01/2024 11:15:00

✅ Aman untuk menjemur kembali!
```

---

## 🛠️ Monitoring

Worker menyediakan:

- **Health check** setiap 5 menit
- **System logs** tersimpan di Firebase
- **Status monitoring** real-time
- **Error alerts** via Telegram

### Log Structure:

```json
{
  "logs": {
    "timestamp": {
      "level": "info|warn|error",
      "message": "Log message",
      "timestamp": "ISO string",
      "data": {}
    }
  }
}
```

---

## 📁 Struktur Project

```
jemuran-iot-worker/
├── src/
│   ├── config/
│   │   ├── firebase.js
│   │   └── telegram.js
│   ├── services/
│   │   ├── weatherMonitor.js
│   │   ├── notificationService.js
│   │   └── healthCheck.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── formatter.js
│   └── index.js
├── scripts/
│   └── telegram-rain-notifier.js
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Production Deployment

### Menggunakan PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start worker dengan PM2
pm2 start scripts/telegram-rain-notifier.js --name "jemuran-worker"

# Setup auto-start on boot
pm2 startup
pm2 save

# Monitor logs
pm2 logs jemuran-worker

# Restart worker
pm2 restart jemuran-worker
```

### Menggunakan Docker:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "start"]
```

```bash
# Build dan run container
docker build -t jemuran-worker .
docker run -d --name jemuran-worker --env-file .env jemuran-worker
```

---

## 🔧 Troubleshooting

### Worker tidak terhubung ke Firebase:
- Periksa konfigurasi Firebase di `.env`
- Pastikan Realtime Database rules mengizinkan read/write
- Verifikasi koneksi internet

### Notifikasi Telegram tidak terkirim:
- Verifikasi Bot Token dan Chat ID
- Pastikan bot sudah di-start dengan `/start`
- Cek koneksi internet
- Test dengan curl:

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{"chat_id": "<CHAT_ID>", "text": "Test message"}'
```

### Data tidak ter-update:
- Periksa struktur data di Firebase Console
- Pastikan sensor IoT mengirim data ke path yang benar
- Cek timestamp format (harus ISO string)

### Memory leak atau high CPU usage:
- Monitor dengan `pm2 monit`
- Restart worker secara berkala
- Periksa log untuk error patterns

---

## 📊 API Endpoints

### Health Check:
```
GET /health
Response: {"status": "ok", "uptime": 12345, "lastCheck": "timestamp"}
```

### Manual Notification Test:
```
POST /test-notification
Body: {"type": "rain|clear", "data": {...}}
```

---

## 🔮 Roadmap

- [ ] Web dashboard untuk monitoring
- [ ] Multiple notification channels (WhatsApp, Email)
- [ ] Weather forecast integration
- [ ] Machine learning untuk prediksi cuaca
- [ ] Mobile app companion
- [ ] Multi-location support

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**  
- GitHub: https://github.com/ficrammanifur
- Email: ficramm@gmail.com

<div align="center">

**⭐ Star this repository if you find it helpful!**

<p><a href="#top">⬆ Kembali ke Atas</a></p>

</div>
