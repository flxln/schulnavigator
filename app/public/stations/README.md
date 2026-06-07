# `public/stations/`

Raumbilder für den Gyro-Viewer. Eine Datei pro Station, Dateiname = Slug.

## Regeln

- **Dateiname:** `{slug}.jpg` — Slug aus der [kanonischen Slug-Liste](../../../dokumentation/content-verzeichnisstruktur.md)
- **Format:** optimiertes JPG (Kleinbuchstaben `.jpg`), **max. 500 KB**
- **Auflösung:** ≥ 2400 px Breite; Seitenverhältnis ≥ 2,5:1 für sinnvollen Gyro-Pan
- **Keine Originalaufnahmen** — Rohdateien gehören nach `auftraggeber/material/stationen-360-pano/flat/{slug}/raw/`

## Was hier nicht hingehört

Großbuchstaben-Endungen (`.JPG`, `.CR2`, `.DNG`, `.TIFF`, `.HEIC`) sind per `.gitignore` blockiert. Nur freigegebene, optimierte Exporte committen.

## Aktueller Stand

Alle 11 Stationen als 4:3-Platzhalter vorhanden. Panorama-Exporte (≥ 2,5:1) werden sukzessive nachgeliefert (Issue #17).

Zuordnung Slug ↔ Rohfoto: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md)  
Gyro-Anforderungen: [`anleitungen/fuer-entwickler.md`](../../../anleitungen/fuer-entwickler.md) (Abschnitt „Raumbilder")  
ADR: [ADR-006](../../../dokumentation/adr/006-raum-viewer-gyro-hotspots.md)
