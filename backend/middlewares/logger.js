const winston = require('winston');
const expressWinston = require('express-winston');

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
};
