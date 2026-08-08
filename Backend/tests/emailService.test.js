const test = require('node:test');
const assert = require('node:assert/strict');
const { sendOtpEmail } = require('../services/emailService');

test('returns a clear error when email credentials are not configured', async () => {
  const originalUser = process.env.EMAIL_USER;
  const originalPass = process.env.EMAIL_PASS;

  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;

  try {
    const result = await sendOtpEmail({ to: 'user@example.com', otp: '123456' });
    assert.equal(result.success, false);
    assert.match(result.message, /configured|credentials/i);
  } finally {
    if (originalUser !== undefined) process.env.EMAIL_USER = originalUser;
    if (originalPass !== undefined) process.env.EMAIL_PASS = originalPass;
  }
});
