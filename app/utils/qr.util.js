const QRCode = require("qrcode");

const generateQRCodeDataURL = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
    });
  } catch (error) {
    throw new Error(`QR generation failed: ${error.message}`);
  }
};

module.exports = {
  generateQRCodeDataURL,
};