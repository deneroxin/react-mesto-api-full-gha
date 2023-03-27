const { ValidationError, CastError } = require('mongoose').Error;

const Status = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

class GeneralError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function throwError(err, next) {
  // Решил сделать так: если база данных отправляет ошибку, связанную с валидацией,
  // то текст ошибки передаём пользователю, ведь он полезный.
  // При этом код ошибки заменяем на 400.
  // Если же база данных сгенерирует прочие ошибки,
  // то передаём их как есть, с кодом 500, а дефолтный обработчик,
  // в случае кода 500, заменит текст ошибки на свой.
  if (err instanceof ValidationError || err instanceof CastError) {
    next(new GeneralError(err.message, Status.BAD_REQUEST));
  }
  next(err);
}

module.exports = {
  Status,
  GeneralError,
  throwError,
};
