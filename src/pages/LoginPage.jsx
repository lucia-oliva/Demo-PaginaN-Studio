import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowLeft,
  LockKeyhole,
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

function getSafeReturnPath(routeState) {
  const candidate = routeState?.from;

  if (
    typeof candidate === 'string'
    && candidate.startsWith('/')
    && !candidate.startsWith('//')
    && candidate !== '/login'
  ) {
    return candidate;
  }

  return '/';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    checkingSession,
    login,
  } = useAuth();

  const returnPath = getSafeReturnPath(
    location.state,
  );

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (
      !checkingSession
      && isAuthenticated
    ) {
      navigate(returnPath, {
        replace: true,
      });
    }
  }, [
    checkingSession,
    isAuthenticated,
    navigate,
    returnPath,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login({
        username,
        password,
      });

      navigate(returnPath, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError.message
        || 'No se pudo iniciar sesión',
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="login-page">
        <p className="login-page__checking">
          Verificando sesión…
        </p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <main className="login-page__container">
        <Link
          className="login-page__main-logo"
          to="/"
          aria-label="Volver a 1V1"
        >
          <img
            src="/assets/logo_sin_fondo.svg"
            alt="NOVA Esports"
          />
        </Link>

        <form
          className="login-page__card"
          onSubmit={handleSubmit}
        >
          <img
            className="login-page__secondary-logo"
            src="/assets/logo_nova_blanco1.svg"
            alt="NOVA"
          />

          <div
            className="login-page__icon"
            aria-hidden="true"
          >
            <LockKeyhole size={24} />
          </div>

          <div className="login-page__heading">
            <p className="login-page__eyebrow">
              Acceso administrativo
            </p>

            <h1 className="login-page__title">
              Iniciar sesión
            </h1>

            <p className="login-page__description">
              Ingresá para administrar puntos,
              sanciones y slots.
            </p>
          </div>

          <label className="login-page__field">
            <span>Usuario</span>

            <input
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
              disabled={loading}
              maxLength={100}
              required
              autoFocus
            />
          </label>

          <label className="login-page__field">
            <span>Contraseña</span>

            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              disabled={loading}
              maxLength={256}
              required
            />
          </label>

          {error ? (
            <p
              className="login-page__error"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            className="login-page__submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Ingresando…'
              : 'Ingresar'}
          </button>

          <Link
            className="login-page__back"
            to={returnPath}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />
            Volver a la tabla
          </Link>
        </form>
      </main>
    </div>
  );
}