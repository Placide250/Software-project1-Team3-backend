const { authenticate } = require("../authentication/authentication");
const { PAYMENT_METHODS, STANDARD_SEAT_COUNT } = require("../config/constants");
const db = require("../models");
const { httpError } = require("../utils/httpUtils");
const Event = db.event;
const Order = db.order;
const Payment = db.payment;
const Ticket = db.ticket;
const Slot = db.slot;
const User = db.user;
const Op = db.Sequelize.Op;

// Create and Save a new Order
exports.create = async (req, res) => {
  let { userId } = await authenticate(req, res, (require = false));
  const { eventId, slotId } = req.params;
  const {
    selectedSeats,
    childCount,
    guestEmail,
    paymentMethod,
    paymentToken,
    cardName,
    cardNumber,
    expirationMonth,
    expirationYear,
  } = req.body;

  try {
    // validate
    if (!selectedSeats || selectedSeats.length === 0) {
      throw httpError("Must sepcify seat selection for an order!", 400);
    }

    if (childCount === undefined || childCount < 0) {
      throw httpError("Child count must be a nonnegative integer!", 400);
    }

    if (!userId && !guestEmail?.trim()) {
      throw httpError("Must be authenticated or enter a guest email!", 400);
    }

    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      throw httpError("Invalid payment method!", 400);
    }

    if (paymentMethod === "credit_card") {
      if (!cardName || !cardNumber || !expirationMonth || !expirationYear) {
        throw httpError("Credit card info must be provided!", 400);
      }
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      throw httpError("Event not found!", 404);
    }

    const slot = await Slot.findByPk(slotId, {
      include: [
        {
          model: Ticket,
          as: "tickets",
        },
      ],
    });
    if (!slot) {
      throw httpError("Slot not found!", 404);
    }

    const result = await db.sequelize.transaction(async (t) => {
      // make sure the seats are available
      if (
        selectedSeats.some((selection) =>
          slot.tickets.some((ticket) => ticket.seat === selection.seat),
        )
      ) {
        throw httpError(
          "At least one of your selected seats is already reserved.",
          409,
        );
      }

      // create order
      const order = await Order.create(
        {
          userId,
          slotId,
          childCount,
          guestEmail: guestEmail?.trim() ? guestEmail.trim() : null,
        },
        { transaction: t },
      );

      // reserve tickets
      const ticketsToReserve = selectedSeats.map((selection) => ({
        seat: selection.seat,
        isWheelchair: selection.isWheelchair,
        orderId: order.id,
        slotId: slot.id,
        archivedPrice: event.price,
      }));
      const tickets = await Ticket.bulkCreate(ticketsToReserve, {
        transaction: t,
      });

      // record payment
      const isCreditCard = paymentMethod === "credit_card";
      const payment = await Payment.create(
        {
          orderId: order.id,
          paymentMethod,
          status: "processing",
          amount: event.price * (selectedSeats.length - childCount),
          cardName: isCreditCard ? cardName : null,
          cardNumber: isCreditCard ? cardNumber : null,
          expirationMonth: isCreditCard ? expirationMonth : null,
          expirationYear: isCreditCard ? expirationYear : null,
          thirdPartyPaymentToken: paymentToken || null,
        },
        { transaction: t },
      );

      // send confirmation email
      // TODO: send email
      // TODO: create QR codes for each ticket

      return { order, tickets, payment };
    });
    res.send(result);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "At least one of your selected seats is already reserved.",
      });
    }

    res.status(err.statusCode || 500).send({
      message: err.message || "Some error occurred while creating the order.",
    });
  }
};

// Retrieve all Orders from the database.
exports.findAll = async (req, res) => {
  const orderId = req.query.orderId;
  var condition = orderId
    ? {
        id: {
          [Op.like]: `%${orderId}%`,
        },
      }
    : null;

  try {
    const data = await Order.findAll({
      where: condition,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Payment,
          as: "payment",
          required: true,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName", "isAdmin"],
          required: false,
        },
        {
          model: Ticket,
          as: "tickets",
          required: true,
          include: [
            {
              model: Slot,
              as: "slot",
              required: true,
              include: [
                {
                  model: Event,
                  as: "event",
                  required: true,
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
      message: err.message || "Some error occurred while retrieving orders.",
    });
  }
};

// Find a single Order with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Order.findAll({
      where: { id: id },
      include: [
        {
          model: Payment,
          as: "payment",
          required: true,
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName", "isAdmin"],
          required: false,
        },
        {
          model: Ticket,
          as: "tickets",
          required: true,
          include: [
            {
              model: Slot,
              as: "slot",
              required: true,
              include: [
                {
                  model: Event,
                  as: "event",
                  required: true,
                },
                {
                  model: Ticket,
                  as: "tickets",
                  required: false,
                  separate: true,
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
        message: `Cannot find Order with id=${id}.`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving Order with id=" + id,
    });
  }
};

// Delete a Order with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const number = await Order.destroy({
      where: { id: id },
    });
    if (number == 1) {
      res.send({
        message: "Order was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Order with id=${id}. Maybe Order was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message || "Could not delete Order with id=" + id,
    });
  }
};

// Delete all orders from the database.
exports.deleteAll = async (req, res) => {
  try {
    const number = await Order.destroy({
      where: {},
      truncate: false,
    });
    res.send({ message: `${number} Orders were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all orders.",
    });
  }
};
