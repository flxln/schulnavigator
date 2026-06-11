# `public/stations/360/`

Equirectangular-Panoramen für den Sphere-Viewer (ADR-018). Eine Datei pro Station.

## Regeln

- **Dateiname:** `{slug}.webp` (bevorzugt) oder `{slug}.jpg`
- **Format:** Equirectangular 2:1 (Breite = doppelte Höhe), optimiert, **max. 4 MB**
- **Auflösung:** min. 4096×2048 px, besser 8192×4096 px für scharfe Darstellung
- **Kein Flat-Panorama** — dieser Ordner ist ausschließlich für echte 360°-Kugelprojektionen

## Aktueller Stand

| Slug | Status |
|------|--------|
| `musik` | Equirectangular 5376×2688 — Quelle `flat/musik/raw/009-360-Musikraum.JPG` |

## Produktionsvorbereitung

Echte Aufnahmen nach `auftraggeber/material/stationen-360-pano/equirect/{slug}/` ablegen
und per Export-Skript hierher kopieren (siehe `dokumentation/content-verzeichnisstruktur.md`).

Validierung läuft automatisch beim Build (`npm run validate:stations`).
