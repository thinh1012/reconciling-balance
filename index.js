import monitor from './monitor-bridge-batch.mjs';

import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './src/database/db.js';
import { startBot } from './src/bot.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DB_PATH = process.env.DATABASE_PATH || './data/balance.db';

if (!BOT_TOKEN) {
    console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
    process.exit(1);
}

// Initialize database
try {
    initDatabase(DB_PATH);
} catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
}

// Start the bot
try {
    startBot(BOT_TOKEN);

    monitor.init('mom_bot');
} catch (error) {
    console.error('❌ Bot startup failed:', error);
    closeDatabase();
    process.exit(1);
}

// Cleanup on exit
process.on('exit', () => {
    closeDatabase();
});

// [STABILITY]: Global Error Handlers
// These prevent the bot from becoming a "zombie" (Online in PM2 but dead inside)
// after a network EFATAL or ETIMEDOUT error.
process.on('uncaughtException', (error) => {
    console.error('🔥 FATAL: Uncaught Exception:', error);
    setTimeout(() => {
        closeDatabase();
        process.exit(1); // Force PM2 to restart the process
    }, 100);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🌊 FATAL: Unhandled Rejection at:', promise, 'reason:', reason);
    setTimeout(() => {
        closeDatabase();
        process.exit(1); // Force PM2 to restart the process
    }, 100);
});
