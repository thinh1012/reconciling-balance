import {
    getTransactionsByDate,
    getTransactionsInRange,
    getTodaysSummary
} from '../services/balanceService.js';
import { parseDate, formatNumber, formatDate } from '../services/messageParser.js';

/**
 * Today command handler - Vietnamese version
 */
export function handleToday(bot, msg) {
    const chatId = msg.chat.id;

    try {
        const summary = getTodaysSummary();
        const { transactions, totalReceived, totalSent, net, date } = summary;

        let message = `📅 *Hôm Nay (${formatDate(date)})*\n\n`;

        if (transactions.length === 0) {
            message += `_Hôm nay chưa có giao dịch_`;
        } else {
            transactions.forEach(tx => {
                const emoji = tx.amount > 0 ? '➕' : '➖';
                const sign = tx.amount > 0 ? '+' : '';
                const time = new Date(tx.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                message += `${emoji} ${sign}${formatNumber(Math.abs(tx.amount))} (${time})\n`;
            });

            message += `\n📊 *Tổng Kết:*\n`;
            message += `Tổng nhận: ${formatNumber(totalReceived)}\n`;
            message += `Tổng chi: ${formatNumber(totalSent)}\n`;

            const netEmoji = net >= 0 ? '✅' : '⚠️';
            const netSign = net >= 0 ? '+' : '';
            message += `Còn lại: ${netEmoji} ${netSign}${formatNumber(net)}`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling today command:', error);
        bot.sendMessage(chatId, '❌ Lỗi lấy giao dịch hôm nay. Vui lòng thử lại.');
    }
}

/**
 * History command handler - Vietnamese version
 */
export function handleHistory(bot, msg, args) {
    const chatId = msg.chat.id;

    try {
        let transactions;
        let dateStr = '';

        if (!args || args.trim() === '') {
            // Show last 7 days
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            transactions = getTransactionsInRange(startDate, endDate);
            dateStr = '7 Ngày Qua';
        } else {
            // Parse specific date
            const date = parseDate(args);

            if (!date || isNaN(date.getTime())) {
                bot.sendMessage(
                    chatId,
                    '❌ Sai định dạng ngày. Hãy dùng:\n• DD/MM (ví dụ: 19/01)\n• YYYY-MM-DD (ví dụ: 2026-01-19)'
                );
                return;
            }

            transactions = getTransactionsByDate(date);
            dateStr = formatDate(date);
        }

        let message = `📅 *${dateStr}*\n\n`;

        if (transactions.length === 0) {
            message += `_Không có giao dịch_`;
        } else {
            let totalReceived = 0;
            let totalSent = 0;

            transactions.forEach(tx => {
                const emoji = tx.amount > 0 ? '➕' : '➖';
                const sign = tx.amount > 0 ? '+' : '';
                const time = new Date(tx.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                message += `${emoji} ${sign}${formatNumber(Math.abs(tx.amount))} (${time})\n`;

                if (tx.amount > 0) {
                    totalReceived += tx.amount;
                } else {
                    totalSent += Math.abs(tx.amount);
                }
            });

            message += `\n📊 *Tổng Kết:*\n`;
            message += `Tổng nhận: ${formatNumber(totalReceived)}\n`;
            message += `Tổng chi: ${formatNumber(totalSent)}\n`;

            const net = totalReceived - totalSent;
            const netEmoji = net >= 0 ? '✅' : '⚠️';
            const netSign = net >= 0 ? '+' : '';
            message += `Còn lại: ${netEmoji} ${netSign}${formatNumber(net)}`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling history command:', error);
        bot.sendMessage(chatId, '❌ Lỗi lấy lịch sử giao dịch. Vui lòng thử lại.');
    }
}
