import React from 'react';
import {PopupWithFormContext} from '../contexts/contexts';

export default function InputWithError({children, ...inputProps}) {
  //                                      ^---проп children содержит исходный текст для поля

  const [errorText, setErrorText] = React.useState('');
  const inputElement = React.useRef(null);
  const parentForm = React.useContext(PopupWithFormContext);

  React.useEffect(function handleSettingTextExplicitly() {
    inputElement.current.value = children ? children : '';
    validateInput();
    setErrorText('');
  }, [parentForm.shouldReset, children]);

  function validateInput() {
    parentForm.updateOverallData(
      inputProps.name,
      inputElement.current.checkValidity(),
      inputElement.current.value
    );
  }

  function handleInput() {
    validateInput();
    setErrorText(inputElement.current.validationMessage);
  }

  return (
    <>
      <input
        ref={inputElement}
        className="popup__input-box"
        {...inputProps}
        aria-label={inputProps.placeholder}
        onInput={handleInput}
      />
      <span className="popup__error">{ errorText }</span>
    </>
  );
}
