import { listSlots } from '../../../_shared/slots.js';

export function onRequestGet(context) {
  return listSlots(context, 'novarush');
}