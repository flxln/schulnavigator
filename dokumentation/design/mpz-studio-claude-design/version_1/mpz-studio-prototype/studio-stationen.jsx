// studio-stationen.jsx — S3 Grid, S4 Stammdaten, S5 Medien, S6 Upload Modal, S7 Hotspots, S10 Dialog-Audio

const { useState: useStateSt, useRef: useRefSt } = React;

// ─── Mock data ────────────────────────────────────────────────────────────────
const STATIONS_LIST = [
  { slug:'klassenzimmer',   hubNr:1,  titel:'Klassenzimmer',    viewer:'equirectangular', status:'ok',    media:4, hs:4 },
  { slug:'musik',           hubNr:2,  titel:'Musik',            viewer:'flat',            status:'warn',  media:2, hs:1, issues:['Datei fehlt: grundschule-chor.mp3'] },
  { slug:'daz',             hubNr:3,  titel:'DaZ-Zimmer',       viewer:'flat',            status:'error', media:3, hs:2, issues:['Dialog-WAV fehlt: 01-frieda.wav','Dialog-WAV fehlt: 02-otto.wav'], hasDialog:true },
  { slug:'kunst',           hubNr:4,  titel:'Kunst',            viewer:'flat',            status:'ok',    media:5, hs:3 },
  { slug:'pc-raum',         hubNr:5,  titel:'PC-Raum',          viewer:'equirectangular', status:'ok',    media:3, hs:3, hasDialog:true },
  { slug:'lesewelt',        hubNr:6,  titel:'Lesewelt',         viewer:'flat',            status:'warn',  media:2, hs:0, issues:['Keine Hotspots definiert'] },
  { slug:'werken',          hubNr:7,  titel:'Werken',           viewer:'flat',            status:'ok',    media:3, hs:2 },
  { slug:'speiseraum',      hubNr:8,  titel:'Speiseraum',       viewer:'flat',            status:'ok',    media:2, hs:1 },
  { slug:'hort',            hubNr:9,  titel:'Hort',             viewer:'flat',            status:'warn',  media:0, hs:0, issues:['Keine Medien vorhanden'] },
  { slug:'turnhalle',       hubNr:10, titel:'Turnhalle',        viewer:'equirectangular', status:'ok',    media:4, hs:4 },
  { slug:'schulsozialarbeit',hubNr:11,titel:'Schulsozialarbeit',viewer:'flat',            status:'error', media:1, hs:0, issues:['beschreibung darf nicht leer sein'] },
  { slug:'schulhof',        hubNr:12, titel:'Schulhof',         viewer:'equirectangular', status:'ok',    media:6, hs:5 },
];

