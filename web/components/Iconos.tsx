/* Íconos de línea en el estilo de la tarjeta de OBRAX */
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Mixer = ({ className = "h-10 w-10" }: P) => (
  <svg viewBox="0 0 64 40" className={className} {...base}>
    <path d="M4 28V12h12l6 8h8v8" /><path d="M30 28h28V20" />
    <ellipse cx="44" cy="14" rx="14" ry="9" transform="rotate(-12 44 14)" />
    <path d="M36 9l14 9M40 6l12 8" /><circle cx="12" cy="31" r="4" /><circle cx="38" cy="31" r="4" /><circle cx="50" cy="31" r="4" />
  </svg>
);
export const Ladrillos = ({ className = "h-10 w-10" }: P) => (
  <svg viewBox="0 0 64 40" className={className} {...base}>
    <rect x="4" y="26" width="18" height="10" /><rect x="22" y="26" width="18" height="10" /><rect x="40" y="26" width="18" height="10" />
    <rect x="13" y="16" width="18" height="10" /><rect x="31" y="16" width="18" height="10" /><rect x="22" y="6" width="18" height="10" />
  </svg>
);
export const Bomba = ({ className = "h-10 w-10" }: P) => (
  <svg viewBox="0 0 64 40" className={className} {...base}>
    <path d="M4 30V20h14l4 6h20v4" /><path d="M24 20l14-14 16 6" /><path d="M54 12v14" />
    <circle cx="11" cy="33" r="3.5" /><circle cx="34" cy="33" r="3.5" />
  </svg>
);
export const Escudo = ({ className = "h-8 w-8" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
);
export const Reloj = ({ className = "h-8 w-8" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const Casco = ({ className = "h-8 w-8" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3" /><path d="M10 7.5V5h4v2.5" /></svg>
);
export const Camion = ({ className = "h-8 w-8" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M2 6h11v10H2zM13 10h4l3 3v3h-7" /><circle cx="6" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
);
export const Chat = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a15 15 0 0 1-6-5.3c-.5-.7-1-1.7-1-2.7 0-1 .5-1.5.7-1.7.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.7c.1.1.1.3 0 .4l-.3.5-.4.4c-.1.1-.3.3-.1.5.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.5.3 0 .1 0 .7-.3 1.3z" />
  </svg>
);
