import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import OneVOnePage from './pages/OneVOnePage';
import NovarushPage from './pages/NovarushPage';
import NovaEclipsePage from './pages/NovaEclipsePage';
import LoginPage from './pages/LoginPage';

import './stylesNovaRush.css';
import './stylesEclipse.css';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<OneVOnePage />}
      />

      <Route
        path="/eclipse"
        element={<NovaEclipsePage />}
      />

      <Route
        path="/novarush"
        element={<NovarushPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}