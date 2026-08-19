import {
  createEntry,
  deleteAllEntries,
  listEntries,
} from '../../../_shared/entries.js';

import { withAdmin } from '../../../_shared/auth/guard.js';

export function onRequestGet(context) {
  return listEntries(context, 'novarush');
}

export const onRequestPost = withAdmin(
  (context) => createEntry(context, 'novarush'),
);

export const onRequestDelete = withAdmin(
  (context) => deleteAllEntries(context, 'novarush'),
);