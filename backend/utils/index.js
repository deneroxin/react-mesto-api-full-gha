const rateLimiter = require('express-rate-limit');

const { GeneralError } = require('../errors');

const validationPatterns = {
  patternURL: /^https?:\/\/(?:www\.)?(?:[a-z\d-]+\.)+[a-z]+\/[-\w.~:/?#[\]@!$&'()*+,;=]+#?$/,
  // 1) protocol  1            2           3           4              5                 6
  // 2) optional www.
  // 3) domain and subdomains (one or more words ended with .)
  // 4) domain zone (assume there can be only letters, though I'm not sure)
  // 5) path (\w incorporates digits and the underscore) - can't be empty
  // 6) optional # at the end
};

function createRateLimiter(minutes, tries) {
  return rateLimiter({
    windowMs: minutes * 60 * 1000,
    max: tries,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (request, response, next, { message, statusCode }) => {
      next(new GeneralError(message, statusCode));
    },
  });
}

function getSecretKey() {
  const { NODE_ENV, JWT_SECRET } = process.env;
  return NODE_ENV === 'production' ? JWT_SECRET : 'hardcoded_secret_key';
}

module.exports = {
  validationPatterns,
  validators: {
    isURL: (string) => validationPatterns.patternURL.test(string),
  },
  createRateLimiter,
  getSecretKey,
};
