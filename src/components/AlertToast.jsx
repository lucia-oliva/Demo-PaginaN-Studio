import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AlertToast({ alert }) {
  if (!alert) return null;

  const isPenalty = alert.type === 'penalty';

  return (
    <div className="toast-stack">
      <div className={`toast ${isPenalty ? 'toast--penalty' : ''}`}>
        <div className={`toast__icon ${isPenalty ? 'toast__icon--penalty' : ''}`}>
          {isPenalty ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <div>
          <div className="toast__title">{alert.title}</div>
          <div className="toast__description">{alert.description}</div>
        </div>
      </div>
    </div>
  );
}
