import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Request, Response } from 'express';

import { CrudController } from '../CrudController';
import { User } from '../../models/User';

import * as redisUtils from '../../middlewares/redis';
import * as mqUtils from '../../middlewares/queue';
import * as queries from './queries';

const upload = multer({
  dest: "./temp"
})

export class UserController extends CrudController {
  public create(req: any, res: Response): void {
    const filepath = path.normalize(req.file.path)
    const errors: [string?] = []

    fs.readFile(filepath, { encoding: 'base64' }, (fileErr: any, imgData: string) => {
      if (fileErr) errors.push("Error reading file")

      const newUser: User = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }

      queries.insertUser(newUser)
        .then((dbRes: any) => {
          const userID = dbRes.rows[0].id

          mqUtils.addImageToQueue(userID, imgData)

          redisUtils.setImageInCache(`tempimg_${userID}`, imgData)
            .then(() => {
              fs.unlink(filepath, (unlinkErr: any) => {
                if (unlinkErr) errors.push("Cannot remove file from temp folder")
              })
            })
            .catch((err: string) => {
              errors.push(err)
            })


          res.json({
            errors: errors,
            data: { ...newUser, avatar: imgData }
          })
        }).catch((err: string) => {
          errors.push(err)
          res.json({
            errors: errors,
            data: {}
          })
        })
    })
  }

  public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    const userID: any = req.query.id
    const errors: [string?] = []

    const makeResponse = (user: Object, errors: [string?], res: Response) => {
      res.json({
        errors: errors,
        data: user
      });
    }

    if (userID) {
      queries.getUser(userID).then((user: any) => {
        if (user[0].avatar == null) {
          redisUtils.getImageFromCache(`tempimg_${userID}`)
            .then((img: string) => {
              user[0].avatar = img
              makeResponse(user[0], errors, res)
            })
            .catch((err: string) => {
              errors.push(err)
              makeResponse({}, errors, res)
            })
        } else {
          makeResponse(user[0], errors, res)
        }
      })
    } else {
      errors.push('No ID provided.')
      makeResponse({}, errors, res)
    }
  }

  public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }

  public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }
}