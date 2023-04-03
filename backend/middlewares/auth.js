const jwt = require('jsonwebtoken');
const { getSecretKey } = require('../utils');
const { GeneralError, Status } = require('../error');

module.exports = function authorize(req, res, next) {
  let token;
  const method = process.env.AUTHENTICATION_METHOD.toLowerCase();
  const error = new GeneralError('Необходима авторизация', Status.UNAUTHORIZED);
  if (method === 'cookie') {
    token = req.cookies.jwt;
    if (!token) next(error);
  } else {
    token = req.get('Authorization');
    if (!token || !token.startsWith('Bearer ')) next(error);
    token = token.replace('Bearer ', '');
  }
  try {
    req.user = jwt.verify(token, getSecretKey());
    next();
  } catch (err) {
    next(error);
  }
};
