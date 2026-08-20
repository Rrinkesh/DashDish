const nodemailer = require('nodemailer');

async function sendOtpEmail({ to, otp }) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    return {
      success: false,
      message: 'Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASS in the backend environment.'
    };
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

  const transporter = nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: smtpHost ? smtpPort : 587,
    secure: smtpHost ? smtpSecure : false,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  try {
    await transporter.sendMail({
      from: emailUser,
      to,
      subject: 'Your Verification OTP',
      text: `Your OTP for registration is ${otp}. It is valid for 10 minutes.`
    });

    return { success: true, message: 'OTP sent via email' };
  } catch (error) {
    console.error('Email send failed:', error);
    return {
      success: false,
      message: error?.response || error?.message || 'Failed to send OTP email.'
    };
  }
}

async function sendDeliveryPinEmail({ to, otp, orderId }) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (!emailUser || !emailPass) {
    console.warn('Email credentials are not configured. Cannot send delivery PIN email.');
    return {
      success: false,
      message: 'Email credentials are not configured. Please set EMAIL_USER and EMAIL_PASS in the backend environment.'
    };
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

  const transporter = nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: smtpHost ? smtpPort : 587,
    secure: smtpHost ? smtpSecure : false,
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  try {
    await transporter.sendMail({
      from: emailUser,
      to,
      subject: `Delivery Verification PIN for Order #${orderId.toString().substring(orderId.toString().length - 4).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0055A5; text-align: center;">Delivery Verification PIN</h2>
          <p>Hello,</p>
          <p>Your delivery agent has arrived nearby with your order <strong>#${orderId.toString().substring(orderId.toString().length - 4).toUpperCase()}</strong>.</p>
          <p>Please share the following 4-digit PIN with the driver to verify and receive your order:</p>
          <div style="background-color: #f0f8ff; border: 1px dashed #0055A5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0055A5; margin: 20px 0; border-radius: 5px;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 12px;">This PIN is valid for 15 minutes. For security, do not share this PIN with anyone else before delivery.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="font-size: 12px; text-align: center; color: #999;">Thank you for ordering with us!</p>
        </div>
      `
    });

    return { success: true, message: 'Delivery PIN sent via email' };
  } catch (error) {
    console.error('Delivery PIN email send failed:', error);
    return {
      success: false,
      message: error?.response || error?.message || 'Failed to send delivery PIN email.'
    };
  }
}

module.exports = { sendOtpEmail, sendDeliveryPinEmail };
