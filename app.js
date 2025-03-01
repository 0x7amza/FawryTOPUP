const express = require("express");
const app = express();
const db = require("./Models");
require("express-async-errors");
const logger = require("./logs/logger");
const errorHandler = require("./Middleware/errorHandler.middleware.js");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

app.use("/api", require("./Routes/index"));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "FawryTopUp API",
      version: "1.0.0",
      description: "FawryTopUp API Documentation",
      contact: {
        name: "Your Name",
        email: "your-email@example.com",
      },
      servers: ["http://localhost:3000"],
    },
  },
  apis: ["./Routes/*.js", "./swaggerSchemas.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
