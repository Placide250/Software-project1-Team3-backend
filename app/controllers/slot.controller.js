const {
  ALLOWED_FREQUENCIES,
  TIME_VALIDATOR,
  MAX_SLOTS,
} = require("../config/constants");
const db = require("../models");
const { nthDate, combineDateAndTime } = require("../utils/dateUtils");
const { httpError } = require("../utils/httpUtils");
const {
  sendSlotUpdatedEmail,
  sendSlotCancelledEmail,
} = require("../utils/email.service.js");
const Slot = db.slot;
const Order = db.order;
const Ticket = db.ticket;
const User = db.user;
const Event = db.event;
const Op = db.Sequelize.Op;

// Create and Save a new slot for an event
exports.create = async (req, res) => {
  try {
    if (!req.body.datetime) {
      throw httpError("Datetime cannot be empty for slot!", 400);
    }

    const eventId = req.params.eventId;
    if (!eventId) {
      throw httpError("Event id cannot be empty for slot!", 400);
    }

    const datetime = new Date(req.body.datetime);
    if (isNaN(datetime.getTime())) {
      throw httpError("Datetime is not a valid date!", 400);
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw httpError("Event not found!", 404);
    }

    const slot = {
      datetime: new Date(req.body.datetime),
    };

    const data = await event.createSlot(slot);
    res.send(data);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "This action would create a scheduling conflict.",
      });
    }

    res.status(err.statusCode || 500).send({
      message: err.message || "Some error occurred while creating the slot.",
    });
  }
};

// Create recurring slots for an event
exports.createRecurring = async (req, res) => {
  try {
    // extract request body and params
    const { frequency, startDate, endDate, times } = req.body;
    const eventId = req.params.eventId;

    // a whole lotta validation
    if (!frequency) {
      throw httpError("Frequency cannot be empty for recurring slots!", 400);
    } else if (!ALLOWED_FREQUENCIES.includes(frequency)) {
      throw httpError(
        `Frequency must be one of: ${ALLOWED_FREQUENCIES.join(", ")}.`,
        400,
      );
    } else if (!startDate) {
      throw httpError("startDate cannot be empty for recurring slots!", 400);
    } else if (!endDate) {
      throw httpError("endDate cannot be empty for recurring slots!", 400);
    } else if (!eventId) {
      throw httpError("Event id cannot be empty for slot!", 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime())) {
      throw httpError("startDate is not a valid date!", 400);
    } else if (isNaN(end.getTime())) {
      throw httpError("endDate is not a valid date!", 400);
    } else if (start > end) {
      throw httpError("startDate must be before endDate!", 400);
    }

    let timeList = null;
    if (!times || !Array.isArray(times) || times.length === 0) {
      throw httpError("times must be a non-empty array of HH:mm strings.", 400);
    }

    times.forEach((t) => {
      if (!TIME_VALIDATOR.test(t)) {
        throw httpError(`Invalid time "${t}". Use 24-hour HH:mm format.`, 400);
      }
    });
    timeList = times;

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw httpError("Event not found!", 404);
    }

    // Generate the list of dates we want to create slots on
    const dates = [];
    for (let n = 0; true; n++) {
      const d = nthDate(start, frequency, n);
      if (d > end) break;
      dates.push(d);
      if (dates.length > MAX_SLOTS) {
        throw httpError(
          `Too many dates requested (limit ${MAX_SLOTS}). Narrow the range.`,
          400,
        );
      }
    }

    // Add all the time occurences to the list of dates to get a final list of slots to create
    const slots = [];
    dates.forEach((date) => {
      if (timeList) {
        timeList.forEach((t) => {
          slots.push({
            datetime: combineDateAndTime(date, t),
            eventId,
          });
        });
      } else {
        slots.push({ datetime: new Date(date), eventId });
      }
      if (slots.length > MAX_SLOTS) {
        throw httpError(
          `Too many slots requested (limit ${MAX_SLOTS}). Reduce dates or times.`,
          400,
        );
      }
    });

    const data = await Slot.bulkCreate(slots);
    res.send(data);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "This action would create a scheduling conflict.",
      });
    }

    res.status(err.statusCode || 500).send({
      message:
        err.message || "Some error occurred while creating recurring slots.",
    });
  }
};

