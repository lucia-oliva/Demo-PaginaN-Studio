# Torneo 1V1 - React + Vite

Proyecto React organizado para el panel de cálculo de puntos y ranking del torneo.

## Estructura

```text
src/
  components/
    AlertToast.jsx
    ControlPanel.jsx
    EntryHistory.jsx
    FieldLabel.jsx
    Header.jsx
    NumberField.jsx
    RankingTable.jsx
    SectionCard.jsx
    SelectField.jsx
    SocialLink.jsx
    TikTokIcon.jsx
    TopBadge.jsx
  data/
    mockData.js
  utils/
    scoring.js
  App.jsx
  main.jsx
  styles.css
public/
  assets/
    nova-logo.svg
    torneo-1v1-logo.svg
```

## Instalar

```bash
npm install
npm run dev
```

## Reemplazar branding

Cambios rápidos para personalizar:

- Reemplazá `public/assets/nova-logo.svg` por tu logo real.
- Reemplazá `public/assets/torneo-1v1-logo.svg` por la imagen real del torneo.
- Editá redes y rutas en `src/data/mockData.js`.

## Lógica de puntaje actual

- Kill: 2 puntos
- Posición 1: 10 puntos
- Posición 2: 6 puntos
- Posición 3: 4 puntos
- Sanción: descuento manual

