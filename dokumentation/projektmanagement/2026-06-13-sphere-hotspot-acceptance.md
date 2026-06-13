# Sphere-Hotspot — Soll-Abnahme (Referenz)

**Stand:** 2026-06-13  
**Zweck:** Reproduzierbare Vergleichspunkte nach CSS-/PSV-/Größen-Änderungen.

## Ablauf pro Station

1. `npm run dev` → Route öffnen
2. `focusHotspot(id)` in DevTools-Konsole (über Viewer-Ref) oder manuell zur Position drehen
3. Screenshot Desktop + iPhone Safari (HTTPS)
4. Dialog starten (Maskottchen): Bubble neben Kopf, kein Flackern beim Sprecherwechsel

## Stationen

### daz (Gate)

| id | yaw | pitch | bubblePitchOffset | Erwartung |
|----|-----|-------|-------------------|-----------|
| hs-frieda | 6 | −30 | 14 | Fuß auf Boden vor Sitzgruppe |
| hs-otto | −14 | −28 | 14 | Fuß auf Boden, gespiegelt |

Route: `/raum/daz`

### pc-raum

| id | yaw | pitch | Notiz |
|----|-----|-------|-------|
| hs-frieda | −20 | −20 | links im Raum |
| hs-otto | 18 | −20 | rechts im Raum |
| hs-delightex | −2 | 2 | Icon an Tafel/Station |

Route: `/raum/pc-raum`

### klassenzimmer

| id | yaw | pitch |
|----|-----|-------|
| hs-text | −32 | −4 |
| hs-video | −18 | 0 |
| hs-audio | 4 | −8 |
| hs-foto | 28 | −2 |

Route: `/raum/klassenzimmer`

### musik

| id | yaw | pitch |
|----|-----|-------|
| hs-video | −28 | −12 |
| hs-audio | 22 | −10 |

Route: `/raum/musik`

## Regression Flat

`/raum/kunst` — Gyro-Pan, keine `hotspots360`, unverändert.

## Kalibrier-Tool

`/raum/daz?hotspot-calib=1` — Klick liefert `yaw`/`pitch` + `textureX`/`textureY`; JSON-Snippet kopieren.
