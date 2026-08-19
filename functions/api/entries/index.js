import {
  createEntry,
  deleteAllEntries,
  listEntries,
} from '../../_shared/entries.js';

import { withAdmin } from '../../_shared/auth/guard.js';

export function onRequestGet(context) {
  return listEntries(context, 'one-v-one');
}

export const onRequestPost = withAdmin(
  (context) => createEntry(context, 'one-v-one'),
);

export const onRequestDelete = withAdmin(
  (context) => deleteAllEntries(context, 'one-v-one'),
);