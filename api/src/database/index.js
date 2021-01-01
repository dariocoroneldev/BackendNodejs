import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseconfig from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Appointmens from '../app/models/Appointments';

const models = [User, File, Appointmens];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseconfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/encontraap',
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
