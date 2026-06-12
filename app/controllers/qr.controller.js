const { generateQRCodeDataURL } = require("../utils/qr.util");

exports.generateQR = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send({
      message: "text is required",
    });
  }

  try {
    const qrDataURL = await generateQRCodeDataURL(text);

    res.status(200).send({
      qrDataURL,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

exports.generateTicketQR = async (req, res) => {
  const { uuid } = req.params;

  const ticketURL =
    `https://planetarium.com/tickets/verify/${uuid}`;

  try {
    const qrDataURL =
      await generateQRCodeDataURL(ticketURL);

    res.status(200).send({
      uuid,
      ticketURL,
      qrDataURL,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};