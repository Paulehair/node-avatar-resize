import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express';

import { CrudController } from '../CrudController';
import { User } from '../../models/User'

import * as redisUtils from '../../middlewares/redis'
import * as queries from './queries';


const makeUserResponse = (user:Object, error:string, res:Response) => {
  res.json({
    error: error,
    data: user
  });
}

export class UserController extends CrudController {
  public create(req:any, res: Response): void {
    const filepath = path.normalize(req.file.path)

    fs.readFile(filepath, (readFileErr:any, fileData:any) => {
      if (readFileErr) makeUserResponse(null, "Error reading file: "+readFileErr, res)

      const imgData = Buffer.from(fileData).toString('base64')

      const newUser: User = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      }

      queries.insertUser(newUser)
        .then((dbRes:any) => {
          const userID = dbRes.rows[0].id

          redisUtils.setImageInCache(`tempimg_${userID}`, imgData)
            .then(() => {
              fs.unlink(filepath, (unlinkErr:any) => {
                if (unlinkErr) makeUserResponse(null, "Error removing temp file: "+unlinkErr, res)
              })
            }).catch((cacheErr:string) => {
              makeUserResponse(null, "Error caching avatar: "+cacheErr, res)
            })
            
          newUser.id = userID
          makeUserResponse(newUser, null, res)
        }).catch((err:string) => {
          makeUserResponse(null, err, res)
        })
    })
  }

  public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
    const userID:any = req.query.id

    if (userID) {
      queries.getUser(userID).then((user:any) => {
        if (user[0].avatar == null) {
          redisUtils.getImageFromCache(`tempimg_${userID}`)
            .then((img:string) => {
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