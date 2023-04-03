class ForbiddenError extends Error {
  static code = 403;

  constructor(message) {
    super(message);
    this.statusCode = ForbiddenError.code;
  }
}

module.exports = { ForbiddenError };
