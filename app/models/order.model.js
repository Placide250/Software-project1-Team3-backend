module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
    childCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isCancelled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    guestEmail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return Order;
};
