import React from 'react';
import {CurrentUserContext} from '../contexts/contexts';
import PopupWithForm from './PopupWithForm';
import InputWithError from './InputWithError';

export default React.memo(function EditProfilePopup(props) {

  const currentUser = React.useContext(CurrentUserContext);

  return (
    <PopupWithForm
      {...props}
      name="edit-profile"
      title="Редактировать профиль"
      buttonText="Сохранить"
      buttonRequestText="Сохранение"
    >
      <InputWithError name="name" type="text" placeholder="Имя" minLength="2" maxLength="40" required>
        {currentUser && currentUser.name}
      </InputWithError>
      <InputWithError name="about" type="text" placeholder="О себе" minLength="2" maxLength="200" required>
        {currentUser && currentUser.about}
      </InputWithError>
    </PopupWithForm>
  );
});
