#!/usr/bin/env bash
# EDURS -- Secure Job Automation Bot (Phase 2)
# macOS / Linux launcher.  Windows users: run run_bot.bat instead.
set -u
cd "$(dirname "$0")" || exit 1

echo
echo "===================================================================="
echo "  EDURS -- Secure Job Automation Bot  (Phase 2)"
echo "===================================================================="
echo
echo "[NOTE] Vault unlock takes approximately 1-2 seconds after you"
echo "       enter your password. This is a deliberate security feature"
echo "       (scrypt key derivation) -- NOT a freeze or error."
echo

# -- Check Node.js is installed ----------------------------------------------
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo
    echo "This bot requires Node.js v16 or newer."
    echo "Install from: https://nodejs.org/en/download"
    echo "  macOS (Homebrew): brew install node"
    echo "  Debian/Ubuntu:    sudo apt install nodejs npm"
    echo
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "[ERROR] npm is not installed or not in PATH."
    exit 1
fi

# -- Show / verify Node.js version -------------------------------------------
NODE_VER="$(node --version)"
echo "[INFO] Node.js version: ${NODE_VER}"
echo "[INFO] Required:        v16 or newer  (cross-platform)"

NODE_MAJOR="$(printf '%s' "${NODE_VER}" | sed 's/^v//' | cut -d. -f1)"
if [ -n "${NODE_MAJOR}" ] && [ "${NODE_MAJOR}" -lt 16 ] 2>/dev/null; then
    echo "[ERROR] Node.js ${NODE_VER} is too old. Please install v16 or newer."
    exit 1
fi
echo

# -- Install / verify npm dependencies ---------------------------------------
echo "[SETUP] Installing / verifying dependencies..."
if ! npm install --silent; then
    echo "[ERROR] npm install failed. Check your Node.js installation."
    exit 1
fi
echo "[OK]   npm packages ready."

# -- Install Playwright browser (Chromium) if needed -------------------------
echo "[SETUP] Checking Playwright browser..."
if node -e "require('playwright')" >/dev/null 2>&1; then
    if npx playwright install chromium >/dev/null 2>&1; then
        echo "[OK]   Playwright Chromium ready."
    else
        echo "[WARN]  Playwright browser install had issues. Scraping may be affected."
        echo "[WARN]  On Linux you may need system libraries:"
        echo "[WARN]    sudo npx playwright install --with-deps chromium"
    fi
fi
echo

# -- Launch bot --------------------------------------------------------------
echo "[LAUNCH] Starting EDURS bot..."
node index.js
STATUS=$?

if [ "${STATUS}" -ne 0 ]; then
    echo
    echo "[ERROR] The bot terminated with an error (exit ${STATUS})."
    echo "Check bot_execution.log for details."
    exit "${STATUS}"
fi

echo
echo "[COMPLETE] Bot run finished."
