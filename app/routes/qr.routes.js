module.exports = (app) => {
  const qr = require("../controllers/qr.controller");

  app.post("/api/qr/generate", qr.generateQR);

  app.get(
    "/api/qr/generate/:uuid",
    qr.generateTicketQR
  );
};