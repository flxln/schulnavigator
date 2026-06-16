// studio-components.jsx — shared atoms for MPZ Studio v0
// All exports → window at bottom

const { useState: useStateC, useRef: useRefC } = React;

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
const ICONS = {
  music:       'M9 18V5l12-2v13M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  video:       'M5 3l14 9-14 9V3z',
  image:       'M3 3h18v18H3V3zm3.5 5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm0 9.5 3-3 3 3 4-5 4 5H6z',
  file:        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 0v6h6M16 13H8m8 4H8m3-8H8',
  check:       'M20 6 9 17l-5-5',
  x:           'M18 6 6 18M6 6l12 12',
  warn:        'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',
  info:        'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 14v-4m0-4h.01',
  edit:        'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash:       'M3 6h18M19 6l-1 14H6L5 6M10 11v6m4-6v6M9 6V4h6v2',
  external:    'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6m-11 4L21 3',
  upload:      'M16 16 12 12l-4 4m4-4v9M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3',
  plus:        'M12 5v14M5 12h14',
  chevronRight:'M9 18l6-6-6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  home:        'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm6 13V12h6v10',
  grid:        'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zM3 14h7v7H3v-7z',
  dashboard:   'M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 9h7v9h-7v-9zM3 16h7v5H3v-5z',
  crosshair:   'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm10 10h-4m-12 0H2m10-10v4m0 12v4',
  arrowLeft:   'M19 12H5m7 7-7-7 7-7',
  speaker:     'M11 5 6 9H2v6h4l5 4V5zm7.07-1.07a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
  save:        'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  eye:         'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  link:        'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71m-5.5 5.5-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  clock:       'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v7l4 2',
  dialog:      'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z',
};

function Icon({ name, size = 16, color, style: extStyle }) {
  const d = ICONS[name];
  if (!d) return <span style={{ display: 'inline-block', width: size, height: size }} />;
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...extStyle }}
    >
      <path d={d} />
    </svg>
  );
}

// ─── StatusDot ───────────────────────────────────────────────────────────────
function StatusDot({ status, size = 8 }) {
  const c = { ok: '#4b9a23', warn: '#fbbb24', error: '#ef3a37', empty: 'rgba(8,42,80,0.2)', loading: 'rgba(8,42,80,0.3)' };
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: c[status] || c.empty,
      flexShrink: 0, verticalAlign: 'middle',
    }} />
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ children, variant = 'default', size = 'sm' }) {
  const p = size === 'sm' ? '2px 8px' : '4px 12px';
  const fs = size === 'sm' ? '11px' : 'var(--t-small)';
  const vs = {
    default: { bg: 'var(--paper-50)',  color: 'var(--fg-2)',          border: '1px solid var(--ink-10)' },
    dev:     { bg: '#fff3cd',          color: '#7a5000',               border: '1px solid rgba(251,187,36,0.4)' },
    flat:    { bg: 'rgba(8,42,80,.06)',color: 'var(--ink-60)',         border: '1px solid var(--ink-10)' },
    '360':   { bg: 'rgba(31,106,187,.1)',color:'var(--brand-blue)',    border: '1px solid rgba(31,106,187,.25)' },
    ok:      { bg: '#e8f7df',          color: 'var(--brand-green-700)',border: '1px solid rgba(75,154,35,.25)' },
    warn:    { bg: '#fff8e1',          color: '#7a5000',               border: '1px solid rgba(251,187,36,.35)' },
    error:   { bg: '#fdeaea',          color: 'var(--brand-red)',      border: '1px solid rgba(239,58,55,.25)' },
    navy:    { bg: 'var(--brand-navy)',color: 'var(--white)',          border: 'none' },
    green:   { bg: 'var(--brand-green)',color:'var(--white)',          border: 'none' },
    blue:    { bg: 'var(--brand-blue)',color: 'var(--white)',          border: 'none' },
    loading: { bg: 'var(--paper-50)',  color: 'var(--fg-3)',           border: '1px solid var(--ink-10)' },
  };
  const v = vs[variant] || vs.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      borderRadius: 'var(--r-pill)', padding: p, fontSize: fs,
      fontFamily: 'var(--font-ui)', fontWeight: 'var(--w-semibold)',
      letterSpacing: '0.04em', whiteSpace: 'nowrap', flexShrink: 0,
      background: v.bg, color: v.color, border: v.border,
    }}>{children}</span>
  );
}

