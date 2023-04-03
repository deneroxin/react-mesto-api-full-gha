const winston = require('winston');
const expressWinston = require('express-winston');

const { combine, printf } = winston.format;

module.exports = {
  requestLogger: expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: 'request.log' }),
    ],
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({
        timestamp, method, url, headers, body,
      }) => `${timestamp}\n${method} ${url}\n${JSON.stringify(headers)}\n${JSON.stringify(body)}\n\n`),
    ),
    metaField: null,
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
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({
        timestamp, error, message, method, url, body,
      }) => `${timestamp}\n${message}\n${JSON.stringify(error)}\n${method} ${url}\n${JSON.stringify(body)}\n\n`),
    ),
    metaField: null,
    requestWhitelist: ['method', 'url', 'body'],
  }),
};
