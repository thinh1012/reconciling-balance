import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import { handleHelp } from './commands/help.js';
import { handleBalance } from './commands/balance.js';
import { handleToday, handleHistory } from './commands/history.js';
import { handleTransaction } from './commands/transaction.js';
import { handleUndo } from './commands/undo.js';
import monitor from '../monitor-bridge-batch.mjs';

export async function startBot(token) {
    const port = parseInt(process.env.PORT || '2002');
    const webhookBase = process.env.WEBHOOK_BASE_URL;
    const secret = process.env.WEBHOOK_SECRET;

    const bot = new TelegramBot(token, {
        webHook: {
            port,
            host: '127.0.0.1',
            ...(secret && { secretToken: secret })
        }
    });

    const webhookUrl = `${webhookBase}/webhook/${token}`;
    await bot.setWebHook(webhookUrl, {
        certificate: fs.createReadStream('/etc/nginx/ssl/na-bot/cert.pem'),
        ...(secret && { secret_token: secret })
    });

    console.log(`Webhook registered: ${webhookBase}/webhook/<token>`);
    console.log('Mode: Webhook (always-on)');

    bot.on('message', () => monitor.recordInbound());

    bot.onText(/\/start/, (msg) => {
        bot.sendMessage(msg.chat.id, '👋 Chào mừng đến với Bot Quản Lý Tiền Mẹ!\n\nGõ /help để xem hướng dẫn.');
    });

    bot.onText(/\/ping/, (msg) => {
        bot.sendMessage(msg.chat.id, `🏓 PONG!\n\nStatus: Online\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}`);
    });

    bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
    bot.onText(/\/balance/, (msg) => handleBalance(bot, msg));
    bot.onText(/\/today/, (msg) => handleToday(bot, msg));
    bot.onText(/\/undo/, (msg) => handleUndo(bot, msg));

    bot.onText(/\/history(.*)/, (msg, match) => {
        handleHistory(bot, msg, match[1].trim());
    });

    bot.on('message', (msg) => {
        const text = msg.text;
        if (!text || text.startsWith('/')) return;
        if (/^[+\-][\d.]+[km]?/i.test(text.trim())) {
            handleTransaction(bot, msg);
        }
    });

    bot.on('webhook_error', (error) => {
        console.error(`Webhook error: ${error.message}`);
    });

    process.on('SIGINT', () => {
        bot.closeWebHook();
        process.exit(0);
    });

    return bot;
}
