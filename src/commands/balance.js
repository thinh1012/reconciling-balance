import { getCurrentBalance, getTransactionHistory } from '../services/balanceService.js';
import { formatNumber, formatDate } from '../services/messageParser.js';

/**
 * Balance command handler - Vietnamese version
 */
export function handleBalance(bot, msg) {
    const chatId = msg.chat.id;

    try {
        const balance = getCurrentBalance();
        const recentTransactions = getTransactionHistory(5);

        let message = `💰 *Số Dư Tiền Của Mẹ*\n\n`;
        message += `Số dư: *${formatNumber(balance)}*\n\n`;

        if (recentTransactions.length > 0) {
            message += `📋 *Giao Dịch Gần Đây:*\n`;
            recentTransactions.forEach(tx => {
                const emoji = tx.amount > 0 ? '➕' : '➖';
                const sign = tx.amount > 0 ? '+' : '';
                const date = formatDate(tx.created_at);
                message += `${emoji} ${sign}${formatNumber(Math.abs(tx.amount))} (${date})\n`;
            });
        } else {
            message += `_Chưa có giao dịch nào_`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling balance command:', error);
        bot.sendMessage(chatId, '❌ Lỗi lấy số dư. Vui lòng thử lại.');
    }
}
