const nodemailer = require("nodemailer");

// Configure transporter using .env credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a booking confirmation email to the customer.
 * @param {string} toEmail  - recipient email address
 * @param {string} toName   - recipient display name
 * @param {object} booking  - the saved booking record from the DB
 */
exports.sendConfirmationEmail = async (toEmail, toName, booking) => {
  const mailOptions = {
    from: `"Planetarium" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Booking confirmed: ${booking.name}`,
    html: buildHtml(toName, booking),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Confirmation email sent:", info.messageId);
  return info;
};

function buildHtml(name, booking) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a1a2e;">Hi ${name}, your booking is confirmed!</h2>
      <hr style="border: 0.5px solid #eee;" />
      <p><strong>Booking:</strong> ${booking.name}</p>
      <p><strong>Description:</strong> ${booking.description || "N/A"}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</p>
      <hr style="border: 0.5px solid #eee;" />
      <p style="color: #666; font-size: 13px;">
        Please keep this email as your proof of purchase.<br/>
        Thank you for booking with Planetarium!
      </p>
    </div>
  `;
}