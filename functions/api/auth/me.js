import {
  jsonResponse,
  serverError,
} from '../../_shared/http.js';

import { readAdminSession } from '../../_shared/auth/session.js';

export async function onRequestGet(context) {
  try {
    const session = await readAdminSession(context);

    if (!session) {
      return jsonResponse(
        {
          ok: false,
          user: null,
          message: 'Sesión no válida',
        },
        401,
      );
    }

    return jsonResponse({
      ok: true,
      user: {
        username: session.sub,
        role: session.role,
      },
      csrfToken: session.csrf,
    });
  } catch (error) {
    return serverError(
      error,
      'No se pudo verificar la sesión',
    );
  }
}