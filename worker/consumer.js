require("dotenv").config();
const amqplib = require("amqplib/callback_api");
const { Pool } = require("pg");
const sharp = require("sharp");
const { promisify } = require("util");
// redis client
const client = require("redis").createClient(process.env.REDIS_URL);
const amqp_url = process.env.AMQP_URL;
const get = promisify(client.get).bind(client);
const del = promisify(client.del).bind(client);

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const transform = async (data) => {
  const imgBuffer = Buffer.from(data, "base64");
  return await sharp(imgBuffer).resize(32, 32).toBuffer();
};

const updateDb = (id, data) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "UPDATE users SET avatar = $1 WHERE id = $2",
      [data, id],
      (err, res) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

const resizeImage = async (id) => {
  let image = await get(`user_${id}_avatar`);
  if (!image) return;
  console.log("[x] retrieve item from redis cache");

  let cropedImage = await transform(image);
  console.log("[x] reduced size transformation done");
  await updateDb(id, croppedImage);
  console.log("[x] user " + id + " updated");
  await del(`user_${id}_avatar`);
  console.log("[x] original image deleted");
};

const bail = (err) => {
  console.error(err);
  process.exit(1);
};

// Consumer
function consumer(conn) {
  conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue("avatar_tasks");
    ch.consume("avatar_tasks", async (msg) => {
      if (msg !== null) {
        const key = msg.content.toString();
        console.log("[x] receive key : " + key);
        await resizeImage(key);
        await ch.ack(msg);
      }
    });
  }
}

amqplib.connect(amqp_url, function (err, conn) {
  if (err != null) bail(err);
  consumer(conn);
});
