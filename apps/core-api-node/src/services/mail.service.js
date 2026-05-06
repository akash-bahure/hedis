const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mailpit",
  port: 1025,
  secure: false,
});

const sendInviteEmail = async (toEmail, name) => {
  return transporter.sendMail({
    from: "no-reply@yourapp.com",
    to: toEmail,
    subject: "User Invitation",
    html: `
      <h3>Hello ${name || "User"},</h3>
      <p>You have been invited to the system.</p>
      <p>Please login to continue.</p>
    `,
  });
};

module.exports = { sendInviteEmail };
