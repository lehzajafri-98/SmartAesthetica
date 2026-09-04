export default function ConsentModal({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      <div className="relative z-70 max-w-lg w-full glass-card p-6">
        <h3 className="text-xl font-semibold">Data & Privacy Consent</h3>
        <p className="text-muted mt-3">
          By continuing you consent to secure, encrypted storage of your image for
          the purpose of generating an AI-based aesthetic simulation. Images will not be shared without explicit permission.
        </p>

        <ul className="text-sm mt-4 list-disc pl-5 text-muted">
          <li>Temporary storage for model inference and demo only</li>
          <li>Option to delete images anytime</li>
          <li>Clinic Mode shares images only with authorised clinicians</li>
        </ul>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={() => { onConfirm(); }} className="btn-primary">I Consent</button>
        </div>
      </div>
    </div>
  );
}
