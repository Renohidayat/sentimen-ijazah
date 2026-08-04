# 📊 Sentimen Ijazah - Analisis Sentimen Media Sosial

[![Status](https://img.shields.io/badge/Status-Vercel%20Unified%20%E2%9C%93-success)](https://sentimen-ijazah.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

Sistem analisis sentimen berbasis Machine Learning untuk menganalisis komentar YouTube tentang isu ijazah Presiden Jokowi. Menggunakan algoritma **SVM-RBF** dengan pre-processing teks bahasa Indonesia menggunakan **PySastrawi**.

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Instalasi](#instalasi)
- [Penggunaan](#penggunaan)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Struktur Project](#struktur-project)
- [Metodologi](#metodologi)
- [Penelitian Terkait](#penelitian-terkait)
- [Kontributor](#kontributor)

---

## ✨ Fitur

### 🎯 Core Features
- **Prediksi Sentimen Real-time** - Analisis sentimen teks baru secara instant
- **Dashboard Statistik** - Visualisasi distribusi sentimen dari 2,561 data labeled
- **Per-Video Analytics** - Breakdown sentimen untuk setiap video YouTube
- **Model Evaluation** - Confusion matrix, accuracy, precision, recall, F1-score
- **Annotator Agreement** - Calculation PA & Cohen/Fleiss Kappa

### 📊 Analytics
- Distribusi sentimen: Negatif (66.81%), Positif (22.49%), Netral (10.70%)
- 11 video viral dari berbagai channel (Metro TV, iNews, tvOneNews, dll)
- Analisis per-channel dan per-tipe (Pro, Netral, Kontra)
- Comparison dengan 4 varian model (SVM-RBF, LinearSVC, dengan/tanpa SMOTE)

### 🎨 UI/UX
- Responsive design (mobile, tablet, desktop)
- Interactive charts dengan Recharts
- Multi-halaman (Dashboard, Predict, Stats, Methodology, About)
- Dark/Light theme support

---

## 🛠️ Tech Stack

### **Backend**
```
FastAPI 0.111.0        - Web framework
Uvicorn 0.29.0         - ASGI server
scikit-learn 1.5.0     - Machine Learning
numpy 1.26.4           - Numerical computing
joblib 1.4.2           - Model serialization
PySastrawi 1.2.0       - Stemming bahasa Indonesia
Pydantic 2.7.1         - Data validation
```

### **Frontend**
```
React 18.2.0           - UI library
React Router 6.22.0    - Routing
Vite 5.2.0             - Build tool
Recharts 2.12.0        - Data visualization
Axios 1.6.0            - HTTP client
```

### **Deployment**
```
Vercel                 - Serverless Deployment (React + FastAPI Unified)
GitHub                 - Version control
```

### **ML Model**
```
Algorithm              - SVM with RBF Kernel
Training Data          - 2,048 samples (80%)
Testing Data           - 513 samples (20%)
Best Parameters        - C=10, gamma=0.1
Accuracy               - 75.24%
F1-Score               - 73.46%
```

---

## 📦 Instalasi

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- npm atau yarn
- Git

### **Local Setup (Unified)**

```bash
# 1. Install dependencies untuk frontend & root
npm install

# 2. Setup backend environment (opsional untuk API key)
echo "YOUTUBE_API_KEY=your_api_key_here" > api/.env
echo "ENV=development" >> api/.env

# 3. Jalankan backend (di tab terminal baru)
cd api
python -m venv venv
# Aktifkan venv: .\venv\Scripts\activate (Windows) atau source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
uvicorn index:app --reload --port 8000

# 4. Jalankan frontend (kembali ke root direktori, di tab terminal lain)
npm run dev
```

**Aplikasi berjalan di:**
- Frontend: `http://localhost:5173`
- API Backend: `http://localhost:8000` (diproxy via frontend `/api`)

---

## 🚀 Penggunaan

### **Via API (Backend)**

#### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "model": "SVM-RBF Baseline"
}
```

#### Prediksi Sentimen
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"ijazah jokowi ini sangat bagus"}'
```

Response:
```json
{
  "text_asli": "ijazah jokowi ini sangat bagus",
  "text_proses": "ijazah jokowi bagus",
  "label": "Positif",
  "confidence": {
    "Negatif": 15.23,
    "Netral": 8.45,
    "Positif": 76.32
  }
}
```

#### Dapatkan Statistik
```bash
curl http://localhost:8000/stats
curl http://localhost:8000/stats/video
curl http://localhost:8000/stats/agreement
curl http://localhost:8000/model
curl http://localhost:8000/model/confusion
```

### **Via Web Dashboard**

1. **Buka aplikasi** → `https://sentimen-ijazah-xxx.vercel.app`
2. **Navigasi:**
   - **Dashboard** - Statistik keseluruhan
   - **Predict** - Prediksi sentimen teks baru
   - **Evaluasi** - Performa model dan confusion matrix
   - **Metodologi** - Penjelasan workflow research
   - **Terdahulu** - Perbandingan dengan penelitian lain
   - **Video Sentimen** - Analisis per-video YouTube

---

## 🔌 API Documentation

### **Endpoints**

| Method | Endpoint | Deskripsi | Response |
|--------|----------|-----------|----------|
| GET | `/` | Welcome message | JSON |
| GET | `/health` | Health check | `{status, model}` |
| POST | `/predict` | Prediksi sentimen | `{text_asli, text_proses, label, confidence}` |
| GET | `/stats` | Statistik lengkap | Dataset stats |
| GET | `/stats/video` | Per-video breakdown | Array videos |
| GET | `/stats/agreement` | Annotator agreement | PA & Kappa scores |
| GET | `/model` | Model info | Model metadata |
| GET | `/model/comparison` | 4 model variants | Models comparison |
| GET | `/model/confusion` | Confusion matrix | Matrix & percentages |
| GET | `/model/terdahulu` | Penelitian terkait | Related research |

### **Request/Response Examples**

**Predict Request:**
```json
{
  "text": "ijazah jokowi ini asli atau palsu sih?"
}
```

**Predict Response:**
```json
{
  "text_asli": "ijazah jokowi ini asli atau palsu sih?",
  "text_proses": "ijazah jokowi asli palsu",
  "label": "Negatif",
  "confidence": {
    "Negatif": 68.5,
    "Netral": 20.3,
    "Positif": 11.2
  }
}
```

### **Error Handling**

- **400 Bad Request** - Text kosong atau tidak valid
- **422 Unprocessable Entity** - Text tidak bisa di-process
- **500 Internal Server Error** - Server error

---

## 🚢 Deployment

Aplikasi ini menggunakan arsitektur **Vercel Unified Serverless**, di mana **Frontend (React)** dan **Backend (FastAPI)** di-deploy bersamaan dalam satu repository di Vercel.

### **Cara Deploy ke Vercel**

1. Push seluruh kode ke repository GitHub Anda.
2. Buka [Vercel](https://vercel.com/new) dan import repository Anda.
3. Vercel akan mendeteksi project sebagai **Vite**.
4. Biarkan isian **Root Directory**, **Build Command**, dan **Output Directory** secara default (kosong).
5. Tambahkan Environment Variable di Vercel:
   - `YOUTUBE_API_KEY` = `(API Key YouTube Anda)`
6. Klik **Deploy**.

Vercel akan secara otomatis membangun React frontend dan mengubah folder `api/` menjadi endpoint serverless FastAPI berkat konfigurasi `vercel.json` yang sudah disiapkan.

### **Environment Variables**
```
YOUTUBE_API_KEY=AIzaSy... (Wajib untuk fitur Analisis Video)
```

---

## 📁 Struktur Project (Vercel Unified)

```
sentimen-ijazah/
├── README.md                          ← Project overview
├── vercel.json                        ← Vercel Serverless config
├── package.json                       ← Frontend dependencies
├── vite.config.js                     ← Vite config (termasuk proxy API)
├── index.html                         ← Entry HTML
│
├── api/                               ← FastAPI Backend (Serverless)
│   ├── index.py                       ← Main API app (Entrypoint Vercel)
│   ├── requirements.txt               ← Backend dependencies
│   ├── run_local.bat                  ← Quick start local script
│   ├── models/                        ← Trained ML models
│   │   ├── model_terbaik_final.pkl    ← SVM model
│   │   └── tfidf_vectorizer_final.pkl ← TF-IDF vectorizer
│   └── data/                          ← Training datasets
│
├── src/                               ← React Frontend Code
│   ├── main.jsx                       ← React entry
│   ├── App.jsx                        ← Main component
│   ├── api.js                         ← Axios config (baseURL: /api)
│   ├── components/                    ← Reusable components
│   └── pages/                         ← Page components
│
├── public/                            ← Static assets
└── node_modules/
```

---

## 📊 Metodologi Research

### **1. Data Collection (Scraping)**
- **Source:** YouTube API v3
- **Videos:** 11 viral videos (376-376 comments each)
- **Channels:** Metro TV, iNews, Kompas TV, tvOneNews, Tribun Jatim, ILC, Forum Keadilan, KOMPAS TV
- **Total:** 2,783 raw comments (Maret-April 2025)

### **2. Preprocessing**
- Case Folding → Stemming (PySastrawi) → Tokenization
- Stopword Removal → TF-IDF Vectorization (max 8K features)
- Result: 2,561 clean, labeled comments

### **3. Labeling (InSet Lexicon)**
- Automated: InSet Indonesian Sentiment Lexicon
- Manual Validation: 3 expert annotators
- **Agreement:** PA=92%, Fleiss' Kappa=0.8635 (Almost Perfect)
- **Distribution:** Negatif 1,711 | Positif 576 | Netral 274

### **4. Model Training**
- **Algorithm:** SVM with RBF Kernel
- **Train/Test:** 80/20 split (stratified, random_state=42)
- **Hyperparameter Tuning:** GridSearchCV 5-fold CV
- **Best Params:** C=10, gamma=0.1, kernel=rbf
- **Class Weight:** Balanced (for imbalanced data)

### **5. Evaluation**
- **Accuracy:** 75.24%
- **Precision:** 72.58%
- **Recall:** 75.24%
- **F1-Score:** 73.46%
- **CV F1-Score:** 68.21%

---

## 📚 Penelitian Terkait

| Peneliti | Metode | Akurasi | F1-Score | Tahun |
|----------|--------|---------|----------|------|
| **M. Reno Hidayat** ⭐ | SVM-RBF Baseline | 75.24% | 73.46% | 2025-2026 |
| Rahmadhani et al. | SVM + TF-IDF | 81.60% | 80.90% | 2025 |
| Putro & Hendrawan | SVM + TF-IDF | 83.00% | 82.00% | 2025 |
| Santoso et al. | SVM | 85.00% | 84.00% | 2024 |
| Saputra & Isnain | CNN | 91.00% | 90.00% | 2024 |

---

## 👨‍💻 Kontributor

### **Peneliti Utama**
- **M. Reno Hidayat**
  - ID: 220660121005
  - University: Universitas Sebelas April Sumedang
  - Email: hidayatreno085@gmail.com
  - GitHub: [@Renohidayat](https://github.com/Renohidayat)

### **Anotator Pakar**
- Annotator 1, 2, 3 (Universitas Sebelas April Sumedang)

---

## 📄 License

MIT License - Bebas digunakan untuk keperluan akademis dan komersial

---

## 🔗 Links

- **Live Application:** https://sentimen-ijazah.vercel.app
- **GitHub Repository:** https://github.com/Renohidayat/sentimen-ijazah

---

## 📞 Support & Issues

Jika ada pertanyaan atau bug:
1. **Check:** Existing issues di GitHub
2. **Create:** New issue dengan detail deskripsi
3. **Contact:** hidayatreno085@gmail.com

---

## 🎯 Roadmap

### ✅ Completed
- [x] Data collection & preprocessing
- [x] Model training & evaluation
- [x] API development (FastAPI)
- [x] Frontend dashboard (React)
- [x] Unified Deployment (Vercel Serverless)
- [x] Integrasi YouTube Data API v3

### 🔄 In Progress
- [ ] Add more video data
- [ ] Implement deep learning models (LSTM, BERT)
- [ ] Multi-language support

### 📋 Planned
- [ ] Mobile app (React Native)
- [ ] Real-time streaming analysis
- [ ] User authentication & custom models
- [ ] Export/download reports

---

## 🙏 Acknowledgments

- **YouTube API** - Data source
- **scikit-learn** - ML framework
- **FastAPI** - Backend framework
- **React & Vite** - Frontend tools
- **Vercel** - Unified Hosting Platform

---

**Happy Analyzing! 🎉**

*Last Updated: Agustus 2026*
