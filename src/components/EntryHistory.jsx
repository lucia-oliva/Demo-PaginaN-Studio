import { useEffect, useMemo, useState } from 'react';
import { Pencil, Save, Trash2, X } from 'lucide-react';
import FieldLabel from './FieldLabel';
import NumberField from './NumberField';
import SelectField from './SelectField';
import ConfirmDialog from './ConfirmDialog';
import { calculateEntryPoints, getPositionLabel } from '../utils/scoring';

export default function EntryHistory({
  slotName,
  selectedDay,
  selectedDayLabel,
  entries,
  positions,
  sanctionTypes = [],
  onEditEntry,
  onDeleteEntry,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    kills: 0,
    position: 'none',
    sanctionType: '',
    penaltyPoints: 0,
  });
  const [deleteDialogEntry, setDeleteDialogEntry] = useState(null);

  const orderedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [entries]);

  useEffect(() => {
    setEditingId(null);
  }, [slotName, selectedDay]);

  function startEdit(entry) {
    setEditingId(entry.id);
    setDraft({
      kills: Number(entry.kills || 0),
      position: entry.position || 'none',
      sanctionType: entry.sanctionType || '',
      penaltyPoints: Number(entry.penaltyPoints || 0),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({
      kills: 0,
      position: 'none',
      sanctionType: '',
      penaltyPoints: 0,
    });
  }

  function saveEdit(entryId) {
    onEditEntry(entryId, {
      kills: Number(draft.kills || 0),
      position: draft.position || 'none',
      sanctionType: null,
      penaltyPoints: Number(draft.penaltyPoints || 0),
    });

    cancelEdit();
  }

  function handleDelete(entryId) {
    const entry = orderedEntries.find((item) => item.id === entryId);
    setDeleteDialogEntry(entry || { id: entryId });
    return;

    const ok = window.confirm('¿Eliminar esta entrada?');
    if (!ok) return;

    if (editingId === entryId) {
      cancelEdit();
    }

    onDeleteEntry(entryId);
  }

  function confirmDeleteEntry() {
    if (!deleteDialogEntry?.id) return;

    const entryId = deleteDialogEntry.id;

    if (editingId === entryId) {
      cancelEdit();
    }

    onDeleteEntry(entryId);
    setDeleteDialogEntry(null);
  }

  return (
    <div className="history-card">
      <ConfirmDialog
        open={Boolean(deleteDialogEntry)}
        title="Eliminar registro"
        description="Se eliminara este registro de puntos o sancion. Los slots y el resto de cargas quedan intactos."
        confirmLabel="Eliminar"
        onConfirm={confirmDeleteEntry}
        onCancel={() => setDeleteDialogEntry(null)}
      />

      <div className="history-card__top">
        <span className="history-card__slot">{slotName || 'Sin slot'}</span>
        <span className="history-card__day">{selectedDayLabel || `Día ${selectedDay}`}</span>
      </div>

      {orderedEntries.length === 0 ? (
        <div className="history-card__empty">
          Todavía no hay cargas para este slot en este día.
        </div>
      ) : (
        <div className="history-card__list">
          {orderedEntries.map((entry) => {
            const isEditing = editingId === entry.id;

            const previewEntry = isEditing
              ? {
                  ...entry,
                  kills: Number(draft.kills || 0),
                  position: draft.position,
                  sanctionType: null,
                  penaltyPoints: Number(draft.penaltyPoints || 0),
                }
              : entry;

            const points = calculateEntryPoints(previewEntry, positions);

            return (
              <div
                key={entry.id}
                className={`history-item ${isEditing ? 'history-item--editing' : ''}`}
              >
                {isEditing ? (
                  <>
                    <div className="inline-edit-grid">
                      <div>
                        <FieldLabel>Kills</FieldLabel>
                        <NumberField
                          type="number"
                          min="0"
                          value={draft.kills}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              kills: event.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <FieldLabel>Posición</FieldLabel>
                        <SelectField
                          value={draft.position}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              position: event.target.value,
                            }))
                          }
                        >
                          {positions.map((position) => (
                            <option key={position.value} value={position.value}>
                              {position.label}
                            </option>
                          ))}
                        </SelectField>
                      </div>

                      <div>
                        <FieldLabel>Sanción</FieldLabel>
                        <SelectField
                          value={draft.sanctionType}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              sanctionType: event.target.value,
                            }))
                          }
                        >
                          <option value="">Sin sanción</option>
                          {sanctionTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </SelectField>
                      </div>

                      <div>
                        <FieldLabel>Quita manual</FieldLabel>
                        <NumberField
                          type="number"
                          min="0"
                          value={draft.penaltyPoints}
                          onChange={(event) =>
                            setDraft((prev) => ({
                              ...prev,
                              penaltyPoints: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="history-item__footer">
                      <div className="history-item__points">
                        {points >= 0 ? `+${points}` : points} pts
                      </div>

                      <div className="history-item__actions">
                        <button
                          type="button"
                          className="action-button action-button--small action-button--neutral"
                          onClick={() => saveEdit(entry.id)}
                        >
                          <Save size={14} />
                          Guardar
                        </button>

                        <button
                          type="button"
                          className="action-button action-button--small action-button--ghost"
                          onClick={cancelEdit}
                        >
                          <X size={14} />
                          Cancelar
                        </button>

                        <button
                          type="button"
                          className="action-button action-button--small action-button--danger"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="history-item__badges">
                      <span className="top-badge">Kills {entry.kills || 0}</span>

                      <span className="top-badge">
                        Pos {getPositionLabel(entry.position)}
                      </span>

                      {false && entry.sanctionType ? (
                        <span className="top-badge top-badge--danger">
                          {entry.sanctionType === 'yellow' ? 'Amarilla' : 'Roja'}
                        </span>
                      ) : null}

                      {Number(entry.penaltyPoints || 0) > 0 ? (
                        <span className="top-badge top-badge--danger">
                          -{entry.penaltyPoints} pts
                        </span>
                      ) : null}
                    </div>

                    <div className="history-item__footer">
                      <div className="history-item__points">
                        {points >= 0 ? `+${points}` : points} pts
                      </div>

                      <div className="history-item__actions">
                        <button
                          type="button"
                          className="action-button action-button--small action-button--ghost"
                          onClick={() => startEdit(entry)}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className="action-button action-button--small action-button--danger"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
