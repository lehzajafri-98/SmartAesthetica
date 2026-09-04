export default function ClinicMode({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="hidden"
        />
        <div className={`w-12 h-6 rounded-full p-0.5 ${enabled ? 'bg-[#00eaff]/60' : 'bg-gray-700/40'}`}>
          <div className={`w-5 h-5 rounded-full bg-white transform transition ${enabled ? 'translate-x-6' : ''}`}></div>
        </div>
        <span className="text-sm text-muted">{enabled ? 'Clinic Mode ON' : 'Clinic Mode'}</span>
      </label>
    </div>
  );
}
