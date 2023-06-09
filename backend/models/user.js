const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { isURL } = require('../utils').validators;
const { UnauthorizedError } = require('../errors');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: validator.isEmail,
      message: 'Wrong email address',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minLength: 2,
    maxLength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: isURL, // Можно было использовать готовый: validator.isURL
      message: 'Picture address should be a valid link',
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
}, {
  toJSON: {
    transform: function removePassword(doc, ret) {
      const retAlias = ret; // linter ругается, но нет уверенности, что добавление лишних
      delete retAlias.password; //                      игнорирующих опций будет одобрено:
      return retAlias; //                no-param-reassign: ["error", { "props": false }]
    },
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      const message = 'Введён неверный адрес почты или пароль';
      if (!user) throw new UnauthorizedError(message);
      const { password: hash, ...userData } = user.toObject();
      return bcrypt.compare(password, hash)
        .then((matched) => {
          if (!matched) throw new UnauthorizedError(message);
          return userData;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
