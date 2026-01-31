import { addBalance, subtractBalance, getCurrentBalance } from '../services/balanceService.js';
import { parseTransactionCommand, formatNumber } from '../services/messageParser.js';

/**
 * Transaction command handler - Vietnamese version
 */
export function handleTransaction(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    try {
        const parsed = parseTransactionCommand(text);

        if (!parsed) {
            bot.sendMessage(
                chatId,
                '❌ Sai định dạng. Hãy dùng:\n• +300k để thêm tiền\n• -50k để trừ tiền\n• +300k | ghi chú để thêm mô tả'
            );
            return;
        }

        const { operation, amount, description } = parsed;
        let newBalance;
        let emoji;
        let action;

        if (operation === 'add') {
            newBalance = addBalance(amount, description || 'Nhận tiền', msg.message_id);
            emoji = '➕';
            action = 'Đã Thêm';
        } else {
            newBalance = subtractBalance(amount, description || 'Chi tiêu', msg.message_id);
            emoji = '➖';
            action = 'Đã Trừ';
        }

        let message = `
${emoji} *Giao Dịch ${action}*

Số tiền: ${formatNumber(amount)}`;

        if (description) {
            message += `\nGhi chú: _${description}_`;
        }

        message += `\nSố dư mới: *${formatNumber(newBalance)}*`;

        bot.sendMessage(chatId, message.trim(), { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error handling transaction:', error);
        bot.sendMessage(chatId, '❌ Lỗi xử lý giao dịch. Vui lòng thử lại.');
    }
}
