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

function getProp(obj, prop) {
  const doti = prop.indexOf('.');
  if (doti < 0) return obj[prop];
  return getProp(obj[prop.slice(0, doti)], prop.slice(doti + 1));
}

module.exports = {
  requestLogger: expressWinston.logger({
    transports: [new winston.transports.File({ filename: 'request.log' })],
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({ timestamp, req, res }) => `${timestamp}
${req.method} ${req.url}
${str(req.headers)}
${str(req.body)}
${str(res.body)}\n\n`),
    ),
    metaField: null,
    requestWhitelist: ['method', 'url', 'headers', 'body'],
    responseWhitelist: ['status', 'headers', 'body'],
    bodyBlacklist: (dev ? null : ['password', 'token']),
    headerBlacklist,
    // Никаким способом не удаётся отсеить защищённые поля ответа, и следующим тоже:
    responseFilter: (req, prop) => (prop === 'body.token' && !dev ? undefined : getProp(req, prop)),
  }),

  errorLogger: expressWinston.errorLogger({
    transports: [new winston.transports.File({ filename: 'error.log' })],
    format: combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
      printf(({ timestamp, message, meta }) => `${timestamp}
${message}
${str(meta.error)}
${str(meta.message)}
${str(meta.req)}\n\n`),
    ),
    requestWhitelist: ['method', 'url', 'body'],
    // Ни одним из перечисленных ниже способов не удаётся отсеить защищенные поля:
    requestFilter: (req, prop) => (prop === 'body.password' && !dev ? undefined : getProp(req, prop)),
    blacklistedMetaFields: (dev ? null : ['req.body.password']),
  }),
};
