require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const connectDB = require("./config/Database");
const { connectRabbitMQ, startConsuming } = require("./config/RabbitMQ");

const authRoutes = require("./routes/user");
const notificationRoutes = require("./routes/notification");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API with WebSocket and RabbitMQ",
      version: "1.0.0",
      description:
        "This is a simple API that integrates WebSocket and RabbitMQ with Node.js",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3000;

connectDB();
connectRabbitMQ().then(() => startConsuming(io));

app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

io.on("connection", (socket) => {
  console.log("Client connected via WebSocket");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, server };
