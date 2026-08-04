FROM python:3.11-slim

WORKDIR /app

# Copy requirements first untuk leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy aplikasi dan models
COPY . .

# Cloud Run / Railway menggunakan env variable PORT
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
