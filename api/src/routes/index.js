import { Router } from 'express';
import multer from 'multer';
import UserController from '../app/controllers/UserController';
import SessionController from '../app/controllers/SessionController';
import Authmiddleware from '../app/middlewares/auth';
import multerConfig from '../config/multer';

const routes = new Router();
const upload = multer(multerConfig);
routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(Authmiddleware);
routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), (req, res) =>
  res.json({ ok: 'ok' })
);

export default routes;
