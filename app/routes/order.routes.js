module.exports = (app) => {
  const Order = require("../controllers/order.controller.js");
  const { authenticateRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Create a new Order
  router.post("/events/:eventId/slots/:slotId/orders", Order.create);

  // Retrieve all Orders
  router.get("/orders/", Order.findAll);

  // Retrieve all Orders for the given email (user or guestEmail)
  router.get("/orders/email", Order.findAllByEmail);

  // Retrieve all Orders for the current user
  router.get("/orders/user/current", Order.findAllByCurrentUser);

  // Retrieve all Orders for a specific user
  router.get("/orders/user/:userId", Order.findAllByUser);

  // Retrieve a single Order with id
  router.get("/orders/:id", Order.findOne);

  // Delete a Order with id
  router.delete("/orders/:id", Order.delete);

  // Delete all Orders
  router.delete("/orders/", Order.deleteAll);

  app.use("/planetapi", router);
};
