# `public/stations/360/`

Equirectangular-Panoramen für den Sphere-Viewer (ADR-018). Eine Datei pro Station.

## Regeln

- **Dateiname:** `{slug}.webp` (bevorzugt) oder `{slug}.jpg`
- **Format:** Equirectangular 2:1 (Breite = doppelte Höhe), optimiert, **max. 12 MB**
- **Auflösung:** min. 4096×2048 px, besser 8192×4096 px für scharfe Darstellung
- **Kein Flat-Panorama** — dieser Ordner ist ausschließlich für echte 360°-Kugelprojektionen

## Aktueller Stand

| Slug | Status |
|------|--------|
| `klassenzimmer` | Equirectangular 5376×2688 |
| `daz` | Equirectangular 5376×2688 (Dialog-Maskottchen) |
| `pc-raum` | Equirectangular 5376×2688 (Dialog + Embed-Hotspot) |
| `werken` | Equirectangular 5376×2688 |
| `turnhalle` | Equirectangular 5376×2688 |
| `speiseraum` | Equirectangular 5376×2688 |
| `lesewelt` | Equirectangular 5376×2688 |
| `musik` | Equirectangular 5376×2688 (Medien-Hotspots) |
| `schulhof` | Equirectangular 5376×2688 |

Export: `node scripts/export-pano-equirect.mjs` (aus `app/`, macOS `sips`).

## Produktionsvorbereitung

Rohdateien unter `auftraggeber/material/stationen-360-pano/flat/{slug}/raw/*360*.JPG`;
freigegebene Exporte unter `auftraggeber/.../equirect/{slug}/export/`.

Validierung läuft automatisch beim Build (`npm run validate:stations`).
