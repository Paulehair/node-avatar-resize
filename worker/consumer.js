require("dotenv").config();
const amqplib = require("amqplib/callback_api");
const { Pool } = require("pg");
const sharp = require("sharp");
const { promisify } = require("util");
// redis client
const client = require("redis").createClient({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT,
});
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

  const extension = detectMimeType(data);
  const uuid = Date.now() + data.slice(0, 20);
  const filename = uuid+extension;
  const imgBuffer = Buffer.from(data, "base64");
  await sharp(imgBuffer).resize(100, 100).toFile('./output/' + filename)
  return filename
};

const updateDb = (id, filename) => {
  return new Promise((resolve, reject) => { 
    pool.query(
      'UPDATE "user" SET avatar = $1 WHERE id = $2',
      [filename.toString(), parseInt(id)],
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
  console.log(`[x] retrieve item ${id} from redis`);
  const filename = await transform(image);
  console.log(`[x] reduced size transformation`);
  await updateDb(id, filename);
  console.log(`[x] user ${id} updated`);
  await del(`user_${id}_avatar`);
  console.log(`[x] original image deleted`);
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
        console.log('----------------')
        console.log('START MESSAGE >')
        const key = msg.content.toString();
        console.log(`[x] receive key : ${key}`);
        await resizeImage(key);
        console.log('< END MESSAGE')
        await ch.ack(msg);
      } 
    });
  }
}

amqplib.connect(process.env.AMQP_URL, function (err, conn) {
  if (err != null) bail(err);
  consumer(conn);
});


const detectMimeType = (b64) => {
  const signatures = {
    JVBERi0: ".pdf",
    R0lGODdh: ".gif",
    R0lGODlh: ".gif",
    iVBORw0KGgo: ".png"
  };
  for (let s in signatures) {
    if (b64.indexOf(s) === 0) {
      return signatures[s];
    }
  }
}