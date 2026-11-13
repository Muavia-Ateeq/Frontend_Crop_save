export default function Input({
  label, icon: Icon, right, error, className = '', ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-ink mb-1.5">
          {label}
        </label>
      )}
      <div
        className={`flex items-center bg-white border rounded-xl px-3 gap-2 transition-colors focus-within:border-primary ${
          error ? 'border-danger' : 'border-line'
        }`}
      >
        {Icon && <Icon size={16} className="text-muted flex-shrink-0" />}
        <input
          className="flex-1 py-2.5 text-sm text-ink placeholder-muted bg-transparent outline-none"
          {...props}
        />
        {right}
      </div>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
