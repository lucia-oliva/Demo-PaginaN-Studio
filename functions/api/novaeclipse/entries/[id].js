import {
  deleteEntry,
  getEntry,
  updateEntry,
} from '../../../_shared/entries.js';

import { withAdmin } from '../../../_shared/auth/guard.js';

export function onRequestGet(context) {
  return getEntry(context, 'novaeclipse');
}

export const onRequestPut = withAdmin(
  (context) => updateEntry(context, 'novaeclipse'),
);

export const onRequestDelete = withAdmin(
  (context) => deleteEntry(context, 'novaeclipse'),
);