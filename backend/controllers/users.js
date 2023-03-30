const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { getSecretKey } = require('../utils');
const { GeneralError, Status, throwError } = require('../error');

module.exports = {

  login: (req, res, next) => {
    const { email, password } = req.body;
    User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign(
          { _id: user._id },
          getSecretKey(),
          { expiresIn: '7d' },
        );
        res.status(Status.OK)
          .cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          })
          .send(user);
      })
      .catch((err) => throwError(err, next));
  },

  clearCookie: (req, res) => {
    res.clearCookie('jwt', {
      sameSite: 'none',
      secure: true,
    }).send({ message: 'Выход' });
  },

  getAllUsers: (req, res, next) => {
    User.find({})
      .then((arrayOfUsers) => {
        res.status(Status.OK).send(arrayOfUsers);
      })
      .catch((err) => throwError(err, next));
  },

  getUserById: (req, res, next) => {
    const { userId } = req.params;
    User.findById(userId)
      .then((user) => {
        if (!user) throw new GeneralError(`Пользователь ${userId} не найден`, Status.NOT_FOUND);
        res.status(Status.OK).send(user);
      })
      .catch((err) => throwError(err, next));
  },

  getCurrentUser: (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) throw new GeneralError('Вас нет в базе данных', Status.NOT_FOUND);
        res.status(Status.OK).send(user);
      })
      .catch((err) => throwError(err, next));
  },

  createUser: (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create([{ ...req.body, password: hash }], { validateBeforeSave: true }))
      .then(([newlyCreatedUser]) => {
        // возможно, из-за того, что create() возвращает Promise, а не Query,
        // select: false не работает с create(), и пароль приходится отсеивать вручную:
        const { password, ...newUserData } = newlyCreatedUser.toObject();
        res.status(Status.CREATED).send({ data: newUserData });
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new GeneralError(
            'Пользователь с таким email уже зарегистрирован',
            Status.CONFLICT,
          ));
        }
        throwError(err, next);
      });
  },

  updateUserData: (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, req.body, { runValidators: true, new: true })
      .then((updatedUserData) => {
        // поскольку req.user._id берётся из payload токена, а не путём поиска в базе данных,
        // то нет уверенности, что в базе данных такой пользователь всё ещё есть.
        // За время хранения токена база данных могла быть повреждена, и пользователь удалился.
        if (!updatedUserData) throw new GeneralError('Вас нет в базе данных', Status.NOT_FOUND);
        res.status(Status.OK).send(updatedUserData);
      })
      .catch((err) => throwError(err, next));
  },

};
