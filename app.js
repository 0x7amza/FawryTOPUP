const express = require("express");
const app = express();
const db = require("./Models");
require("express-async-errors");
const logger = require("./logs/logger");
const errorHandler = require("./Middleware/errorHandler.middleware.js");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./Routes/index"));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Synced db.");

    logger.info("Synced db.");
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
      logger.info(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
    logger.error("Failed to sync db: " + err.message);
  });

module.exports = app;
