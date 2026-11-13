export default function Card({ children, className = '', accent = false, hover = false, style }) {
  return (
    <div
      style={style}
      className={`bg-white rounded-2xl border shadow-warm transition-all duration-200 ${
        accent ? 'border-primary border-2' : 'border-line'
      } ${hover ? 'hover:-translate-y-0.5 hover:shadow-warm-lg cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
