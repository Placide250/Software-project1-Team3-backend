module.exports = (sequelize, Sequelize) => {
  const Payment = sequelize.define("payment", {
    paymentType: {
      type: DataTypes.ENUM("credit_card", "paypal", "google_pay", "apple_pay"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "processing",
        "complete",
        "failed",
        "cancelled",
        "refunded",
      ),
      allowNull: false,
      defaultValue: "processing",
    },
    cardName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    cardNumber: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    expirationMonth: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    expirationYear: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    accountEmail: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return Payment;
};
