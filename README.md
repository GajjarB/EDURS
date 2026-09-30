<div align="center">

```ansi
[38;2;217;119;87m
       ███████╗██████╗ ██╗   ██╗██████╗ ███████╗
       ██╔════╝██╔══██╗██║   ██║██╔══██╗██╔════╝
       █████╗  ██║  ██║██║   ██║██████╔╝███████╗
       ██╔══╝  ██║  ██║██║   ██║██╔══██╗╚════██║
       ███████╗██████╔╝╚██████╔╝██║  ██║███████║
       ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
[0m
```

**AUTOMATED JOB BOT - PHASE 2 SECURITY EDITION**

Developed by **[BHARGAV VADGAMA](https://github.com/GajjarB)**

![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?style=flat-square&logo=nodedotjs)
![Security](https://img.shields.io/badge/Security-AES--256--GCM-red?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)

</div>

---

## What is EDURS?

**EDURS** is a fully automated, AI-powered job search bot that runs 24/7 on behalf of a candidate. It scrapes live job listings, filters by location and seniority, scores opportunities using local AI (Ollama), reaches out to recruiters, tracks all activity in Google Sheets and Excel, and notifies the candidate via Telegram - all without any manual effort.

---

## Features

| Module | Description |
|---|---|
| 🔍 **Job Scraping** | Scrapes multiple job boards automatically |
| 🧠 **AI Scoring** | Scores each job via local Ollama LLM (no cloud cost) |
| 📋 **Smart Filtering** | Filters by location, language, seniority, salary currency |
| 🏢 **Company Research** | Deep research on high-priority companies |
| 📧 **Recruiter Outreach** | Personalised AI-drafted outreach emails |
| 📊 **Excel Tracking** | Exports full analytics to Excel |
| 📑 **Google Sheets Sync** | Live sync to Google Sheets dashboard |
| 📱 **Telegram Alerts** | Real-time notifications for new matches |
| 🔐 **Vault Security** | Script-encryption keys sealed under an AES-256-GCM + scrypt password vault |
| 🛡️ **Code Protection** | All logic (including the orchestrator) obfuscated + AES-256-GCM encrypted, password-sealed - cross-platform, no readable source |

---

## Security Architecture

EDURS protects all bot logic with a layered system - and ships as **obfuscated JavaScript**, so it runs on any OS (Windows, macOS Intel/Apple Silicon, Linux) with Node ≥ 16:

```
Source .js
  → Obfuscation  (javascript-obfuscator, 14 layers)
  → Encryption   (AES-256-GCM)
  → Stored as    .bin   (pipeline)  /  bot_entry.bin  (orchestrator)
```

The orchestrator ships **obfuscated AND AES-256-GCM encrypted** (`bot_entry.bin`), sealed with a key derived from your password - the pipeline scripts ship as encrypted `.bin` too. A tiny plaintext loader (`index.js`) holds only generic crypto, no secrets.

At runtime:
- Random 16-byte salt (stored in the `.vault` header) + password → scrypt (N=131072) → vault key
- That key decrypts **`bot_entry.bin`** (in memory) and unlocks `.vault` → the two group keys → decrypts each pipeline `.bin` in memory → run
- Without the password, `bot_entry.bin`, `.vault` and the `.bin` stages are all unrecoverable
- Decrypted scripts are **never written to disk**
- Key derivation has a timing guard that detects a patched/instant scrypt
- Tamper lockout: 5 wrong passwords deletes the local `.vault`. This is a casual deterrent only - it does **not** stop offline brute force (an attacker can copy `.vault` first and reset the plaintext counter). The real protection against guessing is the scrypt KDF above plus a strong password.

> **Note:** earlier releases compiled `bot_entry` to V8 bytecode (`.jsc`) via `bytenode`. That format is locked to one exact Node/V8 version **and** CPU architecture, so it segfaulted on other platforms (e.g. macOS Apple Silicon). This release uses obfuscated + encrypted JS instead - fully cross-platform.

---

## Folder Structure

```
EDURS/
├── index.js              ← Plaintext loader (decrypts bot_entry.bin with your password)
├── bot_entry.bin         ← Security core + orchestration (obfuscated + AES-256-GCM encrypted)
├── config.json           ← Candidate profile & job preferences ← YOU EDIT THIS
├── credentials.json      ← Google Service Account ← YOU EDIT THIS
├── YourName_CV.pdf       ← Your CV in PDF format ← YOU ADD THIS
├── run_bot.bat           ← Double-click to run on Windows
├── run_bot.sh            ← Launcher for macOS / Linux (./run_bot.sh)
├── package.json          ← Runtime dependencies
│
├── ai_process.bin        ← AI scoring engine (encrypted)
├── scrape_jobs.bin       ← Job scraper (encrypted)
├── filter_jobs.bin       ← Smart filter (encrypted)
├── company_research.bin  ← Company research (encrypted)
├── send_email.bin        ← Email outreach (encrypted)
├── recruiter_outreach.bin← Recruiter targeting (encrypted)
├── export_excel.bin      ← Excel export (encrypted)
├── track_status.bin      ← Status tracker (encrypted)
├── upload_to_sheets.bin  ← Google Sheets sync (encrypted)
└── test_bot.bin          ← Self-test suite (encrypted)
```

---

## Setup Guide

### Prerequisites

- [Node.js 16+](https://nodejs.org/) - any OS (Windows, macOS Intel/Apple Silicon, Linux)
- [Ollama](https://ollama.ai/) running locally with `mistral:latest` (or your chosen model)
- A Google Cloud Service Account with Sheets + Drive API enabled
- A Gmail App Password for outreach
- A Telegram Bot token + chat ID for notifications

---

### Step 1 - Fill in `config.json`

Open `config.json` and replace every placeholder with your real data:

```jsonc
{
  "candidate_name": "Your Full Name",
  "candidate_email": "your.email@example.com",
  "candidate_location": "City, Country",
  "cv_path": "YourName_CV.pdf",          // must match your PDF filename
  "ollama_model": "mistral:latest",       // must match your installed Ollama model
  "spreadsheet_id": "YOUR_SHEET_ID",
  "gmail_app_password": "xxxx xxxx xxxx xxxx",
  "telegram_bot_token": "0000000000:AAA...",
  "telegram_chat_id": "000000000",
  // ... job keywords, scoring rules, target cities, etc.
}
```

> **Important:** `cv_path` must be the filename of your PDF placed in the same folder.

---

### Step 2 - Fill in `credentials.json`

Replace with your Google Service Account JSON from [Google Cloud Console](https://console.cloud.google.com/):

```jsonc
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com"
  // ...
}
```

---

### Step 3 - Add your CV

Place your CV PDF in the `EDURS/` folder and make sure the filename matches `cv_path` in `config.json`.

---

### Step 4 - Install dependencies

```bash
npm install
```

Or just double-click `run_bot.bat` - it auto-installs on first run.

---

### Step 5 - Run the bot

**Windows:**

```bat
run_bot.bat
```

**macOS / Linux:**

```bash
chmod +x run_bot.sh    # first time only
./run_bot.sh
```

Or, on any platform, via terminal:

```bash
node index.js
```

> On Linux, if Chromium fails to launch, install its system libraries:
> `sudo npx playwright install --with-deps chromium`

You will be prompted for your **vault password** - this is the password you set when the vault was built. The bot will then run all pipeline stages automatically.

---

## What the Bot Does (Pipeline)

```
[BOOT]
  └─ System self-tests & integrity checks

[JOB SOURCING]
  └─ Scrape live job sources
  └─ Filter by location, language, seniority
  └─ Score each job via AI (Ollama)
  └─ Research high-priority companies

[DATA AGGREGATION]
  └─ Export analytics to Excel
  └─ Update job tracker

[OUTREACH]
  └─ Send personalised recruiter emails
  └─ Recruiter connect protocol
  └─ Sync everything to Google Sheets
```

All stages log to `bot_execution.log` for debugging.

---

## Customising Job Targeting

The `scoring_rules` section in `config.json` controls how the AI scores jobs:

```jsonc
"scoring_rules": [
  {
    "score": 10,           // 0-10 relevance score
    "any": ["your top job title", "alternate title"],
    "avoid": ["senior", "10 years experience"]
  }
]
```

`scoring_bonuses` adds extra points for matching companies, cities, or skills.
`reject_keywords` hard-blocks jobs regardless of score.

---

## Sharing This Bot

You only need to share the `EDURS/` folder. The recipient must:
1. Fill in their own `config.json`, `credentials.json`, and add their CV PDF
2. Run `npm install` (or `run_bot.bat`)
3. Use the vault password (provided separately - never store in the repo)

> **The `.vault` file and vault password must be set up separately by running `vault_builder.js` from the source directory. Contact the bot author for the build toolchain.**

> ⚠️ **Never share a folder in which you have already filled in `config.json` / `credentials.json`.** Those files are plaintext and hold your Gmail app password, Telegram bot token, spreadsheet ID and Google service-account private key. The vault does not encrypt them. Share only this release folder with its placeholder values.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `MISSING DEPENDENCY` | Run `npm install` |
| `Invalid password or corrupted vault` | Wrong password, or re-run `vault_builder.js` to rebuild the vault |
| `[FATAL] Integrity check failed: timing anomaly` | scrypt ran suspiciously fast - use a clean environment, no debugger/hooks |
| `[LOCKOUT] Too many failed attempts` | Local `.vault` deleted after 5 wrong tries - rebuild it with `vault_builder.js` |
| `Exit code 1` on a stage | Check `bot_execution.log` for details |
| Segfault on an old copy (macOS/Linux) | Old `.jsc` build - this release is obfuscated JS; rebuild and redeploy |

---

<div align="center">

**Developed by [BHARGAV VADGAMA](https://github.com/GajjarB)**

*Built with Node.js · AES-256-GCM · scrypt · JS Obfuscation · Ollama AI*

</div>
