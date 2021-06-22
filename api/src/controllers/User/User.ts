import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express';

import { CrudController } from '../CrudController';
import { User } from '../../models/User';

import * as redisUtils from '../../middlewares/redis';
import * as mqUtils from '../../middlewares/queue';
import * as queries from './queries';

const makeUserResponse = (user:Object, error:string, res:Response) => {
  res.json({
    error: error,
    data: user
  });
}

export class UserController extends CrudController {
  public create(req: any, res: Response): void {
    const filepath = path.normalize(req.file.path)

    fs.readFile(filepath, { encoding: 'base64' }, (fileErr: any, imgData: string) => {
      if (fileErr) makeUserResponse({}, "Error reading file: "+fileErr, res)

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
                if (unlinkErr) makeUserResponse({}, "Error removing file: "+unlinkErr, res)
              })
              newUser.id = userID
              makeUserResponse(newUser, null, res)
            })
            .catch((cacheErr: string) => {
              makeUserResponse({}, "Error caching avatar", res)
            })
        }).catch((dbErr: string) => {
          makeUserResponse({}, "Error inserting user: "+dbErr, res)
        })
    })
  }

  public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    const userID:any = req.query.id

    if (userID) {
      queries.getUser(userID).then((user:any) => {
        if (user[0].avatar == null) {
          redisUtils.getImageFromCache(`tempimg_${userID}`)
            .then((img: string) => {
              user[0].avatar = img
              makeUserResponse(user[0], null, res)
            })
            .catch((cacheErr:string) => {
              makeUserResponse({}, "Error getting avatar from cache: "+cacheErr, res)
            })
        } else {
          makeUserResponse(user[0], null, res)
        }
      })
    } else {
      makeUserResponse({}, "No ID provided.", res)
    }
  }

  public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }

  public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    throw new Error("Method not implemented.");
  }
}