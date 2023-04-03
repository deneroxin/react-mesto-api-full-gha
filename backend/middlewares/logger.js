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
    metaField: null,
    meta: false,
    requestWhitelist: ['method', 'url', 'headers', 'body'],
    responseWhitelist: ['status', 'headers', 'body'],
    bodyBlacklist: ['password', 'token'],
    headerBlacklist: [
      'Server', 'Content-Length', 'Connection', 'Content-Security-Policy',
      'Cross-Origin-Embedder-Policy', 'Cross-Origin-Opener-Policy',
      'Cross-Origin-Resource-Policy', 'X-DNS-Prefetch-Control', 'X-Frame-Options',
      'Strict-Transport-Security', 'X-Download-Options', 'X-Content-Type-Options',
      'Origin-Agent-Cluster', 'X-Permitted-Cross-Domain-Policies', 'Referrer-Policy',
      'X-XSS-Protection', 'RateLimit-Limit', 'RateLimit-Reset', 'ETag',
      'User-Agent', 'Accept', 'Accept-Encoding',
    ],
  }),

  errorLogger: expressWinston.errorLogger({
    transports: [
      new winston.transports.File({ filename: 'error.log' }),
    ],
    format: winston.format.json(),
    requestWhitelist: ['method', 'url', 'body'],
  }),

  bodyLogger: createBodyLogger(),

  makeSureDotenvPickedUpAndParsed: (req, res, next) => {
    const { NODE_ENV, JWT_SECRET, AUTHENTICATION_METHOD } = process.env;
    fs.appendFile(
      'console.log',
      `.env content: ${NODE_ENV} ${JWT_SECRET} ${AUTHENTICATION_METHOD}\n`,
      next,
    );
  },
};
