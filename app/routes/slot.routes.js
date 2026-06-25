module.exports = (app) => {
  const Slot = require("../controllers/slot.controller.js");
  const { adminRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Retrieve a single Slot with id
  router.get("/slots/:id", Slot.findOne);

  // Retrieve all slots
  router.get("/slots", Slot.findAll);

  // Retrieve all slots for today
  router.get("/slots/day/:date", Slot.findAllByDate);

  // Retrieve all slots for a specific event
  router.get("/events/:eventId/slots", Slot.findAllByEvent);

  // Create a new Slot for an event
  router.post("/events/:eventId/slots", [adminRoute], Slot.create);

  // Create new recurring slots in date range
  router.post("/events/:eventId/slots/recurring", [adminRoute], Slot.createRecurring);

  // Update a Slot with id
  router.put("/slots/:id", [adminRoute], Slot.update);

  // Delete a slot with id
  router.delete("/slots/:id", [adminRoute], Slot.delete);

  // Delete all slots
  router.delete("/slots/", [adminRoute], Slot.deleteAll);

  app.use("/planetapi", router);
};
