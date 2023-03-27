const Card = require('../models/card');
const { GeneralError, Status, throwError } = require('../error');

module.exports = {

  getAllCards: (req, res, next) => {
    Card.find({})
      .then((result) => {
        res.status(Status.OK).send(result);
      })
      .catch((err) => throwError(err, next));
  },

  createCard: (req, res, next) => {
    req.body.owner = req.user._id;
    Card.create(req.body)
      .then((createdCard) => {
        res.status(Status.CREATED).send({ data: createdCard });
      })
      .catch((err) => throwError(err, next));
  },

  deleteCard: (req, res, next) => {
    const { cardId } = req.params;
    Card.findById(cardId)
      .then((foundCard) => {
        if (!foundCard) throw new GeneralError('Карточка не найдена', Status.NOT_FOUND);
        if (foundCard.get('owner', String) !== req.user._id) {
          throw new GeneralError('Нельзя удалять чужие карточки', Status.FORBIDDEN);
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
        if (!updatedCard) throw new GeneralError('Карточка не найдена', Status.NOT_FOUND);
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
        if (!updatedCard) throw new GeneralError('Карточка не найдена', Status.NOT_FOUND);
        res.status(Status.OK).send(updatedCard);
      })
      .catch((err) => throwError(err, next));
  },

};
