# Datenmodell — Typen und JSON-Schema

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


---

## stations.schema.json (vollständig)

Quelle: `app/data/stations.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schulnavigator.mpz.schule/schemas/stations.json",
  "title": "Schulnavigator stations.json",
  "description": "IDE-Hilfe für app/data/stations.json. Build-Validierung: lib/validate-stations.ts + npm run validate:stations",
  "type": "object",
  "required": ["stations"],
  "additionalProperties": false,
  "properties": {
    "stations": {
      "type": "array",
      "minItems": 12,
      "maxItems": 12,
      "items": { "$ref": "#/$defs/station" }
    }
  },
  "$defs": {
    "hubSlug": {
      "type": "string",
      "enum": [
        "klassenzimmer",
        "musik",
        "daz",
        "kunst",
        "pc-raum",
        "lesewelt",
        "werken",
        "speiseraum",
        "hort",
        "turnhalle",
        "schulsozialarbeit",
        "schulhof"
      ]
    },
    "mediumTyp": {
      "type": "string",
      "enum": ["audio", "video", "foto", "text", "link", "embed"]
    },
    "viewerMode": {
      "type": "string",
      "enum": ["flat", "equirectangular"]
    },
    "dialogRolle": {
      "type": "string",
      "enum": ["frieda", "otto", "beide"]
    },
    "dialogFigure": {
      "type": "string",
      "enum": ["frieda", "otto"]
    },
    "hotspotAction": {
      "type": "string",
      "enum": ["medium", "dialog"]
    },
    "medium": {
      "type": "object",
      "required": ["id", "typ", "quelle"],
      "additionalProperties": false,
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "description": "Eindeutig pro Station"
        },
        "typ": { "$ref": "#/$defs/mediumTyp" },
        "quelle": {
          "type": "string",
          "minLength": 1,
          "description": "Pfad unter /public (/) oder https-URL bei link/embed"
        },
        "untertitel": { "type": "string" },
        "thumbnail": {
          "type": "string",
          "pattern": "^/"
        },
        "videoSource": {
          "type": "string",
          "enum": ["upload", "youtube"]
        },
        "poster": {
          "type": "string",
          "pattern": "^/"
        },
        "openIn": {
          "type": "string",
          "enum": ["external"]
        },
        "embedAllow": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1
        }
      },
      "allOf": [
        {
          "if": { "properties": { "typ": { "const": "video" } } },
          "then": { "properties": { "videoSource": { "type": "string" } } }
        },
        {
          "if": { "properties": { "typ": { "const": "link" } } },
          "then": {
            "properties": {
              "quelle": { "type": "string", "format": "uri" }
            }
          }
        },
        {
          "if": { "properties": { "typ": { "const": "embed" } } },
          "then": {
            "properties": {
              "quelle": { "type": "string", "format": "uri" }
            }
          }
        }
      ]
    },
    "hotspotFlat": {
      "type": "object",
      "required": ["id", "x", "y"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "label": { "type": "string" },
        "x": { "type": "number", "minimum": 0, "maximum": 1 },
        "y": { "type": "number", "minimum": 0, "maximum": 1 },
        "radius": { "type": "number" },
        "action": { "$ref": "#/$defs/hotspotAction" },
        "mediumId": { "type": "string" },
        "mascot": { "$ref": "#/$defs/dialogFigure" },
        "mascotSize": { "type": "number", "minimum": 0.05, "maximum": 0.5 },
        "mascotFlipX": { "type": "boolean" },
        "icon": { "type": "string", "pattern": "^/" },
        "iconSize": { "type": "number", "minimum": 0.05, "maximum": 0.25 }
      }
    },
    "hotspot360": {
      "type": "object",
      "required": ["id", "yaw", "pitch"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "minLength": 1 },
        "label": { "type": "string" },
        "yaw": { "type": "number", "minimum": -180, "maximum": 180 },
        "pitch": { "type": "number", "minimum": -90, "maximum": 90 },
        "bubblePitchOffset": { "type": "number" },
        "action": { "$ref": "#/$defs/hotspotAction" },
        "mediumId": { "type": "string" },
        "mascot": { "$ref": "#/$defs/dialogFigure" },
        "mascotSize": { "type": "number", "minimum": 0.05, "maximum": 0.5 },
        "mascotFlipX": { "type": "boolean" },
        "icon": { "type": "string", "pattern": "^/" },
        "iconSize": { "type": "number", "minimum": 0.05, "maximum": 0.25 }
      }
    },
    "dialogSegment": {
      "type": "object",
      "required": ["id", "rolle", "quelle", "text"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string" },
        "rolle": { "$ref": "#/$defs/dialogRolle" },
        "quelle": {
          "type": "string",
          "pattern": "^/api/dialog/"
        },
        "text": { "type": "string" },
        "gruppe": { "type": "string" },
        "tail": {
          "type": "string",
          "enum": ["left", "right", "center"]
        }
      }
    },
    "dialog": {
      "type": "object",
      "required": ["figuren", "segmente"],
      "additionalProperties": false,
      "properties": {
        "figuren": {
          "type": "array",
          "items": { "$ref": "#/$defs/dialogFigure" },
          "minItems": 1
        },
        "segmente": {
          "type": "array",
          "items": { "$ref": "#/$defs/dialogSegment" }
        },
        "gruppen": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "text"],
            "properties": {
              "id": { "type": "string" },
              "text": { "type": "string" }
            }
          }
        },
        "bubble": {
          "type": "object",
          "properties": {
            "y": { "type": "number", "minimum": 0, "maximum": 1 },
            "x": { "type": "number", "minimum": 0, "maximum": 1 },
            "maxWidth": { "type": "number", "minimum": 0.3, "maximum": 1 },
            "fontSize": { "type": "number", "minimum": 0.02, "maximum": 0.06 },
            "followPan": { "type": "boolean" }
          }
        }
      }
    },
    "station": {
      "type": "object",
      "required": ["slug", "titel", "beschreibung", "medien"],
      "additionalProperties": false,
      "properties": {
        "slug": { "$ref": "#/$defs/hubSlug" },
        "titel": { "type": "string", "minLength": 1 },
        "beschreibung": { "type": "string" },
        "viewer": { "$ref": "#/$defs/viewerMode" },
        "bild": {
          "type": "string",
          "pattern": "^/stations/"
        },
        "panorama360": {
          "type": "string",
          "pattern": "^/stations/360/"
        },
        "medien": {
          "type": "array",
          "items": { "$ref": "#/$defs/medium" }
        },
        "hotspots": {
          "type": "array",
          "items": { "$ref": "#/$defs/hotspotFlat" }
        },
        "hotspots360": {
          "type": "array",
          "items": { "$ref": "#/$defs/hotspot360" }
        },
        "startYaw": {
          "type": "number",
          "minimum": -180,
          "maximum": 180
        },
        "startPitch": {
          "type": "number",
          "minimum": -90,
          "maximum": 90
        },
        "startPanX": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "dialog": { "$ref": "#/$defs/dialog" }
      }
    }
  }
}
```
