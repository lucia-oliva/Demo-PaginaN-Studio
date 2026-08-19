import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

export default function AuthButton() {
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    checkingSession,
    logout,
  } = useAuth();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  if (checkingSession) {
    return (
      <div
        className="auth-nav auth-nav--loading"
        aria-label="Verificando sesión"
      >
        Verificando…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-nav">
        <Link
          className="auth-nav__button"
          to="/login"
          state={{ from: location.pathname }}
        >
          <LogIn size={16} aria-hidden="true" />
          <span>Iniciar sesión</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-nav">
      <span className="auth-nav__user">
        <ShieldCheck size={15} aria-hidden="true" />
        {user?.username || 'Admin'}
      </span>

      <button
        className="auth-nav__button"
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        <LogOut size={16} aria-hidden="true" />
        <span>
          {loggingOut ? 'Cerrando…' : 'Cerrar sesión'}
        </span>
      </button>
    </div>
  );
}