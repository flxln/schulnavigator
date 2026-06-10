# ADR-015 — Dialog-Sprechblase: Position und Größe im Content-Schema

**Datum:** 2026-06-10  
**Status:** entschieden  
**Ergänzt:** [ADR-010](./010-dialog-cutscene-gated-audio.md) (Dialog-Daten), [ADR-011](./011-dialog-mascot-hotspots.md) (eingebettete Blase), [ADR-013](./013-dialog-blase-mitpan.md) (horizontales Mitpan), [ADR-014](./014-mascot-size-json.md) (normierte Viewer-Bezüge)

## Kontext

Maskottchen sind seit ADR-014 per JSON positionier- und skalierbar (`x`, `y`, `mascotSize`, `mascotFlipX`). Die **Sprechblase** bleibt hardcodiert in [`DialogEmbeddedBubble`](../../app/components/dialog/dialog-embedded-bubble.tsx): feste `top`-Offset, `max-w-md`, `text-[15px]`, horizontale Verschiebung nur über ADR-013 (`bubbleOffsetX` aus Maskottchen-Mittelpunkt + Pan).

**Sprechen und Sprecherwechsel** laufen bereits über `dialog.segmente[]` (`rolle`, `text`, `quelle`, optional `gruppe`) — siehe ADR-010. Schwanzrichtung leitet sich aus `rolle` ab (`dialogTailSide` in `lib/dialog-display.ts`).

Ziel: Blase am Gerät nachjustieren können, ohne CSS-Deploy — analog zu Maskottchen und viewport-relativem `y`.

## Entscheidung (Vorschlag)

### 1. Neuer optionaler Block `dialog.bubble`

Nur auf Stationen mit `dialog`; eine Blase pro Dialog (nicht pro Hotspot).

```typescript
interface DialogBubbleLayout {
  /** Vertikale Position des Blasen-Ankers: 0 = oberer Rand der Hero-Box, 1 = unterer (Anteil der Box-Höhe containerH). */
  y?: number
  /** Horizontale Basisposition: 0 = links, 1 = rechts im Hero-Container. Fehlt → ADR-013 (Mitte + Mitpan aus Maskottchen-x). */
  x?: number
  /** Max. Breite als Anteil der Hero-Breite (containerW), 0,3–1. Default im Code. */
  maxWidth?: number
  /** Schriftgröße als Anteil der Hero-Box-Höhe (containerH, ResizeObserver), 0,02–0,06. Default im Code. */
  fontSize?: number
  /** Horizontales Mitpan bei gesetztem `x`. Default `true`. `false` = viewport-fixe x ohne Pan-Korrektur. */
  followPan?: boolean
}

interface Dialog {
  figuren: DialogFigure[]
  segmente: DialogSegment[]
  gruppen?: DialogGruppe[]
  bubble?: DialogBubbleLayout
}
```

### 2. Defaults (Code-Konstanten, nicht JSON)

| Feld | Default | Entspricht heute (ca.) |
|------|---------|-------------------------|
| `bubble.y` | `0.12` | `top: max(3rem, safe-area + 2.5rem)` |
| `bubble.x` | *(fehlt)* | zentriert + `bubbleOffsetX` (ADR-013) |
| `bubble.maxWidth` | `0.88` | `max-w-md` auf schmalem Phone |
| `bubble.fontSize` | `~0.037` | `text-[15px]` bei 400 px Box-Höhe |
| `bubble.followPan` | `true` | Mitpan aktiv (ersetzt ADR-013-Auto-Offset bei gesetztem `x`) |

Rendering: px-Werte aus `containerW` / **`containerH` (Box-Höhe, ResizeObserver)** in JS berechnen (wie `mascotSize`), **kein** CSS `%` an der Blase. Die Blase wird im `<section>`-Box positioniert (nicht in der gezoomten Bild-Ebene), daher ist `containerH` die korrekte Höhen-Referenz für `y`/`fontSize` — **nicht** `effectiveDisplayH`.

**Verbindliche Konventionen (vor dem Tunen):**

1. Referenz `y`/`fontSize` = Box-Höhe `containerH`; `maxWidth` = `containerW`. Nie `effectiveDisplayH`.
2. `followPan` **ersetzt** die ADR-013-Logik: bei gesetztem `x` addiert `followPan: true` nur den reinen Pan-Delta (`panPx`), nicht das maskottchen-zentrierte `bubbleOffsetX`. Kombiniertes `offsetX` einmal auf ±35 % `containerW` clampen.
3. Fehlender `bubble`-Block → JS-Layout umgehen, exakt heutiges CSS rendern (beweisbar regressionsfrei).
4. `fontSize`-Default an die 400-px-Box kalibrieren (`× 400 ≈ 15px`, daher ≈ `0.037`, nicht `0.022`).
5. Fallback wenn Viewer-Metriken fehlen (`panInfo === null` / `containerH <= 0`) → „kein-`bubble`"-Pfad, kein `NaN`.
6. Safe-Area erhalten: `top: max(${topPx}px, calc(env(safe-area-inset-top) + 2.5rem))`.

### 3. Horizontales Verhalten (ADR-013)

