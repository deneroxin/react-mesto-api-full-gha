import React from 'react';
import PopupWithForm from './PopupWithForm';

export default React.memo(function ConfirmationPopup(props) {
  return (
    <PopupWithForm
      {...props}
      name="confirmation"
      title="Вы уверены?"
      buttonText="Да"
      buttonRequestText="Удаление"
    />
  );
});