// ─── Btn ─────────────────────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', disabled, onClick, icon, style: ext, type = 'button' }) {
  const [hov, setHov] = useStateC(false);
  const h = { sm: '32px', md: '40px', lg: '48px' };
  const pad = { sm: '0 12px', md: '0 16px', lg: '0 24px' };
  const fs = { sm: '13px', md: 'var(--t-small)', lg: 'var(--t-body)' };
  const vs = {
    primary:   { bg: hov ? '#3d7e1b' : 'var(--brand-green)', color: '#fff' },
    secondary: { bg: hov ? 'var(--ink-05)' : 'transparent', color: 'var(--brand-navy)', border: '1.5px solid var(--ink-20)' },
    ghost:     { bg: hov ? 'var(--ink-05)' : 'transparent', color: 'var(--fg-2)' },
    danger:    { bg: hov ? '#c42e2b' : 'var(--brand-red)', color: '#fff' },
    navy:      { bg: hov ? '#0b3565' : 'var(--brand-navy)', color: '#fff' },
    blue:      { bg: hov ? '#1557a2' : 'var(--brand-blue)', color: '#fff' },
  };
  const v = vs[variant] || vs.primary;
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        minHeight: h[size], padding: pad[size], fontSize: fs[size],
        fontFamily: 'var(--font-ui)', fontWeight: 'var(--w-semibold)',
        border: v.border || 'none', borderRadius: 'var(--r-sm)',
        background: v.bg, color: v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all var(--t-fast) var(--ease-out)',
        whiteSpace: 'nowrap', flexShrink: 0, ...ext,
      }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

// ─── Form inputs ─────────────────────────────────────────────────────────────
const inputBase = {
  width: '100%', padding: '8px 12px',
  fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--fg-1)',
  border: '1.5px solid var(--ink-20)', borderRadius: 'var(--r-sm)',
  background: 'var(--white)', outline: 'none',
  transition: 'border-color var(--t-fast)', minHeight: 40,
  boxSizing: 'border-box',
};

function StInput({ error, readOnly, style: ext, ...p }) {
  const [foc, setFoc] = useStateC(false);
  return <input {...p} readOnly={readOnly}
    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
    style={{ ...inputBase, borderColor: error ? 'var(--brand-red)' : foc ? 'var(--brand-green)' : 'var(--ink-20)', background: readOnly ? 'var(--paper-50)' : 'var(--white)', cursor: readOnly ? 'default' : 'text', ...ext }} />;
}

function StTextarea({ error, rows = 4, style: ext, ...p }) {
  const [foc, setFoc] = useStateC(false);
  return <textarea {...p} rows={rows}
    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
    style={{ ...inputBase, minHeight: 'unset', resize: 'vertical', borderColor: error ? 'var(--brand-red)' : foc ? 'var(--brand-green)' : 'var(--ink-20)', ...ext }} />;
}

function StSelect({ error, children, style: ext, ...p }) {
  const [foc, setFoc] = useStateC(false);
  return <select {...p}
    onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
    style={{ ...inputBase, borderColor: error ? 'var(--brand-red)' : foc ? 'var(--brand-green)' : 'var(--ink-20)', ...ext }}>
    {children}
  </select>;
}

