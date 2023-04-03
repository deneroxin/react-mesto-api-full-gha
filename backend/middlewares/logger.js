const winston = require('winston');
const expressWinston = require('express-winston');

const { combine, printf } = winston.format;

const dev = (process.env.NODE_ENV === 'development');
const str = JSON.stringify;

const headerBlacklist = [
  'Server', 'Content-Length', 'Connection', 'Content-Security-Policy',
  'Cross-Origin-Embedder-Policy', 'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy', 'X-DNS-Prefetch-Control', 'X-Frame-Options',
  'Strict-Transport-Security', 'X-Download-Options', 'X-Content-Type-Options',
  'Origin-Agent-Cluster', 'X-Permitted-Cross-Domain-Policies', 'Referrer-Policy',
  'X-XSS-Protection', 'RateLimit-Limit', 'RateLimit-Reset', 'ETag',
  'User-Agent', 'Accept', 'Accept-Encoding',
];

if (!dev) headerBlacklist.push('Authorization', 'Set-Cookie', 'Cookie');

module.exports = {
  requestLogger: expressWinston.logger({
    transports: [
      new winston.transports.File({ filename: 'request.log' }),
    ],
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({
        timestamp, req, res,
      }) => `${timestamp}\n${req.method} ${req.url}\n${str(req.headers)}\n${str(req.body)}\n${str(res.body)}\n\n`),
    ),
    metaField: null,
    requestWhitelist: ['method', 'url', 'headers', 'body'],
    responseWhitelist: ['status', 'headers', 'body'],
    bodyBlacklist: (dev ? null : ['password', 'token']),
    headerBlacklist,
  }),

  errorLogger: expressWinston.errorLogger({
    transports: [
      new winston.transports.File({ filename: 'error.log' }),
    ],
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({
        timestamp, message, meta,
      }) => `${timestamp}\n${message}\n${str(meta.error)}\n${str(meta.message)}\n${str(meta.req)}\n\n`),
    ),
    requestWhitelist: ['method', 'url', 'body'],
    blacklistedMetaFields: (dev ? null : ['req.body.password']),
  }),
};
