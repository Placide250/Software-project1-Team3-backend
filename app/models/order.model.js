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
  });
  return Order;
};
