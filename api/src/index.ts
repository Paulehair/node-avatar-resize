
import express from 'express';
import redis from 'redis';
import axios from 'axios';
import * as util from 'util';
import { PORT } from './config/constants';
import { userRouter } from './routes';

const app = express();

const client = redis.createClient({
  host: 'redis-server',
  port: 6379
});

const getAsync = util.promisify(client.get).bind(client);

export const catchedData = async (req:express.Request,res:express.Response,next:express.NextFunction) => {
  try {
    const cacheddata = await getAsync("users");
    if (cacheddata !== null) {
      console.log("cacheddata");
      res.send({payload:JSON.parse(cacheddata)});
    }
    else {
      next();
    }
  }
  catch(error) {
    res.send(error);
  }
};

app.use(express.json());

app.use('/users', userRouter);

app.get("/", catchedData, async (req:express.Request,res:express.Response) => {
  try {
      console.log("getting catched");
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      client.setex("users",10000,JSON.stringify(response.data));
      res.send({payload:response.data});
  } catch(err) {
      console.log(err);
  }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});