// Retrieve all slots from the database.
exports.findAll = async (req, res) => {
  const slotId = req.query.slotId;
  var condition = slotId
    ? {
        id: {
          [Op.like]: `%${slotId}%`,
        },
      }
    : null;

  try {
    const data = await Slot.findAll({
      where: condition,
      order: [["datetime", "ASC"]],
      include: [
        {
          model: Event,
          as: "event",
          required: false,
        },
        {
          model: Ticket,
          as: "tickets",
          required: false,
          include: [
            {
              model: Order,
              as: "order",
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving slots.",
    });
  }
};


// Retrieve all slots for today
exports.findAllByDate = async (req, res) => {
  //today
  const date = new Date(req.params.date);
  const startDay = date.setHours(0, 0, 0, 0);
  //5 am today
  const endDay = date.setHours(23, 59, 59, 999);
  //5am next day
  try {
    const data = await Slot.findAll({
      where: { 
        datetime: {
          [Op.gt]: startDay,
          [Op.lt]: endDay,
        },
    },
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error retrieving slots for time=" + startDay + " to " + endDay,
    });
  }
};

// Find a single slots with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Slot.findAll({
      where: { id: id },
      include: [
        {
          model: Event,
          as: "event",
          required: false,
        },
        {
          model: Ticket,
          as: "tickets",
          required: false,
          include: [
            {
              model: Order,
              as: "order",
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  required: false,
                },
              ],
            },
          ],
        },
      ],
    });
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `Cannot find slot with id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving slot with id=" + id,
    });
  }
};

// Retrieve all slots for a specific event
exports.findAllByEvent = async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const data = await Slot.findAll({
      where: { eventId: eventId },
    });
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Error retrieving slots for event with id=" + eventId,
    });
  }
};

/**
 * Look up everything we need to email customers about a slot: the event name,
 * and one row per non-cancelled Order tied to this slot (via Ticket) with the
 * recipient's email/name and the seats they booked.
 *
 * Order does not have a slotId column directly -- the link is
 * Order -> Ticket -> Slot, so we find tickets for this slot first, then group
 * by their (non-cancelled) order.
 */
async function getNotifiableOrdersForSlot(slotId) {
  const slot = await Slot.findByPk(slotId, {
    include: [
      {
        model: Event,
        as: "event",
        required: false,
      },
    ],
  });

  if (!slot) return { slot: null, eventName: null, recipients: [] };

  const tickets = await Ticket.findAll({
    where: { slotId: slotId },
    include: [
      {
        model: Order,
        as: "order",
        required: true,
        where: { isCancelled: false },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email", "firstName"],
            required: false,
          },
        ],
      },
    ],
  });

  // group tickets by orderId so each customer gets one email listing all their seats
  const orderMap = new Map();
  for (const ticket of tickets) {
    const order = ticket.order;
    if (!order) continue;

    if (!orderMap.has(order.id)) {
      orderMap.set(order.id, {
        order,
        seats: [],
      });
    }
    orderMap.get(order.id).seats.push(ticket);
  }

  const recipients = [];
  for (const { order, seats } of orderMap.values()) {
    const email = order.guestEmail || order.user?.email;
    if (!email) continue; // nothing we can do without an address

    const name = order.user?.firstName || "Guest";
    recipients.push({
      email,
      name,
      orderId: order.id,
      seats,
    });
  }

  return {
    slot,
    eventName: slot.event?.name || "your upcoming event",
    recipients,
  };
}

// Update a slot by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  try {
    const existingSlot = await Slot.findByPk(id);
    if (!existingSlot) {
      return res.send({
        message: `Cannot update slot with id=${id}. Maybe slot was not found or req.body is empty!`,
      });
    }

    const oldDatetime = existingSlot.datetime;
    const newDatetime = req.body.datetime
      ? new Date(req.body.datetime)
      : oldDatetime;
    const datetimeChanged =
      req.body.datetime && new Date(oldDatetime).getTime() !== newDatetime.getTime();

    const [number] = await Slot.update(req.body, {
      where: { id: id },
    });

    if (number != 1) {
      return res.send({
        message: `Cannot update slot with id=${id}. Maybe slot was not found or req.body is empty!`,
      });
    }

    // notify customers only if the date/time actually changed
    if (datetimeChanged) {
      try {
        const { eventName, recipients } = await getNotifiableOrdersForSlot(id);
        for (const recipient of recipients) {
          await sendSlotUpdatedEmail(recipient.email, recipient.name, {
            eventName,
            oldDatetime,
            newDatetime,
            seats: recipient.seats,
            orderId: recipient.orderId,
          });
        }
      } catch (emailErr) {
        console.error(
          "Slot update email sending failed (non-fatal):",
          emailErr.message,
        );
      }
    }

    res.send({
      message: "Slot was updated successfully.",
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "This action would create a scheduling conflict.",
      });
    }

    res.status(500).send({
      message: err.message || "Error updating slot with id=" + id,
    });
  }
};

// Delete a slot with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const existingSlot = await Slot.findByPk(id);
    if (!existingSlot) {
      return res.send({
        message: `Cannot delete slot with id=${id}. Maybe slot was not found!`,
      });
    }

    // gather who needs to be notified + cancel their orders before the slot is gone
    const { eventName, recipients } = await getNotifiableOrdersForSlot(id);
    const slotDatetime = existingSlot.datetime;

    // Order has no slotId column -- cancel every order that has at least one
    // ticket on this slot (the recipients we already collected give us the
    // exact set of order ids to cancel).
    const orderIdsToCancel = recipients.map((r) => r.orderId);
    if (orderIdsToCancel.length > 0) {
      await Order.update(
        { isCancelled: true },
        {
          where: {
            id: { [Op.in]: orderIdsToCancel },
            isCancelled: false,
          },
        },
      );
    }

    const number = await Slot.destroy({
      where: { id: id },
    });

    if (number == 1) {
      try {
        for (const recipient of recipients) {
          await sendSlotCancelledEmail(recipient.email, recipient.name, {
            eventName,
            slotDatetime,
            seats: recipient.seats,
            orderId: recipient.orderId,
          });
        }
      } catch (emailErr) {
        console.error(
          "Slot cancellation email sending failed (non-fatal):",
          emailErr.message,
        );
      }

      res.send({
        message: "Slot was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete slot with id=${id}. Maybe slot was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete slot with id=" + id,
    });
  }
};

// Delete all slots from the database.
exports.deleteAll = async (req, res) => {
  try {
    const number = await Slot.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${number} slots were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all slots.",
    });
  }
};