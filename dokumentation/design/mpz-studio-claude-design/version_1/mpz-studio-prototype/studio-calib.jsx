// studio-calib.jsx — S8 Flat-Kalibrierung /mpz/calib/flat/[slug]

const { useState: useStateCalib } = React;

function FlatKalibrierung({ slug, hotspotId, onBack, calibState = 'idle' }) {
  const [marker,   setMarker]   = useStateCalib(calibState === 'marker-placed' || calibState === 'applied' ? { x:0.3412, y:0.5123 } : null);
  const [selHs,    setSelHs]    = useStateCalib(hotspotId || 'hs-saegetisch');
  const [applied,  setApplied]  = useStateCalib(calibState === 'applied');
  const [dragging, setDragging] = useStateCalib(false);
  const panoRef = React.useRef(null);

  function handlePanoClick(e) {
    if (applied) return;
    const rect = panoRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width);
    const y = ((e.clientY - rect.top) / rect.height);
    setMarker({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(4)) });
  }

  const mockHotspots = [
    { id:'hs-saegetisch',   label:'Sägetisch' },
    { id:'hs-ausstellung',  label:'Ausstellungsfläche' },
    { id:'neu',             label:'+ Neuer Hotspot' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0f1420' }}>
      {/* Calib TopBar */}
      <div style={{ background:'#1a2035', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'0 22px', height:50, display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
        <Btn variant="ghost" size="sm" icon="arrowLeft" onClick={onBack} style={{ color:'rgba(255,255,255,0.6)' }}>Zurück</Btn>
        <div style={{ width:1, height:20, background:'rgba(255,255,255,0.1)' }}/>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>
          <span style={{ color:'rgba(255,255,255,0.8)', fontWeight:'600' }}>Flat-Kalibrierung</span>
          {' '}· /mpz/calib/flat/<span style={{ fontFamily:'var(--font-mono)' }}>{slug}</span>
        </span>
        <div style={{ flex:1 }}/>
        <Badge variant="dev">calib · nur lokal</Badge>
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* Panorama canvas */}
        <div style={{ flex:1, position:'relative', overflow:'hidden', cursor: applied ? 'default' : 'crosshair' }}
          ref={panoRef} onClick={handlePanoClick}>

          {/* Fake panorama bg */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(180deg, #2d4a6e 0%, #1c3354 30%, #3a5c3a 60%, #2a4a2a 100%)',
          }}>
            {/* Pseudo-classroom elements */}
            <div style={{ position:'absolute', bottom:'25%', left:'10%', width:'30%', height:'40%', background:'rgba(60,90,50,.4)', borderRadius:4, border:'1px solid rgba(255,255,255,.08)' }}/>
            <div style={{ position:'absolute', bottom:'25%', left:'43%', width:'25%', height:'35%', background:'rgba(50,80,70,.35)', borderRadius:4, border:'1px solid rgba(255,255,255,.06)' }}/>
            <div style={{ position:'absolute', top:'15%', left:'20%', width:'60%', height:'25%', background:'rgba(30,50,80,.5)', borderRadius:2, border:'1px solid rgba(255,255,255,.08)' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,0,0,.25) 0%,transparent 15%,transparent 85%,rgba(0,0,0,.25) 100%)' }}/>
            <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.12)', fontSize:11, fontFamily:'monospace', paddingBottom:6, whiteSpace:'nowrap' }}>
              /stations/{slug}.jpg — Panorama-Platzhalter
            </div>
          </div>

          {/* Existing markers (dim) */}
          {[{x:0.72,y:0.40}].map((m,i)=>(
            <div key={i} style={{ position:'absolute', left:`${m.x*100}%`, top:`${m.y*100}%`, transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(75,154,35,0.35)', border:'2px solid rgba(75,154,35,0.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--brand-green)' }}/>
              </div>
              <div style={{ position:'absolute', top:'110%', left:'50%', transform:'translateX(-50%)', fontSize:10, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap', background:'rgba(0,0,0,0.5)', padding:'2px 5px', borderRadius:3, fontFamily:'monospace' }}>hs-ausstellung</div>
            </div>
          ))}

          {/* Active marker */}
          {marker && (
            <div style={{ position:'absolute', left:`${marker.x*100}%`, top:`${marker.y*100}%`, transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
              {/* Crosshair */}
              <svg width="36" height="36" style={{ position:'absolute', top:-18, left:-18 }}>
                <circle cx="18" cy="18" r="14" fill="rgba(251,187,36,0.18)" stroke="rgba(251,187,36,0.8)" strokeWidth="1.5"/>
                <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(251,187,36,0.7)" strokeWidth="1"/>
                <line x1="4" y1="18" x2="32" y2="18" stroke="rgba(251,187,36,0.7)" strokeWidth="1"/>
                <circle cx="18" cy="18" r="2.5" fill="#fbbb24"/>
              </svg>
              <div style={{ position:'absolute', top:'130%', left:'50%', transform:'translateX(-50%)', fontSize:10, color:'#fbbb24', whiteSpace:'nowrap', background:'rgba(0,0,0,0.7)', padding:'3px 7px', borderRadius:3, fontFamily:'monospace' }}>
                x={marker.x.toFixed(4)} y={marker.y.toFixed(4)}
              </div>
            </div>
          )}

          {/* Instruction overlay (no marker yet) */}
          {!marker && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ background:'rgba(0,0,0,0.6)', borderRadius:8, padding:'12px 20px', textAlign:'center' }}>
                <Icon name="crosshair" size={22} color="rgba(255,255,255,0.5)" style={{ margin:'0 auto 8px' }}/>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>Klick auf das Panorama setzt den Marker</div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ width:280, background:'#1a2035', borderLeft:'1px solid rgba(255,255,255,0.08)', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:11, fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>Koordinaten</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              {['x','y'].map(axis => (
                <div key={axis}>
                  <label style={{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', display:'block', marginBottom:4 }}>{axis}</label>
                  <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, padding:'7px 10px', fontFamily:'var(--font-mono)', fontSize:14, color: marker ? '#fbbb24' : 'rgba(255,255,255,0.2)' }}>
                    {marker ? marker[axis].toFixed(4) : '—.——'}
                  </div>
                </div>
              ))}
            </div>

            {/* Hotspot selector */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', display:'block', marginBottom:4 }}>Hotspot verknüpfen</label>
              <select value={selHs} onChange={e => setSelHs(e.target.value)}
                style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, padding:'7px 10px', fontFamily:'var(--font-ui)', fontSize:13, color:'rgba(255,255,255,0.8)', outline:'none' }}>
                {mockHotspots.map(h => <option key={h.id} value={h.id}>{h.label}</option>)}
              </select>
            </div>

            {applied && (
              <Alert type="success" title="Koordinaten übernommen">x={marker?.x.toFixed(4)} · y={marker?.y.toFixed(4)} wurde in stations.json geschrieben.</Alert>
            )}
          </div>

          <div style={{ padding:'14px 18px', display:'flex', flexDirection:'column', gap:8 }}>
            <button
              disabled={!marker || applied}
              onClick={() => setApplied(true)}
              style={{ width:'100%', padding:'10px', border:'none', borderRadius:6, background: !marker || applied ? 'rgba(255,255,255,0.1)' : 'var(--brand-green)', color: !marker || applied ? 'rgba(255,255,255,0.3)' : '#fff', fontFamily:'var(--font-ui)', fontWeight:'600', fontSize:13, cursor: !marker || applied ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Icon name="save" size={14} />
              In stations.json übernehmen
            </button>
            <button onClick={() => { setMarker(null); setApplied(false); }}
              style={{ width:'100%', padding:'8px', border:'1px solid rgba(255,255,255,0.12)', borderRadius:6, background:'transparent', color:'rgba(255,255,255,0.45)', fontFamily:'var(--font-ui)', fontWeight:'500', fontSize:13, cursor:'pointer' }}>
              Marker zurücksetzen
            </button>
          </div>

          {/* Info */}
          <div style={{ marginTop:'auto', padding:'12px 18px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', lineHeight:1.6 }}>
              x ∈ [0,1] · links→rechts<br/>
              y ∈ [0,1] · oben→unten<br/>
              4 Nachkommastellen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FlatKalibrierung });
