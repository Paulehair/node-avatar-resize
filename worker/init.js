const amqplib = require("amqplib");

var amqp_url = process.env.CLOUDAMQP_URL || "amqp://localhost:5672";

async function init_queues() {
  var conn = await amqplib.connect(amqp_url, "heartbeat=60");
  var ch = await conn.createChannel();
  await conn.createChannel();
  await ch.assertQueue("avatar_tasks", { durable: true });
}

init_queues();
