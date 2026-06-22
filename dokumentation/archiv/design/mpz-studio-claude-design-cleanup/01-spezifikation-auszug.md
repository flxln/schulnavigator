# Spezifikation — Auszug (Snapshot 2026-06-22)

Kurzfassung aus [`dokumentation/spezifikationen/mpz-studio.md`](../../spezifikationen/mpz-studio.md). Volltext im Repo.

---

## Leitplanken

| Regel | Umsetzung |
|-------|-----------|
| Nur für MPZ | Route `/mpz/*`, nur `NODE_ENV=development` |
| Lokal schreiben | API → Repo-Dateien; **kein** Studio auf Coolify |
| Single Source of Truth | Validatoren nach jedem Save |
| Plan A Fallback | CLI + JSON bleibt kritisch |

---

## Informationsarchitektur (Soll laut Spec)

```
/mpz/studio
├── Dashboard
├── Stationen
│   └── /stationen/[slug]
│       ├── Stammdaten
│       ├── Medien
│       ├── Hotspots
│       ├── Dialog
│       └── Vorschau
├── Coach
├── Embeds & Links
├── Design & Hub          ← Brand + Hub-Karte zusammengelegt (Route /mpz/studio/design)
└── Deploy
```

**Design & Hub:** „Brand & Design“ und „Hub-Karte“ werden zu **einem** Sidebar-Punkt unter der Route `/mpz/studio/design` zusammengelegt (alte Pfade `/hub`, `/brand` per Redirect). Entscheidung 3.5 — siehe [`ROADMAP.md`](./ROADMAP.md) (Abschnitt „Pre-Mortem-Härtung“).

**Dialog-Audio** gehört **nicht** in die Sidebar — nur im Tab Dialog pro Segment-Zeile (`15-dialog-segment-zeilenmodell.md`).

**Cleanup-Aufgabe:** Ist-Navigation (9 flache Punkte, Dialog-Audio doppelt) an sinnvolle IA anpassen — Spec als Referenz, nicht als starres Korsett.

---

## Medien (`medien[]`) — alle 6 Typen

| `typ` | Pflichtfelder | Upload/Auto |
|-------|---------------|-------------|
| `audio` | id, untertitel, quelle | → `media/{slug}/audio/` |
| `video` | quelle | videoSource optional (Default `upload`), MP4 oder YouTube |
| `foto` | quelle | → `fotos/` |
| `text` | quelle | → `texte/` |
| `link` | quelle (HTTPS), openIn | URL |
| `embed` | quelle, embedAllow[] | Allowlist-Check |

Zusatz v2.1: Datei ersetzen, Thumbnail/Poster-Upload.

---

## Hotspots

- **Medien-Hotspot:** mediumId, x/y (flat) oder yaw/pitch (360°)
- **Dialog-Hotspot:** action dialog, mascot
- **Flat-Kalibrierung:** `/mpz/calib/flat/{slug}`
- **Sphere-Kalibrierung (geplant):** `/mpz/calib/sphere/{slug}` — symmetrisch zu Flat; siehe [`16-sphere-calib-screen.md`](./16-sphere-calib-screen.md)
- **Sphere (Ist):** `?hotspot-calib=1` in Besucher-App — wird durch Studio-Screen ersetzt

---

## Dialog (daz, pc-raum)

| Block | Inhalt |
|-------|--------|
| `figuren[]` | frieda, otto |
| `segmente[]` | id, rolle, text, quelle, gruppe, tail |
| `gruppen[]` | Gruppentexte |
| `bubble` | y, x, maxWidth, fontSize, followPan |

WAV: `01-frieda.wav` → `quelle: "/api/dialog/{slug}/01-frieda.wav"`

---

## Coach (global)

| Trigger | Zusatz |
|---------|--------|
| `hub-milestone` | milestone 0–12 |
| `hub-complete` | — |
| `room-first` | slug |

Felder: id, mascot, placement, text, modes.

---

## Querschnitt-Module

| Modul | Datei(en) |
|-------|-----------|
| Embeds | `app/data/embed-allowlist.json` |
| Hub | `app/data/hub-slug-map.json`, Akzente, Icons |
| Brand | `app/public/brand/` |
| Deploy | Env, QR, Token, validate-all |

---

## Phasierung (Kontext)

- **v0–v2.1:** umgesetzt (2026-06-20)
- **v3 Polish:** optional (Inline-Markdown, visuelle Bubble-Position, Batch-Import)

Dieses Design-Paket adressiert **Aufräumen der v2.1-UI**, nicht v3-Features.
