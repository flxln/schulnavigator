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
| `npm run test`         | Vitest (u. a. Merge Schulhaus ↔ `stations.json`, Issue #14)   |
| `npm run validate:stations` | Prüft `bild`- und `quelle`-Pfade unter `public/` (wird von `build` mitaufgerufen) |
| `npm run generate:qr`  | QR-PNGs + `manifest.json` unter `public/qr/` (Issue #15); liest `.env` / `.env.local` wie dokumentiert in `scripts/load-env-local.mjs` |

---

## Verzeichnisstruktur (`app/`)

| Pfad               | Inhalt                                                        |
| ------------------ | ------------------------------------------------------------- |
| `app/app/`         | Next.js App Router (`page.tsx`, `eintritt/`, `scan/`, `raum/[slug]/`, `api/health`, `robots.ts`) |
| `components/`      | React-Komponenten (`PascalCase.tsx`); u. a. `schoolhouse/` (Startseite #14)   |
| `lib/`             | Hilfsfunktionen, Typen, Daten-Loader; u. a. `schoolhouse-layout.ts`, `schoolhouse-segments.ts` (#14), `qr-urls.ts` (#15, später #23) |
| `data/`            | `stations.json` (Phase 1, Issue #12)                          |
| `public/stations/` | Raumbilder (`{slug}.jpg`)                                     |
| `public/qr/`       | generierte QR-PNGs + `manifest.json` (Issue #15; PNGs gitignored) |

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

Der Container lauscht auf `0.0.0.0`; der Port ist über `PORT` konfigurierbar (Standard 3000). Coolify-Deploy: Issue #16 (Runbook unten).

Ohne laufenden Docker-Daemon: nach `npm run build` den Standalone-Server ausprobieren (entspricht dem Laufzeitverhalten im Image):

```bash
cd app/.next/standalone
PORT=3007 HOSTNAME=127.0.0.1 node server.js
```

`npm run start` meldet mit `output: 'standalone'` eine Hinweiszeile — im Container wird stattdessen `node server.js` verwendet.

---

## Deployment (Überblick)

Produktion: Multi-Stage-Image wie in [`app/Dockerfile`](../app/Dockerfile), Health-Check `GET /api/health`. Ziel-Hosting: **MPZ-Hetzner / Coolify** ([ADR-001](../dokumentation/adr/001-hosting-coolify.md)). Geplante öffentliche URL: **`https://schulnavigator.mpz.schule`**.

Die App setzt **`robots.txt`** (`Disallow: /`) und **`noindex`** im Root-Layout (Phase 1, Issue #16), damit die Subdomain nicht in Suchmaschinen indexiert wird; Feinabstimmung mit Middleware in Phase 2 (#23).

---

## Coolify — Schulnavigator (Issue #16)

### Preflight (vor erstem Build)

| Schritt | Beschreibung |
|---------|--------------|
| GitHub-Quelle | In Coolify unter **Settings → Source** prüfen, ob die **GitHub-App** Zugriff auf das private Repo `flxln/schulnavigator` hat. Ohne Zugriff schlägt der Clone fehl. **Submodule:** siehe Abschnitt unten *Fehler beim Clone: private Git-Submodule* — für den Docker-Build aus `app/` meist **Submodules in Coolify deaktivieren**. |
| DNS | **Wildcard** `*.mpz.schule` → **`217.154.120.240`** (Coolify-VPS) — deckt u. a. `schulnavigator.mpz.schule` ab; kein separater A-Record pro Subdomain nötig. Prüfen: `dig +short schulnavigator.mpz.schule` → VPS-IP |
| VPS-RAM | Optional per SSH: `ssh coolify-server` (siehe MPZ-Doku) und `free -h` — `npm run build` im Image kann speicherintensiv sein. |
| Lokaler Docker-Build | `cd app && docker build -t schulnavigator-app .` — bestätigt das Dockerfile, bevor Coolify baut (Docker-Daemon muss laufen). |

### Neue Application in Coolify

1. **Project** anlegen (z. B. „Schulnavigator“).
2. **New Resource → Application**; Quelle: GitHub-Repo `flxln/schulnavigator`, Branch `main`.
3. **Build** (Coolify zeigt u. a. **Base Directory** und **Dockerfile Location** — kein separates Feld „Build Context“.)

| Feld | Korrekter Wert | Häufiger Fehler |
|------|----------------|-----------------|
| Build Pack | `Dockerfile` | — |
| **Base Directory** | **`/app`** | Mit Base **`/`** und Dockerfile **`/Dockerfile`** sucht Coolify das Dockerfile im **Repo-Root** — dort liegt **kein** `Dockerfile` (es liegt unter `app/`). |
| **Dockerfile Location** | **`Dockerfile`** oder **`/Dockerfile`** (je nach Coolify-Version: relativ zum Base Directory; nur der Dateiname im Ordner `app/`) | **`/Dockerfile`** zusammen mit Base **`/`** ist für dieses Repo **falsch**. |

**Alternative**, wenn deine Coolify-Instanz den Build-Kontext immer auf das Repo-Root legt:

| Feld | Wert |
|------|------|
| **Base Directory** | `/` |
| **Dockerfile Location** | **`/app/Dockerfile`** (Pfad vom Repo-Root zum [`app/Dockerfile`](../app/Dockerfile)) |

Lokal entspricht Variante 1: `cd app && docker build -t schulnavigator-app .`

4. **Network / Domains**

| Feld | Wert |
|------|------|
| **Ports Exposes** | `3000` (muss mit `PORT` übereinstimmen) |
| **Domain** | `schulnavigator.mpz.schule` |
| **HTTPS** | aktiviert (Let's Encrypt; Wildcard-DNS `*.mpz.schule` muss auf den VPS zeigen) |

5. **Umgebungsvariablen:** `PORT=3000`, optional `NODE_ENV=production`.

6. **Health Check** (Coolify UI, bei Application-Typ): Pfad `/api/health`, erwarteter Status **200**. Zusätzlich enthält das Image einen Docker-`HEALTHCHECK` auf dieselbe URL.

7. **Deploy** auslösen und Build-Logs bis „Running“ verfolgen.

### Fehler beim Clone: private Git-Submodule

**Typische Logzeilen:** `fatal: could not read Username for 'https://github.com'` / `Failed to clone 'auftraggeber'` nach `git submodule update`.

**Ursache:** Das Repo [`/.gitmodules`](../.gitmodules) verweist auf **private** GitHub-Repos per HTTPS. Coolify klont zuerst das Hauptrepo, führt dann **`git submodule update`** aus — dafür gibt es **keine** Anmeldedaten für die Submodule-URLs.

**Wichtig:** Der **Docker-Build** nutzt nur den Ordner [`app/`](../app/) (`COPY . .` im `Dockerfile`). Die Submodule liegen **außerhalb** von `app/` und werden für das Image **nicht** benötigt.

**Lösung (empfohlen):** In Coolify bei der Application unter **Advanced** / **Build** die Option **Submodules** (o. ä.) **deaktivieren** — dann wird nur das Hauptrepo geklont, der Build aus `app/` kann normal laufen.

**Alternativen:** dieselbe **GitHub-App** (oder Deploy-Key) auch auf die Repos `schulnavigator-auftraggeber` und `schulnavigator-protokolle` mit Leserechten installieren; oder Submodule-URLs in `.gitmodules` auf **SSH/relative Pfade** umstellen (Coolify-Doku / GitHub-Org gleicher Owner).

### Smoke-Tests (nach Deploy)

Ersetze die Domain, falls abweichend.

```bash
curl -sS https://schulnavigator.mpz.schule/api/health
# Erwartung: {"status":"ok"}

curl -sSI http://schulnavigator.mpz.schule/ | head -5
# Erwartung: Redirect auf https://…

curl -sSI https://schulnavigator.mpz.schule/
curl -sSI https://schulnavigator.mpz.schule/raum/musik
curl -sSI https://schulnavigator.mpz.schule/scan
curl -sSI 'https://schulnavigator.mpz.schule/eintritt?t=fest-2026'

curl -sS https://schulnavigator.mpz.schule/robots.txt
# Erwartung: Disallow: /
```

**Browser:** `/`, zwei Stationen unter `/raum/…`, `/eintritt` (Platzhalter), `/scan`.

**Troubleshooting:** Antwort **`503`** / Text **`no available server`** → Proxy (Traefik) ist erreichbar, aber **kein laufender App-Container** hinter der Domain (Coolify-Application noch nicht deployed, Build fehlgeschlagen oder Container crashed) — in Coolify **Logs** und **Deployments** prüfen. **`curl: (60) SSL certificate problem`** → Zertifikatskette oder lokales Trust-Store; zur Abgrenzung im **Browser** öffnen oder Let's-Encrypt-Erneuerung in Coolify prüfen.

**Optional:** kostenloses Monitoring (z. B. UptimeRobot) auf `https://…/api/health`.

### Rollback

In Coolify: **Application → Deployments** → stabiles vorheriges Image **Redeploy**. Kein manuelles SSH nötig für den Standardfall.

### QR-Codes mit Produktions-Domain

```bash
cd app
NEXT_PUBLIC_BASE_URL=https://schulnavigator.mpz.schule npm run generate:qr
```

Oder dauerhaft in `app/.env.local` setzen (nicht committen). Stichprobe: Raum-QR und Entry-QR mit dem Handy scannen.
