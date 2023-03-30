const winston = require('winston');
const fs = require('fs');
const expressWinston = require('express-winston');

function createBodyLogger() {
  if (process.env.NODE_ENV === 'debug') {
    return function (req, res, next) {
      fs.appendFile('console.log', `${JSON.stringify(req.body)}\n`, next);
    };
  }
  return function (req, res, next) {
    next();
  };
}

module.exports = {
  requestLogger: expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: 'request.log' }),
    ],
    format: winston.format.json(),
    msg: (req, res) => `${req.protocol}://${req.method} --> ${res.statusCode}`,
  }),

  errorLogger: expressWinston.errorLogger({
    transports: [
      new winston.transports.File({ filename: 'error.log' }),
    ],
    format: winston.format.json(),
  }),

  bodyLogger: createBodyLogger(),
};
