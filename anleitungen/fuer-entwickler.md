# Schulnavigator — Entwickler-Dokumentation

_Setup, lokale Entwicklung, Deployment._

---

## Voraussetzungen

- **Node.js** 20 LTS oder neuer
- **npm** (mit Node mitgeliefert)

---

## Lokales Setup

```bash
cd app
npm install
npm run dev
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).

---

## Umgebungsvariablen

Vorlage: [`app/.env.example`](../app/.env.example) nach `app/.env.local` kopieren und Werte setzen.

`.env.local` ist git-ignoriert und wird nicht ins Repository committet.

---

## Wichtige Skripte

Alle Befehle im Verzeichnis `app/` ausführen.

| Skript                 | Beschreibung                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Lokaler Entwicklungsserver       |
| `npm run build`        | Produktions-Build                |
| `npm run start`        | Produktionsserver (nach `build`) |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Prettier (Dateien überschreiben) |
| `npm run format:check` | Prettier nur prüfen              |

---

## Verzeichnisstruktur (`app/`)

| Pfad               | Inhalt                                                               |
| ------------------ | -------------------------------------------------------------------- |
| `app/app/`         | Next.js App Router (`page.tsx`, `layout.tsx`, später `raum/[slug]/`) |
| `components/`      | React-Komponenten (`PascalCase.tsx`)                                 |
| `lib/`             | Hilfsfunktionen, Typen, Daten-Loader                                 |
| `data/`            | `stations.json` (Phase 1, Issue #12)                                 |
| `public/stations/` | Raumbilder (`{slug}.jpg`)                                            |
| `public/qr/`       | generierte QR-Codes (Phase 1, Issue #15)                             |

Dateinamen für Nicht-Komponenten: `kebab-case` (siehe [`CLAUDE.md`](../CLAUDE.md)).

---

## Deployment

Multi-Stage-Dockerfile und Coolify folgen in Phase 1 (Issues #10 und #16). Health-Check: `GET /api/health`.
