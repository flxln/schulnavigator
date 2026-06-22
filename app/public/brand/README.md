# Brand-Assets (GS39 Jubiläum 2026)

Statische Marken-Dateien für den Schulnavigator. Werden **versioniert und committed** — sie müssen im Coolify-Docker-Build unter `app/public/` liegen (Submodule `auftraggeber/` ist im Image nicht verfügbar).

## Git-Policy

| Ordner | Policy |
|--------|--------|
| `logos/` | **Committed** — stabil, klein (SVG) |
| `motifs/` | **Committed**, sobald PNGs vom Auftraggeber vorliegen; bis dahin nur README + CSS-Fallback in `sn-theme.css` |
| `mascots/` | **Committed** — Frieda/Otto (Alpha-PNG) für Dialog-Hotspots im Raumbild ([ADR-011](../../dokumentation/adr/011-dialog-mascot-hotspots.md)) |
| `hotspot-icons/` | **Committed** — Typ-Presets (audio, video, foto, text) für Medien-Hotspots ohne eigenes `icon` ([ADR-017](../../dokumentation/adr/017-externe-medien-hotspot-marker.md)) |

Nicht in `.gitignore` aufnehmen.

## Quelle

Kopiert bzw. abgeleitet aus:

`auftraggeber/Virtueller Schulrundgang/assets/`

Design-System-Doku: `auftraggeber/material/UI-Vorschläge/UI-vorschlag-website.md`

## Verwendung in der App

- Logos: `/brand/logos/jubilaeum-lockup.svg`, `/brand/logos/badge.svg` (Next.js `public/`-Pfad)
- Motive: `/brand/motifs/…` (wenn vorhanden)
- Maskottchen: `/brand/mascots/frieda.png`, `/brand/mascots/otto.png`
- Hotspot-Presets: `/brand/hotspot-icons/audio.svg`, `video.svg`, `foto.svg`, `text.svg`, `link.svg`, `embed.svg`
- Farben/Typo: CSS-Variablen in `app/gs39-tokens.css`, nicht direkte Hex-Werte in TSX

## Pflege

Bei Aktualisierung durch die Schule: Dateien hier ersetzen, Commit im Hauptrepo, erneut deployen. Submodule allein reichen nicht für Production.

**MPZ Studio (lokal, #180):** [`/mpz/studio/design?tab=brand`](../../anleitungen/fuer-entwickler.md) — slot-basiertes Ersetzen der Dateien unten.

### Upload-Slots (Studio)

| Slot-ID | Ziel |
|---------|------|
| `logo-jubilaeum-lockup` | `/brand/logos/jubilaeum-lockup.svg` |
| `logo-badge` | `/brand/logos/badge.svg` |
| `logo-mpz` | `/brand/logos/mpz-logo.png` |
| `mascot-frieda` | `/brand/mascots/frieda.png` |
| `mascot-otto` | `/brand/mascots/otto.png` |
| `motif-bunting` | `/brand/motifs/bunting.png` |
| `motif-balloons` | `/brand/motifs/balloons.png` |
| `motif-heart-sparkles` | `/brand/motifs/heart-sparkles.png` |

Hotspot-Preset-Icons (`hotspot-icons/`) und Hub-SVG (`hub/`) werden nicht über das Studio ersetzt.
