import {
  deleteEntry,
  getEntry,
  updateEntry,
} from '../../_shared/entries.js';

import { withAdmin } from '../../_shared/auth/guard.js';

export function onRequestGet(context) {
  return getEntry(context, 'one-v-one');
}

export const onRequestPut = withAdmin(
  (context) => updateEntry(context, 'one-v-one'),
);

export const onRequestDelete = withAdmin(
  (context) => deleteEntry(context, 'one-v-one'),
);