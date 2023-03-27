import React from 'react';
import headerLogo from '../blocks/header/__logo/header__logo_color_white.svg';
import { CurrentUserContext } from '../contexts/contexts';

export default function Header({handleHeaderLinkClick, isRegistration}) {

  const [menuInvoked, setMenuInvoked] = React.useState(false);   // Когда вызываем бургерное меню в мобильной версии
  const loggedIn = React.useContext(CurrentUserContext);

  React.useEffect(function scrollToMenu() {
    window.scroll(0, 0);  // Если страница не на самой высоте, то скролла к меню не происходит,
  }, [menuInvoked]);      // если явно его не сделать.

  function handleInvokeMenu() {
    setMenuInvoked(oldState => !oldState);
  }

  function handleLinkClick() {
    if (loggedIn) setMenuInvoked(false);
    handleHeaderLinkClick();
  }

  return (
    <header className={`header ${loggedIn ? 'authorized' : ''} ${menuInvoked ? 'header_menu-invoked' : ''}`}>
      <div className="header__band">
        <img className="header__logo"
          src={headerLogo}
          alt="лого" />
        {loggedIn && <button className={`header__menu-button interactive`} onClick={handleInvokeMenu} />}
      </div>
      <div className="header__nav">
        {loggedIn && <h2 className="header__user-email">{ loggedIn.email }</h2>}
        <nav>
          <button
            className="header__link interactive"
            onClick={handleLinkClick}
          >
            {loggedIn ? 'Выйти' : (isRegistration ? 'Войти' : 'Регистрация')}
          </button>
        </nav>
      </div>
    </header>
  );
}
