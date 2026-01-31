/**
 * Help command handler - Vietnamese version
 */
export function handleHelp(bot, msg) {
  const chatId = msg.chat.id;

  const helpMessage = `
🤖 *Bot Quản Lý Tiền Của Mẹ*

📝 *Các Lệnh:*

\`/help\` - Xem hướng dẫn này
\`/balance\` - Xem số dư hiện tại
\`/today\` - Xem giao dịch hôm nay
\`/history\` - Xem giao dịch 7 ngày qua
\`/undo\` - Hoàn tác giao dịch cuối

💰 *Lệnh Giao Dịch:*

\`+300k\` - Thêm 300,000
\`-50k\` - Trừ 50,000
\`+300k mua rau\` - Thêm + ghi chú
\`-50k | tiền điện\` - Trừ + ghi chú

📊 *Cách Viết Tắt:*
• \`k\` = nghìn: \`300k\` = 300,000
• \`M\` = triệu: \`9M\` = 9,000,000
• Số thập phân: \`1.5M\` = 1,500,000

📅 *Ví Dụ Ngày Tháng:*
• \`/history 19/01\` - Ngày 19 tháng 1
• \`/history 2026-01-19\` - Ngày 19/01/2026

💡 *Mẹo Nhanh:*
• Gõ \`+300k\` hoặc \`-50k\` để thêm/trừ tiền
• Dùng \`/today\` để xem tổng hợp hôm nay
• Mọi giao dịch đều được lưu lại
  `.trim();

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}
