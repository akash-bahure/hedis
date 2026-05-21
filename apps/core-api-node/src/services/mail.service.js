const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mailpit",
  port: 1025,
  secure: false,
});

const sendInviteEmail = async (toEmail, name, token) => {
  // Update this URL to point to your frontend application's set-password page
  const inviteLink = `http://localhost:3000/set-password?token=${token}`;

  return transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: toEmail,
    subject: "You're Invited!",
    html: `
        <h2>Hello ${name || "User"},</h2>
        <p>You have been invited.</p>
        <a href="${inviteLink}">Set Password</a>
        <p>Expires in 24 hours</p>
      `,
  });
};

const sendResetEmail = async (toEmail, name, token) => {
  // Update this URL to point to your frontend application's reset-password page
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;

  return transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: toEmail,
    subject: "Password Reset Request",
    html: `
        <h2>Hello ${name || "User"},</h2>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
  });
};

const sendOTPEmail = async (toEmail, otp) => {
  return transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: toEmail,
    subject: "Your Login OTP",
    html: `
        <h2>Verification Code</h2>
        <p>Your 6-digit OTP for login is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      `,
  });
};

module.exports = { sendInviteEmail, sendResetEmail, sendOTPEmail };

