const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { Joi, celebrate } = require('celebrate');
const { NotFoundError } = require('../errors');
const { login, clearCookie, createUser } = require('../controllers/users');
const authorize = require('../middlewares/auth');
const { validationPatterns, createRateLimiter } = require('../utils');

// Число запросов увеличено в 10 раз для того, чтобы тест прошёл нормально.
const tightLimiter = createRateLimiter(5, 100);
const looseLimiter = createRateLimiter(5, (req) => (req.path.endsWith('/likes') ? 5000 : 1000));

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

router.post('/signin', tightLimiter, celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
}), login);

router.post('/signup', tightLimiter, celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(validationPatterns.patternURL),
  }),
}), createUser);

router.get('/signout', clearCookie);

router.use(looseLimiter, cookieParser(), authorize);

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use((req, res, next) => {
  next(new NotFoundError('Ресурс не найден'));
});

module.exports = router;
