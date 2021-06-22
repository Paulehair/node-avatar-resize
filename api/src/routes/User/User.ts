
import express, { Request, Response } from 'express';
import { userController } from '../../controllers';
import multer from 'multer'


export const router = express.Router({
    strict: true
});

const upload = multer({
    dest:"./src/temp"   
})

router.post('/', upload.single('avatar'), (req: Request, res: Response) => {
    userController.create(req, res);
});

router.get('/', (req: Request, res: Response) => {
    userController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    userController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    userController.delete(req, res);
});