const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Cấu hình Transporter Nodemailer
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
    });
  }

  // Chế độ mô phỏng / Development nếu chưa điền thông tin SMTP thật
  return {
    sendMail: async (options) => {
      console.log("==================================================");
      console.log("📧 [Mock Mailer] Giả lập gửi email thành công!");
      console.log(`   👉 Người nhận: ${options.to}`);
      console.log(`   👉 Tiêu đề:    ${options.subject}`);
      console.log(`   👉 Thời gian:  ${new Date().toLocaleString("vi-VN")}`);
      console.log("==================================================");
      return { messageId: `mock-${Date.now()}` };
    },
  };
};

const transporter = createTransporter();

class EmailService {
  /**
   * Gửi email chào mừng khi đăng ký tài khoản hội viên mới thành công
   */
  static async sendWelcomeEmail({ to, fullName }) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const sender = process.env.EMAIL_FROM || '"PetHub Vietnam" <no-reply@pethub.vn>';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng bạn đến với PetHub</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6fa; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #0667d0 0%, #044b99 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 30px; color: #17324d; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
        .perks { background: #f8faff; border: 1px solid #dfe6f0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .perks-title { font-weight: 700; font-size: 15px; margin-bottom: 12px; color: #0667d0; }
        .perk-item { display: flex; align-items: center; margin-bottom: 10px; font-size: 14px; }
        .btn-wrapper { text-align: center; margin: 32px 0 16px; }
        .btn { display: inline-block; background-color: #d84315; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; }
        .footer { background: #f8faff; padding: 20px 30px; text-align: center; font-size: 12px; color: #72849a; border-top: 1px solid #dfe6f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🐾 Chào mừng bạn đến với PetHub!</h1>
          <p>Hệ sinh thái chăm sóc & mua sắm cao cấp cho thú cưng</p>
        </div>
        <div class="body">
          <div class="greeting">Xin chào ${fullName || "Quý khách"},</div>
          <p>
            Cảm ơn bạn đã đăng ký tài khoản hội viên tại <strong>PetHub</strong>. Chúng tôi rất vinh hạnh được đồng hành cùng bạn trên hành trình chăm sóc và mang lại cuộc sống hạnh phúc nhất cho các bé thú cưng!
          </p>
          <div class="perks">
            <div class="perks-title">🎁 Đặc quyền hội viên PetHub của bạn:</div>
            <div class="perk-item">✓ Quản lý đơn hàng & xem lịch sử mua sắm theo thời gian thực.</div>
            <div class="perk-item">✓ Tự động đồng bộ giỏ hàng an toàn trên mọi thiết bị.</div>
            <div class="perk-item">✓ Đặt lịch dịch vụ Spa & Tắm sấy chuyên nghiệp với 1 cú click.</div>
            <div class="perk-item">✓ Ưu đãi giảm giá 10% cho đơn hàng đầu tiên (Mã: <strong>PETHUBWELCOME</strong>).</div>
          </div>
          <div class="btn-wrapper">
            <a href="${clientUrl}" class="btn" target="_blank">Khám phá PetHub ngay</a>
          </div>
        </div>
        <div class="footer">
          <p>PetHub Vietnam - 128 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
          <p>Hotline hỗ trợ: 1900 6868 | Email: support@pethub.vn</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: sender,
        to,
        subject: "🐾 Chào mừng bạn gia nhập hội viên PetHub!",
        html: htmlContent,
      });
      console.log(`✉️  [EmailService] Đã gửi mail chào mừng tới ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (error) {
      // Không để lỗi gửi email làm gián đoạn luồng đăng ký của khách hàng
      console.warn(`⚠️ [EmailService] Không thể gửi email tới ${to}:`, error.message);
      return null;
    }
  }
}

module.exports = EmailService;
