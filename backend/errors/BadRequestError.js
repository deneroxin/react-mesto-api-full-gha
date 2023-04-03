class BadRequestError extends Error {
  static code = 400;

  constructor(message) {
    super(message);
    this.statusCode = BadRequestError.code;
  }
}

module.exports = { BadRequestError };
