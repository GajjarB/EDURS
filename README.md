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
![Bytecode](https://img.shields.io/badge/Protected-V8%20Bytecode-orange?style=flat-square)
![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)

</div>

---

## Overview

EDURS is a modular, automated pipeline system built on Node.js. It runs a sequence of encrypted processing stages end-to-end — retrieving data from external sources, scoring and filtering results with a local AI model, syncing output to cloud services, and sending real-time notifications — all from a single configuration file with no manual intervention required.

All pipeline logic is compiled to V8 bytecode and sealed in an AES-256-GCM vault. The source code is never exposed at runtime.

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

EDURS uses a **3-layer protection system** for all pipeline logic:

```
Source .js
  → Obfuscation  (javascript-obfuscator)
  → Bytecode     (V8 .jsc via bytenode)
  → Encryption   (AES-256-GCM + scrypt)
  → Stored as    .bin
```

The vault is destroyed after too many failed password attempts. Credentials are never stored in plaintext.

---

## Folder Structure

```
EDURS/
├── index.js                ← Bootloader (Node version guard + bytenode loader)
├── bot_entry.jsc           ← Security core + orchestration (compiled bytecode)
├── config.json             ← Your profile & pipeline preferences  ← YOU EDIT THIS
├── credentials.json        ← Google Service Account               ← YOU EDIT THIS
├── YourName_CV.pdf         ← Input document                       ← YOU ADD THIS
├── run_bot.bat             ← Double-click launcher (Windows)
├── package.json            ← Runtime dependencies
│
├── ai_process.bin          ← AI scoring engine (encrypted bytecode)
├── scrape_jobs.bin         ← Data retrieval (encrypted bytecode)
├── filter_jobs.bin         ← Filtering engine (encrypted bytecode)
├── company_research.bin    ← Deep research module (encrypted bytecode)
├── send_email.bin          ← Email module (encrypted bytecode)
├── recruiter_outreach.bin  ← Outreach targeting (encrypted bytecode)
├── export_excel.bin        ← Excel export (encrypted bytecode)
├── track_status.bin        ← Status tracker (encrypted bytecode)
├── upload_to_sheets.bin    ← Google Sheets sync (encrypted bytecode)
└── test_bot.bin            ← Self-test suite (encrypted bytecode)
```

---

## Setup

### Prerequisites

- [Node.js 18+](https://nodejs.org/) — must match the version used to compile `.jsc`
- [Ollama](https://ollama.ai/) running locally with `mistral:latest` (or your configured model)
- A Google Cloud Service Account with Sheets + Drive API enabled
- A Gmail App Password
- A Telegram Bot token + chat ID

---

### Step 1 — Fill in `config.json`

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

### Step 2 — Fill in `credentials.json`

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

### Step 3 — Add your input document

Place your PDF in the `EDURS/` folder and confirm the filename matches `cv_path` in `config.json`.

---

### Step 4 — Install dependencies

```bash
npm install
```

Or double-click `run_bot.bat` — it auto-installs on first run.

---

### Step 5 — Run

```bat
run_bot.bat
```

Or via terminal:

```bash
node index.js
```

You will be prompted for your **vault password**. The pipeline then runs all stages automatically.

---

## Sharing EDURS

You only need to share the `EDURS/` folder. The recipient must:

1. Fill in their own `config.json` and `credentials.json`
2. Add their input PDF
3. Run `npm install` (or `run_bot.bat`)
4. Use the vault password — **never store this in the repo**

> The `.vault` file is built separately using `vault_builder.js` from the source toolchain. Contact the author for the build toolchain.

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
