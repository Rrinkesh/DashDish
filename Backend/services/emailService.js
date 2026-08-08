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

module.exports = { sendOtpEmail };
