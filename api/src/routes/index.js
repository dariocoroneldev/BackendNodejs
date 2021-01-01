import { Router } from 'express';
import multer from 'multer';
import UserController from '../app/controllers/UserController';
import SessionController from '../app/controllers/SessionController';
import Authmiddleware from '../app/middlewares/auth';
import multerConfig from '../config/multer';
import FileController from '../app/controllers/FileController';
import ProviderController from '../app/controllers/ProviderController';
import AppointmentController from '../app/controllers/AppointmentController';
import CalendaryController from '../app/controllers/CalendaryController';
import NotificationController from '../app/controllers/NotificationController';

const routes = new Router();
const upload = multer(multerConfig);
routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);
routes.use(Authmiddleware);
routes.put('/users', UserController.update);
routes.get('/users', UserController.index);
routes.get('/providers', ProviderController.index);
routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.get('/calendary', CalendaryController.index);
routes.get('/notifications', NotificationController.index);
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
