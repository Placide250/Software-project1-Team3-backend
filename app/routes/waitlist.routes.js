module.exports = (app) => {
  const Waitlist = require("../controllers/waitlist.controller.js");
  var router = require("express").Router();

  // Add user to waitlist for an event
  router.post("/waitlist", Waitlist.create);

  // Get all waitlist entries for a specific event
  router.get("/waitlist/event/:eventId", Waitlist.findByEvent);

  // Get all waitlist entries for a specific user
  router.get("/waitlist/user/:userId", Waitlist.findByUser);

  // Remove a user from the waitlist
  router.delete("/waitlist/:id", Waitlist.delete);

  app.use("/planetapi", router);
};