// "Объект" интерфейса описан функцией, чтобы соответствовать
// выбранной тенденции использовать функциональный подход при создании компонентов,
// хотя на самом деле - просто лаконичнее получается запись (не загромождена префиксами this.)

export default function createPopupClosable(handleAnyPopupClose) {

  let mousePushedOnOverlay = false;
  let handleClose = close;

  function handleKeyDown(evt) {
    if (evt.key == 'Escape') handleClose(false);
  }

  function initialize(handleThisPopupClose) {
    if (handleThisPopupClose) handleClose = handleThisPopupClose;
    document.addEventListener('keydown', handleKeyDown);
  }

  // !! handleThisPopupClose, передаваемый методу initialize,
  // должен по завершении !обязательно! вызвать метод close() интерфейса:
  function close() {
    handleClose = close;
    document.removeEventListener('keydown', handleKeyDown);
    handleAnyPopupClose();
  }

  // Целью использования пары событий (mouseDown, mouseUp) вместо простого "click"
  // является обход неправильной реализации браузерами события "click",
  // благодаря чему удастся избежать закрытия окна в следующих случаях:
  // когда кнопка нажата внутри окна и отпущена на оверлее, или
  // когда кнопка нажата на оверлее и отпущена внутри окна.

  function handleMouseDown(evt) {
    if (evt.target.classList.contains('popup-close')) mousePushedOnOverlay = true;
  }

  function handleMouseUp(evt) {
    if (evt.target.classList.contains('popup-close') && mousePushedOnOverlay) handleClose(false);
    mousePushedOnOverlay = false;
  }

  return { initialize, handleMouseDown, handleMouseUp, close }
}
