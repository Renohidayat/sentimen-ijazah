@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo Sentimen Ijazah - Backend Local Setup
echo ========================================
echo.

REM Load .env file jika ada
if exist ".env" (
    echo [0/3] Loading .env variables...
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" if not "%%A:~0,1%"=="#" (
            set "%%A=%%B"
        )
    )
    echo       YOUTUBE_API_KEY loaded
)

REM Check if venv exists
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
) else (
    echo [1/3] Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo [2/3] Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo [3/3] Starting server on http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

uvicorn index:app --reload --host 0.0.0.0 --port 8000

pause
