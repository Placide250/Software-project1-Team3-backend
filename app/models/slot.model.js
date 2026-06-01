module.exports = (sequelize, Sequelize) => {
  const Slot = sequelize.define("slot", {
    datetime: {
      type: Sequelize.DATE,
      allowNull: false,
      unique: true,
    },
    seatsAvailable: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return Slot;
};
