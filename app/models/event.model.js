module.exports = (sequelize, Sequelize) => {
  const Event = sequelize.define("event", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // since we're storing price in cents
      get() {
        const rawValue = this.getDataValue("price");
        return rawValue ? rawValue / 100 : 0;
      },
      // since we're storing price in cents
      set(value) {
        this.setDataValue("price", Math.round(value * 100));
      },
    },
    isCancelled: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  return Event;
};
