import {
  deleteEntry,
  getEntry,
  updateEntry,
} from '../../../_shared/entries.js';

import { withAdmin } from '../../../_shared/auth/guard.js';

export function onRequestGet(context) {
  return getEntry(context, 'novarush');
}

export const onRequestPut = withAdmin(
  (context) => updateEntry(context, 'novarush'),
);

export const onRequestDelete = withAdmin(
  (context) => deleteEntry(context, 'novarush'),
);