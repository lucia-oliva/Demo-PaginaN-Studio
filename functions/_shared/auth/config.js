export const SESSION_COOKIE_NAME = 'nova_admin_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function getAuthConfig(context) {
  const username = String(
    context.env.ADMIN_USERNAME || '',
  ).trim();

  const passwordHash = String(
    context.env.ADMIN_PASSWORD_HASH || '',
  ).trim();

  const authSecret = String(
    context.env.AUTH_SECRET || '',
  ).trim();

  if (!username || !passwordHash || !authSecret) {
    throw new Error('Configuración de autenticación incompleta');
  }

  if (username.length > 64) {
    throw new Error('ADMIN_USERNAME posee una longitud inválida');
  }

  if (!passwordHash.startsWith('pbkdf2$')) {
    throw new Error('ADMIN_PASSWORD_HASH posee un formato inválido');
  }

  if (authSecret.length < 32) {
    throw new Error('AUTH_SECRET no cumple la longitud mínima');
  }

  return {
    username,
    passwordHash,
    authSecret,
  };
}