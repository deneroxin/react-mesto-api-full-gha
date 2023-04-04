const { ValidationError, CastError } = require('mongoose').Error;
const { BadRequestError } = require('./BadRequestError');
const { ConflictError } = require('./ConflictError');
const { ForbiddenError } = require('./ForbiddenError');
const { NotFoundError } = require('./NotFoundError');
const { UnauthorizedError } = require('./UnauthorizedError');
const { InternalServerError } = require('./InternalServerError');

const Status = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
};

function throwError(err, next) {
  // Функционал избыточен, но я так и не понял, зачем мы делаем двойную работу:
  // сначала валидируем данные с помощью Joi, а затем, по тем же самым правилам,
  // валидируем данные через схему mongoose. По идее, mongoose и в одиночку бы справился...
  // Но теперь, когда у нас есть Joi, мы могли бы убрать все валидаторы из схем mongoose.
  // А раз мы этого не делаем, то наверное, мы таким образом перестраховываемся.
  // Тогда получается, что и эту функцию как будто бы надо оставить для подстраховки.
  // Если, например, нам по какой-то причине придётся отключить валидацию Joi
  // (или упразднить), и положиться только на mongoose (или положиться в деталях).
  // А тогда mongoose генерирует ошибку с кодом 500, который нужно заменить на 400.
  if (err instanceof ValidationError || err instanceof CastError) {
    next(new BadRequestError(err.message));
  } else {
    next(err);
  }
}

class GeneralError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = {
  Status,
  throwError,
  GeneralError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
};
