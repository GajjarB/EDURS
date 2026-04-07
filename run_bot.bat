@echo off
cd /d "%~dp0"
setlocal enabledelayedexpansion

echo.
echo ====================================================================
echo   EDURS -- Secure Job Automation Bot  (Phase 2)
echo ====================================================================
echo.
echo [NOTE] Vault unlock takes approximately 2-3 seconds after you
echo        enter your password. This is a deliberate security feature
echo        (scrypt key derivation) -- NOT a freeze or error.
echo.

REM ── Check Node.js is installed ──────────────────────────────────────────
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo This bot requires Node.js v25.x ^(exact version^).
    echo Download from: https://nodejs.org/en/download/releases
    echo.
    pause
    exit /b 1
)

REM ── Show Node.js version ─────────────────────────────────────────────────
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [INFO] Node.js version: %NODE_VER%
echo [INFO] Required:        v25.x  ^(must match compiled version^)
echo.

REM ── Install / verify npm dependencies ───────────────────────────────────
echo [SETUP] Installing / verifying dependencies...
call npm install --silent
if errorlevel 1 (
    echo [ERROR] npm install failed. Check your Node.js installation.
    pause
    exit /b 1
)
echo [OK]   npm packages ready.

REM ── Install Playwright browser (Chromium) if not already present ─────────
echo [SETUP] Checking Playwright browser...
node -e "require('playwright')" >nul 2>&1
if not errorlevel 1 (
    call npx playwright install chromium --with-deps >nul 2>&1
    if errorlevel 1 (
        echo [WARN]  Playwright browser install had issues. Scraping may be affected.
    ) else (
        echo [OK]   Playwright Chromium ready.
    )
)
echo.

REM ── Launch bot ───────────────────────────────────────────────────────────
echo [LAUNCH] Starting EDURS bot...
node index.js

if errorlevel 1 (
    echo.
    echo [ERROR] The bot terminated with an error.
    echo Check bot_execution.log for details.
    pause
)

echo.
echo [COMPLETE] Bot run finished.
pause
