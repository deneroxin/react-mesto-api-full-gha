class ConflictError extends Error {
  static code = 409;

  constructor(message) {
    super(message);
    this.statusCode = ConflictError.code;
  }
}

module.exports = { ConflictError };
