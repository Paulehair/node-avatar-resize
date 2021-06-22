require("dotenv").config();

const redis = require('redis')
const { promisify } = require("util");
const amqp = require("amqplib/callback_api");

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
});

const set = promisify(client.set).bind(client);
const amqp_url = process.env.AMQP_URL;

export const addImageToQueue = async (userID: Number, image: string) => {
    const on_open = async (err: string, ch: any) => {
        if (err != null) console.error(err);
        // "data:image/gif;base64,R0lGODlhPQBEAPeoAJosM//AwO/AwHVYZ/z595kzAP/s7P+goOXMv8+fhw/v739/f+8PD98fH/8mJl+fn/9ZWb8/PzWlwv///6wWGbImAPgTEMImIN9gUFCEm/gDALULDN8PAD6atYdCTX9gUNKlj8wZAKUsAOzZz+UMAOsJAP/Z2ccMDA8PD/95eX5NWvsJCOVNQPtfX/8zM8+QePLl38MGBr8JCP+zs9myn/8GBqwpAP/GxgwJCPny78lzYLgjAJ8vAP9fX/+MjMUcAN8zM/9wcM8ZGcATEL+QePdZWf/29uc/P9cmJu9MTDImIN+/r7+/vz8/
        await set(`user_${userID}_avatar`, image);
        // user_2_avatar
        ch.sendToQueue('avatar_tasks', Buffer.from(`${userID}`));
    };


    await amqp.connect(amqp_url, async (err: string, conn: any) => {
        if (err != null) console.error(err);
        await conn.createChannel(on_open);
    });
}