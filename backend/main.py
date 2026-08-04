from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib, re, os, sys
from pathlib import Path
from typing import Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Logger setup untuk Cloud Run
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    _stemmer = StemmerFactory().create_stemmer()
    def stem(text): return _stemmer.stem(text)
except ImportError:
    def stem(text): return text

# Load models dengan error handling
BASE  = Path(__file__).parent / "models"
try:
    logger.info(f"Loading models from {BASE}")
    MODEL = joblib.load(BASE / "model_terbaik_final.pkl")
    TFIDF = joblib.load(BASE / "tfidf_vectorizer_final.pkl")
    logger.info("✓ Models loaded successfully")
except FileNotFoundError as e:
    logger.error(f"✗ Model file not found: {e}")
    sys.exit(1)
except Exception as e:
    logger.error(f"✗ Error loading models: {e}")
    sys.exit(1)

STOPWORDS = {
    "yang","di","dan","ke","dari","untuk","ini","itu","dengan","adalah",
    "pada","juga","akan","tidak","bisa","dalam","sudah","ada","kita",
    "saya","anda","dia","mereka","kami","kamu","karena","tapi","atau",
    "lebih","setelah","saat","oleh","jadi","bukan","namun","agar","atas",
    "lagi","ya","pun","nya","gak","ga","yg","lah","deh","dong",
}

def preprocess(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"@\w+|#\w+", " ", text)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    tokens = [stem(t) for t in text.split() if t not in STOPWORDS and len(t) > 2]
    return " ".join(tokens)

