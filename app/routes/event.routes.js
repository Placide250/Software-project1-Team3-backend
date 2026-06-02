module.exports = (app) => {
  const Event = require("../controllers/event.controller.js");
  const { authenticateRoute } = require("../authentication/authentication");
  var router = require("express").Router();

  // Create a new Event
  router.post("/events/", Event.create);

  // Retrieve a single Event with id
  router.get("/events/:id", Event.findOne);

  // Retrieve all Events
  router.get("/events/", Event.findAll);

  // Update a Event with id
  router.put("/events/:id", Event.update);

  // Delete a Event with id
  router.delete("/events/:id", Event.delete);

  // Delete all Events
  router.delete("/events/", Event.deleteAll);

  app.use("/planetapi", router);
};
