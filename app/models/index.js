const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.event = require("./event.model.js")(sequelize, Sequelize);
db.order = require("./order.model.js")(sequelize, Sequelize);
db.payment = require("./payment.model.js")(sequelize, Sequelize);
db.ticket = require("./ticket.model.js")(sequelize, Sequelize);
db.slot = require("./slot.model.js")(sequelize, Sequelize);
db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.waitlist = require("./waitlist.model.js")(sequelize, Sequelize);

// foreign key for session
db.user.hasMany(db.session, {
  as: "session",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.session.belongsTo(db.user, {
  as: "user",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

// foreign keys for events
db.event.hasMany(db.slot, {
  as: "slots",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.slot.belongsTo(db.event, {
  as: "event",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

// foreign key for order
db.user.hasMany(db.order, {
  as: "order",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.order.belongsTo(db.user, {
  as: "user",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.order.hasOne(db.payment, {
  as: "payment",
  foreignKey: { name: "orderId", allowNull: true },
  onDelete: "CASCADE",
});
db.payment.belongsTo(db.order, {
  as: "order",
  foreignKey: { name: "orderId", allowNull: true },
  onDelete: "CASCADE",
});
db.order.hasMany(db.ticket, {
  as: "tickets",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.ticket.belongsTo(db.order, {
  as: "order",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

// foreign key for ticket
db.ticket.belongsTo(db.slot, {
  as: "slot",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.slot.hasMany(db.ticket, {
  as: "tickets",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

// foreign keys for waitlist
db.slot.hasMany(db.waitlist, {
  as: "waitlist",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.waitlist.belongsTo(db.slot, {
  as: "slot",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.user.hasMany(db.waitlist, {
  as: "waitlist",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.waitlist.belongsTo(db.user, {
  as: "user",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});

module.exports = db;