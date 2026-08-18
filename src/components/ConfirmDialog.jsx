import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-dialog" role="presentation">
      <div className="confirm-dialog__overlay" onClick={loading ? undefined : onCancel} />

      <section
        className="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <button
          type="button"
          className="confirm-dialog__close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Cerrar"
        >
          <X size={15} />
        </button>

        <div className="confirm-dialog__icon">
          <AlertTriangle size={19} />
        </div>

        <div>
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
          <p className="confirm-dialog__description">{description}</p>
        </div>

        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Reiniciando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
