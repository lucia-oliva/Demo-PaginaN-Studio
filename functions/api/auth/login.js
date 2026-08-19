import {
  jsonResponse,
  readJson,
  serverError,
} from '../../_shared/http.js';

import { getAuthConfig } from '../../_shared/auth/config.js';
import { secureEqualStrings } from '../../_shared/auth/crypto.js';
import { verifyPassword } from '../../_shared/auth/password.js';
import { createAdminSession } from '../../_shared/auth/session.js';

import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from '../../_shared/auth/rate-limit.js'; 



function rateLimitResponse(retryAfterSeconds) {
  const response = jsonResponse(
    {
      ok: false,
      message: 'Demasiados intentos. Intentá nuevamente más tarde',
    },
    429,
  );

  response.headers.set(
    'Retry-After',
    String(retryAfterSeconds),
  );

  return response;
}

export async function onRequestPost(context) {
  try {
    const contentLength = Number(
      context.request.headers.get('Content-Length') || 0,
    );

    if (contentLength > 4096) {
      return jsonResponse(
        {
          ok: false,
          message: 'Petición demasiado grande',
        },
        413,
      );
    }

    const rateLimit = await checkLoginRateLimit(context);

    if (!rateLimit.allowed) {
      return rateLimitResponse(
        rateLimit.retryAfterSeconds,
      );
    }

    const body = await readJson(context.request);

    const username = String(body?.username || '');
    const password = String(body?.password || '');

    const config = getAuthConfig(context);

    const acceptableInput =
      username.length > 0
      && username.length <= 100
      && password.length > 0
      && password.length <= 256;

    const [validUsername, validPassword] =
      acceptableInput
        ? await Promise.all([
            secureEqualStrings(
              username,
              config.username,
            ),
            verifyPassword(
              password,
              config.passwordHash,
            ),
          ])
        : [false, false];

    if (!validUsername || !validPassword) {
      const failure = await recordLoginFailure(
        context.env.DB,
        rateLimit.identifierHash,
      );

      if (failure.blocked) {
        return rateLimitResponse(
          failure.retryAfterSeconds,
        );
      }

      return jsonResponse(
        {
          ok: false,
          message: 'Usuario o contraseña incorrectos',
        },
        401,
      );
    }

    await clearLoginFailures(
      context.env.DB,
      rateLimit.identifierHash,
    );

    const session = await createAdminSession(context);

    const response = jsonResponse({
      ok: true,
      message: 'Login correcto',
      user: session.user,
      csrfToken: session.csrfToken,
    });

    response.headers.set(
      'Set-Cookie',
      session.cookie,
    );

    return response;
  } catch (error) {
    return serverError(
      error,
      'No se pudo iniciar sesión',
    );
  }
}