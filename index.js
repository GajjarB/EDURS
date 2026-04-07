/**
 * EDURS Bootloader — Dependency + Version Guard Edition
 */

const REQUIRED_NODE_MAJOR = process.versions.node.split('.')[0]; // compiled major
const COMPILED_WITH       = process.version; // e.g. v25.8.2

// Node.js version check — .jsc bytecode is version-locked
const currentMajor = parseInt(process.versions.node.split('.')[0], 10);
const requiredMajor = parseInt(REQUIRED_NODE_MAJOR, 10);

if (currentMajor !== requiredMajor) {
    console.error('\n\x1b[38;2;250;50;50m[ERROR] WRONG NODE.JS VERSION\x1b[0m');
    console.error('====================================================================');
    console.error(`This bot was compiled with \x1b[1m${COMPILED_WITH}\x1b[0m`);
    console.error(`You are running       \x1b[38;2;217;119;87mNode.js ${process.version}\x1b[0m`);
    console.error('\nThe .jsc bytecode is version-locked. You need:');
    console.error(`\x1b[1m   Node.js ${COMPILED_WITH}\x1b[0m`);
    console.error('\nDownload the exact version from: https://nodejs.org/en/download/releases');
    console.error('Or use nvm (Node Version Manager) to switch versions.');
    console.error('====================================================================\n');
    process.exit(1);
}

try {
    require('bytenode');
    require('./bot_entry.jsc');
} catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
        const missingModule = err.message.split("'")[1];
        console.error('\n\x1b[38;2;250;50;50m[ERROR] MISSING DEPENDENCY\x1b[0m');
        console.error('====================================================================');
        console.error(`The module \x1b[38;2;217;119;87m'${missingModule}'\x1b[0m is not installed.`);
        console.error('\nTo fix this, please run:');
        console.error('\x1b[1m   npm install\x1b[0m');
        console.error('\nIf you just downloaded the bot, run \x1b[1mrun_bot.bat\x1b[0m to auto-setup.');
        console.error('====================================================================\n');
        process.exit(1);
    } else if (err.message && (err.message.includes('bytecode') || err.message.includes('magic') || err.message.includes('version'))) {
        console.error('\n\x1b[38;2;250;50;50m[ERROR] BYTECODE VERSION MISMATCH\x1b[0m');
        console.error('====================================================================');
        console.error(`bot_entry.jsc was compiled with \x1b[1m${COMPILED_WITH}\x1b[0m`);
        console.error(`Your Node.js version: \x1b[38;2;217;119;87m${process.version}\x1b[0m`);
        console.error('\nInstall the correct version:');
        console.error(`\x1b[1m   Node.js ${COMPILED_WITH}\x1b[0m`);
        console.error('\nhttps://nodejs.org/en/download/releases');
        console.error('====================================================================\n');
        process.exit(1);
    } else {
        console.error('\n\x1b[38;2;250;50;50m[FATAL ERROR]\x1b[0m');
        console.error(err.message);
        process.exit(1);
    }
}
