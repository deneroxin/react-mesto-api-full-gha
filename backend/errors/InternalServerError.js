class InternalServerError extends Error {
  static code = 500;

  constructor(message) {
    super(message);
    this.statusCode = InternalServerError.code;
  }
}

module.exports = { InternalServerError };
