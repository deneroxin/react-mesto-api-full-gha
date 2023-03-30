import React from 'react';
import {CurrentUserContext} from '../contexts/contexts';
import fallbackImage from '../blocks/card/__image/card__image-fallback.jpg';

export default function Card({cardData, cardHandlers}) {

  const cardElement = React.useRef(null); // Используется, чтобы прицепить эффект удаления на карточку
  const myID = React.useContext(CurrentUserContext)._id;
  const isLiked = cardData.likes.some(user => user._id == myID);
  const numLikes = cardData.likes.length;
  const isMine = cardData.owner === myID;

  function handleClick() {
    cardHandlers.handleCardClick(cardData);
  }

  function handleRemove(evt) {
    evt.stopPropagation();
    cardHandlers.handleCardRemoveClick(cardData, removeEffect);
  }

  function removeEffect() {
    return new Promise(resolve => {
      cardElement.current.classList.add('card_removed');
      const style = window.getComputedStyle(cardElement.current);
      const transDurSec = parseFloat(style.getPropertyValue('transition-duration'));
      setTimeout(resolve, transDurSec * 1000);
    });
  }

  function handleLikeClick() {
    cardHandlers.handleCardLike(cardData);
  }

  return (
    <li className="card" ref={cardElement}>
      <div
        className="card__image"
        style={{backgroundImage: `url(${cardData.link}), url(${fallbackImage})`}}
        onClick={handleClick}
      >
        { isMine && (
          <button type="button"
            className="interactive card__remove-button"
            aria-label="Удалить место"
            onClick={handleRemove}
          ></button>)
        }
      </div>
      <div className="card__footer">
        <h2 className="card__subscript">{cardData.name}</h2>
        <button type="button"
          className={`interactive card__like-button ${isLiked ? 'card__like-button_active' : ''}`}
          aria-label="Поставить лайк"
          onClick={handleLikeClick}
        ></button>
        <p className="card__num-likes">{numLikes}</p>
      </div>
    </li>
  )
}