// Full mock for "werken"
const STATION_DETAIL = {
  werken: {
    slug:'werken', titel:'Werken', viewer:'flat',
    bild:'/stations/werken.jpg',
    beschreibung:'Im Werkunterricht bauen, sägen und kleben wir — hier entstehen die kreativsten Projekte der ganzen Schule. Jedes Kind baut sein eigenes Werkstück.',
    medien:[
      { id:'werken-audio-1', typ:'audio', quelle:'/media/werken/audio/projekttag.mp3',      untertitel:'Kinder erklären ihr Werkstück' },
      { id:'werken-foto-1',  typ:'foto',  quelle:'/media/werken/fotos/werkstatt.jpg',        untertitel:'Blick in die Werkstatt' },
      { id:'werken-text-1',  typ:'text',  quelle:'/media/werken/texte/mein-werkstueck.md',   untertitel:'Was wir gebaut haben' },
    ],
    hotspots:[
      { id:'hs-saegetisch',  label:'Sägetisch',       x:0.3412, y:0.5123, mediumId:'werken-audio-1', action:'medium' },
      { id:'hs-ausstellung', label:'Ausstellungsfläche', x:0.7234, y:0.4012, mediumId:'werken-foto-1', action:'medium' },
    ],
  },
  daz: {
    slug:'daz', titel:'DaZ-Zimmer', viewer:'flat',
    bild:'/stations/daz.jpg',
    beschreibung:'Der Raum für Deutsch als Zweitsprache – hier lernen Kinder mit Migrationshintergrund gemeinsam Deutsch.',
    medien:[
      { id:'daz-audio-1', typ:'audio', quelle:'/media/daz/audio/begruessung.mp3', untertitel:'Begrüßung auf Deutsch' },
      { id:'daz-foto-1',  typ:'foto',  quelle:'/media/daz/fotos/raum.jpg',        untertitel:'Raumansicht' },
      { id:'daz-text-1',  typ:'text',  quelle:'/media/daz/texte/info.md',         untertitel:'Über den DaZ-Unterricht' },
    ],
    hotspots:[
      { id:'hs-tafel', label:'Tafel', x:0.4, y:0.45, mediumId:'daz-audio-1', action:'medium' },
      { id:'hs-tisch', label:'Lerntisch', x:0.6, y:0.6, mediumId:'daz-foto-1', action:'medium' },
    ],
    hasDialog: true,
    dialog:{
      figuren:['frieda','otto'],
      segmente:[
        { id:'01-frieda', rolle:'frieda', quelle:'/api/dialog/daz/01-frieda.wav', text:'Hallo! Willkommen im DaZ-Zimmer.' },
        { id:'02-otto',   rolle:'otto',   quelle:'/api/dialog/daz/02-otto.wav',   text:'Hier lernen wir gemeinsam Deutsch!' },
      ]
    },
  },
  klassenzimmer: {
    slug:'klassenzimmer', titel:'Klassenzimmer', viewer:'equirectangular',
    bild:'/stations/klassenzimmer.jpg', panorama360:'/stations/360/klassenzimmer.jpg',
    beschreibung:'Hallo und willkommen in unserem Klassenzimmer! Hier lernen wir jeden Tag spannende Sachen.',
    medien:[
      { id:'demo-audio', typ:'audio', quelle:'/media/klassenzimmer/audio/grundschule_demo.mp3', untertitel:'Mein Schultag (Audio)' },
      { id:'demo-video', typ:'video', quelle:'/media/klassenzimmer/video/grundschule_demo.mp4', untertitel:'Mein Schultag (Video)' },
      { id:'demo-foto',  typ:'foto',  quelle:'/media/klassenzimmer/fotos/grundschule_demo.jpg', untertitel:'Schulfoto' },
      { id:'demo-text',  typ:'text',  quelle:'/media/klassenzimmer/texte/grundschule_demo.md',  untertitel:'Mein Schultag' },
    ],
    hotspots360:[
      { id:'hs-text',  label:'Korkpinnwand',  yaw:-32, pitch:-4,  mediumId:'demo-text' },
      { id:'hs-video', label:'Tafel',          yaw:-18, pitch:0,   mediumId:'demo-video' },
      { id:'hs-audio', label:'Klassentische',  yaw:4,   pitch:-8,  mediumId:'demo-audio' },
      { id:'hs-foto',  label:'Fensterseite',   yaw:28,  pitch:-2,  mediumId:'demo-foto' },
    ],
  },
};

