import TelegramBot from 'node-telegram-bot-api';
import { handleHelp } from './commands/help.js';
import { handleBalance } from './commands/balance.js';
import { handleToday, handleHistory } from './commands/history.js';
import { handleTransaction } from './commands/transaction.js';
import { handleUndo } from './commands/undo.js';
import monitor from '../monitor-bridge-batch.mjs';

/**
 * Initialize and start the Telegram bot
 */
export function startBot(token) {
    // [NETWORK]: 30s polling during active window
    // The bot will only run for 6 minutes every 30 minutes to save resources.
    const bot = new TelegramBot(token, {
        polling: {
            interval: 30000,    // 30 seconds (User requested)
            autoStart: true,
            params: { timeout: 55 }
        }
    });

    // [MONITORING] Track inbound messages for Dashboard
    bot.on('message', () => monitor.recordInbound());

    console.log('🤖 Bot started successfully!');
    console.log('⏱️ Mode: Wake-and-Sleep (Running for 6 minutes, 30s polling)');

    // Schedule shutdown after 6 minutes (360,000 ms)
    const RUN_DURATION = 360000;
    setTimeout(() => {
        console.log('💤 6 minutes up! Shutting down to save router load. See you later.');
        bot.stopPolling();
        setTimeout(() => process.exit(0), 1000); // Graceful exit
    }, RUN_DURATION);

    // Diagnostic Heartbeat
    bot.onText(/\/ping/, (msg) => {
        bot.sendMessage(msg.chat.id, `🏓 PONG!\n\nStatus: Online\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}`);
    });

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(
            chatId,
            '👋 Chào mừng đến với Bot Quản Lý Tiền Mẹ!\n\nGõ /help để xem hướng dẫn.'
        );
    });

    bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
    bot.onText(/\/balance/, (msg) => handleBalance(bot, msg));
    bot.onText(/\/today/, (msg) => handleToday(bot, msg));
    bot.onText(/\/undo/, (msg) => handleUndo(bot, msg));

    bot.onText(/\/history(.*)/, (msg, match) => {
        const args = match[1].trim();
        handleHistory(bot, msg, args);
    });

    bot.on('message', (msg) => {
        const text = msg.text;
        if (!text || text.startsWith('/')) return;

        if (/^[+\-][\d.]+[km]?/i.test(text.trim())) {
            handleTransaction(bot, msg);
        }
    });

    // Error handling for EFATAL and ETIMEDOUT
    bot.on('polling_error', (error) => {
        console.error(`⚠️ [NETWORK_ISSUE]: ${error.code} - ${error.message}`);

        if (error.code === 'ETIMEDOUT') {
            console.log('⏳ Telegram connection timed out. Retrying...');
        }

        if (error.code === 'EFATAL' || error.code === 'ECONNRESET') {
            console.error(`💀 NETWORK ERROR (${error.code}). Bot will stay alive and retry until the 6-minute window ends.`);
        }
    });

    process.on('SIGINT', () => {
        bot.stopPolling();
        process.exit(0);
    });

    return bot;
}
