const amqplib = require("amqplib");

let channel, connection;

const connectRabbitMQ = async () => {
  try {
    connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue("notificationQueue");
    console.log("RabbitMQ connected and queue created");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    process.exit(1);
  }
};

const getChannel = () => {
  return channel;
};

const startConsuming = (io) => {
  channel.consume("notificationQueue", (msg) => {
    try {
      const notification = JSON.parse(msg.content.toString());
      io.emit("notification", notification);
      console.log("Broadcasted notification via WebSocket", notification);
      channel.ack(msg);
    } catch (error) {
      console.error("Error processing message from RabbitMQ:", error);
      channel.nack(msg, false, true);
    }
  });
};

module.exports = { connectRabbitMQ, getChannel, startConsuming };
