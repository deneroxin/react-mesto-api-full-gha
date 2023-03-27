const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { patternURL } = require('../utils').validationPatterns;
const {
  getAllUsers, getUserById, updateUserData, getCurrentUser,
} = require('../controllers/users');

router.get('/', getAllUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex().length(24).required(),
  }),
}), getUserById);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(patternURL), // используем тот же валидатор, что и в схеме
  }),
}), updateUserData);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserData);

module.exports = router;
