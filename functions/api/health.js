import { jsonResponse, serverError } from '../_shared/http.js';

export async function onRequestGet(context) {
  try {
    const database = await context.env.DB
      .prepare('SELECT 1 AS connected')
      .first();

    return jsonResponse({
      ok: true,
      message: 'Backend Cloudflare funcionando',
      database: database?.connected === 1 ? 'connected' : 'unknown',
    });
  } catch (error) {
    return serverError(error, 'No se pudo conectar con D1');
  }
}