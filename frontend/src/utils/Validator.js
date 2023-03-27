export default function createValidator(validationObject) {

  const errorText = {};  // Объекты намеренно оставлены пустыми, чтобы подчеркнуть, что начальное состояние
                         // валидации должно непременно вычисляться на основе начального содержимого полей.
  let isInvalid;         // Поэтому после создания валидатора необходимо вызвать функцию generateState(),
                         // которая сгенерирует начальное состояние полей и произведёт первичную валидацию. (*)
  const isReal = (name) => name[0] != '_';

  const commonRules = Object.fromEntries(
    Object.keys(validationObject).filter(name => !isReal(name)).map(name => [name, null])
  );

  const generateState = (initialValue) => validate(null, Object.fromEntries(
    Object.keys(validationObject).filter(isReal).map(name => [name, initialValue])
  ));

  const complementState = (state) => ({...state, ...commonRules});

  function validate(fieldsModified, allValues) {
    const arrayOfModified = Object.entries(fieldsModified || complementState(allValues));
    const realFieldsModified = Object.fromEntries(arrayOfModified.filter(([name]) => isReal(name)));
    const newValues = {...allValues, ...realFieldsModified};
    arrayOfModified.forEach(([name, text]) => {
      errorText[name] = '';
      for (let i = 0; i < validationObject[name].length && !errorText[name]; i++) {
        const [rule, message] = validationObject[name][i];
        const result = rule(isReal(name) ? text : newValues);
        if (result) errorText[name] = (typeof message == 'function' ? message(result) : message);
      }
    });
    isInvalid = Object.values(errorText).some(Boolean);
    return newValues;
  };

  const getMessage = (name) => errorText[name];

  const isFormInvalid = () => isInvalid;

  return { generateState, validate, getMessage, isFormInvalid };
}


// (*) Может возникнуть вопрос: а что если мы хотим сгенерировать состояние,
// отличное от того, чтобы дублировать одно и то же значение на все поля?
// Получается, что функция generateState() не может этого обеспечить.
// Но я подозреваю, что это и не понадобится.
// В нашем случае, к примеру, начальное значение всех полей - пустая строка.
// Предположим, что нам нужно вставить в поля какой-то заведомо определенный текст.
// Как правило, мы будем делать это в каком-нибудь эффекте, например:
// React.useEffect(() => { fillInputsContentWith(someObject) }, [])
// или
// React.useEffect(() => { if (isOpen) fillInputsContentWith(someObject) }, [isOpen])
// то есть либо когда окно открыли, либо когда компонент с формой монтируется.
// Между тем, функция useState() уже при самом первом исполнении функции компонента
// (ещё до всяких эффектов) - требует передать ей какое-то начальное состояние.
// Вот для этого случая и нужна функция generateState(), так как на начальном этапе нам
// подойдёт любое сотояние, лишь бы оно содержало все необходимые ключи (да и это не всегда обязательно)
// Поэтому мы генерируем состояние с пустыми строками, а конкретные состояния
// будут назначаться позднее другими способами.
// Поэтому я верю, что функции generateState() в том виде, в каком она реализована,
// должно быть достаточно.
// Вообще, она сделана для того, чтобы не приходилось перечислять имена всех полей ещё раз,
// задавая объект вручную: ведь они уже перечислены при задании правил валидации,
// так что список имён всех полей можно вытянуть оттуда.
// К сожалению, этот "трюк" нельзя применить к объекту fillOrder.
