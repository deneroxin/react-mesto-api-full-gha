import React from 'react';
import {useRememberState} from '../utils/customHooks';
import {GeneralStateContext} from '../contexts/contexts';

export default function Login({onSubmit}) {

  const [inputsContent, setInputsContent] = React.useState({email: '', password: ''});
  const [serverError, setServerError] = React.useState('');
  const {isMakingRequest} = React.useContext(GeneralStateContext);

  const setSubmitted = useRememberState(  // Засчёт setSubmitted указываем хуку useRememberState, что форма подтверждена,
    inputsContent, setInputsContent,      //  а значит, в следующий раз не надо "вспоминать" значения, а нужно оставить поля пустыми
    'loginData', undefined,
    ([name]) => name != 'password'  // Используем этот фильтр, если не хотим, чтобы пароль тоже попал в хранилище
  );                                // (если не боимся сохранять пароль в локальном хранилище, фильтр можно убрать)

  const handleInputChange = React.useCallback(evt => {
    const {name, value} = evt.target;
    if (serverError) setServerError('');
    setInputsContent(oldState => ({...oldState, [name]: value}));
  }, [serverError]);

  function handleFormSubmit(evt) {
    evt.preventDefault();
    setServerError('');
    onSubmit(inputsContent, setSubmitted, setServerError);
  }

  return (
    <div className="sign-in">
      <h2 className="sign-in__title">Вход</h2>
      <form className="sign-in__form" name="sign-in" onSubmit={handleFormSubmit} noValidate>
        <div>
          <input name="email" type="email" value={inputsContent.email}
            className="sign-in__input"
            placeholder="Email"
            onChange={handleInputChange}
          />
          <input name="password" type="password" value={inputsContent.password}
            className="sign-in__input"
            placeholder="Пароль"
            onChange={handleInputChange}
          />
        </div>
        <div className="sign-in__error-sheet">
          {serverError && <span className="sign-in__error">{serverError}</span>}
        </div>
        <div>
          <button type="submit"
            style={{marginBottom: '32px'}}
            disabled={isMakingRequest}
            className="sign-in__button interactive"
          >
            {isMakingRequest ? <div className="sign-in__wait-sign" /> : 'Войти'}
          </button>
        </div>
      </form>
    </div>
  );
}
