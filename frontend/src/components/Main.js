import React from 'react';
import { CurrentUserContext } from '../contexts/contexts';
import emptyIndicator from '../blocks/elements/__empty-indicator/elements__empty-indicator.jpg';
import Card from './Card';

export default function Main({ cards, cardHandlers, handleOpenPopup }) {

  const currentUser = React.useContext(CurrentUserContext);

  return (
    <main className="main">
      { currentUser && (
        <section className="profile" aria-label="Профиль" hidden>
          <div className="profile__avatar"
            style={{backgroundImage: `url(${currentUser.avatar})`}}
            onClick={() => handleOpenPopup('change-avatar')}>
          </div>
          <div className="profile__text-container">
            <div className="profile__name-container">
              <h1 className="profile__name">{currentUser.name}</h1>
              <button type="button" className="interactive profile__edit-button"
                aria-label="Редактировать профиль"
                onClick={() => handleOpenPopup('edit-profile')}
              ></button>
            </div>
            <p className="profile__about">{currentUser.about}</p>
          </div>
          <button type="button" className="interactive profile__add-button"
            aria-label="Добавить"
            onClick={() => handleOpenPopup('add-card')}
          ></button>
        </section>
      )}
      { currentUser && cards && (
        <section className="elements" aria-label="Места">
          <ul className="elements__cards">
            { cards.map(card => (<Card
                key={card._id}
                cardData={card}
                {...{cardHandlers}}
              />))
            }
          </ul>
          { !cards.length &&
            <img
              className="elements__empty-indicator"
              src={emptyIndicator}
              alt="Нет карточек"
            />
          }
        </section>
      )}
    </main>
  );
}