app = FastAPI(title="Sentimen Ijazah API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 50)
    logger.info("Sentimen Ijazah API Starting Up")
    logger.info(f"Environment: {os.getenv('ENV', 'development')}")
    logger.info("=" * 50)

class PredictRequest(BaseModel):
    text: str

class PredictResponse(BaseModel):
    text_asli: str
    text_proses: str
    label: str
    confidence: dict

STATS_DATA = {
    "total_komentar": 2561,
    "distribusi_label": {"Negatif": 1711, "Positif": 576, "Netral": 274},
    "distribusi_persen": {"Negatif": 66.81, "Positif": 22.49, "Netral": 10.70},
    "per_video": [
        {"video_id":"czY6MUhd1X0","judul":"Tunjukkan Ijazah Jokowi, Labfor: Ini Asli","channel":"Metro TV","tipe":"Pro","Negatif":237,"Netral":44,"Positif":95,"total":376},
        {"video_id":"VopaDB5Oy_8","judul":"FULL Ijazah Asli Jokowi Muncul, Roy Suryo CS ke Penjara?","channel":"Official iNews","tipe":"Pro","Negatif":275,"Netral":32,"Positif":68,"total":375},
        {"video_id":"5btOJ_Wru2k","judul":"Membongkar Sosok 'Bohir' Kasus Ijazah Jokowi","channel":"Official iNews","tipe":"Pro","Negatif":175,"Netral":24,"Positif":42,"total":241},
        {"video_id":"uYv02O38LCk","judul":"Membongkar Uang Besar Kasus Ijazah Jokowi","channel":"Official iNews","tipe":"Pro","Negatif":182,"Netral":34,"Positif":40,"total":256},
        {"video_id":"yU3TPooccKI","judul":"Jawab Polda Metro soal Arsip Ijazah Jokowi","channel":"Kompas TV Jatim","tipe":"Pro","Negatif":175,"Netral":37,"Positif":98,"total":310},
        {"video_id":"XJgFJn-P870","judul":"IJAZAH JOKOWI: POLEMIK TANPA AKHIR","channel":"Indonesia Lawyers Club","tipe":"Netral","Negatif":220,"Netral":43,"Positif":93,"total":356},
        {"video_id":"kfe9i9CYqGc","judul":"KHOZINUDIN: JAKSA HENTIKAN KASUS IJAZAH JOKOWI","channel":"Forum Keadilan TV","tipe":"Kontra","Negatif":96,"Netral":8,"Positif":38,"total":142},
        {"video_id":"6qPRXIbfRJs","judul":"Pro-Kontra Ijazah Asli atau Palsu Hal Wajar","channel":"tvOneNews","tipe":"Kontra","Negatif":60,"Netral":14,"Positif":17,"total":91},
        {"video_id":"Sr-z1qGZ3Dw","judul":"Ada 'Orang Besar' di Balik Kasus Ijazah Jokowi?","channel":"tvOneNews","tipe":"Kontra","Negatif":62,"Netral":10,"Positif":18,"total":90},
        {"video_id":"M3iBgzB6yL0","judul":"DEBAT PANAS Massa Pro & Kontra Ijazah Palsu Jokowi","channel":"Tribun Jatim","tipe":"Kontra","Negatif":182,"Netral":15,"Positif":47,"total":244},
        {"video_id":"ojUXWQV9bdM","judul":"Ijazah Jokowi Asli atau Palsu: Tanggapan Publik","channel":"KOMPAS TV","tipe":"Kontra","Negatif":47,"Netral":13,"Positif":20,"total":80},
    ],
    "percentage_agreement": {
        "A1_A2":96.0,"A1_A3":92.0,"A2_A3":88.0,"rata_rata":92.0,
        "cohen_kappa":{"A1_A2":0.9326,"A1_A3":0.8632,"A2_A3":0.7935,"rata_rata":0.8631},
        "fleiss_kappa":{"nilai":0.8635,"interpretasi":"Hampir Sempurna"},
    },
}

MODEL_DATA = {
    "model_terbaik":{"nama":"SVM-RBF (Baseline)","akurasi":75.24,"presisi":72.58,"recall":75.24,"f1":73.46,"cv_f1":68.21,"best_params":{"C":10,"gamma":0.1,"kernel":"rbf"}},
    "semua_model":[
        {"nama":"SVM-RBF (Baseline)","akurasi":75.24,"presisi":72.58,"recall":75.24,"f1":73.46,"cv_f1":68.21,"terbaik":True},
        {"nama":"SVM-RBF + SMOTE","akurasi":73.68,"presisi":72.79,"recall":73.68,"f1":68.16,"cv_f1":95.27,"terbaik":False},
        {"nama":"LinearSVC (Baseline)","akurasi":75.24,"presisi":72.15,"recall":75.24,"f1":72.90,"cv_f1":69.07,"terbaik":False},
        {"nama":"LinearSVC + SMOTE","akurasi":72.32,"presisi":70.00,"recall":72.32,"f1":70.86,"cv_f1":93.14,"terbaik":False},
    ],
    "confusion_matrix":{
        "labels":["Negatif","Netral","Positif"],
        "matrix":[[312,16,15],[29,10,16],[43,8,64]],
        "persen":[[91.0,4.7,4.4],[52.7,18.2,29.1],[37.4,7.0,55.7]],
    },
    "pola_misklasifikasi":[
        {"pola":"Positif→Negatif","jumlah":43},
        {"pola":"Netral→Negatif","jumlah":29},
        {"pola":"Negatif→Netral","jumlah":16},
        {"pola":"Netral→Positif","jumlah":16},
        {"pola":"Negatif→Positif","jumlah":15},
        {"pola":"Positif→Netral","jumlah":8},
    ],
    "penelitian_terdahulu":[
        {"peneliti":"M. Reno Hidayat (2025)","metode":"SVM-RBF Baseline","akurasi":75.24,"f1":73.46,"ini":True},
        {"peneliti":"Rahmadhani et al. (2025)","metode":"SVM + TF-IDF","akurasi":81.60,"f1":80.90,"ini":False},
        {"peneliti":"Putro & Hendrawan (2025)","metode":"SVM + TF-IDF","akurasi":83.00,"f1":82.00,"ini":False},
        {"peneliti":"Santoso et al. (2024)","metode":"SVM","akurasi":85.00,"f1":84.00,"ini":False},
        {"peneliti":"Saputra & Isnain (2024)","metode":"CNN","akurasi":91.00,"f1":90.00,"ini":False},
    ],
}

@app.get("/")
def root(): return {"message":"Sentimen Ijazah API v1.0 aktif"}

@app.get("/health")
def health(): return {"status":"ok","model":"SVM-RBF Baseline"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not req.text.strip():
        raise HTTPException(400, "Teks tidak boleh kosong")
    processed = preprocess(req.text)
    if not processed.strip():
        raise HTTPException(422, "Teks tidak dapat diproses")
    vec   = TFIDF.transform([processed])
    label = MODEL.predict(vec)[0]
    try:
        proba = MODEL.predict_proba(vec)[0]
        confidence = {c:round(float(p)*100,2) for c,p in zip(MODEL.classes_, proba)}
    except AttributeError:
        confidence = {label:100.0}
    return PredictResponse(text_asli=req.text, text_proses=processed, label=label, confidence=confidence)

@app.get("/stats")           
def stats(): return STATS_DATA
@app.get("/stats/video")     
def stats_video(): return STATS_DATA["per_video"]
@app.get("/stats/agreement") 
def stats_agreement(): return STATS_DATA["percentage_agreement"]
@app.get("/model")           
def model_info(): return MODEL_DATA
@app.get("/model/comparison")
def model_comparison(): return MODEL_DATA["semua_model"]
@app.get("/model/confusion") 
def model_confusion(): return MODEL_DATA["confusion_matrix"]
@app.get("/model/terdahulu") 
def model_terdahulu(): return MODEL_DATA["penelitian_terdahulu"]

# ── Analisis Video ─────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    video_id: str
    max_comments: Optional[int] = 200

class CommentResult(BaseModel):
    comment_id: str
    text: str
    text_proses: str
    label: str
    confidence: dict
    like_count: int
    author: str

class VideoInfo(BaseModel):
    video_id: str
    title: str
    channel: str
    thumbnail: str
    view_count: str
    comment_count: str

class AnalysisResponse(BaseModel):
    video_info: VideoInfo
    total_analyzed: int
    distribusi: dict
    distribusi_persen: dict
    comments: list[CommentResult]

def _extract_video_id(raw: str) -> str:
    """Ekstrak video ID dari berbagai format URL YouTube atau ID langsung."""
    raw = raw.strip()
    patterns = [
        r'(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})',
    ]
    for pat in patterns:
        m = re.search(pat, raw)
        if m:
            return m.group(1)
    # Jika panjang 11 karakter alphanumeric/dash/underscore, anggap langsung video_id
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', raw):
        return raw
    raise ValueError(f"Tidak dapat mengekstrak video ID dari: {raw}")

@app.post("/analyze-video", response_model=AnalysisResponse)
def analyze_video(req: AnalysisRequest):
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        raise HTTPException(503, "YOUTUBE_API_KEY tidak dikonfigurasi di server")

    # Ekstrak video ID
    try:
        vid = _extract_video_id(req.video_id)
    except ValueError as e:
        raise HTTPException(400, str(e))

    max_comments = max(10, min(req.max_comments or 200, 500))

    try:
        yt = build("youtube", "v3", developerKey=api_key, cache_discovery=False)

        # Ambil info video
        video_resp = yt.videos().list(
            part="snippet,statistics",
            id=vid
        ).execute()

        if not video_resp.get("items"):
            raise HTTPException(404, f"Video '{vid}' tidak ditemukan atau privat")

        snippet    = video_resp["items"][0]["snippet"]
        statistics = video_resp["items"][0].get("statistics", {})

        thumbnails = snippet.get("thumbnails", {})
        thumb_url  = (
            thumbnails.get("high", {}).get("url") or
            thumbnails.get("medium", {}).get("url") or
            thumbnails.get("default", {}).get("url") or
            f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"
        )

        video_info = VideoInfo(
            video_id=vid,
            title=snippet.get("title", ""),
            channel=snippet.get("channelTitle", ""),
            thumbnail=thumb_url,
            view_count=statistics.get("viewCount", "0"),
            comment_count=statistics.get("commentCount", "0"),
        )

        # Ambil komentar dengan pagination
        raw_comments = []
        page_token   = None

        while len(raw_comments) < max_comments:
            batch_size = min(100, max_comments - len(raw_comments))
            kwargs = dict(
                part="snippet",
                videoId=vid,
                maxResults=batch_size,
                textFormat="plainText",
                order="relevance",
            )
            if page_token:
                kwargs["pageToken"] = page_token

            try:
                resp = yt.commentThreads().list(**kwargs).execute()
            except HttpError as e:
                if e.resp.status == 403:
                    raise HTTPException(403, "Komentar dinonaktifkan atau video dibatasi")
                raise

            for item in resp.get("items", []):
                top = item["snippet"]["topLevelComment"]["snippet"]
                raw_comments.append({
                    "id":    item["id"],
                    "text":  top.get("textDisplay", ""),
                    "likes": int(top.get("likeCount", 0)),
                    "author": top.get("authorDisplayName", ""),
                })

            page_token = resp.get("nextPageToken")
            if not page_token:
                break

    except HTTPException:
        raise
    except HttpError as e:
        logger.error(f"YouTube API error: {e}")
        raise HTTPException(502, f"YouTube API error: {e.reason}")
    except Exception as e:
        logger.error(f"analyze_video error: {e}")
        raise HTTPException(500, str(e))

    # Klasifikasi setiap komentar
    results: list[CommentResult] = []
    distribusi = {"Positif": 0, "Negatif": 0, "Netral": 0}

    for c in raw_comments:
        text = c["text"]
        processed = preprocess(text)
        if not processed.strip():
            processed = text[:200]  # fallback agar tidak kosong

        try:
            vec   = TFIDF.transform([processed])
            label = MODEL.predict(vec)[0]
            try:
                proba      = MODEL.predict_proba(vec)[0]
                confidence = {cls: round(float(p)*100, 2) for cls, p in zip(MODEL.classes_, proba)}
            except AttributeError:
                confidence = {label: 100.0}
        except Exception:
            label      = "Netral"
            confidence = {"Netral": 100.0}

        distribusi[label] = distribusi.get(label, 0) + 1

        results.append(CommentResult(
            comment_id=c["id"],
            text=text,
            text_proses=processed,
            label=label,
            confidence=confidence,
            like_count=c["likes"],
            author=c["author"],
        ))

    total = len(results)
    persen = {
        k: round(v / total * 100, 2) if total > 0 else 0.0
        for k, v in distribusi.items()
    }

    return AnalysisResponse(
        video_info=video_info,
        total_analyzed=total,
        distribusi=distribusi,
        distribusi_persen=persen,
        comments=results,
    )