function FormField({ label, hint, error, required, children, id }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label htmlFor={id} style={{ fontSize: 13, fontWeight: '600', color: error ? 'var(--brand-red)' : 'var(--fg-1)' }}>
        {label}{required && <span style={{ color: 'var(--brand-red)', marginLeft: 2 }}>*</span>}
      </label>}
      {children}
      {error && <span style={{ fontSize: 12, color: 'var(--brand-red)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="warn" size={12}/>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{hint}</span>}
    </div>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', borderBottom: '2px solid var(--ink-10)', gap: 2, marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => !t.disabled && onChange(t.id)} style={{
          padding: '9px 16px', border: 'none',
          borderBottom: active === t.id ? '2px solid var(--brand-green)' : '2px solid transparent',
          marginBottom: -2, background: 'none',
          fontFamily: 'var(--font-ui)', fontWeight: active === t.id ? '600' : '500',
          fontSize: 13, cursor: t.disabled ? 'not-allowed' : 'pointer',
          color: t.disabled ? 'var(--ink-20)' : active === t.id ? 'var(--brand-green)' : 'var(--fg-2)',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}>
          {t.icon && <Icon name={t.icon} size={13} />}
          {t.label}
          {t.badge != null && <span style={{
            background: t.badgeErr ? 'var(--brand-red)' : t.badgeWarn ? 'var(--brand-sun)' : 'var(--ink-10)',
            color: t.badgeErr || t.badgeWarn ? '#fff' : 'var(--fg-3)',
            borderRadius: 'var(--r-pill)', fontSize: 10,
            padding: '1px 5px', fontWeight: '700',
          }}>{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Alert ───────────────────────────────────────────────────────────────────
function Alert({ type = 'info', title, children, onDismiss }) {
  const cfg = {
    info:    { bg: 'var(--brand-sky-50)',  lborder: 'var(--brand-blue)', ic: 'info',  col: 'var(--brand-blue)' },
    success: { bg: '#e8f7df',             lborder: 'var(--brand-green)',ic: 'check', col: 'var(--brand-green)' },
    warning: { bg: '#fff8e1',             lborder: 'var(--brand-sun)', ic: 'warn',  col: '#7a5000' },
    error:   { bg: '#fdeaea',             lborder: 'var(--brand-red)', ic: 'warn',  col: 'var(--brand-red)' },
  };
  const c = cfg[type];
  return (
    <div style={{ background: c.bg, border: '1px solid transparent', borderLeft: `3px solid ${c.lborder}`, borderRadius: 'var(--r-sm)', padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span style={{ color: c.col, marginTop: 1 }}><Icon name={c.ic} size={15} /></span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: '600', fontSize: 13, color: c.col, marginBottom: children ? 3 : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>{children}</div>}
      </div>
      {onDismiss && <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 2 }}><Icon name="x" size={13} /></button>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ padding: '44px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {icon && <span style={{ opacity: 0.3, color: 'var(--ink)' }}><Icon name={icon} size={30} /></span>}
      {title && <div style={{ fontSize: 14, fontWeight: '600', color: 'var(--fg-2)' }}>{title}</div>}
      {description && <div style={{ fontSize: 13, color: 'var(--fg-3)', maxWidth: 300, lineHeight: 1.5 }}>{description}</div>}
      {action}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ size = 18, color = 'var(--brand-green)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'studioSpin 0.7s linear infinite', flexShrink: 0 }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 16 }}>
      <div>
        <div style={{ fontSize: 'var(--t-h4)', fontWeight: '700', color: 'var(--fg-1)', margin: 0 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── MonoText ─────────────────────────────────────────────────────────────────
function MonoText({ children, truncate, maxW = 200 }) {
  return (
    <code style={{
      fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)',
      background: 'var(--paper-50)', padding: '2px 6px', borderRadius: 3,
      ...(truncate ? { maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' } : {}),
    }}>{children}</code>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, style: ext, onClick }) {
  const [hov, setHov] = useStateC(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--white)', border: '1px solid var(--ink-10)',
        borderRadius: 'var(--r-md)',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
        transform: hov ? 'translateY(-1px)' : 'none',
        transition: 'all var(--t-base) var(--ease-out)', ...ext,
      }}>{children}</div>
  );
}

// ─── ModalShell ───────────────────────────────────────────────────────────────
function ModalShell({ title, onClose, children, footer, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(8,42,80,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-lg)', width: '100%',
        maxWidth: wide ? 740 : 520, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--ink-10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 'var(--t-h4)', fontWeight: '700' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--fg-3)', display: 'flex', borderRadius: 'var(--r-sm)' }}><Icon name="x" size={17} /></button>
        </div>
        <div style={{ padding: '22px', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: '14px 22px', borderTop: '1px solid var(--ink-10)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--paper)', flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
function DataTable({ cols, rows, empty }) {
  return (
    <div style={{ border: '1px solid var(--ink-10)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--paper-50)' }}>
            {cols.map(c => (
              <th key={c.key} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: '800', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--ink-10)', whiteSpace: 'nowrap', width: c.w }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty
            ? <tr><td colSpan={cols.length}>{empty}</td></tr>
            : rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--ink-05)' : 'none' }}>
                {cols.map(c => (
                  <td key={c.key} style={{ padding: '9px 12px', fontSize: 13, color: 'var(--fg-2)', verticalAlign: 'middle' }}>
                    {row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TypeIcon ─────────────────────────────────────────────────────────────────
function TypeIcon({ typ }) {
  const m = { audio: ['music','var(--brand-blue)'], video: ['video','var(--brand-red)'], foto: ['image','var(--brand-green)'], text: ['file','var(--brand-navy)'] };
  const [ic, col] = m[typ] || ['file','var(--fg-3)'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'var(--r-sm)', background: col+'22', color: col, flexShrink:0 }}>
      <Icon name={ic} size={13} />
    </span>
  );
}

// global spin keyframe
const studioCSS = document.createElement('style');
studioCSS.textContent = `
@keyframes studioSpin { to { transform: rotate(360deg); } }
@keyframes studioPulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
@keyframes studioFadeIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
`;
document.head.appendChild(studioCSS);

Object.assign(window, {
  Icon, StatusDot, Badge, Btn, inputBase,
  StInput, StTextarea, StSelect, FormField,
  TabBar, Alert, EmptyState, Spinner, SectionHeader, MonoText,
  Card, ModalShell, DataTable, TypeIcon,
});
