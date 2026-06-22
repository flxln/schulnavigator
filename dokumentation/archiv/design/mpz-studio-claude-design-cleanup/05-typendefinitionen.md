# Typendefinitionen — Content-Modell (Auszug v2.1)

Auszug aus `app/lib/types.ts` für Formular- und Mockup-Design.  
Validierung: `app/lib/validate-stations.ts`, `npm run validate:stations`.

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
| `CoachTrigger` | `hub-milestone`, `hub-complete`, `room-first` |
| `CoachMascot` | `frieda`, `otto`, `duo` |

---

## Medium

```ts
interface Medium {
  id: string
  typ: MediumTyp
  quelle: string
  videoSource?: VideoSource   // nur video
  poster?: string             // video upload
  thumbnail?: string
  openIn?: 'external'         // link
  embedAllow?: string[]       // embed
  untertitel?: string
}
```

### Bedingte Felder im UI

| typ | Pflicht | Optional |
|-----|---------|----------|
| audio | id, quelle | untertitel |
| video (upload) | id, quelle | untertitel, poster, thumbnail |
| video (youtube) | id, quelle (URL/ID) | untertitel, thumbnail |
| foto | id, quelle | untertitel, thumbnail |
| text | id, quelle | untertitel |
| link | id, quelle (https) | thumbnail, openIn |
| embed | id, quelle (https) | embedAllow (Checkboxen aus globaler Liste) |

**v2.1:** Datei ersetzen (gleiche id), Thumbnail-/Poster-Upload.

---

## Hotspot (Flat)

```ts
interface Hotspot {
  id: string
  label?: string
  x: number      // 0–1
  y: number      // 0–1
  action?: HotspotAction
  mediumId?: string
  mascot?: DialogFigure
  mascotSize?: number
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

## Dialog

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
  quelle: string
  text: string
  gruppe?: string
  tail?: 'left' | 'right' | 'center'
}

interface DialogBubbleLayout {
  y: number
  x: number
  maxWidth?: number
  fontSize?: number
  followPan?: boolean
}
```

**Dialog-Audio-Dateiname:** `^\d{2}-(frieda|otto|beide)\.wav$`

---

## Coach Message

```ts
interface CoachMessage {
  id: string
  trigger: CoachTrigger
  milestone?: number      // hub-milestone
  slug?: string           // room-first
  mascot: CoachMascot
  placement: string
  text: string
  modes?: ('fest' | 'heft')[]
  quelle?: string
}
```

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

12 Slugs fest — `10-hub-stationen-liste.json`, Schema: `04-stations-schema.json`.
