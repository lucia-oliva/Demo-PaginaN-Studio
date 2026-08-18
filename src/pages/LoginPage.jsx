import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import Header from '../components/Header';
import { loginAdmin } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="app-shell__glow" />

      <main className="app-container">
        <Header />

        <section className="login-shell">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-card__icon" aria-hidden="true">
              <LockKeyhole size={24} />
            </div>

            <div>
              <p className="login-card__eyebrow">Admin</p>
              <h2 className="login-card__title">Iniciar sesión</h2>
            </div>

            <label className="login-field">
              <span className="field-label">Email</span>
              <input
                className="number-field"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
              />
            </label>

            <label className="login-field">
              <span className="field-label">Contraseña</span>
              <input
                className="number-field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                required
              />
            </label>

            {error ? <p className="login-card__error">{error}</p> : null}

            <button className="action-button action-button--danger" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>

            <Link className="login-card__link" to="/">
              Volver a la tabla
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
}
