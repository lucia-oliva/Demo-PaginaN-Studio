import { jsonResponse, readJson, serverError } from './http.js';

function serializeSlot(row) {
  const id = String(row.id);

  return {
    _id: id,
    id,
    name: row.name,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findSlot(database, slotId, tournamentSlug) {
  return database
    .prepare(`
      SELECT
        s.id,
        s.name,
        s.active,
        s.created_at,
        s.updated_at
      FROM slots AS s
      INNER JOIN tournaments AS t
        ON t.id = s.tournament_id
      WHERE s.id = ?
        AND t.slug = ?
    `)
    .bind(slotId, tournamentSlug)
    .first();
}

export async function listSlots(context, tournamentSlug) {
  try {
    const result = await context.env.DB
      .prepare(`
        SELECT
          s.id,
          s.name,
          s.active,
          s.created_at,
          s.updated_at
        FROM slots AS s
        INNER JOIN tournaments AS t
          ON t.id = s.tournament_id
        WHERE t.slug = ?
          AND s.active = 1
        ORDER BY s.sort_order ASC
      `)
      .bind(tournamentSlug)
      .all();

    return jsonResponse({
      ok: true,
      data: (result.results || []).map(serializeSlot),
    });
  } catch (error) {
    return serverError(error, 'Error al obtener slots');
  }
}

export async function updateSlot(context, tournamentSlug) {
  try {
    const slotId = Number(context.params.id);

    if (!Number.isInteger(slotId) || slotId <= 0) {
      return jsonResponse(
        {
          ok: false,
          message: 'slotId inválido',
        },
        400,
      );
    }

    const body = await readJson(context.request);

    if (!body) {
      return jsonResponse(
        {
          ok: false,
          message: 'El cuerpo de la petición debe ser JSON válido',
        },
        400,
      );
    }

    const name = String(body.name || '').trim();

    if (!name) {
      return jsonResponse(
        {
          ok: false,
          message: 'El nombre del slot es obligatorio',
        },
        400,
      );
    }

    if (name.length > 40) {
      return jsonResponse(
        {
          ok: false,
          message: 'El nombre del slot no puede superar los 40 caracteres',
        },
        400,
      );
    }

    const currentSlot = await findSlot(
      context.env.DB,
      slotId,
      tournamentSlug,
    );

    if (!currentSlot) {
      return jsonResponse(
        {
          ok: false,
          message: 'El slot no existe en este torneo',
        },
        404,
      );
    }

    await context.env.DB
      .prepare(`
        UPDATE slots
        SET
          name = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(name, slotId)
      .run();

    const updatedSlot = await findSlot(
      context.env.DB,
      slotId,
      tournamentSlug,
    );

    return jsonResponse({
      ok: true,
      message: 'Slot actualizado correctamente',
      data: serializeSlot(updatedSlot),
    });
  } catch (error) {
    return serverError(error, 'Error al actualizar slot');
  }
}