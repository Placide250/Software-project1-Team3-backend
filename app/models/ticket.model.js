module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define(
    "ticket",
    {
      seat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isWheelchair: {
        // need to cap to at most two per slot in the app layer
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["seat", "slotId"], // slotId is FK, this prevents duplicate tickets
        },
      ],
    },
  );
  return Ticket;
};
