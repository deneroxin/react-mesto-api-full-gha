class NotFoundError extends Error {
  static code = 404;

  constructor(message) {
    super(message);
    this.statusCode = NotFoundError.code;
  }
}

module.exports = { NotFoundError };
