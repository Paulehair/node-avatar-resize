import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import redis from 'redis'

import {User} from '../../models/User'

export class UserController extends CrudController {
  public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    console.log(req.body)
    const newUser: User = {
      id: req.body.id,
      username: "string",
      password: "string",
      email: "string"
    }

    const client = redis.createClient({
      host: 'redis-server',
      port: 6379,
      password: 'pwd-redis'
    });

    res.json(newUser)
  }

  public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    res.json({ message: 'GET /user request received' });
  }

  public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }

  public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }
}