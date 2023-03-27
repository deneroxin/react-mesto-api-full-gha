import React from 'react';
import {Link} from 'react-router-dom';
import createValidator from '../utils/Validator';
import {useRememberState} from '../utils/customHooks';
import {GeneralStateContext} from '../contexts/contexts';

const validationObject = {
  email: [
    [text => !text, 'Введите адрес электронной почты'],
    [text => !/^[a-z\d_-]+@[a-z_-]+\.[a-z]+$/.test(text), 'Неверный формат электронного адреса'],
    [text => !/@yandex\.ru$/.test(text), 'Почта должна быть зарегистрирована на yandex.ru, использование конкурентных серверов не допускается'],
  ],
  password: [
    [text => !text, 'Введите пароль'],
    [text => text.length < 8, 'Пароль должен быть не короче 8 символов'],
    [text => !(/[a-z]/.test(text) && /[A-Z]/.test(text) && /\d/.test(text) && /[_~!@#$%^&*()-+?]/.test(text)),
     'Пароль должен содержать заглавные и строчные буквы латинского алфавита, цифры и символы из набора: _~!@#$%^&*()-+?'],
    [text => text.match(/[^\d\w~!@#$%^&*()-+?]/g),
     matches => `Пароль не должен содержать этих символов: ${Array.from(new Set(matches)).join('')}`]  // :-) Недопустимые символы можно показать, так как они не помогут узнать ни один из символов итогового пароля, который система примет.
  ],
  passwordConfirm: [
    [text => !text, 'Подтвердите пароль']
  ],
  _passwordsMatch: [
    [({password, passwordConfirm}) => password && passwordConfirm && (password != passwordConfirm),
     'Пароль подтверждён неверно']
  ]  // Email для быстрой проверки:   a@yandex.ru
};   // Пароль для быстрой проверки:  Qwerty1!

const fillOrder = { email: 1, password: 2, passwordConfirm: 3, _passwordsMatch: 2 };

export default function Register({onSubmit}) {

  const validator = React.useRef(createValidator(validationObject)).current;
  const [inputsContent, setInputsContent] = React.useState(() => validator.generateState(''));
  const {isMakingRequest} = React.useContext(GeneralStateContext);
  const lastTouched = React.useRef(0);
  const isFormInvalid = validator.isFormInvalid();

  const setSubmitted = useRememberState(      // С помощью setSubmitted указываем хуку useRememberState, что форма подтверждена,
    inputsContent, setInputsContent,          //   а значит, в следующий раз не надо "вспоминать" значения, а нужно оставить поля пустыми
    'registerData', newState => validator.validate(null, newState),
    ([name]) => !name.startsWith('password')  // Используем этот фильтр, если не хотим, чтобы пароли тоже попадали в хранилище
  );                                          // (если не боимся сохранять пароли в локальном хранилище, фильтр можно убрать)

  const handleInputChange = React.useCallback(evt => {
    const {name, value, type} = evt.target;
    lastTouched.current = Math.max(lastTouched.current, fillOrder[name]);
    const target = {[name]: value};
    if (type == 'password') target._passwordsMatch = null;
    setInputsContent(oldState => validator.validate(target, oldState));
  }, []);

  function handleFormSubmit(evt) {
    evt.preventDefault();
    onSubmit(inputsContent, setSubmitted);
  }

  function renderError(name) {
    const errorMessage = validator.getMessage(name);
    return (fillOrder[name] <= lastTouched.current) && errorMessage && <span className="sign-in__error">{errorMessage}</span>;
  }

  return (
    <div className="sign-in">
      <h2 className="sign-in__title">Регистрация</h2>
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
          <input name="passwordConfirm" type="password" value={inputsContent.passwordConfirm}
            className="sign-in__input"
            placeholder="Подтверждение пароля"
            onChange={handleInputChange}
          />
        </div>
        <div className="sign-in__error-sheet">
          {renderError('email')}
          {renderError('password')}
          {renderError('passwordConfirm')}
          {renderError('_passwordsMatch')}
        </div>
        <div>
          <button type="submit"
            disabled={isFormInvalid || isMakingRequest}
            className={`sign-in__button ${isFormInvalid ? 'sign-in__button_cloaked' : 'interactive'}`}
          >
            {isMakingRequest ? <div className="sign-in__wait-sign" /> : 'Зарегистрироваться'}
          </button>
          <p className="sign-in__subscript">
            Уже зарегистрированы?
            <Link className="sign-in__link interactive" to='/sign-in'>Войти</Link>
          </p>
        </div>
      </form>
    </div>
  );
}




// Об особенностях валидации в компоненте
// --------------------------------------
// Здесь (как и в компоненте Login) я решил реализовать такой способ валидации, при котором
// валидация производится ДО установки состояния всех полей,
// хотя логичнее было бы валидацию вызывать внутри useEffect() с зависимостью [inputsContent].
// Однако такой способ приведёт к избыточному рендерингу, так как
// setInputsContent сначала перересует всю форму с новыми данными, затем вызовется useEffect,
// который произведет валидацию, и по ее результатам необходимо будет установить
// какое-то зарегистрированное состояние, например, ответственное за текст ошибок, чтобы
// спровоцировать второй ререндеринг с новыми текстами ошибок.
// Т.е. мы получаем дабл-рендеринг и ещё необходимость регистрировать дополнительное состояние.
// Данный способ позволяет избежать и того и другого.
// Состояние с текстами ошибок здесь является приватным и инкапсулировано в объекте validator,
// который регистрируется с помощью useRef.
// Теперь при изменении в полях мы вычисляем новое состояние и сначала подаём его на валидатор, (а если точнее, то сам валидатор мержит новые данные с полным старым состоянием, проверяет это и возвращает нам новое состояние)
// который тут же проверяет и выставляет тексты ошибок, после чего вызываем setInputsContent,
// который провоцирует рендеринг, и во время рендеринга актуальные тексты ошибок уже доступны.
// Таким образом удастся обойтись одним рендерингом и не выностить состояние для ошибок в useState.
// Как раз из-за использования такого способа, пользовательскому хуку useRememberState приходится
// передавать не только setInputsContent, но и объект validator,
// чтобы перед установкой состояния полей, useRememberState мог вызвать валидатор
// над этим набором значений, как и положено.
// Это необходимо, чтобы соответствующим образом выставить доступность кнопки, когда мы впихиваем данные принудительно.


// В чём смысл объекта fillOrder?
// ------------------------------
// Ошибки не выводятся до тех пор пока пользователь не начнёт вводить что-либо в поля.
// Это сделано для того, чтобы сообщения об ошибках не смущали пользователя,
// когда он ещё даже не начал ничего вводить.
// Но как только он начнёт вводить в поле текст, сообщения об ошибках для этого поля
// станут разрешены, и начнут появляться, если значение не проходит валидацию.
// Однако, может случиться так, что пользователь начнёт заполнять форму
// не с самого верхнего поля.
// Тогда было бы логично разрешить сообщения об ошибках не только
// для выбранного поля, но и для всех полей, находящихся выше него.
// Например, если пользователь сразу перешёл ко второму полю и стал вводить пароль,
// а логин пропустил, то было бы хорошо сообщить ему о том, что нужно ввести логин.
// Для этого мы отслеживаем максимальный порядковый номер затронутого поля,
// и потом, если набор правил закреплён за полем, чей порядковый номер меньше или равен
// этому максимальному, то сообщения об ошибках для этого набора правил разрешаем.

// Имеется также набор общих правил, которые не относятся к конкретному полю.
// Такие правила призваны сопоставлять данные нескольких полей.
// Поэтому надо, чтобы сообщения об ошибках, порождаемые этими правилами, появлялись
// в случае, когда любое из полей, от которых они зависят, находится выше
// максимального затронутого поля или им является.
// Для этого, таким виртуальным "полям" присваивается порядковый номер
// самого верхнего поля, от которого они зависят.
// Имя виртуального "поля" должно начинаться с "_", а валидационная функция принимает
// весь набор значений физических полей вместо значения одного поля.

// Объект fillOrder нельзя сгенерировать автоматически.
// Во-первых, индексы виртуальных полей зависят от тех или иных физических полей,
// и только мы сами знаем, от каких. Поэтому их нужно выставлять вручную.
// Во-вторых, для нескольких форм могут быть заданы единые правила, которые были вынесены
// в отдельную переменную, и к ним предполагается добавить специфичные для каждой формы правила.
// В этом случае точный порядок следования полей в объекте соблюсти не удастся,
// так как объект получается разбит на части, и при их объединении,
// порядок свойств будет уже не такой, какой нам нужен.
// Вот почему нет смысла пытаться сгенерировать объект fillOrder автоматически,
// его придётся заполнять вручную.
