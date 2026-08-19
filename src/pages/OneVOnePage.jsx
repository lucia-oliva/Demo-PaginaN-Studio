import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ControlPanel from '../components/ControlPanel';
import RankingTable from '../components/RankingTable';
import AlertToast from '../components/AlertToast';
import TournamentFooter from '../components/TournamentFooter';
import { DAYS, POSITIONS, SANCTION_TYPES } from '../data/mockData';
import {
  calculateEntryPoints,
  getPositionPoints,
  getKillsPoints,
} from '../utils/scoring';
import {
  getEntries,
  getSlots,
  updateSlotById,
  createEntry,
  updateEntryById,
  deleteEntryById,
  deleteAllEntries,
} from '../services/api';
import { useAuth } from '../auth/AuthContext';

function normalizeEntry(entry) {
  const populatedSlot = entry?.slotId && typeof entry.slotId === 'object' ? entry.slotId : null;

  return {
    ...entry,
    id: entry._id ?? entry.id,
    slotId: populatedSlot?._id ?? entry.slotId,
    slot: populatedSlot,
  };
}

function getDayLabel(dayValue) {
  return DAYS.find((day) => day.value === Number(dayValue))?.label ?? `Dia ${dayValue}`;
}

export default function OneVOnePage() {
  const [slots, setSlots] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDay, setSelectedDay] = useState(DAYS[0]?.value ?? 1);
  const [killsInput, setKillsInput] = useState(0);
  const [positionInput, setPositionInput] = useState('none');
  const [rankingFilter, setRankingFilter] = useState('all');
  const [sanctionTypeInput, setSanctionTypeInput] = useState('yellow');
  const [manualPenaltyInput, setManualPenaltyInput] = useState(2);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 2400);
    return () => clearTimeout(timer);
  }, [alert]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);

        const [slotsData, entriesData] = await Promise.all([getSlots(), getEntries()]);
        const normalizedEntries = entriesData.map(normalizeEntry);

        setSlots(slotsData);
        setEntries(normalizedEntries);
        setSelectedSlot((prev) => prev || slotsData[0]?._id || '');
      } catch (error) {
        setAlert({
          type: 'penalty',
          title: 'Error al cargar datos',
          description: error.message || 'No se pudo conectar con el backend',
        });
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const filteredEntries = useMemo(() => {
    if (rankingFilter === 'all') return entries;
    return entries.filter((entry) => entry.day === Number(rankingFilter));
  }, [entries, rankingFilter]);

  const ranking = useMemo(() => {
    return slots
      .map((slot) => {
        const slotEntries = filteredEntries.filter((entry) => entry.slotId === slot._id);

        const killsPointsTotal = slotEntries.reduce(
          (acc, entry) => acc + getKillsPoints(entry.kills),
          0
        );

        const killsTotal = slotEntries.reduce(
          (acc, entry) => acc + Number(entry.kills || 0),
          0
        );

        const positionPointsTotal = slotEntries.reduce(
          (acc, entry) => acc + getPositionPoints(entry.position, POSITIONS),
          0
        );

        const totalPoints = slotEntries.reduce(
          (acc, entry) => acc + calculateEntryPoints(entry, POSITIONS),
          0
        );

        return {
          id: slot._id,
          name: slot.name,
          killsTotal,
          killsPointsTotal,
          positionPointsTotal,
          totalPoints,
        };
      })
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.killsPointsTotal !== a.killsPointsTotal) return b.killsPointsTotal - a.killsPointsTotal;
        if (b.positionPointsTotal !== a.positionPointsTotal) return b.positionPointsTotal - a.positionPointsTotal;
        return a.name.localeCompare(b.name);
      })
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }, [slots, filteredEntries]);

  const currentSlotName = useMemo(() => {
    return slots.find((slot) => slot._id === selectedSlot)?.name ?? '';
  }, [slots, selectedSlot]);

  const selectedDayLabel = useMemo(() => {
    return getDayLabel(selectedDay);
  }, [selectedDay]);

  const slotEntriesForSelectedDay = useMemo(() => {
    return entries.filter(
      (entry) => entry.slotId === selectedSlot && entry.day === Number(selectedDay)
    );
  }, [entries, selectedSlot, selectedDay]);

  function addLocalEntry(savedEntry) {
    const normalized = normalizeEntry(savedEntry);
    setEntries((prev) => [normalized, ...prev]);
  }

  function replaceLocalEntry(savedEntry) {
    const normalized = normalizeEntry(savedEntry);
    setEntries((prev) =>
      prev.map((entry) => (entry.id === normalized.id ? normalized : entry))
    );
  }

  async function handleAddScore() {
    if (!selectedSlot) return;

    try {
      const kills = Number(killsInput) || 0;
      const bonus = getPositionPoints(positionInput, POSITIONS);

      const saved = await createEntry({
        slotId: selectedSlot,
        day: Number(selectedDay),
        kills,
        position: positionInput,
        sanctionType: null,
        penaltyPoints: 0,
      });

      addLocalEntry(saved);

      setAlert({
        type: 'score',
        title: 'Puntos guardados',
        description: `${currentSlotName} · ${selectedDayLabel} · +${kills * 2 + bonus} pts`,
      });

      setKillsInput(0);
      setPositionInput('none');
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo guardar',
        description: error.message || 'Error al guardar puntos',
      });
    }
  }

  async function handleAddSanction() {
    if (!selectedSlot) return;

    try {
      const penalty = Number(manualPenaltyInput) || 0;

      const saved = await createEntry({
        slotId: selectedSlot,
        day: Number(selectedDay),
        kills: 0,
        position: 'none',
        sanctionType: null,
        penaltyPoints: penalty,
      });

      addLocalEntry(saved);

      setAlert({
        type: 'penalty',
        title: 'Sancion guardada',
        description: `${currentSlotName} · ${selectedDayLabel} · -${penalty} pts`,
      });

      setManualPenaltyInput(2);
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo guardar',
        description: error.message || 'Error al guardar sancion',
      });
    }
  }

  async function updateEntry(entryId, updates) {
    const currentEntry = entries.find((entry) => entry.id === entryId);

    if (!currentEntry) {
      setAlert({
        type: 'penalty',
        title: 'No se encontro el registro',
        description: 'El registro a editar no existe en memoria',
      });
      return;
    }

    const entrySlotName =
      slots.find((slot) => slot._id === currentEntry.slotId)?.name ?? currentSlotName;

    try {
      const saved = await updateEntryById(entryId, {
        kills: Number(updates.kills ?? currentEntry.kills ?? 0),
        position: updates.position ?? currentEntry.position ?? 'none',
        sanctionType: updates.sanctionType || null,
        penaltyPoints: Number(updates.penaltyPoints ?? currentEntry.penaltyPoints ?? 0),
      });

      replaceLocalEntry(saved);

      setAlert({
        type: 'score',
        title: 'Registro actualizado',
        description: `${entrySlotName} · ${getDayLabel(currentEntry.day)} · cambios guardados`,
      });
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo editar',
        description: error.message || 'Error al actualizar el registro',
      });
    }
  }

  async function updateSlotName(slotId, name) {
    const currentSlot = slots.find((slot) => slot._id === slotId);

    if (!currentSlot) {
      setAlert({
        type: 'penalty',
        title: 'No se encontro el slot',
        description: 'El slot a editar no existe en memoria',
      });
      return;
    }

    try {
      const updatedSlot = await updateSlotById(slotId, { name });

      setSlots((prev) =>
        prev.map((slot) => (slot._id === updatedSlot._id ? updatedSlot : slot))
      );

      setAlert({
        type: 'score',
        title: 'Slot actualizado',
        description: `${currentSlot.name} ahora se llama ${updatedSlot.name}`,
      });
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo editar el slot',
        description: error.message || 'Error al actualizar el nombre del slot',
      });
    }
  }

  async function handleDeleteEntry(entryId) {
    const currentEntry = entries.find((entry) => entry.id === entryId);

    if (!currentEntry) {
      setAlert({
        type: 'penalty',
        title: 'No se encontro el registro',
        description: 'El registro a eliminar no existe en memoria',
      });
      return;
    }

    const entrySlotName =
      slots.find((slot) => slot._id === currentEntry.slotId)?.name ?? currentSlotName;

    try {
      await deleteEntryById(entryId);

      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));

      setAlert({
        type: 'score',
        title: 'Registro eliminado',
        description: `${entrySlotName} · ${getDayLabel(currentEntry.day)} · eliminado correctamente`,
      });
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo eliminar',
        description: error.message || 'Error al eliminar el registro',
      });
    }
  }

  async function handleResetEntries() {
    try {
      const result = await deleteAllEntries();

      setEntries([]);
      setAlert({
        type: 'penalty',
        title: 'Tabla reiniciada',
        description: `Se eliminaron ${result?.deletedCount ?? 0} registros. Los slots no fueron modificados.`,
      });
    } catch (error) {
      setAlert({
        type: 'penalty',
        title: 'No se pudo reiniciar',
        description: error.message || 'Error al reiniciar la tabla',
      });
    }
  }

  return (
    <div className="app-shell one-v-one-theme">
      <AlertToast alert={alert} />
      <div className="app-shell__glow" />

      <main className="app-container">
        <Header />

        <section 
          className={
              isAuthenticated
                ? 'main-grid'
                : 'main-grid main-grid--public'
          }
          >
            {isAuthenticated ? (
          <ControlPanel
            slots={slots}
            days={DAYS}
            positions={POSITIONS}
            sanctionTypes={SANCTION_TYPES}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            selectedDay={selectedDay}
            selectedDayLabel={selectedDayLabel}
            setSelectedDay={setSelectedDay}
            killsInput={killsInput}
            setKillsInput={setKillsInput}
            positionInput={positionInput}
            setPositionInput={setPositionInput}
            sanctionTypeInput={sanctionTypeInput}
            setSanctionTypeInput={setSanctionTypeInput}
            manualPenaltyInput={manualPenaltyInput}
            setManualPenaltyInput={setManualPenaltyInput}
            currentSlotName={currentSlotName}
            slotEntriesForSelectedDay={slotEntriesForSelectedDay}
            handleAddScore={handleAddScore}
            handleAddSanction={handleAddSanction}
            updateEntry={updateEntry}
            deleteEntry={handleDeleteEntry}
            updateSlotName={updateSlotName}
            resetEntries={handleResetEntries}
            resetDialogTitle="Reiniciar tabla 1v1"
            resetDialogDescription="Se eliminaran todos los puntos y sanciones cargados en 1v1. Los slots quedan intactos."
            loading={loading}
          /> ) : null}

          <RankingTable
            ranking={ranking}
            rankingFilter={rankingFilter}
            setRankingFilter={setRankingFilter}
            days={DAYS}
            showKillsCount
          />
        </section>
      </main>
      <TournamentFooter />
    </div>
  );
}
