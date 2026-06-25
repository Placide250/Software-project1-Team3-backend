module.exports = (app) => {
  const Event = require("../controllers/event.controller.js");
  const { adminRoute } = require("../authentication/authentication");
  var router = require("express").Router();
  const upload = require("../middleware/upload");

  // Create a new Event
  router.post("/events/", [adminRoute], Event.create);

  // Retrieve a single Event with id
  router.get("/events/:id", Event.findOne);

  // Retrieve all Events
  router.get("/events/", Event.findAll);

  // Update a Event with id
  router.put("/events/:id", [adminRoute], Event.update);

  router.post(
    "/events/:id/logo",
    upload.single("logo"),
    Event.uploadLogo
  );

  // Delete a Event with id
  router.delete("/events/:id", [adminRoute], Event.delete);

  // Delete all Events
  router.delete("/events/", [adminRoute], Event.deleteAll);

  app.use("/planetapi", router);
};
