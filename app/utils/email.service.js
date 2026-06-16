const nodemailer = require("nodemailer");

// Configure transporter using .env credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a booking confirmation email to the customer.
 * @param {string} toEmail     - recipient email address
 * @param {string} toName      - recipient display name
 * @param {object} booking     - booking details
 */
exports.sendConfirmationEmail = async (toEmail, toName, booking) => {
  const mailOptions = {
    from: `"OC Planetarium" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Booking Confirmed: ${booking.eventName}`,
    html: buildHtml(toName, booking),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Confirmation email sent:", info.messageId);
  return info;
};

function buildHtml(name, booking) {
  const seatList = booking.seats.map((s) => s.seat).join(", ");
  const formattedDate = new Date(booking.slotDatetime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const total = (booking.totalAmount / 100).toFixed(2);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #7B1E2E; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">OC Planetarium</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a1a2e;">Hi ${name}, your booking is confirmed! 🎉</h2>
        <hr style="border: 0.5px solid #eee;" />
        <p><strong>Event:</strong> ${booking.eventName}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Seats:</strong> ${seatList}</p>
        <p><strong>Order ID:</strong> #${booking.orderId}</p>
        <p><strong>Total Paid:</strong> $${total}</p>
        <hr style="border: 0.5px solid #eee;" />
        <p style="color: #666; font-size: 13px;">
          Please keep this email as your proof of purchase.<br/>
          We look forward to seeing you at the planetarium!
        </p>
        <p style="color: #666; font-size: 13px;"><em>OC Planetarium Team</em></p>
      </div>
    </div>
  `;
}