module.exports = (app) => {
  const Waitlist = require("../controllers/waitlist.controller.js");
  var router = require("express").Router();

  // Add user to waitlist for a timeslot
  router.post("/waitlist", Waitlist.create);

  // Get all waitlist entries for a specific timeslot
  router.get("/waitlist/slot/:slotId", Waitlist.findBySlot);

  // Get all waitlist entries for a specific user
  router.get("/waitlist/user/:userId", Waitlist.findByUser);

  // Remove a user from the waitlist
  router.delete("/waitlist/:id", Waitlist.delete);

  app.use("/planetapi", router);
};