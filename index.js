/**
 * EDURS Bootloader - cross-platform, encrypted entry.
 *
 * bot_entry is shipped AES-256-GCM encrypted (dist/bot_entry.bin), sealed with a
 * key derived from the vault password. This loader:
 *   1. reads the random salt from .vault
 *   2. prompts for the password
 *   3. derives the vault key (scrypt N=131072) - the SAME key that sealed the vault
 *   4. decrypts bot_entry.bin in memory and runs it (never written to disk)
 *   5. unlocks the vault and injects the two group keys into the entry
 *
 * Without the password, both bot_entry.bin and the vault are unrecoverable.
 * This loader holds only generic crypto primitives - no secrets, no keys.
 * Plain JS → runs on any OS with Node >= 16.
 */

'use strict';

const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const Module = require('module');

const VAULT_FILE    = path.join(__dirname, '.vault');
const ATTEMPTS_FILE = path.join(__dirname, '.attempts');
const ENTRY_BIN     = path.join(__dirname, 'bot_entry.bin');
const ENTRY_NAME    = path.join(__dirname, 'bot_entry.js'); // virtual filename for the module

const SALT_LEN      = 16;
const SCRYPT_PARAMS = { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 };

const C = {
    reset: '\x1b[0m', bright: '\x1b[1m',
    orange: '\x1b[38;2;217;119;87m', red: '\x1b[38;2;250;50;50m', blue: '\x1b[38;2;80;120;220m',
};

// ── Attempt counter (casual-tamper deterrent) ────────────────────────────────
function readAttempts() {
    try { return parseInt(fs.readFileSync(ATTEMPTS_FILE, 'utf8').trim(), 10) || 0; } catch (_) { return 0; }
}
function checkAttempts() {
    if (readAttempts() >= 5) {
        try { fs.unlinkSync(VAULT_FILE); } catch (_) {}
        console.error(`\n${C.red}[LOCKOUT] Too many failed attempts. Local vault deleted.${C.reset}`);
        process.exit(1);
    }
}
function incrementAttempts() {
    try { fs.writeFileSync(ATTEMPTS_FILE, String(readAttempts() + 1), 'utf8'); } catch (_) {}
}

// ── Hidden password prompt (shows * per char, handles backspace) ─────────────
function getPassword(label) {
    return new Promise((resolve) => {
        process.stdout.write(label);
        let password = '';
        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');
        function handler(ch) {
            switch (ch) {
                case '\r': case '\n': case '\u0004':
                    stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', handler);
                    process.stdout.write('\n'); resolve(password); break;
                case '\u0003':
                    process.stdout.write('\n');
                    console.log(`${C.red}[TERMINATED] Bot paused by user (Ctrl+C).${C.reset}`);
                    process.exit(0); break;
                case '\u007f': case '\b':
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\x1B[2K\x1B[200D' + label + '*'.repeat(password.length));
                    }
                    break;
                default:
                    password += ch; process.stdout.write('*'); break;
            }
        }
        stdin.on('data', handler);
    });
}

function deriveVaultKey(password, salt) {
    const start = Date.now();
    const key = crypto.scryptSync(Buffer.from(password, 'utf8'), salt, 32, SCRYPT_PARAMS);
    if (Date.now() - start < 20) {
        console.error(`\n${C.red}[FATAL] Integrity check failed: timing anomaly detected.${C.reset}`);
        process.exit(1);
    }
    return key;
}

/** AES-256-GCM decrypt: input [iv(16)][tag(16)][ciphertext] */
function decryptBuffer(data, keyBuf) {
    const iv = data.subarray(0, 16), tag = data.subarray(16, 32), ct = data.subarray(32);
    const d = crypto.createDecipheriv('aes-256-gcm', keyBuf, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(ct), d.final()]);
}

async function main() {
    // 1. brute-force lockout (casual deterrent)
    checkAttempts();

    // 2. read sealed vault: [salt(16)][iv(16)][tag(16)][ciphertext]
    let salt, sealed, entryEnc;
    try {
        const rawVault = fs.readFileSync(VAULT_FILE);
        if (rawVault.length < SALT_LEN + 32) throw new Error('vault too small');
        salt   = rawVault.subarray(0, SALT_LEN);
        sealed = rawVault.subarray(SALT_LEN);
    } catch (_) {
        console.error(`\n${C.red}[FATAL] Vault missing or corrupted. Re-run vault_builder.js.${C.reset}`);
        process.exit(1);
    }
    try {
        entryEnc = fs.readFileSync(ENTRY_BIN);
    } catch (_) {
        console.error(`\n${C.red}[FATAL] bot_entry.bin missing. Re-run the build.${C.reset}`);
        process.exit(1);
    }

    // 3. password → vault key (scrypt, salt from vault)
    process.stdout.write(`${C.orange}[AUTH]${C.reset} Enter vault password: `);
    const password = await getPassword('');
    process.stdout.write(`${C.blue}[ .. ]${C.reset} Deriving vault key (scrypt) - ~1-2s...\n`);
    const vaultKey = deriveVaultKey(password, salt);

    // 4. decrypt the encrypted entry AND the vault payload with that key.
    //    Either failing = wrong password (GCM auth fails).
    let entryCode, payload;
    try {
        entryCode = decryptBuffer(entryEnc, vaultKey).toString('utf8');
        payload   = JSON.parse(decryptBuffer(sealed, vaultKey).toString('utf8'));
    } catch (_) {
        incrementAttempts();
        console.error(`\n${C.red}[FATAL] Invalid password or corrupted data. Access Denied.${C.reset}`);
        process.exit(1);
    }

    // 5. inject decrypted group keys and run the entry (decrypted code never hits disk)
    globalThis.__EDURS_CTX__ = {
        masterKeyBuf:   Buffer.from(payload.BOT_MASTER_KEY, 'hex'),
        outreachKeyBuf: Buffer.from(payload.OUTREACH_KEY,   'hex'),
    };

    try {
        const m = new Module(ENTRY_NAME, module);
        m.filename = ENTRY_NAME;
        m.paths    = Module._nodeModulePaths(__dirname);
        m._compile(entryCode, ENTRY_NAME); // runs orchestrateBot()
    } catch (err) {
        if (err && err.code === 'MODULE_NOT_FOUND') {
            const missing = (err.message.split("'")[1]) || 'a required module';
            console.error(`\n${C.red}[ERROR] MISSING DEPENDENCY${C.reset}`);
            console.error(`The module ${C.orange}'${missing}'${C.reset} is not installed. Run: ${C.bright}npm install${C.reset}`);
            process.exit(1);
        }
        console.error(`\n${C.red}[FATAL ERROR]${C.reset} ${err && err.message ? err.message : err}`);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    console.log(`\n${C.red}[TERMINATED] Bot paused by user (Ctrl+C).${C.reset}`);
    process.exit(0);
});

main();
