const e = require("express");

module.exports = {
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "docker",
  database: "encontraap",
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
