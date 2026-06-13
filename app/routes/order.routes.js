module.exports = (app) => {
  const Order = require("../controllers/order.controller.js");
  const {
    authenticateRoute,
    adminRoute,
  } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Create a new Order
  router.post("/events/:eventId/slots/:slotId/orders", Order.create);

  // Retrieve all Orders
  router.get("/orders/", [adminRoute], Order.findAll);

  // Retrieve all Orders for the given email (user or guestEmail)
  router.get("/orders/email", [adminRoute], Order.findAllByEmail);

  // Retrieve all Orders for the current user
  router.get(
    "/orders/user/current",
    [authenticateRoute],
    Order.findAllByCurrentUser,
  );

  // Retrieve all Orders for a specific user
  router.get("/orders/user/:userId", [adminRoute], Order.findAllByUser);

  // Retrieve a single Order with id
  router.get("/orders/:id", [authenticateRoute], Order.findOne);

  // Delete a Order with id
  router.delete("/orders/:id", [adminRoute], Order.delete);

  // Delete all Orders
  router.delete("/orders/", [adminRoute], Order.deleteAll);

  app.use("/planetapi", router);
};
