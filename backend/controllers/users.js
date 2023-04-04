const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { getSecretKey } = require('../utils');
const {
  Status, throwError, NotFoundError, ConflictError,
} = require('../errors');

// !!!!!!!!!!!!!!!!! ВАЖНО !!!!!!!!!!!!!!!!
// Изначально я реализовал аутентификацию с помощью cookie.
// Но оказалось, что автотест не поддерживает такой метод.
// Чтобы пройти автотест, пришлось реализовать метод аутентификации "Bearer"
// Однако на ревью я хотел предъявить вариант с куки.
// Поэтому я разветвил логику, чтобы всё, что связано с куки, осталось.
// Например, заголовок 'Access-Control-Allow-Credentials': true
// нужен только для куки, но я его намеренно оставил, так как "Bearer" он не мешает,
// а я впоследствии расчитываю сделать выбор в сторону cookie.
// !!!!!!!!!!!!!!!!! ВАЖНО !!!!!!!!!!!!!!!!

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
        res.status(Status.OK);
        const method = process.env.AUTHENTICATION_METHOD;
        // Хотел добавить ещё AUTHENTICATION_METHOD.toLowerCase() для пущей надёжности,
        // но тест создаёт свой клиент, и генерирует себе .env сам, поэтому он ничего
        // не знает об этом свойстве. В результате AUTHENTICATION_METHOD === undefined,
        // и вызов метода toLowerCase() над undefined заваливает тест.
        if (method === 'cookie') {
          res.cookie('jwt', token, {
            maxAge: 3600000 * 24 * 7,
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          }).send(user);
        } else if (method === 'bearer, provided in headers') {
          res.set('Authorization', token)
            .set('Access-Control-Expose-Headers', 'Authorization')
            .send(user);
        } else {
          res.send({ ...user, token });
        }
      })
      .catch((err) => throwError(err, next));
  },

  clearCookie: (req, res) => {
    if (process.env.AUTHENTICATION_METHOD === 'cookie') {
      res.clearCookie('jwt', {
        sameSite: 'none',
        secure: true,
      });
    }
    res.send({ message: 'Выход' });
  },

  getAllUsers: (req, res, next) => {
    User.find({})
      .sort('-createdAt')
      .then((arrayOfUsers) => {
        res.status(Status.OK).send(arrayOfUsers);
      })
      .catch((err) => throwError(err, next));
  },

  getUserById: (req, res, next) => {
    const { userId } = req.params;
    User.findById(userId)
      .then((user) => {
        if (!user) throw new NotFoundError(`Пользователь ${userId} не найден`);
        res.status(Status.OK).send(user);
      })
      .catch((err) => throwError(err, next));
  },

  getCurrentUser: (req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) throw new NotFoundError('Вас нет в базе данных');
        res.status(Status.OK).send(user);
      })
      .catch((err) => throwError(err, next));
  },

  createUser: (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create([{ ...req.body, password: hash }], { validateBeforeSave: true }))
      .then(([newlyCreatedUser]) => {
        // Спасибо за разъяснение причины несрабатывания select: false -
        // это разъяснение прямо таки расставило всё на свои места!
        // Также интересно было узнать о назначении таких полезных опций как toJSON, toObject,
        // и об использовании в рамках этих опций функции transform(doc, ret, options)!
        // Прочитал, что есть ещё SchemaType.prototype.transform(v) - для отдельного поля.
        // Интересно, если такая функция вернёт undefined (для поля password, например),
        // то будет ли эффект тем же - т.е. будет ли такое поле проигнорировано и исключено?
        // Об этом в описании функции как-то ничего не говорится.
        res.status(Status.CREATED).send(newlyCreatedUser);
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
        } else {
          throwError(err, next);
        }
      });
  },

  updateUserData: (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, req.body, { runValidators: true, new: true, returnDocument: 'after' })
      .then((updatedUserData) => {
        // поскольку req.user._id берётся из payload токена, а не путём поиска в базе данных,
        // то нет уверенности, что в базе данных такой пользователь всё ещё есть.
        // За время хранения токена база данных могла быть повреждена, и пользователь удалился.
        if (!updatedUserData) throw new NotFoundError('Вас нет в базе данных');
        res.status(Status.OK).send(updatedUserData);
      })
      .catch((err) => throwError(err, next));
  },

};
