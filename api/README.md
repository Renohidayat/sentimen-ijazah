# Sentimen Ijazah - Backend API

FastAPI server untuk analisis sentimen komentar video YouTube tentang Ijazah Jokowi.

## 📋 Prerequisites

- Python 3.11+
- pip (Python package manager)

## 🚀 Quick Start (Development)

### Windows (PowerShell)

```powershell
# 1. Navigate to backend folder
cd backend

# 2. Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Or simply double-click:** `run_local.bat`

### Linux/Mac (Terminal)

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Or run:** `bash run_local.sh`

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root message |
| GET | `/health` | Health check |
| POST | `/predict` | Prediksi sentimen |
| GET | `/stats` | Statistik lengkap |
| GET | `/stats/video` | Distribusi per video |
| GET | `/stats/agreement` | PA & Kappa anotator |
| GET | `/model` | Info model |
| GET | `/model/comparison` | Perbandingan 4 varian |
| GET | `/model/confusion` | Confusion matrix |
| GET | `/model/terdahulu` | Penelitian terdahulu |

---

## 📝 Example Usage

### Test Health
```bash
curl http://localhost:8000/health
```

### Predict Sentimen
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"text":"Ijazah jokowi ini bagus sekali"}'
```

Response:
```json
{
  "text_asli": "Ijazah jokowi ini bagus sekali",
  "text_proses": "ijazah jokowi bagus",
  "label": "Positif",
  "confidence": {
    "Negatif": 15.23,
    "Netral": 8.45,
    "Positif": 76.32
  }
}
```

---

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t sentimen-ijazah:latest .
```

### Run Container
```bash
docker run -p 8080:8080 sentimen-ijazah:latest
```

### Push to Cloud Run
```bash
gcloud run deploy penilaian-sentimen-api \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated
```

---

## 📦 Requirements

See `requirements.txt` untuk daftar lengkap dependencies:

- FastAPI 0.111.0
- Uvicorn 0.29.0
- Pydantic 2.7.1
- scikit-learn 1.5.0
- numpy 1.26.4
- joblib 1.4.2
- PySastrawi 1.2.0

---

## 📁 Project Structure

```
backend/
├── main.py                      # Main FastAPI app
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Docker build config
├── .dockerignore               # Docker ignore file
├── .gitignore                  # Git ignore file
├── models/
│   ├── model_terbaik_final.pkl       # Trained model
│   └── tfidf_vectorizer_final.pkl    # TF-IDF vectorizer
├── run_local.bat               # Windows quick start
└── run_local.sh                # Linux/Mac quick start
```

---

## 🔧 Environment Variables (Cloud Run)

- `PORT` - Server port (default: 8080)
- `ENV` - Environment (default: production)

---

## 📊 Model Info

- **Algorithm:** SVM-RBF (Baseline)
- **Accuracy:** 75.24%
- **F1-Score:** 73.46%
- **Labels:** Negatif, Netral, Positif
- **Training Data:** 2,561 comments

---

## 🐛 Troubleshooting

### Models not found
```
Error: FileNotFoundError: model_terbaik_final.pkl not found
```
**Fix:** Pastikan models folder ada dengan pkl files di dalamnya.

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

### Import errors
```bash
pip install -r requirements.txt --force-reinstall
```

---

## 📞 Support

Untuk bantuan, lihat:
- [DEPLOY.md](../DEPLOY.md) - Panduan deploy lengkap
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Checklist deployment

---

**Happy coding! 🎉**
