import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Request, Response } from 'express';

import { CrudController } from '../CrudController';
import { User } from '../../models/User'

import * as redisUtils from '../../middlewares/redis'
import * as queries from './queries';

const upload = multer({
  dest:"./temp"
})

export class UserController extends CrudController {
  public create(req:any, res: Response): void {
    const filepath = path.normalize(req.file.path)
    const errors:[string?] = []

    fs.readFile(filepath, (fileErr:any, fileData:any) => {
      if (fileErr) errors.push("Error reading file")

      const imgData = Buffer.from(fileData).toString('base64')

      const newUser: User = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }

      queries.insertUser(newUser)
        .then((dbRes:any) => {
          const userID = dbRes.rows[0].id

          redisUtils.setImageInCache(userID, imgData)

          fs.unlink(filepath, (unlinkErr:any) => {
            if (unlinkErr) errors.push("Cannot remove file from temp folder")
          })

          res.json({
            errors: errors,
            data: newUser
          })
        }).catch((err:string) => {
          errors.push(err)
          res.json({
            errors: errors,
            data: {}
          })
        })
    })
  }

  public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    const userID:string = req.query.id?.toString() || '-1'

    queries.getUser(parseInt(userID)).then((user:any) => {
      // redisUtils.getImageFromCache(user.id)
      res.json(user);
    })
  }

  public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }

  public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }
}