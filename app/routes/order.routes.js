module.exports = (app) => {
  const Order = require("../controllers/order.controller.js");
  const { authenticateRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Create a new Order
  router.post("/events/:eventId/slots/:slotId/orders", Order.create);

  // Retrieve a single Order with id
  router.get("/orders/:id", Order.findOne);

  // Retrieve all Orders
  router.get("/orders/", Order.findAll);

  // Delete a Order with id
  router.delete("/orders/:id", Order.delete);

  // Delete all Orders
  router.delete("/orders/", Order.deleteAll);

  app.use("/planetapi", router);
};
