import { updateSlot } from '../../../_shared/slots.js';
import { withAdmin } from '../../../_shared/auth/guard.js';

export const onRequestPut = withAdmin(
  (context) => updateSlot(context, 'novarush'),
);