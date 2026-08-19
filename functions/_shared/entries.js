import { jsonResponse, readJson, serverError } from './http.js';

const VALID_POSITIONS = new Set([
  'none',
  'first',
  'second',
  'third',
]);

const VALID_SANCTIONS = new Set([
  'yellow',
  'red',
]);

const ENTRY_SELECT = `
  SELECT
    e.id,
    e.slot_id,
    e.day,
    e.kills,
    e.position,
    e.sanction_type,
    e.penalty_points,
    e.created_at,
    e.updated_at,
    s.name AS slot_name,
    s.active AS slot_active
  FROM entries AS e
  INNER JOIN slots AS s
    ON s.id = e.slot_id
  INNER JOIN tournaments AS t
    ON t.id = s.tournament_id
`;

function parsePositiveInteger(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
}

function parseDay(value) {
  const day = Number(value);

  if (!Number.isInteger(day) || day < 1 || day > 4) {
    return null;
  }

  return day;
}

function parseNonNegativeInteger(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
}

function serializeEntry(row) {
  const entryId = String(row.id);
  const slotId = String(row.slot_id);

  return {
    _id: entryId,
    id: entryId,
    slotId: {
      _id: slotId,
      id: slotId,
      name: row.slot_name,
      active: Boolean(row.slot_active),
    },
    day: row.day,
    kills: row.kills,
    position: row.position,
    sanctionType: row.sanction_type,
    penaltyPoints: row.penalty_points,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateScore(body, current = {}) {
  const kills = parseNonNegativeInteger(
    body.kills ?? current.kills ?? 0,
  );

  if (kills === null) {
    return {
      error: 'kills debe ser un número entero igual o mayor que cero',
    };
  }

  const penaltyPoints = parseNonNegativeInteger(
    body.penaltyPoints ?? current.penaltyPoints ?? 0,
  );

  if (penaltyPoints === null) {
    return {
      error: 'penaltyPoints debe ser un número entero igual o mayor que cero',
    };
  }

  const position = String(
    body.position ?? current.position ?? 'none',
  );

  if (!VALID_POSITIONS.has(position)) {
    return {
      error: 'La posición recibida no es válida',
    };
  }

  const rawSanction =
    body.sanctionType !== undefined
      ? body.sanctionType
      : current.sanctionType ?? null;

  const sanctionType =
    rawSanction === '' || rawSanction === null
      ? null
      : String(rawSanction);

  if (
    sanctionType !== null
    && !VALID_SANCTIONS.has(sanctionType)
  ) {
    return {
      error: 'El tipo de sanción recibido no es válido',
    };
  }

  return {
    values: {
      kills,
      position,
      sanctionType,
      penaltyPoints,
    },
  };
}

async function findSlot(database, slotId, tournamentSlug) {
  return database
    .prepare(`
      SELECT s.id
      FROM slots AS s
      INNER JOIN tournaments AS t
        ON t.id = s.tournament_id
      WHERE s.id = ?
        AND t.slug = ?
    `)
    .bind(slotId, tournamentSlug)
    .first();
}

async function findEntry(database, entryId, tournamentSlug) {
  return database
    .prepare(`
      ${ENTRY_SELECT}
      WHERE e.id = ?
        AND t.slug = ?
    `)
    .bind(entryId, tournamentSlug)
    .first();
}

export async function listEntries(context, tournamentSlug) {
  try {
    const url = new URL(context.request.url);
    const rawDay = url.searchParams.get('day');
    const rawSlotId = url.searchParams.get('slotId');

    const conditions = ['t.slug = ?'];
    const bindings = [tournamentSlug];

    if (rawDay !== null) {
      const day = parseDay(rawDay);

      if (day === null) {
        return jsonResponse(
          {
            ok: false,
            message: 'day debe ser un número entre 1 y 4',
          },
          400,
        );
      }

      conditions.push('e.day = ?');
      bindings.push(day);
    }

    if (rawSlotId !== null) {
      const slotId = parsePositiveInteger(rawSlotId);

      if (slotId === null) {
        return jsonResponse(
          {
            ok: false,
            message: 'slotId inválido',
          },
          400,
        );
      }

      conditions.push('e.slot_id = ?');
      bindings.push(slotId);
    }

    const result = await context.env.DB
      .prepare(`
        ${ENTRY_SELECT}
        WHERE ${conditions.join(' AND ')}
        ORDER BY
          e.day ASC,
          e.created_at DESC,
          e.id DESC
      `)
      .bind(...bindings)
      .all();

    return jsonResponse({
      ok: true,
      data: (result.results || []).map(serializeEntry),
    });
  } catch (error) {
    return serverError(error, 'Error al obtener registros');
  }
}

export async function getEntry(context, tournamentSlug) {
  try {
    const entryId = parsePositiveInteger(context.params.id);

    if (entryId === null) {
      return jsonResponse(
        {
          ok: false,
          message: 'id inválido',
        },
        400,
      );
    }

    const entry = await findEntry(
      context.env.DB,
      entryId,
      tournamentSlug,
    );

    if (!entry) {
      return jsonResponse(
        {
          ok: false,
          message: 'No existe el registro',
        },
        404,
      );
    }

    return jsonResponse({
      ok: true,
      data: serializeEntry(entry),
    });
  } catch (error) {
    return serverError(error, 'Error al obtener el registro');
  }
}

export async function createEntry(context, tournamentSlug) {
  try {
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

    const slotId = parsePositiveInteger(body.slotId);
    const day = parseDay(body.day);

    if (slotId === null) {
      return jsonResponse(
        {
          ok: false,
          message: 'slotId inválido',
        },
        400,
      );
    }

    if (day === null) {
      return jsonResponse(
        {
          ok: false,
          message: 'day debe ser un número entre 1 y 4',
        },
        400,
      );
    }

    const validation = validateScore(body);

    if (validation.error) {
      return jsonResponse(
        {
          ok: false,
          message: validation.error,
        },
        400,
      );
    }

    const slot = await findSlot(
      context.env.DB,
      slotId,
      tournamentSlug,
    );

    if (!slot) {
      return jsonResponse(
        {
          ok: false,
          message: 'El slot no existe en este torneo',
        },
        404,
      );
    }

    const {
      kills,
      position,
      sanctionType,
      penaltyPoints,
    } = validation.values;

    const insertResult = await context.env.DB
      .prepare(`
        INSERT INTO entries (
          slot_id,
          day,
          kills,
          position,
          sanction_type,
          penalty_points
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        slotId,
        day,
        kills,
        position,
        sanctionType,
        penaltyPoints,
      )
      .run();

    const createdEntry = await findEntry(
      context.env.DB,
      insertResult.meta.last_row_id,
      tournamentSlug,
    );

    return jsonResponse(
      {
        ok: true,
        message: 'Registro creado correctamente',
        data: serializeEntry(createdEntry),
      },
      201,
    );
  } catch (error) {
    return serverError(error, 'Error al crear el registro');
  }
}

export async function updateEntry(context, tournamentSlug) {
  try {
    const entryId = parsePositiveInteger(context.params.id);

    if (entryId === null) {
      return jsonResponse(
        {
          ok: false,
          message: 'id inválido',
        },
        400,
      );
    }

    const currentEntry = await findEntry(
      context.env.DB,
      entryId,
      tournamentSlug,
    );

    if (!currentEntry) {
      return jsonResponse(
        {
          ok: false,
          message: 'No existe el registro para actualizar',
        },
        404,
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

    const validation = validateScore(body, {
      kills: currentEntry.kills,
      position: currentEntry.position,
      sanctionType: currentEntry.sanction_type,
      penaltyPoints: currentEntry.penalty_points,
    });

    if (validation.error) {
      return jsonResponse(
        {
          ok: false,
          message: validation.error,
        },
        400,
      );
    }

    const {
      kills,
      position,
      sanctionType,
      penaltyPoints,
    } = validation.values;

    await context.env.DB
      .prepare(`
        UPDATE entries
        SET
          kills = ?,
          position = ?,
          sanction_type = ?,
          penalty_points = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        kills,
        position,
        sanctionType,
        penaltyPoints,
        entryId,
      )
      .run();

    const updatedEntry = await findEntry(
      context.env.DB,
      entryId,
      tournamentSlug,
    );

    return jsonResponse({
      ok: true,
      message: 'Registro actualizado correctamente',
      data: serializeEntry(updatedEntry),
    });
  } catch (error) {
    return serverError(error, 'Error al actualizar el registro');
  }
}

export async function deleteEntry(context, tournamentSlug) {
  try {
    const entryId = parsePositiveInteger(context.params.id);

    if (entryId === null) {
      return jsonResponse(
        {
          ok: false,
          message: 'id inválido',
        },
        400,
      );
    }

    const currentEntry = await findEntry(
      context.env.DB,
      entryId,
      tournamentSlug,
    );

    if (!currentEntry) {
      return jsonResponse(
        {
          ok: false,
          message: 'No existe el registro para eliminar',
        },
        404,
      );
    }

    await context.env.DB
      .prepare('DELETE FROM entries WHERE id = ?')
      .bind(entryId)
      .run();

    return jsonResponse({
      ok: true,
      message: 'Registro eliminado correctamente',
      data: serializeEntry(currentEntry),
    });
  } catch (error) {
    return serverError(error, 'Error al eliminar el registro');
  }
}

export async function deleteAllEntries(context, tournamentSlug) {
  try {
    const result = await context.env.DB
      .prepare(`
        DELETE FROM entries
        WHERE slot_id IN (
          SELECT s.id
          FROM slots AS s
          INNER JOIN tournaments AS t
            ON t.id = s.tournament_id
          WHERE t.slug = ?
        )
      `)
      .bind(tournamentSlug)
      .run();

    return jsonResponse({
      ok: true,
      message: 'Tabla reiniciada correctamente',
      data: {
        deletedCount: result.meta.changes || 0,
      },
    });
  } catch (error) {
    return serverError(error, 'Error al reiniciar la tabla');
  }
}