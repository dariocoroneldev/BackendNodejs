import express from 'express';
import Youch from 'youch';
import path from 'path';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);
    this.server.use(Sentry.Handlers.tracingHandler());
    this.server.use(Sentry.Handlers.requestHandler());
    this.middleware();
    this.routes();
    this.exeptionHandler();
  }

  middleware() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exeptionHandler() {
    this.server.use(async (err, req, res, next) => {
      const errors = await new Youch(err, req).toJSON();
      return res.status(500).json(errors);
    });
  }
}

export default new App().server;
