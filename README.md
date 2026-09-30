<div align="center">

```
███████╗██████╗ ██╗   ██╗██████╗ ███████╗
██╔════╝██╔══██╗██║   ██║██╔══██╗██╔════╝
█████╗  ██║  ██║██║   ██║██████╔╝███████╗
██╔══╝  ██║  ██║██║   ██║██╔══██╗╚════██║
███████╗██████╔╝╚██████╔╝██║  ██║███████║
╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
```

**Encrypted Distributed Utility & Retrieval System**

Developed by **[BHARGAV VADGAMA](https://github.com/GajjarB)**

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=nodedotjs)
![Security](https://img.shields.io/badge/Security-AES--256--GCM-red?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

EDURS is a modular, automated pipeline system built on Node.js. It runs a sequence of encrypted processing stages end-to-end - retrieving data from external sources, scoring and filtering results with a local AI model, syncing output to cloud services, and sending real-time notifications - all from a single configuration file with no manual intervention required.

All pipeline logic is obfuscated and AES-256-GCM encrypted, unlocked by a password-sealed vault at runtime. The source code is never exposed at runtime, and it runs on any OS (Windows, macOS Intel/Apple Silicon, Linux) with Node 16+.

---

## How It Works

```
[BOOT]
  └─ Integrity checks & self-tests

[DATA RETRIEVAL]
  └─ Fetch data from configured sources
  └─ Filter results by your defined rules
  └─ Score each result via local AI (Ollama)
  └─ Research flagged entries in depth

[AGGREGATION]
  └─ Export structured report to Excel
  └─ Update local tracker

[DELIVERY]
  └─ Outreach module runs against targets
  └─ Sync everything to Google Sheets
  └─ Send Telegram notification with summary
```

All stages write to `bot_execution.log`.

---

## Security Architecture

EDURS protects all logic with a layered system, shipped as obfuscated + encrypted JavaScript (no bytecode, so it runs everywhere):

```
Source .js
  → Obfuscation  (javascript-obfuscator, 14 layers)
  → Encryption   (AES-256-GCM, key from scrypt N=131072 + random salt)
  → Stored as    .bin   (pipeline)  /  bot_entry.bin  (orchestrator)
```

Both the orchestrator and every pipeline stage are encrypted with a key derived from your vault password; nothing is recoverable without it. A tamper lockout deletes the local vault after 5 wrong attempts (a casual deterrent - the real protection is the scrypt KDF plus a strong password). Credentials are never stored in plaintext in the shipped release.

---

## Folder Structure

```
EDURS/
EDURS/
├── index.js                ← Plaintext loader (decrypts bot_entry.bin with your password)
├── bot_entry.bin           ← Security core + orchestration (obfuscated + AES-256-GCM encrypted)
├── config.json             ← Your profile & pipeline preferences  ← YOU EDIT THIS
├── credentials.json        ← Google Service Account               ← YOU EDIT THIS
├── YourName_CV.pdf         ← Input document                       ← YOU ADD THIS
├── run_bot.bat             ← Launcher (Windows)
├── run_bot.sh              ← Launcher (macOS / Linux)
├── package.json            ← Runtime dependencies
│
├── ai_process.bin          ← AI scoring engine (encrypted)
├── scrape_jobs.bin         ← Data retrieval (encrypted)
├── filter_jobs.bin         ← Filtering engine (encrypted)
├── company_research.bin    ← Deep research module (encrypted)
├── send_email.bin          ← Email module (encrypted)
├── recruiter_outreach.bin  ← Outreach targeting (encrypted)
├── export_excel.bin        ← Excel export (encrypted)
├── track_status.bin        ← Status tracker (encrypted)
├── upload_to_sheets.bin    ← Google Sheets sync (encrypted)
└── test_bot.bin            ← Self-test suite (encrypted)
```

---

## Setup

### Prerequisites

- [Node.js 16+](https://nodejs.org/) - any OS (Windows, macOS Intel/Apple Silicon, Linux)
- [Ollama](https://ollama.ai/) running locally with `mistral:latest` (or your configured model)
- A Google Cloud Service Account with Sheets + Drive API enabled
- A Gmail App Password
- A Telegram Bot token + chat ID

---

### Step 1 - Fill in `config.json`

```jsonc
{
  "candidate_name": "Your Full Name",
  "candidate_email": "your.email@example.com",
  "candidate_location": "City, Country",
  "cv_path": "YourName_CV.pdf",
  "ollama_model": "mistral:latest",
  "spreadsheet_id": "YOUR_SHEET_ID",
  "gmail_app_password": "xxxx xxxx xxxx xxxx",
  "telegram_bot_token": "0000000000:AAA...",
  "telegram_chat_id": "000000000"
}
```

> `cv_path` must match the filename of your PDF placed in the same folder.

---

### Step 2 - Fill in `credentials.json`

```jsonc
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com"
}
```

Get this from [Google Cloud Console](https://console.cloud.google.com/).

---

### Step 3 - Add your input document

Place your PDF in the `EDURS/` folder and confirm the filename matches `cv_path` in `config.json`.

---

### Step 4 - Install dependencies

```bash
npm install
```

Or use the launcher for your platform - it auto-installs on first run.

---

### Step 5 - Run

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

You will be prompted for your **vault password**. The pipeline then runs all stages automatically. (On Linux, if Chromium fails to launch: `sudo npx playwright install --with-deps chromium`.)

---

## Sharing EDURS

You only need to share the `EDURS/` folder. The recipient must:

1. Fill in their own `config.json` and `credentials.json`
2. Add their input PDF
3. Run `npm install` (or `run_bot.bat` / `./run_bot.sh`)
4. Use the vault password - **never store this in the repo**

> The `.vault` file is built separately using `vault_builder.js` from the source toolchain. Contact the author for the build toolchain.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `MISSING DEPENDENCY` | Run `npm install` |
| `Invalid password or corrupted vault` | Wrong password, or re-run `vault_builder.js` to rebuild the vault |
| `[FATAL] Integrity check failed: timing anomaly` | scrypt ran suspiciously fast - clean environment, no debugger/hooks |
| `[LOCKOUT] Too many failed attempts` | Local vault deleted after 5 wrong tries - rebuild it |
| `Exit code 1` on a stage | Check `bot_execution.log` for details |
| Segfault on an old copy (macOS/Linux) | Old `.jsc` build - this release is obfuscated + encrypted JS; rebuild and redeploy |

---

<div align="center">

**Developed by [BHARGAV VADGAMA](https://github.com/GajjarB)**

*Built with Node.js · AES-256-GCM · scrypt · JS Obfuscation · Ollama AI*

</div>
