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
  // Решил сделать так: если база данных отправляет ошибку, связанную с валидацией,
  // то текст ошибки передаём пользователю, ведь он полезный.
  // При этом код ошибки заменяем на 400.
  // Если же база данных сгенерирует прочие ошибки,
  // то передаём их как есть, с кодом 500, а дефолтный обработчик,
  // в случае кода 500, заменит текст ошибки на свой.
  if (err instanceof ValidationError || err instanceof CastError) {
    next(new BadRequestError(err.message));
  }
  next(err);
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
