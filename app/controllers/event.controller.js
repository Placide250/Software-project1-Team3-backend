const db = require("../models");
const Event = db.event;
const Ticket = db.ticket;
const Slot = db.slot;
const Op = db.Sequelize.Op;

// Create and Save a new Event
exports.create = async (req, res) => {
  try {
    if (!req.body.name) {
      const error = new Error("Name cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (!req.body.description) {
      const error = new Error("Description cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (!req.body.price) {
      const error = new Error("Price cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.price < 0) {
      const error = new Error("Price cannot be negative for event!");
      error.statusCode = 400;
      throw error;
    }

    const event = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
    };

    const data = await Event.create(event);
    res.send(data);
  } catch (err) {
    res.status(err.statusCode || 500).send({
      message: err.message || "Some error occurred while creating the Event.",
    });
  }
};

// Retrieve all Events from the database.
exports.findAll = async (req, res) => {
  const eventId = req.query.eventId;
  var condition = eventId
    ? {
        id: {
          [Op.like]: `%${eventId}%`,
        },
      }
    : null;

  try {
    const data = await Event.findAll({
      where: condition,
      order: [["name", "ASC"]],
      include: [
        {
          model: Slot,
          as: "slots",
          required: false,
          include: [
            {
              model: Ticket,
              as: "tickets",
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: Slot, as: "slots" }, "datetime", "ASC"]],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving events.",
    });
  }
};

// Find a single Event with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Event.findAll({
      where: { id: id },
      include: [
        {
          model: Slot,
          as: "slots",
          required: false,
          include: [
            {
              model: Ticket,
              as: "tickets",
              required: false,
            },
          ],
        },
      ],
      order: [[{ model: Slot, as: "slots" }, "datetime", "ASC"]],
    });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find Event with id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Event with id=" + id,
    });
  }
};

// Update a Event by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    if (!req.body.name) {
      const error = new Error("Name cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (!req.body.description) {
      const error = new Error("Description cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (!req.body.price) {
      const error = new Error("Price cannot be empty for event!");
      error.statusCode = 400;
      throw error;
    } else if (req.body.price < 0) {
      const error = new Error("Price cannot be negative for event!");
      error.statusCode = 400;
      throw error;
    }

    const number = await Event.update(req.body, {
      where: { id: id },
    });
    if (number == 1) {
      res.send({
        message: "Event was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Event with id=${id}. Maybe Event was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error updating Event with id=" + id,
    });
  }
};

// Delete a Event with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const number = await Event.destroy({
      where: { id: id },
    });
    if (number == 1) {
      res.send({
        message: "Event was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Event with id=${id}. Maybe Event was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Event with id=" + id,
    });
  }
};

// Delete all Events from the database.
exports.deleteAll = async (req, res) => {
  try {
    const number = await Event.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${number} Events were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all events.",
    });
  }
};
