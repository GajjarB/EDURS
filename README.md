<div align="center">

```ansi

███████╗██████╗ ██╗   ██╗██████╗ ███████╗
██╔════╝██╔══██╗██║   ██║██╔══██╗██╔════╝
█████╗  ██║  ██║██║   ██║██████╔╝███████╗
██╔══╝  ██║  ██║██║   ██║██╔══██╗╚════██║
███████╗██████╔╝╚██████╔╝██║  ██║███████║
╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝

```

**AUTOMATED JOB BOT — PHASE 2 SECURITY EDITION**

Developed by **[BHARGAV VADGAMA](https://github.com/GajjarB)**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs)
![Security](https://img.shields.io/badge/Security-AES--256--GCM-red?style=flat-square)
![Bytecode](https://img.shields.io/badge/Protected-V8%20Bytecode-orange?style=flat-square)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)

</div>

---

## What is EDURS?

**EDURS** is a fully automated, AI-powered job search bot that runs 24/7 on behalf of a candidate. It scrapes live job listings, filters by location and seniority, scores opportunities using local AI (Ollama), reaches out to recruiters, tracks all activity in Google Sheets and Excel, and notifies the candidate via Telegram — all without any manual effort.

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
| 🔐 **Vault Security** | All credentials sealed under AES-256-GCM + scrypt vault |
| 🛡️ **Bytecode Protection** | All logic compiled to V8 bytecode — source code never exposed |

---

## Security Architecture

EDURS uses a **3-layer protection system** for all bot logic:

```
Source .js
  → Obfuscation  (javascript-obfuscator)
  → Bytecode     (V8 .jsc via bytenode)
  → Encryption   (AES-256-GCM)
  → Stored as    .bin
```

## Folder Structure

```
EDURS/
├── index.js              ← Bootloader (Node version guard + bytenode loader)
├── bot_entry.jsc         ← Security core + orchestration (compiled bytecode)
├── config.json           ← Candidate profile & job preferences ← YOU EDIT THIS
├── credentials.json      ← Google Service Account ← YOU EDIT THIS
├── YourName_CV.pdf       ← Your CV in PDF format ← YOU ADD THIS
├── run_bot.bat           ← Double-click to run on Windows
├── package.json          ← Runtime dependencies
│
├── ai_process.bin        ← AI scoring engine (encrypted bytecode)
├── scrape_jobs.bin       ← Job scraper (encrypted bytecode)
├── filter_jobs.bin       ← Smart filter (encrypted bytecode)
├── company_research.bin  ← Company research (encrypted bytecode)
├── send_email.bin        ← Email outreach (encrypted bytecode)
├── recruiter_outreach.bin← Recruiter targeting (encrypted bytecode)
├── export_excel.bin      ← Excel export (encrypted bytecode)
├── track_status.bin      ← Status tracker (encrypted bytecode)
├── upload_to_sheets.bin  ← Google Sheets sync (encrypted bytecode)
└── test_bot.bin          ← Self-test suite (encrypted bytecode)
```

---

## Setup Guide

### Prerequisites

- [Node.js 18+](https://nodejs.org/) (must match the version used to compile `.jsc`)
- [Ollama](https://ollama.ai/) running locally with `mistral:latest` (or your chosen model)
- A Google Cloud Service Account with Sheets + Drive API enabled
- A Gmail App Password for outreach
- A Telegram Bot token + chat ID for notifications

---

### Step 1 — Fill in `config.json`

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

### Step 2 — Fill in `credentials.json`

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

### Step 3 — Add your CV

Place your CV PDF in the `EDURS/` folder and make sure the filename matches `cv_path` in `config.json`.

---

### Step 4 — Install dependencies

```bash
npm install
```

Or just double-click `run_bot.bat` — it auto-installs on first run.

---

### Step 5 — Run the bot

```bat
run_bot.bat
```

Or via terminal:

```bash
node index.js
```

You will be prompted for your **vault password** — this is the password you set when the vault was built. The bot will then run all pipeline stages automatically.

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
3. Use the vault password (provided separately — never store in the repo)

> **The `.vault` file and vault password must be set up separately by running `vault_builder.js` from the source directory. Contact the bot author for the build toolchain.**

---

## Troubleshooting

| Error | Fix |
|---|---|
| `WRONG NODE.JS VERSION` | Install the exact Node.js version shown in the error |
| `MISSING DEPENDENCY` | Run `npm install` |
| `Invalid vault format` | Re-run `vault_builder.js` to rebuild the vault |
| `TAMPER DETECTED` | Do not modify `.jsc` or `index.js` after vault is built |
| `[LOCKOUT] Too many failed attempts` | Vault destroyed — needs to be rebuilt |
| `Exit code 1` on a stage | Check `bot_execution.log` for details |

---

<div align="center">

**Developed by [BHARGAV VADGAMA](https://github.com/GajjarB)**

*Built with Node.js · AES-256-GCM · scrypt · V8 Bytecode · Ollama AI*

</div>