// ─── S3: Station Grid ──────────────────────────────────────────────────────────
function StationCard({ st, onClick }) {
  const [hov, setHov] = useStateSt(false);
  const statusColor = { ok:'var(--brand-green)', warn:'var(--brand-sun)', error:'var(--brand-red)' };
  return (
    <div onClick={() => onClick(st.slug)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background:'var(--white)', border: st.status === 'error' ? '1px solid rgba(239,58,55,.3)' : '1px solid var(--ink-10)',
        borderRadius:'var(--r-md)',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor:'pointer', padding:'16px',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'all var(--t-base) var(--ease-out)',
        display:'flex', flexDirection:'column', gap:10,
      }}>
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, fontWeight:'800', color:'var(--fg-3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>HUB {st.hubNr}</span>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <Badge variant={st.viewer === 'equirectangular' ? '360' : 'flat'} size="sm">
            {st.viewer === 'equirectangular' ? '360°' : 'flat'}
          </Badge>
          {st.hasDialog && <Badge variant="blue" size="sm">dialog</Badge>}
        </div>
      </div>

      {/* Title */}
      <div>
        <div style={{ fontWeight:'700', fontSize:15, color:'var(--fg-1)', marginBottom:2 }}>{st.titel}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--fg-3)' }}>{st.slug}</div>
      </div>

      {/* Stats row */}
      <div style={{ display:'flex', gap:14, fontSize:12, color:'var(--fg-3)' }}>
        <span>{st.media} Medium{st.media !== 1 ? 'en' : ''}</span>
        <span>{st.hs} Hotspot{st.hs !== 1 ? 's' : ''}</span>
      </div>

      {/* Status bar */}
      <div style={{ borderTop:'1px solid var(--ink-05)', paddingTop:10, display:'flex', alignItems:'center', gap:7 }}>
        <StatusDot status={st.status} size={8} />
        <span style={{ fontSize:12, color: statusColor[st.status], fontWeight:'600' }}>
          {st.status === 'ok' ? 'Valid' : st.status === 'warn' ? `${st.issues?.length} Warnung${st.issues?.length !== 1 ? 'en' : ''}` : `${st.issues?.length} Fehler`}
        </span>
        {st.issues && <span style={{ fontSize:11, color:'var(--fg-3)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>— {st.issues[0]}</span>}
      </div>
    </div>
  );
}

function StationenGrid({ onSelect, gridState = 'partial' }) {
  const isLoading = gridState === 'loading';
  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:22 }}>
        <div>
          <h1 style={{ margin:0, fontSize:'var(--t-h2)', fontWeight:'900', color:'var(--fg-1)' }}>Stationen</h1>
          <p style={{ margin:'3px 0 0', fontSize:13, color:'var(--fg-3)' }}>12 Stationen · Schulrundgang GS39</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <StatusDot status="ok" size={7} /><span style={{fontSize:12, color:'var(--fg-3)'}}>{gridState==='all-ok'?12:7} valid</span>
          <StatusDot status="warn" size={7} /><span style={{fontSize:12, color:'var(--fg-3)'}}>{gridState==='all-ok'?0:3}</span>
          <StatusDot status="error" size={7} /><span style={{fontSize:12, color:'var(--fg-3)'}}>{gridState==='all-ok'?0:2}</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {STATIONS_LIST.map(s => (
            <div key={s.slug} style={{ height:148, borderRadius:'var(--r-md)', background:'var(--white)', border:'1px solid var(--ink-10)', animation:'studioPulse 1.4s ease-in-out infinite' }}/>
          ))}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {STATIONS_LIST.map(st => (
            <StationCard key={st.slug}
              st={gridState === 'all-ok' ? {...st, status:'ok', issues:undefined} : st}
              onClick={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── S4: Stammdaten Tab ────────────────────────────────────────────────────────
function StammdatenTab({ st, onChange }) {
  const [titel, setTitel] = useStateSt(st.titel);
  const [desc,  setDesc]  = useStateSt(st.beschreibung);
  const [viewer,setViewer]= useStateSt(st.viewer || 'flat');
  return (
    <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:20 }}>
      <FormField label="Slug" hint="Unveränderlich — definiert Pfade und Routen.">
        <StInput value={st.slug} readOnly />
      </FormField>
      <FormField label="Titel" required id="titel">
        <StInput id="titel" value={titel} onChange={e => { setTitel(e.target.value); onChange && onChange(); }} placeholder="z. B. Klassenzimmer" />
      </FormField>
      <FormField label="Beschreibung" required id="desc">
        <StTextarea id="desc" value={desc} rows={5} onChange={e => { setDesc(e.target.value); onChange && onChange(); }} placeholder="Kurze Beschreibung der Station für Besucher…" />
      </FormField>
      <FormField label="Viewer-Modus" id="viewer" hint="flat = Panoramabild; equirectangular = 360°-Kugel">
        <StSelect id="viewer" value={viewer} onChange={e => { setViewer(e.target.value); onChange && onChange(); }}>
          <option value="flat">flat</option>
          <option value="equirectangular">equirectangular (360°)</option>
        </StSelect>
      </FormField>
      {st.bild && (
        <FormField label="Raumbild (bild)" hint="Nur lesen. Datei im Repo ablegen: app/public/stations/{slug}.jpg">
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <StInput value={st.bild} readOnly style={{ fontFamily:'var(--font-mono)', fontSize:12 }} />
            <Btn size="sm" variant="secondary" icon="external" style={{ flexShrink:0 }}>Im Repo</Btn>
          </div>
        </FormField>
      )}
      {st.panorama360 && (
        <FormField label="Panorama 360° (panorama360)" hint="Nur lesen. Format: /stations/360/{slug}.webp">
          <StInput value={st.panorama360} readOnly style={{ fontFamily:'var(--font-mono)', fontSize:12 }} />
        </FormField>
      )}
      <div style={{ paddingTop:8, borderTop:'1px solid var(--ink-10)', display:'flex', gap:8 }}>
        <Btn variant="primary" onClick={() => onChange && onChange()}>Änderungen merken</Btn>
        <Btn variant="ghost">Zurücksetzen</Btn>
      </div>
    </div>
  );
}

// ─── S6: Upload Modal ──────────────────────────────────────────────────────────
const MEDIA_TYPES = [
  { id:'audio', label:'Audio', ext:'.mp3 .wav .m4a', icon:'music',  color:'var(--brand-blue)' },
  { id:'video', label:'Video', ext:'.mp4 .mov',       icon:'video',  color:'var(--brand-red)' },
  { id:'foto',  label:'Foto',  ext:'.jpg .png .webp', icon:'image',  color:'var(--brand-green)' },
  { id:'text',  label:'Text',  ext:'.md .txt',         icon:'file',   color:'var(--brand-navy)' },
];

function UploadModal({ onClose, slug, modalState = 'default' }) {
  const [typ,    setTyp]    = useStateSt(null);
  const [drag,   setDrag]   = useStateSt(false);
  const [file,   setFile]   = useStateSt(modalState === 'validating' || modalState === 'error' ? 'projekttag.mp3' : null);
  const [id,     setId]     = useStateSt(modalState !== 'default' ? 'werken-audio-2' : '');
  const [untertitel, setUT] = useStateSt(modalState !== 'default' ? 'Kinder erklären ihr Lieblingsprojekt' : '');
  const [phase,  setPhase]  = useStateSt(modalState === 'validating' ? 'validating' : modalState === 'error' ? 'error' : null);

  const activeTyp = modalState !== 'default' ? 'audio' : typ;
  const generatedPath = activeTyp && (file || 'dateiname.ext')
    ? `/media/${slug}/${activeTyp === 'foto' ? 'fotos' : activeTyp === 'text' ? 'texte' : activeTyp}/${file || 'dateiname.ext'}`
    : null;

  const mimeError = modalState === 'error' && phase === 'error';
  const validating = modalState === 'validating' || phase === 'validating';

  function handleFakeUpload() {
    setPhase('validating');
    setTimeout(() => setPhase(null), 1800);
  }

  return (
    <ModalShell title="Medium hinzufügen" onClose={onClose} wide
      footer={<>
        <Btn variant="secondary" onClick={onClose}>Abbrechen</Btn>
        <Btn variant="primary" disabled={!activeTyp || !file || validating || mimeError} icon="plus"
          onClick={handleFakeUpload}>
          {validating ? <><Spinner size={13} color="#fff"/>Wird geprüft…</> : 'Hinzufügen'}
        </Btn>
      </>}
    >
      {/* Step 1: type */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--fg-3)', marginBottom:10 }}>Typ wählen</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {MEDIA_TYPES.map(t => {
            const on = activeTyp === t.id;
            return (
              <button key={t.id} onClick={() => !modalState || modalState === 'default' ? setTyp(t.id) : null}
                style={{ border: on ? `2px solid ${t.color}` : '1.5px solid var(--ink-15)', borderRadius:'var(--r-md)', padding:'14px 8px', background: on ? t.color+'12' : 'var(--white)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:7, transition:'all 120ms' }}>
                <span style={{ color: on ? t.color : 'var(--fg-3)' }}><Icon name={t.icon} size={20}/></span>
                <span style={{ fontSize:13, fontWeight: on ? '700' : '500', color: on ? 'var(--fg-1)' : 'var(--fg-2)' }}>{t.label}</span>
                <span style={{ fontSize:10, color:'var(--fg-3)' }}>{t.ext}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: file + fields */}
      {activeTyp && (
        <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'studioFadeIn 0.2s ease' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if(f) setFile(f.name); }}
            style={{
              border: mimeError ? '2px dashed var(--brand-red)' : drag ? '2px dashed var(--brand-green)' : file ? '2px solid var(--brand-green)' : '2px dashed var(--ink-20)',
              borderRadius:'var(--r-md)', padding:'28px 16px', textAlign:'center',
              background: mimeError ? '#fdeaea' : drag ? '#e8f7df' : file ? '#f0fae7' : 'var(--paper)',
              cursor:'pointer', transition:'all 120ms',
            }}>
            {validating ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                <Spinner size={24} /><span style={{ fontSize:13, color:'var(--fg-2)' }}>MIME und Größe werden geprüft…</span>
              </div>
            ) : file ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <Icon name={MEDIA_TYPES.find(t=>t.id===activeTyp)?.icon} size={18} color="var(--brand-green)" />
                <span style={{ fontSize:13, fontWeight:'600', color:'var(--fg-1)' }}>{file}</span>
                <button onClick={() => setFile(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--fg-3)', padding:2 }}><Icon name="x" size={13}/></button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <Icon name="upload" size={24} color="var(--ink-40)" />
                <span style={{ fontSize:13, color:'var(--fg-2)' }}>Datei hierher ziehen oder <span style={{ color:'var(--brand-blue)', cursor:'pointer' }}>klicken zum Auswählen</span></span>
                <span style={{ fontSize:11, color:'var(--fg-3)' }}>{MEDIA_TYPES.find(t=>t.id===activeTyp)?.ext}</span>
              </div>
            )}
          </div>

          {mimeError && <Alert type="error" title="Ungültiger Dateityp">Erwartete Formate für Audio: .mp3, .wav, .m4a — bitte konvertieren und erneut hochladen.</Alert>}

          {/* Fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="ID" required hint="Eindeutig pro Station" id="mid">
              <StInput id="mid" value={id} onChange={e => setId(e.target.value)} placeholder="z. B. werken-audio-2" />
            </FormField>
            <FormField label="Untertitel" id="mun">
              <StInput id="mun" value={untertitel} onChange={e => setUT(e.target.value)} placeholder="Kurze Beschriftung" />
            </FormField>
          </div>

          {/* Path preview */}
          {generatedPath && (
            <div style={{ background:'var(--paper-50)', border:'1px solid var(--ink-10)', borderRadius:'var(--r-sm)', padding:'10px 14px' }}>
              <div style={{ fontSize:11, fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--fg-3)', marginBottom:5 }}>Generierter Pfad (quelle)</div>
              <MonoText>{generatedPath}</MonoText>
              <div style={{ fontSize:11, color:'var(--fg-3)', marginTop:4 }}>app/public{generatedPath}</div>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
}

// ─── S5: Medien Tab ────────────────────────────────────────────────────────────
function MedienTab({ st, onAddMedia, mediaState = 'list' }) {
  const isEmpty = mediaState === 'empty' || st.medien.length === 0;
  const cols = [
    { key:'typ',      label:'Typ',      w:50 },
    { key:'id',       label:'ID',       w:160 },
    { key:'untertitel',label:'Untertitel', w:180 },
    { key:'quelle',   label:'Quelle',   w:undefined },
    { key:'actions',  label:'',         w:90 },
  ];
  const rows = st.medien.map(m => ({
    typ: <TypeIcon typ={m.typ} />,
    id: <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--fg-1)' }}>{m.id}</span>,
    untertitel: <span style={{ fontSize:13, color:'var(--fg-2)' }}>{m.untertitel || <span style={{color:'var(--fg-3)',fontStyle:'italic'}}>—</span>}</span>,
    quelle: <MonoText truncate maxW={240}>{m.quelle}</MonoText>,
    actions: (
      <div style={{ display:'flex', gap:4 }}>
        <Btn size="sm" variant="ghost" icon="edit" style={{ padding:'0 8px', minHeight:30 }}></Btn>
        <Btn size="sm" variant="ghost" icon="trash" style={{ padding:'0 8px', minHeight:30, color:'var(--brand-red)' }}></Btn>
        <Btn size="sm" variant="ghost" icon="eye" style={{ padding:'0 8px', minHeight:30 }}></Btn>
      </div>
    ),
  }));

  return (
    <div>
      <SectionHeader
        title="Medien"
        subtitle={`${st.medien.length} Einträge in medien[]`}
        action={<Btn variant="primary" size="sm" icon="plus" onClick={onAddMedia}>Medien hinzufügen</Btn>}
      />
      {isEmpty
        ? <Card><EmptyState icon="upload" title="Noch keine Medien" description="Füge Audio, Video, Foto oder Text für diese Station hinzu." action={<Btn variant="primary" icon="plus" onClick={onAddMedia}>Erstes Medium hinzufügen</Btn>} /></Card>
        : <DataTable cols={cols} rows={rows} />
      }
    </div>
  );
}

// ─── S7: Hotspots Tab ─────────────────────────────────────────────────────────
function HotspotsTab({ st, onCalibrate, hotspotState = 'list' }) {
  const isFlat = st.viewer !== 'equirectangular';
  const hs     = st.hotspots || [];
  const hs360  = st.hotspots360 || [];
  const isEmpty = hotspotState === 'empty' || (hs.length === 0 && hs360.length === 0);

  const flatCols = [
    { key:'id',    label:'ID',      w:140 },
    { key:'label', label:'Label',   w:130 },
    { key:'x',     label:'x',       w:70 },
    { key:'y',     label:'y',       w:70 },
    { key:'medium',label:'Medium',  w:160 },
    { key:'calib', label:'',        w:120 },
  ];
  const flatRows = hs.map(h => ({
    id: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.id}</span>,
    label: <span style={{ fontSize:13 }}>{h.label || <span style={{color:'var(--fg-3)',fontStyle:'italic'}}>—</span>}</span>,
    x: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.x.toFixed(4)}</span>,
    y: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.y.toFixed(4)}</span>,
    medium: <MonoText truncate maxW={140}>{h.mediumId || '—'}</MonoText>,
    calib: <Btn size="sm" variant="blue" icon="crosshair" onClick={() => onCalibrate(st.slug, h.id)} style={{ fontSize:11 }}>Kalibrieren</Btn>,
  }));

  const sphCols = [
    { key:'id',    label:'ID',    w:140 },
    { key:'label', label:'Label', w:130 },
    { key:'yaw',   label:'Yaw',  w:70 },
    { key:'pitch', label:'Pitch', w:70 },
    { key:'medium',label:'Medium',w:160 },
    { key:'calib', label:'',      w:120 },
  ];
  const sphRows = hs360.map(h => ({
    id: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.id}</span>,
    label: <span style={{ fontSize:13 }}>{h.label || '—'}</span>,
    yaw: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.yaw}</span>,
    pitch: <span style={{ fontFamily:'var(--font-mono)', fontSize:12 }}>{h.pitch}</span>,
    medium: <MonoText truncate maxW={140}>{h.mediumId || '—'}</MonoText>,
    calib: (
      <a href="#" onClick={e => e.preventDefault()} style={{ fontSize:12, color:'var(--brand-blue)', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
        <Icon name="external" size={12} />Sphere-App
      </a>
    ),
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      {/* Flat hotspots */}
      {(isFlat || hs.length > 0) && (
        <div>
          <SectionHeader title="Flat-Hotspots" subtitle={`hotspots[] · x/y ∈ [0,1]`}
            action={<Btn size="sm" variant="secondary" icon="plus">Hotspot hinzufügen</Btn>} />
          {isEmpty || hs.length === 0
            ? <Card><EmptyState icon="crosshair" title="Keine Flat-Hotspots" description="Klicke auf Kalibrieren, um Koordinaten direkt im Panorama zu setzen." action={<Btn variant="blue" icon="crosshair" onClick={() => onCalibrate(st.slug, null)}>Flat kalibrieren</Btn>} /></Card>
            : <DataTable cols={flatCols} rows={flatRows} />}
        </div>
      )}

      {/* 360° hotspots */}
      {(!isFlat || hs360.length > 0) && (
        <div>
          <SectionHeader title="Sphere-Hotspots (360°)" subtitle={`hotspots360[] · yaw ∈ [-180,180] · pitch ∈ [-90,90]`}
            action={<Btn size="sm" variant="secondary" icon="plus">Hotspot hinzufügen</Btn>} />
          {hs360.length === 0
            ? <Card><EmptyState icon="sphere" title="Keine 360°-Hotspots" description="Kalibrierung über Besucher-App mit ?hotspot-calib=1." /></Card>
            : <DataTable cols={sphCols} rows={sphRows} />}
          {hs360.length > 0 && (
            <Alert type="info" title="Sphere-Kalibrierung" style={{ marginTop:12 }}>
              Koordinaten über <MonoText>/raum/{st.slug}?hotspot-calib=1</MonoText> setzen — dann JSON hierher kopieren.
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}

// ─── S10: Dialog-Audio Tab ─────────────────────────────────────────────────────
function DialogAudioTab({ st, dialogState = 'missing' }) {
  const segments = st.dialog?.segmente || [
    { id:'01-frieda', rolle:'frieda', quelle:'/api/dialog/daz/01-frieda.wav', text:'Hallo! Willkommen im DaZ-Zimmer.' },
    { id:'02-otto',   rolle:'otto',   quelle:'/api/dialog/daz/02-otto.wav',   text:'Hier lernen wir gemeinsam Deutsch!' },
  ];
  const hasMissing = dialogState === 'missing';

  const cols = [
    { key:'nr',     label:'Nr.',    w:44 },
    { key:'rolle',  label:'Rolle',  w:80 },
    { key:'text',   label:'Text',   w:undefined },
    { key:'datei',  label:'Datei',  w:180 },
    { key:'status', label:'Status', w:80 },
    { key:'action', label:'',       w:90 },
  ];
  const rows = segments.map((seg, i) => {
    const fname = seg.id + '.wav';
    const missing = hasMissing && i < 2; // simulate missing for first 2
    return {
      nr: <span style={{ fontSize:12, color:'var(--fg-3)', fontWeight:'700' }}>{String(i+1).padStart(2,'0')}</span>,
      rolle: <Badge variant={seg.rolle === 'frieda' ? 'blue' : 'navy'} size="sm">{seg.rolle}</Badge>,
      text: <span style={{ fontSize:13, color:'var(--fg-2)', fontStyle: missing ? 'italic' : 'normal' }}>{seg.text}</span>,
      datei: <MonoText>{fname}</MonoText>,
      status: missing
        ? <Badge variant="error" size="sm">Fehlt</Badge>
        : <Badge variant="ok" size="sm">ok</Badge>,
      action: missing
        ? <Btn size="sm" variant="primary" icon="upload" style={{ fontSize:11 }}>Hochladen</Btn>
        : <Btn size="sm" variant="ghost" icon="eye" style={{ fontSize:11 }}>Vorschau</Btn>,
    };
  });

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        {hasMissing && (
          <Alert type="error" title="WAV-Dateien fehlen" style={{ marginBottom:16 }}>
            {segments.filter((_,i)=>i<2).length} Segment(e) haben keine Audio-Datei im Repo. Namenskonvention: <MonoText>NN-(frieda|otto|beide).wav</MonoText>
          </Alert>
        )}
        <Alert type="info" title="Dialog-Audio-Konvention">
          Dateien unter <MonoText>app/content/dialog-audio/{st.slug}/</MonoText> ablegen. Quelle wird automatisch auf <MonoText>/api/dialog/{st.slug}/…</MonoText> gesetzt.
        </Alert>
      </div>

      <SectionHeader title="Dialog-Segmente"
        subtitle={`${segments.length} Segmente · Figuren: ${(st.dialog?.figuren || ['frieda','otto']).join(', ')}`}
        action={<Btn size="sm" variant="primary" icon="upload">WAV hochladen</Btn>} />
      <DataTable cols={cols} rows={rows} />
    </div>
  );
}

// ─── Station Detail (all tabs) ─────────────────────────────────────────────────
function StationenDetail({ slug, onBack, onCalibrate, detailTab, setDetailTab, onAddMedia, showUpload, onCloseUpload, modalState, mediaState, hotspotState, dialogState }) {
  const found = STATION_DETAIL[slug] || STATION_DETAIL['werken'];
  const st = { ...found, slug };

  const hasDlg = !!st.hasDialog || !!st.dialog || ['daz','pc-raum'].includes(slug);
  const isSt = STATIONS_LIST.find(s => s.slug === slug) || {};
  const errTab = isSt.status === 'error';
  const warnTab = isSt.status === 'warn';

  const tabs = [
    { id:'stammdaten', label:'Stammdaten', icon:'file' },
    { id:'medien',     label:'Medien',     icon:'upload', badge: st.medien?.length, badgeWarn: warnTab && mediaState !== 'empty' },
    { id:'hotspots',   label:'Hotspots',   icon:'crosshair', badge: ((st.hotspots?.length||0)+(st.hotspots360?.length||0)) || undefined },
    ...(hasDlg ? [{ id:'dialog-audio', label:'Dialog-Audio', icon:'speaker', badge: dialogState === 'missing' ? '2' : undefined, badgeErr: dialogState === 'missing' }] : []),
  ];

  return (
    <div style={{ maxWidth:960 }}>
      {/* Back + title */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
        <Btn variant="ghost" size="sm" icon="arrowLeft" onClick={onBack}>Alle Stationen</Btn>
        <div style={{ width:1, height:20, background:'var(--ink-10)' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
          <h1 style={{ margin:0, fontSize:'var(--t-h2)', fontWeight:'900' }}>{st.titel}</h1>
          <Badge variant={st.viewer === 'equirectangular' ? '360' : 'flat'}>{st.viewer === 'equirectangular' ? '360°' : 'flat'}</Badge>
          <Badge variant={isSt.status || 'ok'}>{isSt.status === 'ok' ? 'valid' : isSt.status === 'warn' ? 'Warnung' : 'Fehler'}</Badge>
          {hasDlg && <Badge variant="blue">dialog</Badge>}
        </div>
        <a href={`/raum/${slug}`} target="_blank" style={{ fontSize:12, color:'var(--brand-blue)', display:'flex', alignItems:'center', gap:4, textDecoration:'none', flexShrink:0 }}>
          <Icon name="eye" size={13} />Vorschau <Icon name="external" size={11} />
        </a>
      </div>

      {/* Issues banner */}
      {isSt.issues && isSt.issues.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <Alert type={isSt.status === 'error' ? 'error' : 'warning'} title={isSt.status === 'error' ? 'Validierungsfehler' : 'Warnungen'}>
            {isSt.issues.map((iss,i) => <div key={i}>— {iss}</div>)}
          </Alert>
        </div>
      )}

      <TabBar tabs={tabs} active={detailTab} onChange={setDetailTab} />

      {detailTab === 'stammdaten'   && <StammdatenTab  st={st} />}
      {detailTab === 'medien'       && <MedienTab      st={st} onAddMedia={onAddMedia} mediaState={mediaState} />}
      {detailTab === 'hotspots'     && <HotspotsTab    st={st} onCalibrate={onCalibrate} hotspotState={hotspotState} />}
      {detailTab === 'dialog-audio' && <DialogAudioTab st={st} dialogState={dialogState} />}

      {showUpload && <UploadModal onClose={onCloseUpload} slug={slug} modalState={modalState} />}
    </div>
  );
}

Object.assign(window, { STATIONS_LIST, STATION_DETAIL, StationenGrid, StationenDetail, UploadModal });
