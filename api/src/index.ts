
import express from 'express';
import redis from 'redis';
import * as util from 'util';
import { PORT } from './config/constants';
import { userRouter } from './routes';

const app = express();

const client = redis.createClient({
  host: 'redis-server',
  port: 6379,
  password: 'pwd-redis'
});

const getAsync = util.promisify(client.get).bind(client);

app.use(express.json());

app.use('/users', userRouter);

app.use('/image', express.static('./output'));

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});