const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { patternURL } = require('../utils').validationPatterns;
const {
  getAllCards, createCard, deleteCard, putLike, removeLike,
} = require('../controllers/cards');

const verifyCardId = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
});

router.get('/', getAllCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().pattern(patternURL).required(),
  }),
}), createCard);

router.delete('/:cardId', verifyCardId, deleteCard);

router.put('/:cardId/likes', verifyCardId, putLike);

router.delete('/:cardId/likes', verifyCardId, removeLike);

module.exports = router;
