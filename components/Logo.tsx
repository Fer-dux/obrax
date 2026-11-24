export function Logo({ className = "h-8", claro = false }: { className?: string; claro?: boolean }) {
  const texto = claro ? "#FFFFFF" : "#1F2A33";
  return (
    <svg viewBox="0 0 250 56" className={className} role="img" aria-label="OBRAX">
      <path d="M14 8h22l-8 14h-8L8 48H0L14 8z" fill={texto} />
      <path d="M38 8h12c4 0 6 3 5 6L46 40c-1 5-5 8-10 8H18l6-12h10l6-16h-8l6-12z" fill="#EE7623" />
      <text x="66" y="44" fontFamily="var(--fuente), Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="42" fill={texto}>
        OBRA<tspan fill="#EE7623">X</tspan>
      </text>
    </svg>
  );
}
