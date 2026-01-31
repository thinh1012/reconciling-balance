import { undoLastTransaction } from '../services/balanceService.js';
import { formatNumber, formatDate } from '../services/messageParser.js';

/**
 * Undo command handler - Vietnamese version
 */
export function handleUndo(bot, msg) {
    const chatId = msg.chat.id;

    try {
        const result = undoLastTransaction();

        if (!result) {
            bot.sendMessage(chatId, '❌ Không có giao dịch nào để hoàn tác.');
            return;
        }

        const emoji = result.amount > 0 ? '➕' : '➖';
        const sign = result.amount > 0 ? '+' : '';
        const desc = result.description ? `\nGhi chú: _${result.description}_` : '';

        const message = `
🔄 *Đã Hoàn Tác Giao Dịch*

${emoji} ${sign}${formatNumber(Math.abs(result.amount))}${desc}
Thời gian: ${formatDate(result.created_at)}

Số dư mới: *${formatNumber(result.newBalance)}*
        `.trim();

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling undo command:', error);
        bot.sendMessage(chatId, '❌ Lỗi hoàn tác. Vui lòng thử lại.');
    }
}
