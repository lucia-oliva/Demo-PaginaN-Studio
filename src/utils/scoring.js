export function getPositionPoints(position, positions) {
  const found = positions.find((item) => item.value === position);
  return found?.points ?? 0;
}

export function getKillsPoints(kills) {
  return Number(kills || 0) * 2;
}

export function calculateEntryPoints(entry, positions) {
  const killsPoints = getKillsPoints(entry.kills);
  const positionPoints = getPositionPoints(entry.position, positions);
  const penalty = Number(entry.penaltyPoints || 0);

  return killsPoints + positionPoints - penalty;
}

export function getPositionLabel(position) {
  if (position === 'first') return '1°';
  if (position === 'second') return '2°';
  if (position === 'third') return '3°';
  return '-';
}