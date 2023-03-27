import React from 'react';
import {PopupClosableContext} from '../contexts/contexts';

export default function ImagePopup({card, isOpen}) {

  const popupClosable = React.useContext(PopupClosableContext);

  React.useEffect(function handlePopupOpen() {
    if (isOpen) popupClosable.initialize();
  }, [isOpen]);

  return (
    <div
      className={`popup popup_type_view-card popup-close ${isOpen ? 'popup_opened' : ''}`}
      onMouseDown={popupClosable.handleMouseDown}
      onMouseUp={popupClosable.handleMouseUp}
    >
      <div className="popup__container">
        <img className="popup__image"
          src={card ? card.link : ''}
          alt={card ? card.name : ''}
        />
        <h2 className="popup__subscript">{ card ? card.name : '' }</h2>
        <button type="button"
          className="interactive popup__close-button popup-close"
          aria-label="Закрыть просмотр"
        ></button>
      </div>
    </div>
  );
}
