import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { CurrentUserContext } from '../contexts/contexts';

// Старая реализация защищенного маршрута, не поддерживаемая новыми версиями react-router

export function ProtectedRoute({ element, redirectTo, loadingComplete }) {

  const loggedIn = React.useContext(CurrentUserContext);

  return <Route path="/" element={loggedIn ? element
    : (loadingComplete ? <Navigate to={redirectTo} replace />
      : <section className="loading"/>)} />;
}


// Новая реализация, работающая с новыми версиями react-router

export function ProtectedComponent({ children, redirectTo, loadingComplete }) {

  const loggedIn = React.useContext(CurrentUserContext);

  return loggedIn ? children
    : (loadingComplete ? <Navigate to={redirectTo} replace />
      : <section className="loading"/>);
}
