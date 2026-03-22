import monitor from './monitor-bridge-batch.mjs';

import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './src/database/db.js';
import { startBot } from './src/bot.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DB_PATH = process.env.DATABASE_PATH || './data/balance.db';

if (!BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
    process.exit(1);
}

try {
    initDatabase(DB_PATH);
} catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
}

try {
    await startBot(BOT_TOKEN);
    monitor.init('mom_bot', '/root/server-monitor/monitor.db');
} catch (error) {
    console.error('❌ Bot startup failed:', error);
    closeDatabase();
    process.exit(1);
}

process.on('exit', () => {
    closeDatabase();
});

process.on('uncaughtException', (error) => {
    console.error('🔥 FATAL: Uncaught Exception:', error);
    setTimeout(() => {
        closeDatabase();
        process.exit(1);
    }, 100);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🌊 FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
    setTimeout(() => {
        closeDatabase();
        process.exit(1);
    }, 100);
});
