import {
  jsonResponse,
  serverError,
} from '../http.js';

import { secureEqualStrings } from './crypto.js';
import { readAdminSession } from './session.js';

export async function requireAdmin(context) {
  try {
    const session = await readAdminSession(context);

    if (!session) {
      return {
        response: jsonResponse(
          {
            ok: false,
            message: 'Autenticación requerida',
          },
          401,
        ),
      };
    }

    if (session.role !== 'admin') {
      return {
        response: jsonResponse(
          {
            ok: false,
            message: 'Permisos insuficientes',
          },
          403,
        ),
      };
    }

    const csrfToken =
      context.request.headers.get('X-CSRF-Token');

    if (
      !csrfToken
      || !(await secureEqualStrings(
        csrfToken,
        session.csrf,
      ))
    ) {
      return {
        response: jsonResponse(
          {
            ok: false,
            message: 'Validación CSRF incorrecta',
          },
          403,
        ),
      };
    }

    return {
      response: null,
      session,
    };
  } catch (error) {
    return {
      response: serverError(
        error,
        'Autenticación no disponible',
      ),
    };
  }
}

export function withAdmin(handler) {
  return async function protectedHandler(context) {
    const authorization = await requireAdmin(context);

    if (authorization.response) {
      return authorization.response;
    }

    return handler(context, authorization.session);
  };
}