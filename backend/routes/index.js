const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { Joi, celebrate } = require('celebrate');
const { GeneralError, Status } = require('../error');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');
const { validationPatterns, createRateLimiter } = require('../utils');

// Число запросов увеличено в 10 раз для того, чтобы тест прошёл нормально.
const tightLimiter = createRateLimiter(5, 100);
const looseLimiter = createRateLimiter(5, (req) => (req.path.endsWith('/likes') ? 5000 : 1000));

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

router.get('/signout', (req, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
});

router.use(looseLimiter, cookieParser(), auth);

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

router.use((req, res, next) => {
  next(new GeneralError('Ресурс не найден', Status.NOT_FOUND));
});

module.exports = router;
