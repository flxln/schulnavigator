# `public/stations/`

Raumbilder für den Gyro-Viewer. Eine Datei pro Station, Dateiname = Slug.

## Regeln

- **Dateiname:** `{slug}.jpg` — Slug aus der [kanonischen Slug-Liste](../../../dokumentation/content/verzeichnisstruktur.md)
- **Format:** optimiertes JPG (Kleinbuchstaben `.jpg`), **max. 10 MB**
- **Auflösung:** ≥ 2400 px Breite; Seitenverhältnis ≥ 2,5:1 für sinnvollen Gyro-Pan
- **Keine Originalaufnahmen** — Rohdateien gehören nach `auftraggeber/material/stationen-360-pano/flat/{slug}/raw/`

## Was hier nicht hingehört

Großbuchstaben-Endungen (`.JPG`, `.CR2`, `.DNG`, `.TIFF`, `.HEIC`) sind per `.gitignore` blockiert. Nur freigegebene, optimierte Exporte committen.

## Aktueller Stand (Juni 2026)

| Slug | Status | Quelle |
|------|--------|--------|
| `klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `lesewelt`, `musik` | Panorama 3:1 (4320×1440 exportiert) | `auftraggeber/.../flat/{slug}/export/` via `scripts/export-pano.mjs` |
| `kunst`, `hort` | 4:3-Platzhalter (kein Pano-Rohmaterial) | `auftraggeber/material/stationen/` |
| `schulsozialarbeit` | kein `bild` in `stations.json` — statische Ansicht bis Foto nachgeliefert | — |

Zuordnung Slug ↔ Rohfoto: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md)  
Gyro-Anforderungen: [`anleitungen/fuer-entwickler.md`](../../../anleitungen/fuer-entwickler.md) (Abschnitt „Raumbilder")  
ADR: [ADR-006](../../../dokumentation/adr/006-raum-viewer-gyro-hotspots.md)
