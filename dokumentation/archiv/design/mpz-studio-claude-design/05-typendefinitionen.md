# Typendefinitionen — Content-Modell (Auszug)

Kopie/Auszug aus `app/lib/types.ts` für Formular- und Mockup-Design.  
Build-Validierung: `app/lib/validate-stations.ts` + `npm run validate:stations`.

---

## Enums

| Name | Werte |
|------|--------|
| `MediumTyp` | `audio`, `video`, `foto`, `text`, `link`, `embed` |
| `VideoSource` | `upload`, `youtube` |
| `ViewerMode` | `flat`, `equirectangular` |
| `HotspotAction` | `medium` (default), `dialog` |
| `DialogFigure` | `frieda`, `otto` |
| `DialogRolle` | `frieda`, `otto`, `beide` |

**v0-Upload-Typen:** nur `audio`, `video` (upload), `foto`, `text`.

---

## Medium

```ts
interface Medium {
  id: string
  typ: MediumTyp
  quelle: string              // Pfad / oder https bei link/embed
  videoSource?: VideoSource   // nur video
  poster?: string             // nur video + upload
  thumbnail?: string
  openIn?: 'external'         // nur link
  embedAllow?: string[]       // nur embed — nicht v0
  untertitel?: string
}
```

### Bedingte Felder im UI

| typ | Pflicht | Optional |
|-----|---------|----------|
| audio | id, quelle | untertitel |
| video (upload) | id, quelle | untertitel, poster, thumbnail |
| foto | id, quelle | untertitel, thumbnail |
| text | id, quelle | untertitel |
| link | id, quelle (https) | thumbnail, openIn — **nicht v0** |
| embed | id, quelle (https) | embedAllow — **nicht v0** |

---

## Hotspot (Flat)

```ts
interface Hotspot {
  id: string
  label?: string
  x: number      // 0–1
  y: number      // 0–1
  action?: HotspotAction
  mediumId?: string       // bei action medium
  mascot?: DialogFigure   // bei action dialog
  mascotSize?: number     // 0–1, dialog
  mascotFlipX?: boolean
  icon?: string
  iconSize?: number       // 0.05–0.25
  radius?: number
}
```

---

## Hotspot360 (Sphere)

```ts
interface Hotspot360 {
  id: string
  label?: string
  yaw: number    // -180 … 180
  pitch: number  // -90 … 90
  action?: HotspotAction
  mediumId?: string
  mascot?: DialogFigure
  mascotSize?: number
  mascotFlipX?: boolean
  bubblePitchOffset?: number
  icon?: string
  iconSize?: number
}
```

---

## Dialog (nicht v0-Editor, nur Dialog-Audio-Tab)

```ts
interface Dialog {
  figuren: DialogFigure[]
  segmente: DialogSegment[]
  gruppen?: DialogGruppe[]
  bubble?: DialogBubbleLayout
}

interface DialogSegment {
  id: string
  rolle: DialogRolle
  quelle: string    // z. B. /api/dialog/daz/01-frieda.wav
  text: string
  gruppe?: string
  tail?: 'left' | 'right' | 'center'
}
```

**Dialog-Audio-Dateiname:** `^\d{2}-(frieda|otto|beide)\.wav$`  
Beispiel: `01-frieda.wav`

---

## Station (Stammdaten)

```ts
interface Station {
  slug: string
  titel: string
  beschreibung: string
  viewer?: ViewerMode
  bild?: string
  panorama360?: string
  medien: Medium[]
  hotspots?: Hotspot[]
  hotspots360?: Hotspot360[]
  dialog?: Dialog
}
```

12 Slugs fest — siehe `10-hub-stationen-liste.json` und `04-stations-schema.json`.
