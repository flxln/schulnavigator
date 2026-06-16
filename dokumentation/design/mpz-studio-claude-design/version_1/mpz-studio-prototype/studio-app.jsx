// studio-app.jsx — main App + S11 Save&Validate + Tweaks

const { useState: useStateApp, useEffect: useEffectApp } = React;

// ─── S11 Save & Validate Panel ────────────────────────────────────────────────
function SaveValidatePanel({ state = 'idle', onClose }) {
  const isIdle    = state === 'idle';
  const isRunning = state === 'running';
  const isOk      = state === 'success';
  const isErr     = state === 'rollback-error';

  const checks = [
    { label:'JSON-Schema (stations.json)',       ok:true },
    { label:'Medien-Pfade vorhanden',            ok:!isErr },
    { label:'Hotspot-Koordinaten ∈ [0,1]',      ok:true },
    { label:'Dialog-WAV-Dateien',               ok:!isErr },
    { label:'Keine doppelten IDs',              ok:true },
  ];
  const errors = [
    'daz: Dialog-WAV fehlt — /api/dialog/daz/01-frieda.wav',
    'daz: Dialog-WAV fehlt — /api/dialog/daz/02-otto.wav',
  ];

  return (
    <ModalShell title="Speichern &amp; Validieren" onClose={onClose}
      footer={isRunning ? null : <Btn variant={isErr ? 'danger' : isOk ? 'primary' : 'secondary'} onClick={onClose}>{isErr ? 'Schließen' : isOk ? 'Fertig' : 'Abbrechen'}</Btn>}>

      {isIdle && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <p style={{ margin:0, fontSize:14, color:'var(--fg-2)', lineHeight:1.6 }}>
            Folgende Schritte werden ausgeführt:
          </p>
          {['1. stations.json atomar schreiben (.bak Backup)', '2. Strukturvalidierung (validateStationsFile)', '3. Asset-Validierung (npm run validate:stations)', '4. Bei Fehler: Rollback auf .bak'].map((s,i) => (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--fg-2)' }}>
              <span style={{ width:20, height:20, borderRadius:'50%', background:'var(--paper-50)', border:'1px solid var(--ink-10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:'700', color:'var(--fg-3)', flexShrink:0 }}>{i+1}</span>
              {s}
            </div>
          ))}
        </div>
      )}

      {isRunning && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'20px 0' }}>
          <Spinner size={32} />
          <div style={{ fontSize:14, color:'var(--fg-2)', textAlign:'center' }}>
            Prüfe Struktur und Dateien…
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%' }}>
            {checks.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--fg-3)' }}>
                <Spinner size={12} color="var(--ink-30)" />
                {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOk && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#e8f7df', border:'1px solid rgba(75,154,35,.2)', borderRadius:'var(--r-md)', padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--brand-green)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="check" size={18} color="#fff"/>
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:15, color:'var(--brand-green-700)', marginBottom:3 }}>Validierung erfolgreich</div>
              <div style={{ fontSize:13, color:'var(--fg-2)' }}>stations.json wurde gespeichert. 12 / 12 Stationen valid.</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {checks.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--fg-2)' }}>
                <Icon name="check" size={14} color="var(--brand-green)" />
                {c.label}
              </div>
            ))}
          </div>
          <div style={{ paddingTop:4, display:'flex', gap:8 }}>
            <Btn size="sm" variant="secondary" icon="eye">Vorschau /raum/werken</Btn>
            <Btn size="sm" variant="ghost" icon="external">stations.json öffnen</Btn>
          </div>
        </div>
      )}

      {isErr && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#fdeaea', border:'1px solid rgba(239,58,55,.2)', borderRadius:'var(--r-md)', padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--brand-red)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="warn" size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight:'700', fontSize:15, color:'var(--brand-red)', marginBottom:3 }}>Validierung fehlgeschlagen</div>
              <div style={{ fontSize:13, color:'var(--fg-2)' }}>Änderungen wurden zurückgerollt. stations.json.bak wurde wiederhergestellt.</div>
            </div>
          </div>

          <div style={{ border:'1px solid rgba(239,58,55,.2)', borderRadius:'var(--r-md)', overflow:'hidden' }}>
            <div style={{ background:'#fdeaea', padding:'8px 14px', fontSize:11, fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--brand-red)' }}>Fehler ({errors.length})</div>
            {errors.map((e,i) => (
              <div key={i} style={{ padding:'9px 14px', borderTop:'1px solid rgba(239,58,55,.1)', fontSize:13, color:'var(--fg-2)', display:'flex', gap:8, alignItems:'flex-start' }}>
                <Icon name="warn" size={13} color="var(--brand-red)" style={{ marginTop:1, flexShrink:0 }}/>
                {e}
              </div>
            ))}
          </div>

          <Alert type="warning" title="Rollback durchgeführt">
            stations.json wurde auf den letzten Stand zurückgesetzt. Korrigiere die fehlenden Dateien und speichere erneut. CLI: <MonoText>git diff app/data/stations.json</MonoText>
          </Alert>

          <div style={{ display:'flex', gap:8 }}>
            <Btn size="sm" variant="danger" icon="x">Station daz öffnen</Btn>
            <Btn size="sm" variant="ghost" icon="external">CLI-Anleitung</Btn>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakToggle } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "screen":       "stationen",
    "dashState":    "errors",
    "gridState":    "partial",
    "station":      "werken",
    "detailTab":    "medien",
    "mediaState":   "list",
    "hotspotState": "list",
    "dialogState":  "missing",
    "modalState":   "default",
    "calibState":   "marker-placed",
    "validateState":"success",
    "hasChanges":   true,
    "showBanner":   true,
    "showValidate": false
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [showBanner, setShowBanner] = useStateApp(true);
  const [showUpload, setShowUpload] = useStateApp(false);
  const [saving, setSaving]         = useStateApp(false);
  const [showValidate, setShowVal]  = useStateApp(false);

  // derive state from tweaks
  const screen      = t.screen;
  const hasChanges  = t.hasChanges;
  const valStatus   = t.dashState === 'ok' || t.gridState === 'all-ok' ? 'ok' : 'warn';

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setShowVal(true); }, 1600);
  }

  function getBreadcrumb() {
    if (screen === 'stationen')    return ['Stationen'];
    if (screen === 'station-detail') return ['Stationen', STATIONS_LIST.find(s=>s.slug===t.station)?.titel || t.station];
    if (screen === 'flat-calib')   return ['Stationen', STATIONS_LIST.find(s=>s.slug===t.station)?.titel || t.station, 'Flat-Kalibrierung'];
    return ['Dashboard'];
  }

  return (
    <>
      <StudioShell
        active={screen}
        onNav={s => setTweak('screen', s)}
        breadcrumb={getBreadcrumb()}
        hasChanges={hasChanges}
        onSave={handleSave}
        saving={saving}
        valStatus={valStatus}
        showBanner={showBanner && t.showBanner}
        onDismissBanner={() => setShowBanner(false)}
      >
        {screen === 'dashboard' && (
          <Dashboard
            state={t.dashState}
            onGoStation={slug => {
              if (slug) { setTweak('station', slug); setTweak('screen', 'station-detail'); }
              else setTweak('screen', 'stationen');
            }}
          />
        )}

        {screen === 'stationen' && (
          <StationenGrid
            gridState={t.gridState}
            onSelect={slug => { setTweak('station', slug); setTweak('screen', 'station-detail'); }}
          />
        )}

        {screen === 'station-detail' && (
          <StationenDetail
            slug={t.station}
            onBack={() => setTweak('screen', 'stationen')}
            onCalibrate={(slug) => { setTweak('screen', 'flat-calib'); }}
            detailTab={t.detailTab}
            setDetailTab={v => setTweak('detailTab', v)}
            onAddMedia={() => setShowUpload(true)}
            showUpload={showUpload}
            onCloseUpload={() => setShowUpload(false)}
            modalState={t.modalState}
            mediaState={t.mediaState}
            hotspotState={t.hotspotState}
            dialogState={t.dialogState}
          />
        )}

        {screen === 'flat-calib' && (
          <FlatKalibrierung
            slug={t.station}
            onBack={() => setTweak('screen', 'station-detail')}
            calibState={t.calibState}
          />
        )}
      </StudioShell>

      {(showValidate || t.showValidate) && (
        <SaveValidatePanel
          state={t.validateState}
          onClose={() => setShowVal(false)}
        />
      )}

      {/* Tweaks Panel */}
      <TweaksPanel>
        <TweakSection label="Screen" />
        <TweakRadio label="Aktiver Screen" value={t.screen}
          options={['dashboard','stationen','station-detail','flat-calib']}
          onChange={v => setTweak('screen', v)} />

        <TweakSection label="Dashboard" />
        <TweakRadio label="Zustand" value={t.dashState}
          options={['errors','ok','loading']}
          onChange={v => setTweak('dashState', v)} />

        <TweakSection label="Stationen-Grid" />
        <TweakRadio label="Zustand" value={t.gridState}
          options={['partial','all-ok','loading']}
          onChange={v => setTweak('gridState', v)} />

        <TweakSection label="Station Detail" />
        <TweakSelect label="Station" value={t.station}
          options={['klassenzimmer','musik','daz','kunst','pc-raum','lesewelt','werken','speiseraum','hort','turnhalle','schulsozialarbeit','schulhof']}
          onChange={v => setTweak('station', v)} />
        <TweakRadio label="Tab" value={t.detailTab}
          options={['stammdaten','medien','hotspots','dialog-audio']}
          onChange={v => setTweak('detailTab', v)} />
        <TweakRadio label="Medien-Zustand" value={t.mediaState}
          options={['empty','list','uploading']}
          onChange={v => setTweak('mediaState', v)} />
        <TweakRadio label="Hotspot-Zustand" value={t.hotspotState}
          options={['empty','list']}
          onChange={v => setTweak('hotspotState', v)} />
        <TweakRadio label="Dialog-Audio" value={t.dialogState}
          options={['missing','ok']}
          onChange={v => setTweak('dialogState', v)} />

        <TweakSection label="Upload-Modal" />
        <TweakRadio label="Modal-Zustand" value={t.modalState}
          options={['default','validating','error']}
          onChange={v => setTweak('modalState', v)} />

        <TweakSection label="Kalibrierung" />
        <TweakRadio label="Calib-Zustand" value={t.calibState}
          options={['idle','marker-placed','applied']}
          onChange={v => setTweak('calibState', v)} />

        <TweakSection label="Save &amp; Validate" />
        <TweakRadio label="Validierungs-Panel" value={t.validateState}
          options={['idle','running','success','rollback-error']}
          onChange={v => setTweak('validateState', v)} />
        <TweakToggle label="Panel anzeigen" value={t.showValidate}
          onChange={v => setTweak('showValidate', v)} />

        <TweakSection label="Shell" />
        <TweakToggle label="Änderungen vorhanden" value={t.hasChanges}
          onChange={v => setTweak('hasChanges', v)} />
        <TweakToggle label="Plan-A-Banner" value={t.showBanner}
          onChange={v => setTweak('showBanner', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
