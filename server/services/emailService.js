import nodemailer from 'nodemailer';

let transporter = null;

const isEmailConfigured = () => {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  );
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('[Email] SMTP env variables missing. Emails will not be sent.');
    return null;
  }

  try {
    const secure = process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (error) {
    console.error('[Email] Failed to initialize transporter', error);
    return null;
  }
};

export async function sendBookingConfirmationEmail(booking) {
  if (!transporter) {
    transporter = createTransporter();
  }

  if (!transporter) {
    return;
  }

  const {
    name,
    email,
    phone,
    date,
    time,
    guests,
    diningPreference,
    tableNumber,
    bookingId,
  } = booking;

  const subject = `Xác nhận đặt bàn tại Aura Dining - ${date} ${time}`;
  const preferenceLabel = diningPreference === 'indoor' ? 'Trong nhà' : 'Ngoài trời';
  const tableInfo = tableNumber ? `\n- Bàn: ${tableNumber}` : '';

  const html = `
    <h2>Xin chào ${name},</h2>
    <p>Cảm ơn bạn đã đặt bàn tại nhà hàng Aura Dining.</p>
    <p>Chi tiết đặt bàn:</p>
    <ul>
      <li><strong>Ngày:</strong> ${date}</li>
      <li><strong>Giờ:</strong> ${time}</li>
      <li><strong>Số khách:</strong> ${guests}</li>
      <li><strong>Vị trí:</strong> ${preferenceLabel}</li>
      ${tableNumber ? `<li><strong>Bàn:</strong> ${tableNumber}</li>` : ''}
      <li><strong>Số điện thoại:</strong> ${phone}</li>
    </ul>
    <p>Mã đặt bàn: <strong>${bookingId}</strong></p>
    <p>Chúng tôi rất mong được phục vụ bạn.</p>
    <p>Trân trọng,<br/>Aura Dining</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });

    // Notify admin about the new booking if ADMIN_EMAIL is configured
    if (process.env.ADMIN_EMAIL) {
      const adminSubject = `New booking: ${date} ${time} - ${name}`;
      const adminHtml = `
        <h3>New booking received</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Guests:</strong> ${guests}</li>
          <li><strong>Preference:</strong> ${preferenceLabel}</li>
          ${tableNumber ? `<li><strong>Table:</strong> ${tableNumber}</li>` : ''}
          <li><strong>Booking ID:</strong> ${bookingId}</li>
        </ul>
      `;

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: adminSubject,
          html: adminHtml,
        });
      } catch (error) {
        console.error('[Email] Failed to send admin notification email', error);
      }
    }
  } catch (error) {
    console.error('[Email] Failed to send confirmation email', error);
  }
}


