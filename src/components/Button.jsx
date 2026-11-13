export default function Button({
  children, variant = 'primary', size = 'md',
  disabled, loading, className = '', type = 'button', onClick, ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary:   'gradient-primary text-white hover:opacity-90 hover:scale-[1.02] hover:shadow-lg',
    secondary: 'bg-primaryLight text-primary hover:bg-green-100 hover:scale-[1.02] focus:ring-primary',
    outline:   'border border-primary text-primary hover:bg-primaryLight hover:scale-[1.02] focus:ring-primary',
    ghost:     'text-muted hover:text-ink hover:bg-surface focus:ring-line',
    danger:    'bg-danger text-white hover:opacity-90 hover:scale-[1.02] focus:ring-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-sm',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
