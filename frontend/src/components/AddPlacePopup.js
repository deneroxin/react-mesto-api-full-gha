import React from 'react';
import PopupWithForm from './PopupWithForm';
import InputWithError from './InputWithError';

export default React.memo(function AddPlacePopup(props) {
  return (
    <PopupWithForm
      {...props}
      name="add-card"
      title="Новое место"
      buttonText="Создать"
      buttonRequestText="Создание"
    >
      <InputWithError name="name" type="text" placeholder="Название" minLength="2" maxLength="30" required />
      <InputWithError name="link" type="url" placeholder="Ссылка на картиинку" required />
    </PopupWithForm>
  );
});
