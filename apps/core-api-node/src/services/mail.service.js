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

module.exports = { sendInviteEmail };
