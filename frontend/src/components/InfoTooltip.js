import React from 'react';
import {PopupClosableContext} from '../contexts/contexts';

export default function InfoTooltip({isOpen, icon, message}) {

  const popupClosable = React.useContext(PopupClosableContext);

  React.useEffect(function handlePopupOpen() {
    if (isOpen) popupClosable.initialize();
  }, [isOpen]);

  return (
    <div
      className={`popup popup-close ${isOpen ? 'popup_opened' : ''}`}
      onMouseDown={popupClosable.handleMouseDown}
      onMouseUp={popupClosable.handleMouseUp}
    >
      <div className="popup__container popup__container_type_dialog popup__container_type_info">
        <div className="popup__icon" style={{backgroundImage: `url(${icon})`}}/>
        <h2 className="popup__message">{ message }</h2>
        <button type="button"
          className="interactive popup__close-button popup-close"
          aria-label="Закрыть окно"
        ></button>
      </div>
    </div>
  );
}
