CREATE TABLE tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE
    CHECK (length(trim(slug)) BETWEEN 1 AND 40),
  name TEXT NOT NULL
    CHECK (length(trim(name)) BETWEEN 1 AND 80),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL,
  name TEXT NOT NULL
    CHECK (length(trim(name)) BETWEEN 1 AND 40),
  active INTEGER NOT NULL DEFAULT 1
    CHECK (active IN (0, 1)),
  sort_order INTEGER NOT NULL
    CHECK (sort_order > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (tournament_id)
    REFERENCES tournaments(id)
    ON DELETE CASCADE,

  UNIQUE (tournament_id, sort_order)
);

CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL,
  day INTEGER NOT NULL
    CHECK (day BETWEEN 1 AND 4),
  kills INTEGER NOT NULL DEFAULT 0
    CHECK (kills >= 0),
  position TEXT NOT NULL DEFAULT 'none'
    CHECK (position IN ('none', 'first', 'second', 'third')),
  sanction_type TEXT DEFAULT NULL
    CHECK (
      sanction_type IS NULL
      OR sanction_type IN ('yellow', 'red')
    ),
  penalty_points INTEGER NOT NULL DEFAULT 0
    CHECK (penalty_points >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (slot_id)
    REFERENCES slots(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_slots_tournament_active
  ON slots (tournament_id, active, sort_order);

CREATE INDEX idx_entries_slot_day
  ON entries (slot_id, day);

CREATE INDEX idx_entries_created_at
  ON entries (created_at DESC);

INSERT INTO tournaments (slug, name)
VALUES
  ('one-v-one', '1v1 Cup'),
  ('novarush', 'Nova Rush'),
  ('novaeclipse', 'Nova Eclipse');

WITH RECURSIVE slot_numbers(number) AS (
  SELECT 1
  UNION ALL
  SELECT number + 1
  FROM slot_numbers
  WHERE number < 17
)
INSERT INTO slots (tournament_id, name, sort_order)
SELECT
  tournaments.id,
  'Slot ' || slot_numbers.number,
  slot_numbers.number
FROM tournaments
CROSS JOIN slot_numbers;
