const jwt = require('jsonwebtoken');
const { GeneralError, Status } = require('../error');

module.exports = function authorize(req, res, next) {
  const { jwt: token } = req.cookies;
  const error = new GeneralError('Необходима авторизация', Status.UNAUTHORIZED);
  if (!token) next(error);
  try {
    req.user = jwt.verify(token.replace('Bearer ', ''), 'hardcoded-secret-key');
    next();
  } catch (err) {
    next(error);
  }
};
