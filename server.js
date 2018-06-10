const express = require('express');
const morgan = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const mysql = require('mysql');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`
console.log("== Mongo URL:", mongoURL);

const mysqlHost = process.env.MYSQL_HOST;
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlDBName = process.env.MYSQL_DATABASE;
const mysqlUser = process.env.MYSQL_USER;
const mysqlPassword = process.env.MYSQL_PASSWORD;

const maxMySQLConnections = 10;
app.locals.mysqlPool = mysql.createPool({
  connectionLimit: maxMySQLConnections,
  host: mysqlHost,
  port: mysqlPort,
  database: mysqlDBName,
  user: mysqlUser,
  password: mysqlPassword
});

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});


MongoClient.connect(mongoURL, { useNewUrlParser: true }, function (err, client) {
    if (!err) {
      app.locals.mongoDB = client.db(mongoDBName);
      app.listen(port, function() {
        console.log("== Server is running on port", port);
      });
    } else {
      console.log("MY ERROR: ", err);
    }
});
