# ADR-014 — Dialog-Maskottchen: normierte Größe im Content-Schema

**Datum:** 2026-06-10  
**Status:** entschieden  
**Ergänzt:** [ADR-011](./011-dialog-mascot-hotspots.md) Punkt 2 (Rendering)

## Kontext

ADR-011 legte Maskottchen als Dialog-Hotspots im Panorama fest; die Bildgröße war fest in CSS (`h-[130px] sm:h-[150px]`) und skalierte nicht mit dem Viewer. Position (`x`, `y`) ist bereits normiert in `stations.json`. Die Produktions-Raumseite rendert den Viewer im **Hero-Layout** (`layout="hero"`), die Anzeigehöhe ist `effectiveDisplayH` (= `containerH × zoom`).

## Entscheidung

1. **Schema:** Optionales Feld `mascotSize` (0–1) am Dialog-Hotspot (`action: 'dialog'`). Semantik: Anteil von `effectiveDisplayH` — derselbe Bezug wie `y`.
2. **Default:** `DEFAULT_MASCOT_SIZE_NORM = 0.22` im Code (Startkandidat am Hero-Viewer; Feintuning am Gerät).
3. **Validator:** `0.05 ≤ mascotSize ≤ 1`; nur bei `action: 'dialog'`; bei Medien-Hotspots verboten.
4. **Rendering:** px-Höhe `mascotSize × effectiveDisplayH`, berechnet in JS und als Prop `containerHeight` an `HotspotOverlay` — **kein** CSS `height: %` am `<img>` (Prozent-Kette `li → button → img` ohne definite Eltern-Höhe).
5. **Laufzeit:** `resolveMascotSizeNorm()` clampt auf MIN/MAX (Schutz bei künftiger Directus-Quelle, ADR-003).
6. **Touch-Ziel:** Button `min-h-11 min-w-11` (44 px, ADR-011); Bild unten zentriert, Fußpunkt `translate(-50%, -100%)`.
7. **Spiegelung:** Optionales `mascotFlipX` (boolean) — horizontale Spiegelung (`scaleX(-1)`), Fußpunkt unverändert.
8. **Hotspot-y:** `y` ist **viewport-relativ** (0 = oberer sichtbarer Rand, 1 = unterer); Umrechnung via `hotspotImageY()` in `clip-zone.ts` — nicht auf volles Quellbild bezogen.

## Begründung

- Normierte Größe skaliert konsistent mit Position über Viewport und Zoom.
- CSS-Prozent am `<img>` würde auf intrinsische Größe zurückfallen — `mascotSize` wäre wirkungslos.
- Pixel in JSON würde bei Hero/Tablet brechen.

## Verworfene Alternativen

- **CSS `height: %` am `<img>`:** DOM-Kette ohne definite Höhe; Pre-Mortem blockiert.
- **Pixel in JSON:** nicht viewport-unabhängig.
- **`radius` als Größen-Proxy:** semantisch für Center-Hit, für Maskottchen ungenutzt.

## Konsequenzen

- `stations.json`: `daz`, `pc-raum` mit `mascotSize` pro Dialog-Hotspot.
- `content-einpflegen.md`: Feld dokumentiert; Größe gemeinsam mit `x`/`y` am Gerät justieren.
- Epic #78 (Breakpoint-Skalierung für Maskottchen) entfällt — normierte Größe ersetzt feste Breakpoints.
