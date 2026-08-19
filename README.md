# Demo Página N Studio

Demo web personalizable para presentar y administrar rankings de torneos. El proyecto incluye tres experiencias visuales, cálculo de puntajes, historial de partidas, cupos, autenticación administrativa y persistencia en Cloudflare D1.

**Demo pública:** https://demo-paginan-studio.pages.dev

> Este repositorio es una base demostrativa. Nombres, textos, logos, imágenes, colores, redes, reglas de puntaje y módulos pueden adaptarse al cliente final.

## Funcionalidades

- Tres vistas de torneo:
  - `/` — Torneo 1V1
  - `/eclipse` — Nova Eclipse
  - `/novarush` — Nova Rush
- Ranking y cálculo automático de puntos.
- Historial de registros por torneo.
- Gestión de cupos.
- Panel de edición protegido por sesión administrativa.
- Alta, modificación y eliminación de datos mediante API.
- Protección CSRF, cookies seguras y limitación de intentos de acceso.
- Base de datos SQL en Cloudflare D1.
- Despliegue global mediante Cloudflare Pages y Pages Functions.

## Tecnología

- React 19
- Vite 7
- React Router
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- Wrangler 4

## Arquitectura

```text
Navegador
  ├─ React + Vite (interfaz pública y panel)
  └─ /api/* (Pages Functions)
       ├─ autenticación y sesión
       ├─ validación y rate limiting
       └─ Cloudflare D1
```

Los recursos estáticos se sirven desde la red global de Cloudflare. Las rutas `/api/*` ejecutan Pages Functions y consultan la base D1 mediante el binding `DB`.

## Estructura principal

```text
src/
  auth/                 Estado de autenticación
  components/           Componentes reutilizables
  pages/                Vistas 1V1, Eclipse, Nova Rush y Login
  services/api.js       Cliente de la API
  utils/scoring.js      Reglas de puntaje
  styles*.css           Estilos generales y por torneo
functions/
  _shared/              HTTP, datos y seguridad compartida
  api/auth/             Login, logout y sesión
  api/entries/          Registros del torneo 1V1
  api/novaeclipse/      Registros y cupos de Eclipse
  api/novarush/         Registros y cupos de Nova Rush
  api/slots/            Cupos del torneo 1V1
migrations/             Esquema y migraciones de D1
public/assets/          Logos, fondos e imágenes
wrangler.jsonc          Configuración de Pages y D1
```

## Requisitos

- Node.js 20 o superior.
- npm.
- Una cuenta de Cloudflare para probar Functions, D1 o publicar.
- Wrangler autenticado para operaciones remotas: `npx wrangler login`.

## Instalación local

```bash
npm ci
npm run dev
```

`npm run dev` inicia solamente la interfaz de Vite. Para probar la aplicación completa con Pages Functions y D1:

```bash
npm ci
npx wrangler d1 migrations apply demo-paginan-studio-db --local
npm run build
npx wrangler pages dev dist
```

## Variables y secretos

La autenticación requiere estas claves:

| Nombre | Tipo recomendado | Descripción |
|---|---|---|
| `ADMIN_USERNAME` | Variable o secreto | Usuario administrador |
| `ADMIN_PASSWORD_HASH` | Secreto | Hash PBKDF2, nunca la contraseña en texto plano |
| `AUTH_SECRET` | Secreto | Cadena aleatoria de al menos 32 caracteres |

Para desarrollo local, crear un archivo `.dev.vars` sin subirlo al repositorio:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=pbkdf2$100000$SAL_BASE64URL$HASH_BASE64URL
AUTH_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_LARGO
```

### Requisito del hash de contraseña

El formato aceptado es:

```text
pbkdf2$100000$<salt-base64url>$<hash-base64url>
```

Se utiliza PBKDF2 con SHA-256, salt aleatorio y una clave derivada de 32 bytes. En este proyecto deben usarse **100.000 iteraciones** para mantener compatibilidad con el límite del runtime de Cloudflare Workers. No guardar ni registrar contraseñas, hashes completos, cookies, tokens o secretos en consola.

## Base de datos D1

Aplicar las migraciones localmente:

```bash
npx wrangler d1 migrations apply demo-paginan-studio-db --local
```

Aplicarlas en producción:

```bash
npx wrangler d1 migrations apply demo-paginan-studio-db --remote
```

El binding configurado para las Functions es `DB`.

## Compilación y despliegue

El proyecto actual usa Direct Upload con Wrangler:

```bash
npm ci
npm run build
npx wrangler pages deploy dist \
  --project-name demo-paginan-studio \
  --branch main
```

Antes de publicar:

1. Verificar que no existan logs de diagnóstico ni secretos.
2. Ejecutar la migración remota si hubo cambios de base de datos.
3. Probar las rutas públicas y el login.
4. Compilar desde una copia sincronizada con `main`.
5. Revisar el enlace de despliegue antes de entregarlo al cliente.

## Personalización para un cliente

| Elemento | Ubicación habitual |
|---|---|
| Nombres, textos y contenido | `src/pages/`, `src/data/` |
| Logos, fondos e imágenes | `public/assets/` |
| Colores, tipografías y espacios | `src/styles.css`, `src/stylesEclipse.css`, `src/stylesNovaRush.css` |
| Redes sociales y enlaces | Componentes y datos de cada página |
| Reglas de puntaje | `src/utils/scoring.js` y formularios relacionados |
| Nuevos torneos o módulos | `src/pages/`, `functions/api/` y migraciones |

Los cambios de alcance deben validarse antes de cotizar: cantidad de pantallas, carga de contenido, dominio, panel de administración, nuevas reglas, integraciones y mantenimiento.

## Seguridad y operación

- El mensaje de login es deliberadamente genérico para no revelar si falló el usuario o la contraseña.
- Las acciones administrativas requieren sesión válida y protección CSRF.
- Los intentos fallidos se limitan con datos persistidos en D1.
- Los secretos se configuran en Cloudflare; no se incluyen en Git.
- Cambiar credenciales al entregar una versión final.
- Activar autenticación de dos factores en las cuentas de Cloudflare y GitHub.
- Conservar una copia del código y documentar quién administra el dominio, Cloudflare y el repositorio.

## Estado del proyecto

Versión demostrativa funcional, preparada para personalización y presentación comercial. La adecuación definitiva a producción depende del alcance, contenidos, identidad visual, dominio, analítica, políticas legales, soporte y nivel de servicio contratados.

## Licencia y activos

Antes de una entrega comercial, confirmar por escrito los derechos de uso de logos, imágenes, tipografías, nombres y demás activos provistos por el cliente. Este repositorio no concede licencias sobre marcas o material de terceros.
