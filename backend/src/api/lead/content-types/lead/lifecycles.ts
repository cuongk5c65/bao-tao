import type { Core } from '@strapi/strapi';

export default {
  async afterCreate(event: any) {
    const { result } = event;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('Telegram Bot Token or Chat ID is missing in environment variables.');
      return;
    }

    try {
      const customerName = result.customer_name || 'Chưa cung cấp';
      const phone = result.phone || 'Chưa cung cấp';
      const carInterested = result.car_interested || 'Chưa chọn';
      const province = result.province || 'Chưa cung cấp';
      const notes = result.notes || 'Không có';

      const message = `<b>🆕 CÓ KHÁCH HÀNG ĐĂNG KÝ MỚI!</b>\n` +
        `----------------------------------\n` +
        `👤 <b>Họ và tên:</b> ${customerName}\n` +
        `📞 <b>Số điện thoại:</b> <code>${phone}</code>\n` +
        `🚗 <b>Dòng xe quan tâm:</b> ${carInterested}\n` +
        `📍 <b>Tỉnh thành:</b> ${province}\n` +
        `📝 <b>Ghi chú:</b> ${notes}\n` +
        `----------------------------------\n` +
        `📅 <i>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</i>`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const responseData = await response.text();
        console.error('Failed to send message to Telegram:', responseData);
      } else {
        console.log('Successfully sent notification to Telegram bot.');
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  },
};
