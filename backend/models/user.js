const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { isURL } = require('../utils').validators;
const { GeneralError, Status } = require('../error');

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
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      const error = new GeneralError('Введён неверный адрес почты или пароль', Status.UNAUTHORIZED);
      if (!user) throw error;
      const { password: hash, ...userData } = user.toObject();
      return bcrypt.compare(password, hash)
        .then((matched) => {
          if (!matched) throw error;
          return userData;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
