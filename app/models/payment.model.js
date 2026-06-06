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
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // since we're storing amount in cents
      get() {
        const rawValue = this.getDataValue("amount");
        return rawValue ? rawValue / 100 : 0;
      },
      // since we're storing amount in cents
      set(value) {
        this.setDataValue("amount", Math.round(value * 100));
      },
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
