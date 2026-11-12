const P: Record<string, string> = {
  briefcase: 'M3 8h18v12H3zM8 8V5h8v3M3 13h18',
  code: 'M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M9 7h6',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 0 0 3-3c0-5-4-11-8-11zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
  spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 5l-7 7 7 7',
  check: 'M5 12l5 5 9-10',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  doc: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4a3.5 3.5 0 0 1 0 7M18 14a7 7 0 0 1 4 6',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  admin: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
};

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={P[name] || P.spark} />
    </svg>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} role="img" aria-label="DIFPROGLOBAL" className="logo-mark">
      <rect width="40" height="40" rx="10" fill="#C8A45D" />
      <path d="M13 11h6a9 9 0 0 1 0 18h-6z" fill="none" stroke="#14243A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M7 26c7 8 19 8 26-2" fill="none" stroke="#14243A" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    </svg>
  );
}

export function Globe() {
  return (
    <svg className="globe" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="90" />
      <ellipse cx="100" cy="100" rx="38" ry="90" />
      <ellipse cx="100" cy="100" rx="68" ry="90" />
      <path d="M12 70h176M12 130h176M10 100h180" />
    </svg>
  );
}
