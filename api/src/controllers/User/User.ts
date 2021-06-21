import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import redis from 'redis'
import multer from 'multer'

import {User} from '../../models/User'
import { json } from 'body-parser';
import { insertUser } from './queries';

const upload = multer({
  dest:"./temp"
})

export class UserController extends CrudController {
  public create(req, res: Response): void {
    const fs = require('fs')
    const path = req.file.path

    fs.readFile(path, function(fileErr, fileData) {
      if (fileErr) {
        res.json("Error reading file")
        return
      }

      const imgData = Buffer.from(fileData).toString('base64')

      const newUser: User = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }

      insertUser(newUser)
        .then((dbRes) => {
          const userID = dbRes.rows[0].id
          const client = redis.createClient({
            host: 'redis-server',
            port: 6379,
            password: 'pwd-redis'
          });
      
          client.set(userID, imgData, (setErr, rep) => {
            if (setErr) {
              res.json("Cannot set in redis")
              return
            }
            console.log(rep)
          })
    
          client.get(userID, (getErr, rep) => {
            if (getErr) {
              res.json("Cannot get in redis")
              return
            }
            res.json(newUser)
          })
          fs.unlink(path, unlinkErr => {
            if (unlinkErr) {
              res.json("Cannot remove file in serv")
              return
            }
          })
        })
        .catch((err) => {
          console.log(err)
        })      
    })
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