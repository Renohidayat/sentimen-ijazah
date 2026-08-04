#!/bin/bash
cd "$(dirname "$0")"

echo "========================================"
echo "Sentimen Ijazah - Backend Local Setup"
echo "========================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "[1/3] Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
else
    echo "[1/3] Activating virtual environment..."
    source venv/bin/activate
fi

echo "[2/3] Installing dependencies..."
pip install -r requirements.txt --quiet

echo ""
echo "[3/3] Starting server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
