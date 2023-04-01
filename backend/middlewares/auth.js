const jwt = require('jsonwebtoken');
const { getSecretKey } = require('../utils');
const { GeneralError, Status } = require('../error');

module.exports = function authorize(req, res, next) {
  let { jwt: token } = req.cookies;
  const error = new GeneralError('Необходима авторизация', Status.UNAUTHORIZED);
  if (!token) {
    // Тест не хочет работать с куками, поэтому пришлось добавить альтернативный
    // метод авторицации, через заголовок, чтобы можно было пройти тесты.
    token = req.get('Authorization');
    if (!token) next(error);
    token = token.replace('Bearer ', '');
  }
  try {
    req.user = jwt.verify(token, getSecretKey());
    next();
  } catch (err) {
    next(error);
  }
};
