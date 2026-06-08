module.exports = (app) => {
  const qr = require("../controllers/qr.controller");

  const router = require("express").Router();

  router.post("/qr/generate", qr.generateQR);

  router.get(
    "/qr/generate/:uuid",
    qr.generateTicketQR
  );

  app.use("/planetapi", router);
};