- **`bubble.x` fehlt:** unverändert — `bubbleOffsetX` aus Mittelwert der Dialog-Hotspot-`x` + `panPx`, geclampt auf ±35 % `containerW`.
- **`bubble.x` gesetzt:** Basis `baseOffsetX = (x − 0.5) × containerW` (Blase auf diesem Punkt zentriert). `followPan` **ersetzt** die ADR-013-Auto-Zentrierung — sie addieren sich nicht:
  - `followPan: true` → `offsetX = clamp(baseOffsetX + panPx)` (reiner Pan-Delta, **nicht** `bubbleOffsetX`), damit Blase und Szene beim Gyro zusammenbleiben.
  - `followPan: false` → `offsetX = baseOffsetX` (viewport-fix).

Begründung: `bubbleOffsetX` ist eine maskottchen-zentrierte Absolutverschiebung (±35 % `containerW`), kein kleiner Pan-Delta — ein Aufaddieren auf `baseOffsetX` würde doppelt zählen und die Blase aus dem Bild schieben.

### 4. Sprecherwechsel — unverändert + optionales Override

Bestehend (kein Schema-Bruch):

| Feld | Ort | Wirkung |
|------|-----|---------|
| `segmente[].rolle` | Segment | Playlist, Highlight Maskottchen, Default-Schwanz |
| `segmente[].text` / `gruppe` | Segment | Anzeigetext |
| `segmente[].quelle` | Segment | Audio |

**Neu (optional):** `segmente[].tail?: 'left' | 'right' | 'center'` — überschreibt `dialogTailSide(rolle)` für dieses Segment (z. B. `beide` mit Schwanz links).

### 5. Validator

- `bubble` nur wenn `station.dialog` existiert.
- `0 ≤ bubble.y ≤ 1`, `0 ≤ bubble.x ≤ 1` (wenn gesetzt).
- `0.3 ≤ bubble.maxWidth ≤ 1`, `0.02 ≤ bubble.fontSize ≤ 0.06`.
- `tail` nur auf `segmente[]`, Enum `left` \| `right` \| `center`.

### 6. Beispiel `stations.json`

```json
"dialog": {
  "figuren": ["frieda", "otto"],
  "bubble": {
    "y": 0.1,
    "maxWidth": 0.92,
    "fontSize": 0.024
  },
  "gruppen": [{ "id": "gruesse", "text": "Hello! · Hola! · …" }],
  "segmente": [
    {
      "id": "d1",
      "rolle": "frieda",
      "quelle": "/api/dialog/daz/01-frieda.wav",
      "text": "Hallo, willkommen …"
    },
    {
      "id": "d3",
      "rolle": "beide",
      "tail": "center",
      "quelle": "/api/dialog/daz/03-frieda.wav",
      "text": "Hello!",
      "gruppe": "gruesse"
    }
  ]
}
```

## Begründung

- **Ein Bezugssystem:** `y` und Größen normiert an der Hero-Box (`containerH` / `containerW`, ResizeObserver) — Content-Pflege mit einer Koordinaten-Logik. Hinweis: die Blase liegt im `<section>`-Box, daher `containerH` (nicht `effectiveDisplayH` wie bei den Maskottchen in der Bild-Ebene).
- **Rückwärtskompatibel:** fehlender `bubble`-Block = heutiges Verhalten via Code-Defaults.
- **Sprecherwechsel nicht duplizieren:** `segmente` bleibt Single Source of Truth; nur Layout kommt in `bubble`.
- **ADR-013 erhalten:** Mitpan ist UX-kritisch; optionales `x` ergänzt, ersetzt Auto-Offset nicht blind.

## Verworfene Alternativen

- **`bubble` pro Hotspot:** es gibt nur eine sichtbare Blase; Redundanz und Konflikte zwischen Frieda/Otto-Hotspots.
- **Pixel in JSON (`topPx`, `widthPx`):** bricht auf Tablet/Hero und Zoom (gleiches Argument wie ADR-014).
- **Nur CSS/Tailwind-Klassen in JSON:** nicht typisiert, schwer zu validieren, Directus-unfreundlich.
- **Blase in Panorama-Ebene (wie Maskottchen):** höherer Aufwand, Safe-Area/TopBar-Kollision; Hero-Overlay bleibt passender für Lesbarkeit.

## Konsequenzen

| Bereich | Änderung |
|---------|----------|
| `lib/types.ts` | `DialogBubbleLayout`, `Dialog.bubble`, `DialogSegment.tail?` |
| `lib/validate-stations.ts` | Validierung `bubble`, `tail` |
| `lib/dialog-display.ts` | `resolveTail(segment)` mit Override |
| `lib/dialog-bubble-layout.ts` (neu) | Defaults, Clamp, px-Auflösung |
| `dialog-embedded-bubble.tsx` | optionale `layoutPx`-Props (`topPx`, `maxWidthPx`, `fontSizePx`) + `offsetX`; `null` → heutiges CSS unverändert (Konvention 3) |
| `raum-station-client.tsx` | `containerW`/`containerH` an Blase; horizontale Position nach Konvention 2 (`followPan` ersetzt `bubbleOffsetX`); Fallback bei `panInfo === null` |
| `content-einpflegen.md` | Abschnitt Dialog-Blase + `segmente` |
| `stations.json` | optional `bubble` für `daz`, `pc-raum` nach Feintuning |

**Implementierungsreihenfolge (Vorschlag):** (1) Types + Validator + Defaults ohne JSON-Werte, (2) Größe (`maxWidth`, `fontSize`), (3) `y`, (4) `x` + Mitpan-Tests, (5) `segmente[].tail`, (6) Doku + Demo-Werte.

