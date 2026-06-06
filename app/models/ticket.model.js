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
      archivedPrice: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // since we're storing amount in cents
        get() {
          const rawValue = this.getDataValue("archivedPrice");
          return rawValue ? rawValue / 100 : 0;
        },
        // since we're storing amount in cents
        set(value) {
          this.setDataValue("archivedPrice", Math.round(value * 100));
        },
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
