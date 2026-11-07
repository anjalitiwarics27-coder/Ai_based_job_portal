@echo off
REM HireNova AI — double-click to run backend + frontend
cd /d "%~dp0"
echo Installing dependencies (if needed)...
python -m pip install -r requirements.txt -q
echo Starting HireNova AI at http://127.0.0.1:5000 ...
echo Demo logins (password: password123)
echo   candidate@hirenova.ai / employer@hirenova.ai / admin@hirenova.ai
python app.py
pause
