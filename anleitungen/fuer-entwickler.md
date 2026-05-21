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

**Lokal testen und Screens durchklicken:** [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md) (Demo-Routen, Build wie Produktion, Checkliste).

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
| `npm run validate:stations` | Prüft `bild`- und `quelle`-Pfade unter `public/` (wird von `build` mitaufgerufen) |

---

## Verzeichnisstruktur (`app/`)

| Pfad               | Inhalt                                                        |
| ------------------ | ------------------------------------------------------------- |
| `app/app/`         | Next.js App Router (`page.tsx`, `raum/[slug]/`, `api/health`) |
| `components/`      | React-Komponenten (`PascalCase.tsx`)                          |
| `lib/`             | Hilfsfunktionen, Typen, Daten-Loader                          |
| `data/`            | `stations.json` (Phase 1, Issue #12)                          |
| `public/stations/` | Raumbilder (`{slug}.jpg`)                                     |
| `public/qr/`       | generierte QR-Codes (Phase 1, Issue #15)                      |

Dateinamen für Nicht-Komponenten: `kebab-case` (siehe [`CLAUDE.md`](../CLAUDE.md)).

---

## Docker (lokal, Issue #10)

Build-Kontext ist das Verzeichnis `app/` (enthält `Dockerfile` und `.dockerignore`).

```bash
cd app
docker build -t schulnavigator-app .
docker run --rm -p 3000:3000 -e PORT=3000 schulnavigator-app
```

Prüfen:

- Health: `curl -s http://localhost:3000/api/health`
- Station: `curl -sI http://localhost:3000/raum/musik`

Der Container lauscht auf `0.0.0.0`; der Port ist über `PORT` konfigurierbar (Standard 3000). Coolify-Deploy: Issue #16.

Ohne laufenden Docker-Daemon: nach `npm run build` den Standalone-Server ausprobieren (entspricht dem Laufzeitverhalten im Image):

```bash
cd app/.next/standalone
PORT=3007 HOSTNAME=127.0.0.1 node server.js
```

`npm run start` meldet mit `output: 'standalone'` eine Hinweiszeile — im Container wird stattdessen `node server.js` verwendet.

---

## Deployment (Überblick)

Produktion: Multi-Stage-Image wie in [`app/Dockerfile`](../app/Dockerfile), Health-Check `GET /api/health`. Erstes Hosting auf MPZ/Coolify: Issue #16.
