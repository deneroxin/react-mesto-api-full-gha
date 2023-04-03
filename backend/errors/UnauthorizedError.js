class UnauthorizedError extends Error {
  static code = 401;

  constructor(message) {
    super(message);
    this.statusCode = UnauthorizedError.code;
  }
}

module.exports = { UnauthorizedError };
