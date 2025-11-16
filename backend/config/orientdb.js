require('dotenv').config();
const axios = require('axios');

const baseURL = `http://${process.env.ORIENTDB_HOST}:2480`;

const orientdb = axios.create({
  baseURL,
  auth: {
    username: process.env.ORIENTDB_DB_USER,
    password: process.env.ORIENTDB_DB_PASS,
  },
});

module.exports = orientdb;
