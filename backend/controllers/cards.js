const Card = require('../models/card');
const {
  Status, throwError, NotFoundError, ForbiddenError,
} = require('../errors');

module.exports = {

  getAllCards: (req, res, next) => {
    Card.find({})
      .populate('likes')
      .then((result) => {
        res.status(Status.OK).send(result);
      })
      .catch((err) => throwError(err, next));
  },

  createCard: (req, res, next) => {
    req.body.owner = req.user._id;
    Card.create(req.body)
      .then((createdCard) => {
        res.status(Status.CREATED).send(createdCard);
      })
      .catch((err) => throwError(err, next));
  },

  deleteCard: (req, res, next) => {
    const { cardId } = req.params;
    Card.findById(cardId)
      .then((foundCard) => {
        if (!foundCard) throw new NotFoundError('Карточка не найдена');
        if (foundCard.get('owner', String) !== req.user._id) {
          throw new ForbiddenError('Нельзя удалять чужие карточки', Status.FORBIDDEN);
        }
        Card.findByIdAndRemove(cardId)
          .then((oldCard) => {
            res.status(Status.OK).send(oldCard);
          })
          .catch((err) => throwError(err, next));
      })
      .catch((err) => throwError(err, next));
  },

  putLike: (req, res, next) => {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .populate('likes')
      .then((updatedCard) => {
        if (!updatedCard) throw new NotFoundError('Карточка не найдена');
        res.status(Status.OK).send(updatedCard);
      })
      .catch((err) => throwError(err, next));
  },

  removeLike: (req, res, next) => {
    Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .populate('likes')
      .then((updatedCard) => {
        if (!updatedCard) throw new NotFoundError('Карточка не найдена');
        res.status(Status.OK).send(updatedCard);
      })
      .catch((err) => throwError(err, next));
  },

};
