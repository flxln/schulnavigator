// studio-shell.jsx — Sidebar, TopBar, PlanABanner, StudioShell

const NAV_ACTIVE = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'stationen', label: 'Stationen', icon: 'grid' },
];
const NAV_DISABLED = [
  { label: 'Coach' },
  { label: 'Brand & Design' },
  { label: 'Hub-Karte' },
  { label: 'Deploy' },
];

function Sidebar({ active, onNav }) {
  const isStatActive = s => s === 'stationen' || s === 'station-detail' || s === 'flat-calib';
  return (
    <aside style={{ width: 240, minWidth: 240, background: 'var(--brand-navy)', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Wordmark */}
      <div style={{ padding: '18px 18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1" opacity=".7"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1" opacity=".7"/></svg>
          </div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: '-0.01em' }}>MPZ Studio</span>
        </div>
        {/* Dev badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,187,36,0.12)', border: '1px solid rgba(251,187,36,0.28)', borderRadius: 'var(--r-pill)', padding: '3px 10px', fontSize: 11, fontWeight: '600', color: '#fbbb24' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbb24', display: 'block', flexShrink: 0 }}/>
          Nur lokal · development
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 14px' }}/>

      {/* Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {NAV_ACTIVE.map(item => {
          const on = item.id === 'stationen' ? isStatActive(active) : active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 11px', border: 'none',
              borderLeft: on ? '3px solid var(--brand-green)' : '3px solid transparent',
              borderRadius: 'var(--r-sm)', marginBottom: 2,
              background: on ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: on ? '#fff' : 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-ui)', fontWeight: on ? '600' : '500',
              fontSize: 13, cursor: 'pointer', transition: 'all 120ms',
            }}>
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          );
        })}

        {/* v1/v2 divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px', padding: '0 2px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>v1 / v2</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
        </div>

        {NAV_DISABLED.map(item => (
          <div key={item.label} style={{ padding: '7px 11px 7px 14px', borderLeft: '3px solid transparent', borderRadius: 'var(--r-sm)', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)', fontWeight: '500', fontSize: 13, display: 'flex', alignItems: 'center', gap: 9, cursor: 'not-allowed', marginBottom: 2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          39. Grundschule Dresden<br/>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>stations.json · Plan B v0</code>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ breadcrumb, hasChanges, onSave, saving, valStatus }) {
  return (
    <header style={{ height: 52, background: 'var(--white)', borderBottom: '1px solid var(--ink-10)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, flexShrink: 0 }}>
      {/* Breadcrumb */}
      <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--fg-3)', minWidth: 0, overflow: 'hidden' }}>
        <Icon name="home" size={13} />
        {breadcrumb.map((c, i) => (
          <React.Fragment key={i}>
            <Icon name="chevronRight" size={11} />
            <span style={{ fontWeight: i === breadcrumb.length - 1 ? '600' : '400', color: i === breadcrumb.length - 1 ? 'var(--fg-1)' : 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
          </React.Fragment>
        ))}
      </nav>

      {/* Validation pill */}
      {valStatus && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-3)', flexShrink: 0 }}>
          <StatusDot status={valStatus === 'ok' ? 'ok' : valStatus === 'error' ? 'error' : 'warn'} size={6} />
          <span>{valStatus === 'ok' ? 'Alles valid' : valStatus === 'error' ? '2 Fehler' : '3 Warnungen'}</span>
        </div>
      )}

      {/* CTA */}
      <Btn variant="primary" size="sm" disabled={!hasChanges || saving} onClick={onSave}
        style={{ minWidth: 170 }}>
        {saving
          ? <><Spinner size={13} color="#fff" />Validiere…</>
          : <><Icon name="check" size={13} />Speichern &amp; Validieren</>}
      </Btn>
    </header>
  );
}

function PlanABanner({ onDismiss }) {
  return (
    <div style={{ background: 'var(--brand-sky-50)', borderBottom: '1px solid rgba(31,106,187,0.14)', padding: '7px 22px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-2)', flexShrink: 0 }}>
      <Icon name="info" size={14} color="var(--brand-blue)" />
      <span>Plan A (CLI) bleibt Fallback. Bei Problemen:</span>
      <MonoText>npm run content:ingest</MonoText>
      <span style={{ flex: 1 }}/>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 2, borderRadius: 4 }}><Icon name="x" size={13} /></button>
    </div>
  );
}

function StudioShell({ children, active, onNav, breadcrumb, hasChanges, onSave, saving, valStatus, showBanner, onDismissBanner }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>
      <Sidebar active={active} onNav={onNav} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar breadcrumb={breadcrumb} hasChanges={hasChanges} onSave={onSave} saving={saving} valStatus={valStatus} />
        {showBanner && <PlanABanner onDismiss={onDismissBanner} />}
        <main style={{ flex: 1, overflowY: 'auto', background: active === 'flat-calib' ? '#1a1a2e' : 'var(--paper)', padding: active === 'flat-calib' ? 0 : '26px 30px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar, PlanABanner, StudioShell });
