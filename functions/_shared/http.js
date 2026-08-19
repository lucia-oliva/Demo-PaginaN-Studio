const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=UTF-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

export async function readJson(request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null;
    }

    return body;
  } catch {
    return null;
  }
}

export function serverError(error, message = 'Error interno del servidor') {
  console.error(error);

  return jsonResponse(
    {
      ok: false,
      message,
    },
    500,
  );
}