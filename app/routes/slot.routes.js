module.exports = (app) => {
  const Slot = require("../controllers/slot.controller.js");
  const { authenticateRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Retrieve a single Slot with id
  router.get("/slots/:id", Slot.findOne);

  // Retrieve all slots
  router.get("/slots", Slot.findAll);

  // Retrieve all slots for a specific event
  router.get("/events/:eventId/slots", Slot.findAllByEvent);

  // Create a new Slot for an event
  router.post("/events/:eventId/slots", Slot.create);

  // Create new recurring slots in date range
  router.post("/events/:eventId/slots/recurring", Slot.createRecurring);

  // Update a Slot with id
  router.put("/slots/:id", Slot.update);

  // Delete a slot with id
  router.delete("/slots/:id", Slot.delete);

  // Delete all slots
  router.delete("/slots/", Slot.deleteAll);

  app.use("/planetapi", router);
};
