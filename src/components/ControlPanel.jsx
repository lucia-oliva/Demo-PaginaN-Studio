import { useEffect, useMemo, useState } from 'react';
import { Crosshair, Minus, RotateCcw, Save, ShieldAlert } from 'lucide-react';
import FieldLabel from './FieldLabel';
import NumberField from './NumberField';
import SectionCard from './SectionCard';
import SelectField from './SelectField';
import EntryHistory from './EntryHistory';
import ConfirmDialog from './ConfirmDialog';

export default function ControlPanel({
  slots,
  days,
  positions,
  selectedSlot,
  setSelectedSlot,
  selectedDay,
  selectedDayLabel,
  setSelectedDay,
  killsInput,
  setKillsInput,
  positionInput,
  setPositionInput,
  manualPenaltyInput,
  setManualPenaltyInput,
  currentSlotName,
  slotEntriesForSelectedDay,
  handleAddScore,
  handleAddSanction,
  updateEntry,
  deleteEntry,
  updateSlotName,
  resetEntries,
  resetDialogTitle = 'Reiniciar tabla',
  resetDialogDescription = 'Se eliminaran todos los registros cargados. Los slots quedan intactos.',
  loading,
}) {
  const [slotNameInput, setSlotNameInput] = useState('');
  const [savingSlotName, setSavingSlotName] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resettingEntries, setResettingEntries] = useState(false);

  const selectedSlotData = useMemo(
    () => slots.find((slot) => slot._id === selectedSlot),
    [slots, selectedSlot]
  );

  const trimmedSlotName = slotNameInput.trim();
  const slotNameChanged = trimmedSlotName && trimmedSlotName !== (selectedSlotData?.name ?? '');
  const slotNameSavingDisabled =
    loading || savingSlotName || !selectedSlot || !updateSlotName || !slotNameChanged;

  useEffect(() => {
    setSlotNameInput(selectedSlotData?.name ?? '');
  }, [selectedSlotData]);

  async function handleSlotNameSubmit(event) {
    event.preventDefault();

    if (slotNameSavingDisabled) return;

    setSavingSlotName(true);

    try {
      await updateSlotName(selectedSlot, trimmedSlotName);
    } finally {
      setSavingSlotName(false);
    }
  }

  async function handleResetConfirm() {
    if (!resetEntries || resettingEntries) return;

    setResettingEntries(true);

    try {
      await resetEntries();
      setResetDialogOpen(false);
    } finally {
      setResettingEntries(false);
    }
  }

  return (
    <section className="panel-card">
      <ConfirmDialog
        open={resetDialogOpen}
        title={resetDialogTitle}
        description={resetDialogDescription}
        confirmLabel="Reiniciar Tabla"
        loading={resettingEntries}
        onConfirm={handleResetConfirm}
        onCancel={() => setResetDialogOpen(false)}
      />

      <div className="panel-controls">
        {resetEntries ? (
          <button
            type="button"
            onClick={() => setResetDialogOpen(true)}
            className="action-button action-button--danger reset-table-button"
            disabled={loading || resettingEntries}
          >
            <RotateCcw size={16} />
            Reiniciar Tabla
          </button>
        ) : null}

        <div>
          <FieldLabel>Slot</FieldLabel>
          <SelectField
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            disabled={loading || slots.length === 0}
          >
            {slots.length === 0 ? (
              <option value="">Sin slots</option>
            ) : (
              slots.map((slot) => (
                <option key={slot._id} value={slot._id}>
                  {slot.name}
                </option>
              ))
            )}
          </SelectField>

          <form className="slot-name-editor" onSubmit={handleSlotNameSubmit}>
            <FieldLabel>Nombre del slot</FieldLabel>
            <div className="slot-name-editor__row">
              <input
                className="number-field"
                type="text"
                maxLength={40}
                value={slotNameInput}
                onChange={(event) => setSlotNameInput(event.target.value)}
                disabled={loading || savingSlotName || !selectedSlot}
                placeholder="Nombre del slot"
              />

              <button
                type="submit"
                className="slot-name-editor__button"
                disabled={slotNameSavingDisabled}
                aria-label="Guardar nombre del slot"
                title="Guardar nombre"
              >
                <Save size={16} />
              </button>
            </div>
          </form>
        </div>

        <div>
          <FieldLabel>Día</FieldLabel>
          <div className="day-grid">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => setSelectedDay(day.value)}
                className={`day-chip ${selectedDay === day.value ? 'day-chip--active' : ''}`}
                disabled={loading}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <SectionCard icon={Crosshair} title="Carga de puntos" subtitle="Sumar">
          <div className="form-grid">
            <div>
              <FieldLabel>Kills</FieldLabel>
              <NumberField
                type="number"
                min="0"
                value={killsInput}
                onChange={(event) => setKillsInput(event.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <FieldLabel>Posición</FieldLabel>
              <SelectField
                value={positionInput}
                onChange={(event) => setPositionInput(event.target.value)}
                disabled={loading}
              >
                {positions.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddScore}
            className="action-button action-button--neutral"
            disabled={loading || !selectedSlot}
          >
            Cargar puntos
          </button>
        </SectionCard>

        <SectionCard icon={ShieldAlert} title="Registro de sanciones" subtitle="Quitar" accent>
          <div className="form-grid">
            <div>
              <FieldLabel>Quita manual</FieldLabel>
              <NumberField
                type="number"
                min="0"
                value={manualPenaltyInput}
                onChange={(event) => setManualPenaltyInput(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddSanction}
            className="action-button action-button--danger"
            disabled={loading || !selectedSlot}
          >
            <Minus size={16} />
            Registrar sanción
          </button>
        </SectionCard>
      </div>

      <EntryHistory
        slotName={currentSlotName}
        selectedDay={selectedDay}
        selectedDayLabel={selectedDayLabel}
        entries={slotEntriesForSelectedDay}
        positions={positions}
        onEditEntry={updateEntry}
        onDeleteEntry={deleteEntry}
      />
    </section>
  );
}
