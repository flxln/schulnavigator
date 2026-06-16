// studio-dashboard.jsx — S2 Dashboard screen

const RECENT_EDITS = [
  { slug: 'werken',       label: 'Werken',          time: 'vor 8 Min.',  action: 'Audio hinzugefügt' },
  { slug: 'daz',          label: 'DaZ-Zimmer',      time: 'vor 23 Min.', action: 'Stammdaten geändert' },
  { slug: 'klassenzimmer',label: 'Klassenzimmer',   time: 'vor 1 Std.',  action: 'Hotspot kalibriert' },
];

const ISSUES_LIST = [
  { slug: 'daz',              label: 'DaZ-Zimmer',       sev: 'error', issues: ['Dialog-WAV fehlt: 01-frieda.wav', 'Dialog-WAV fehlt: 02-otto.wav'] },
  { slug: 'schulsozialarbeit',label: 'Schulsozialarbeit',sev: 'error', issues: ['beschreibung darf nicht leer sein'] },
  { slug: 'musik',            label: 'Musik',            sev: 'warn',  issues: ['Datei fehlt: grundschule-chor.mp3'] },
  { slug: 'lesewelt',         label: 'Lesewelt',         sev: 'warn',  issues: ['Keine Hotspots definiert'] },
  { slug: 'hort',             label: 'Hort',             sev: 'warn',  issues: ['Keine Medien vorhanden'] },
];

function Dashboard({ onGoStation, state = 'errors' }) {
  const ok      = state === 'ok';
  const loading = state === 'loading';
  const errCnt  = ok ? 0 : 2;
  const warnCnt = ok ? 0 : 3;

  function StatCard({ label, n, color }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: '900', color, lineHeight: 1 }}>{n}</span>
        <span style={{ fontSize: 11, fontWeight: '700', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Page heading */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 'var(--t-h2)', fontWeight: '900', color: 'var(--fg-1)' }}>Dashboard</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>
          16.06.2026 · Projekttag 24./25.06.2026
        </p>
      </div>

      {loading ? (
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Spinner size={18} />
            <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Validierung läuft – prüfe Struktur und Dateien…</span>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Validation status */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: ok ? '#e8f7df' : errCnt > 0 ? '#fdeaea' : '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ok ? 'check' : 'warn'} size={18} color={ok ? 'var(--brand-green)' : errCnt > 0 ? 'var(--brand-red)' : '#7a5000'} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: 14, color: 'var(--fg-1)' }}>
                    {ok ? 'Alle Stationen valid' : errCnt > 0 ? `${errCnt} Fehler` : `${warnCnt} Warnungen`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>validate:stations · 14:23 Uhr · 342 ms</div>
                </div>
              </div>
              <Badge variant={ok ? 'ok' : errCnt > 0 ? 'error' : 'warn'}>{ok ? 'ok' : errCnt > 0 ? 'Fehler' : 'Warnung'}</Badge>
            </div>
            {!ok && (
              <div style={{ display: 'flex', gap: 14, paddingTop: 4, borderTop: '1px solid var(--ink-05)' }}>
                {errCnt > 0 && <span style={{ fontSize: 12, color: 'var(--brand-red)', fontWeight: '600' }}>{errCnt} Fehler</span>}
                {warnCnt > 0 && <span style={{ fontSize: 12, color: '#7a5000', fontWeight: '600' }}>{warnCnt} Warnungen</span>}
                {ok && <span style={{ fontSize: 12, color: 'var(--brand-green)', fontWeight: '600' }}>12 / 12 Stationen</span>}
              </div>
            )}
          </Card>

          {/* Station counts */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontWeight: '700', fontSize: 14 }}>Stationen</span>
              <Btn size="sm" variant="secondary" onClick={() => onGoStation(null)}>Alle anzeigen</Btn>
            </div>
            <div style={{ display: 'flex', gap: 22 }}>
              <StatCard label="Valid"     n={ok ? 12 : 7}  color="var(--brand-green)" />
              <StatCard label="Warnungen" n={ok ? 0 : 3}   color="var(--brand-sun)" />
              <StatCard label="Fehler"    n={ok ? 0 : 2}   color="var(--brand-red)" />
            </div>
          </Card>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: ok || loading ? '1fr' : '1fr 1fr', gap: 16 }}>
        {/* Issues list */}
        {!ok && !loading && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', fontSize: 13 }}>Stationen mit Problemen</span>
              <Badge variant="error">{errCnt + warnCnt}</Badge>
            </div>
            {ISSUES_LIST.map((s, i) => (
              <div key={s.slug} onClick={() => onGoStation(s.slug)}
                style={{ padding: '9px 16px', borderBottom: i < ISSUES_LIST.length-1 ? '1px solid var(--ink-05)' : 'none', display: 'flex', gap: 9, alignItems: 'flex-start', cursor: 'pointer', background: 'var(--white)' }}>
                <StatusDot status={s.sev} size={7} style={{ marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: 13, marginBottom: 2 }}>{s.label}</div>
                  {s.issues.map((iss, ii) => (
                    <div key={ii} style={{ fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {iss}</div>
                  ))}
                </div>
                <Icon name="chevronRight" size={11} color="var(--ink-40)" style={{ marginTop: 3 }} />
              </div>
            ))}
          </Card>
        )}

        {/* Recent edits */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ink-10)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: 13 }}>Zuletzt bearbeitet</span>
            {ok && <Btn size="sm" variant="ghost" icon="external">CLI-Anleitung</Btn>}
          </div>
          {loading
            ? [1,2,3].map(i => <div key={i} style={{ height: 52, margin: '6px 12px', borderRadius: 6, background: 'var(--paper-50)', animation: 'studioPulse 1.4s ease-in-out infinite' }}/>)
            : RECENT_EDITS.map((e, i) => (
              <div key={e.slug} onClick={() => onGoStation(e.slug)}
                style={{ padding: '9px 16px', borderBottom: i < RECENT_EDITS.length-1 ? '1px solid var(--ink-05)' : 'none', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--paper-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: '800', color: 'var(--ink-60)', flexShrink: 0 }}>
                  {e.label.substring(0,2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: '600', color: 'var(--fg-1)' }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{e.action}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>{e.time}</span>
              </div>
            ))
          }
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
