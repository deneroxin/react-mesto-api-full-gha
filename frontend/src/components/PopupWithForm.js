import React from 'react';
import {PopupClosableContext, PopupWithFormContext, GeneralStateContext} from '../contexts/contexts';

export default function PopupWithForm({
  name, isOpen, onSubmit, title, buttonText, buttonRequestText, children
}) {

  const inputList = React.Children.toArray(children);
  const popupClosable = React.useContext(PopupClosableContext); // Подтягиваем интерфейс, отвечающий за закрытие окна
  const {isMakingRequest} = React.useContext(GeneralStateContext);

  // Свойство inputsContent, хранящее значения всех полей формы,
  // реализовано посредством Ref, а не State, потому что в случае использования State,
  // при любом изменении в одном из полей, будет ре-рендериться весь popup.
  // Если использовать для этой цели контекст, получим примерно то же самое.
  // Реализация через Ref должна, по идее, избавить от лишнего ре-рендеринга.
  const inputsContent = React.useRef(Object.fromEntries(inputList.map(({props}) => [props.name, '']))).current;  // набор значений всех полей формы
  const validationState = React.useRef(Object.fromEntries(inputList.map(({props}) => [props.name, false]))).current;  // набор признаков валидности каждого поля
  const resetOnNextOpen = React.useRef(true);   // текст полей сбрасывается при следующем открытии, а не сразу при закрытии (подтверждении), иначе это заметно, пока окно уходит в прозрачность (оно должно уйти в прозрачность с прежним текстом)
  const [shouldReset, setShouldReset] = React.useState(0);   // сигнал полям, что нужно сбросить текст (поля сбрасываются только вследствие подтверждения формы)
  const [submitButtonAvailable, setSubmitButtonAvailable] = React.useState(isFormValid());   // состояние кнопки Submit (доступна или нет)
  const [serverErrorText, setServerErrorText] = React.useState('');   // текст ошибки при запросе к серверу, который выводится под кнопкой Submit

  const handleEnter = React.useRef((evt) => {
    if (evt.key == 'Enter') handleFormSubmit();
  }).current;

  React.useEffect(function handlePopupOpen() {
    if (isOpen) {
      popupClosable.initialize(close);
      if (resetOnNextOpen.current) setShouldReset(x => x + 1);  // значение этой переменной не важно, главное спровоцировать изменение, которое послужит полю сигналом к необходимости сбросить текст
      resetOnNextOpen.current = false;
      setServerErrorText('');
      if (!inputList.length) document.addEventListener('keydown', handleEnter);
    }
  }, [isOpen]);

  function isFormValid() {
    return Object.values(validationState).every(value => value);
  }

  function updateOverallData(inputName, validationResult, inputContent) {
    inputsContent[inputName] = inputContent;
    if (validationResult != validationState[inputName]) {
      validationState[inputName] = validationResult;
      setSubmitButtonAvailable(isFormValid());
    }
  }

  function close(scheduleReset) {
    if (!inputList.length) document.removeEventListener('keydown', handleEnter);
    resetOnNextOpen.current = scheduleReset;
    popupClosable.close();
  }

  function handleFormSubmit(evt) {
    if (evt) evt.preventDefault();
    onSubmit(inputsContent, close, setServerErrorText);
  }

  return (
    <div
      className={`popup popup-close ${isOpen ? 'popup_opened' : ''}`}
      onMouseDown={popupClosable.handleMouseDown}
      onMouseUp={popupClosable.handleMouseUp}
    >
      <div className="popup__container popup__container_type_dialog">
        <h2 className="popup__title">{ title }</h2>
        <form className="popup__form" name={name} noValidate onSubmit={handleFormSubmit}>
          <PopupWithFormContext.Provider value={{shouldReset, updateOverallData}}>
            { children }
          </PopupWithFormContext.Provider>
          <button type="submit"
            className={`interactive popup__confirm-button ${submitButtonAvailable ? '' : 'popup__confirm-button_disabled'}`}
            disabled={!submitButtonAvailable || isMakingRequest}
          >{ isMakingRequest ? buttonRequestText : buttonText }</button>
          {serverErrorText && (
            <span className="popup__server-error">{ serverErrorText }</span>
          )}
        </form>
        <button type="button"
          className="interactive popup__close-button popup-close"
          aria-label="Закрыть окно"
        ></button>
      </div>
    </div>
  );
}
