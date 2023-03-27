import React from 'react';

// Этот хук пытается сохранить содержимое полей при размонтировании компонента,
// когда мы переходим на другой маршрут, чтобы при переходе обратно "вспомнить" содержимое всех полей.
// Однако, это работает с ссылками, но не работает в случае, когда новый адрес
// вводится в адресной строке вручную: при запросе с новым адресом, размонтирования
// компонентов старого маршрута, видимо, не происходит, поэтому данные сохранить не удаётся
// (а запихивать данные в хранилище после ввода каждого символа представляется расточительством вычислительной мощности)
// Наверняка библиотека history умеет решать подобные задачи лучше,
// но я в это пока не вдавался, и решил остановиться пока на таком "ручном" способе.

export function useRememberState(inputsContent, setInputsContent, storageName, validate = x => x, filter = () => true) {
  const inputsActualContent = React.useRef(inputsContent);
  const isSubmitted = React.useRef(false);

  React.useEffect(() => {
    inputsActualContent.current = inputsContent;
  }, [inputsContent]);

  React.useEffect(function restoreRecentState() {
    const recentState = sessionStorage.getItem(storageName);
    if (recentState) {
      sessionStorage.removeItem(storageName);
      inputsActualContent.current = {...inputsActualContent.current, ...JSON.parse(recentState)};
      setInputsContent(validate(inputsActualContent.current));
    }
    return () => {
      if (!isSubmitted.current)
      sessionStorage.setItem(storageName, JSON.stringify(
        Object.fromEntries(Object.entries(inputsActualContent.current).filter(filter))
      ));
    };
  }, []);

  return () => {
    isSubmitted.current = true;
    // А что если размонтирование произойдёт раньше чем вызовется эта функция?
    // Тогда данные успеют сохраниться в хранилище, а нам это ни к чему:
    sessionStorage.removeItem(storageName);
  }
}
