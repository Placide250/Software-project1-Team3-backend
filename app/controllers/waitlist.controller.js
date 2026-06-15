const db = require("../models");
const { httpError } = require("../utils/httpUtils");
const Waitlist = db.waitlist;
const Event = db.event;
const User = db.user;

// Add user to waitlist for an event
exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, userId, eventId } = req.body;

    if (!firstName) throw httpError("First name cannot be empty!", 400);
    if (!lastName) throw httpError("Last name cannot be empty!", 400);
    if (!email) throw httpError("Email cannot be empty!", 400);
    if (!eventId) throw httpError("Event ID cannot be empty!", 400);

    const event = await Event.findByPk(eventId);
    if (!event) throw httpError("Event not found!", 404);

    // Check if user is already on the waitlist for this event
    if (userId) {
      const existing = await Waitlist.findOne({
        where: { userId, eventId },
      });
      if (existing) {
        throw httpError("You are already on the waitlist for this event!", 409);
      }
    }

    const entry = await Waitlist.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      userId: userId || null,
      eventId,
    });

    res.status(201).send(entry);
  } catch (err) {
    res.status(err.statusCode || 500).send({
      message: err.message || "Some error occurred while joining the waitlist.",
    });
  }
};

// Get all waitlist entries for a specific event
exports.findByEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const data = await Waitlist.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: "user",
          required: false,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Error retrieving waitlist for event with id=" + eventId,
    });
  }
};

// Get all waitlist entries for a specific user
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const data = await Waitlist.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: "event",
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message ||
        "Error retrieving waitlist for user with id=" + userId,
    });
  }
};

// Remove a user from the waitlist
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const number = await Waitlist.destroy({
      where: { id },
    });
    if (number == 1) {
      res.send({ message: "Removed from waitlist successfully." });
    } else {
      res.status(404).send({
        message: `Cannot find waitlist entry with id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not remove waitlist entry with id=" + id,
    });
  }
};