import { jsonResponse } from '../../_shared/http.js';
import { requireAdmin } from '../../_shared/auth/guard.js';

import {
  createExpiredSessionCookie,
} from '../../_shared/auth/session.js';

export async function onRequestPost(context) {
  const authorization = await requireAdmin(context);

  if (authorization.response) {
    return authorization.response;
  }

  const response = jsonResponse({
    ok: true,
    message: 'Sesión cerrada',
  });

  response.headers.set(
    'Set-Cookie',
    createExpiredSessionCookie(context.request),
  );

  return response;
}