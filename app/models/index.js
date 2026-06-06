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

db.ingredient = require("./ingredient.model.js")(sequelize, Sequelize);
db.recipe = require("./recipe.model.js")(sequelize, Sequelize);
db.event = require("./event.model.js")(sequelize, Sequelize);
db.order = require("./order.model.js")(sequelize, Sequelize);
db.payment = require("./payment.model.js")(sequelize, Sequelize);
db.ticket = require("./ticket.model.js")(sequelize, Sequelize);
db.slot = require("./slot.model.js")(sequelize, Sequelize);
db.recipeStep = require("./recipeStep.model.js")(sequelize, Sequelize);
db.recipeIngredient = require("./recipeIngredient.model.js")(
  sequelize,
  Sequelize,
);
db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);

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
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.order.belongsTo(db.user, {
  as: "user",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.order.hasOne(db.payment, {
  as: "payment",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
(db,
  payment.belongsTo(db.order, {
    as: "order",
    foreignKey: { allowNull: true },
    onDelete: "CASCADE",
  }));
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

// foreign key for recipe
db.user.hasMany(db.recipe, {
  as: "recipe",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.recipe.belongsTo(db.user, {
  as: "user",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});

// foreign key for recipeStep
db.recipe.hasMany(db.recipeStep, {
  as: "recipeStep",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.recipeStep.belongsTo(db.recipe, {
  as: "recipe",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

// foreign keys for recipeIngredient
db.recipeStep.hasMany(db.recipeIngredient, {
  as: "recipeIngredient",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.recipe.hasMany(db.recipeIngredient, {
  as: "recipeIngredient",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.ingredient.hasMany(db.recipeIngredient, {
  as: "recipeIngredient",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.recipeIngredient.belongsTo(db.recipeStep, {
  as: "recipeStep",
  foreignKey: { allowNull: true },
  onDelete: "CASCADE",
});
db.recipeIngredient.belongsTo(db.recipe, {
  as: "recipe",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});
db.recipeIngredient.belongsTo(db.ingredient, {
  as: "ingredient",
  foreignKey: { allowNull: false },
  onDelete: "CASCADE",
});

module.exports = db;
