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
| `npm run validate:tokens` | Prüft `app/gs39-tokens.css` gegen `auftraggeber/.../colors_and_type.css` (lokal) bzw. `app/scripts/reference/colors_and_type.css` (Docker, nur `app/` als Kontext) — wird von `build` mitaufgerufen |
| `npm run validate:stations` | Prüft `bild`- und `quelle`-Pfade unter `public/`; warnt bei extremem Hotspot-**y** (Heuristik, sichtbarer Ausschnitt nach Auto-Zoom) — wird von `build` mitaufgerufen |
| `npm run generate:qr`  | QR-PNGs + `manifest.json` unter `public/qr/` (Issue #15); liest `.env` / `.env.local` wie dokumentiert in `scripts/load-env-local.mjs` |

---

## Verzeichnisstruktur (`app/`)

| Pfad               | Inhalt                                                        |
| ------------------ | ------------------------------------------------------------- |
| `app/app/`         | Next.js App Router (`page.tsx`, `eintritt/`, `scan/`, `raum/[slug]/`, `api/health`, `robots.ts`) |
| `components/`      | React-Komponenten (`PascalCase.tsx`); u. a. `schoolhouse/` (Startseite #14)   |
| `lib/`             | Hilfsfunktionen, Typen, Daten-Loader; u. a. `access-tokens.ts`, `scan-url.ts` (#23), `schoolhouse-segments.ts` (#14), `qr-urls.ts` (#15) |
| `middleware.ts`    | Zugangskontrolle: Cookie `sn_access`, Entry `?t=`, Redirect `/eintritt` (#23, ADR-007) |
| `data/`            | `stations.json` (Phase 1, Issue #12)                          |
| `public/stations/` | Raumbilder (`{slug}.jpg`)                                     |
| `public/qr/`       | generierte QR-PNGs + `manifest.json` (Issue #15; PNGs gitignored) |

Dateinamen für Nicht-Komponenten: `kebab-case` (siehe [`CLAUDE.md`](../CLAUDE.md)).

---

## Design-Tokens (GS39, Issue #55)

| Pfad | Rolle |
| ---- | ----- |
| `auftraggeber/material/UI-Vorschläge/colors_and_type.css` | Source of Truth (Auftraggeber, außerhalb Docker-Kontext) |
| `app/app/gs39-tokens.css` | App-Kopie der `:root`-Variablen |
| `app/lib/school-theme.ts` | `SCHOOL_ID = 'gs39'` (MVP eine Schule; später pro Mandant) |
| `app/scripts/reference/colors_and_type.css` | Referenzkopie für `validate:tokens` im Docker-Build |

Nach Änderungen an der Auftraggeber-CSS: `gs39-tokens.css` synchron halten und die Referenzkopie unter `scripts/reference/` aktualisieren. Komponenten nutzen semantische Tailwind-Klassen (`bg-accent`, `text-fg-1`, …), nicht direkte `--brand-*` in TSX. **Dark Mode** ist deaktiviert.

---

## Raumbilder für den Gyro-Viewer (#17 / #27)

Für Stationen mit `bild` in `stations.json` ([ADR-006](../dokumentation/adr/006-raum-viewer-gyro-hotspots.md), Issue **#55**):

Der Viewer skaliert **höhenbasiert** (`ROOM_VIEWER_HEIGHT_CSS` = `min(50vh, 360px)`). **Auto-Zoom** (`roomPanZoom` in `lib/raum-viewer/room-pan-zoom.ts`): Ist das Quellbild zu „hoch“ im Verhältnis zur Viewport-Breite, wird es so weit vergrößert, dass horizontal mindestens **`MIN_PAN_DISPLAY_RATIO` (2)** erreicht wird — Gyro hat dann Spielraum; **oben/unten** kann beschnitten werden (`visibleYNormalRange` in `clip-zone.ts`). Der äußere Rahmen hat **`touch-action: none`** und **`contain: layout paint style`**, damit Wischen nicht mit Pull-to-Refresh oder Browser-Gesten kollidiert.

| Anforderung | Empfehlung |
| ----------- | ---------- |
| Aufnahme | **Panorama** bevorzugt (≥ **2,5 : 1**), Konstante `RECOMMENDED_SOURCE_ASPECT_MIN` |
| 4:3 / 16:9 | In der App **nutzbar** (Auto-Zoom), Hotspot-**y** im **mittleren Drittel** — sonst Warnung in Konsole / `validate:stations` (Heuristik) |
| Pixel | **≥ 2400 px** Breite in der Quelldatei |
| Gyro-Konstanten | `lib/raum-viewer/constants.ts` — Feintuning: [raum-viewer-gyro-feintuning.md](./raum-viewer-gyro-feintuning.md) (`GYRO_FULL_RANGE_DEG` aktuell **60°** je Rand) |
| Pan-Achse | **Portrait:** `deviceorientation.alpha` (Armschwenk, zentrierter Neutral, `pan-from-orientation.ts`); **Landscape:** `gamma` (einseitig); Achswechsel → Neutral-Reset |
| Datei | `public/stations/{slug}.jpg` (oder WebP, Pfad in JSON) |
| Größe | WebP oder optimiertes JPG, Ziel max. ~500 KB (Phase 3 #27) |
| Ohne Foto | `bild` weglassen → statische Ansicht + Medienliste (z. B. `schulsozialarbeit` bis Panorama da ist) |

**Beispiel Smartphone** (~390 px Viewport-Breite, 360 px Viewer-Höhe): sinnvoller Pan ab ca. **2,2 : 1** Quellbild; **2,5 : 1** ist komfortabel (z. B. 2500×1000 px).

Zuordnung Foto ↔ Station: [`auftraggeber/material/stationen/zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md). Demo mit Hotspots: `/raum/musik` — Gyro auf dem iPhone nur unter **HTTPS** testen (siehe [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md)).

---

## Docker (lokal, Issue #10)

Build-Kontext ist das Verzeichnis `app/` (enthält `Dockerfile` und `.dockerignore`). Die Submodule **`auftraggeber/`** und **`protokolle/`** sind **nicht** Teil des Images — Agenten- und Architekturregeln: [`dokumentation/build-kontext-submodule-regeln.md`](../dokumentation/build-kontext-submodule-regeln.md).

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

Die App setzt **`robots.txt`** (`Disallow: /`) und **`noindex`** im Root-Layout (Phase 1, Issue #16), damit die Subdomain nicht in Suchmaschinen indexiert wird.

---

## Zugangskontrolle (Issue #23, ADR-005/007)

- **Token-Quelle:** [`app/lib/access-tokens.ts`](../app/lib/access-tokens.ts) — muss mit [`app/scripts/qr-config.mjs`](../app/scripts/qr-config.mjs) synchron bleiben (Vitest-Sync-Guard in `access-tokens.test.ts`).
- **Cookie:** `sn_access` (HttpOnly, `Secure` nur in Production, `SameSite=Lax`). Inhalt = Token-String; Ablauf/Modus werden bei jedem Request gegen die Token-Liste validiert.
- **Middleware:** [`app/middleware.ts`](../app/middleware.ts) — gültiges `?t=` → Cookie + Redirect `/`; ohne Cookie → `/eintritt` (`?reason=expired` wenn Token bekannt, aber abgelaufen).
- **Scanner:** `html5-qrcode` in `components/scan/qr-scanner.tsx`; gemeinsame Vollbild-Shell `components/scan/scan-fullscreen-shell.tsx` — Entry auf `/eintritt/scan` (`EintrittScanScreen`, `mode: entry`), Räume auf `/scan` (`ScanScreen`, `mode: room`); `parseEntryScan` / `parseRoomScan` in `lib/scan-url.ts` — Entry ohne Token-Whitelist im Client (#57, #82, ADR-008).

### Token pflegen / rotieren

1. `expiresAt` und ggf. neue Token-Strings in **`access-tokens.ts`** und **`qr-config.mjs`** eintragen (gleiche Strings).
2. `npm run test` (Sync-Guard) und `npm run build`.
3. `npm run generate:qr` mit korrekter `NEXT_PUBLIC_BASE_URL` → neue Entry-PNGs.
4. Deploy; alte Entry-QRs werden ungültig.

### Lokal testen (Zugang)

1. `npm run dev` — einmal Entry scannen: `http://localhost:3000/eintritt?t=fest-2026` (Cookie persistiert; `Secure` ist in Dev aus).
2. Ohne Cookie: `/` → Redirect `/eintritt`.
3. Cross-Tab: nach Entry neuen Tab mit `/raum/musik` öffnen — sollte erreichbar sein.
4. Modus-Wechsel: `/eintritt?t=heft-2026-27` überschreibt Cookie → voller Hub.

**Cookie zurücksetzen:** DevTools → Application → Cookies löschen, oder privates Fenster.

### Besuchs-Stempel (Issue #21, Nachtrag #83)

- **Speicher:** `localStorage` Key `sn_visited_slugs` — JSON-Array gültiger Slugs; **nicht** mit Cookie `sn_access` verwechseln.
- **Logik:** [`app/lib/visited-stations.ts`](../app/lib/visited-stations.ts), Freischaltung [`app/lib/hub-mode.ts`](../app/lib/hub-mode.ts) (`fest` = nur besuchte Segmente, `heft` = alle).
- **Markierung (`fest`):** nur bei erfolgreichem Raum-QR in [`app/components/scan/qr-scanner.tsx`](../app/components/scan/qr-scanner.tsx) (`markVisitedSlug` vor `router.push`).
- **Markierung (`heft`):** [`app/components/station-visit-recorder.tsx`](../app/components/station-visit-recorder.tsx) auf `/raum/[slug]` (einmal pro Mount); im `fest`-Modus ist der Recorder ein No-Op.
- **Hub-Navigation:** Gesperrte Stationen — Footer in `/raum/…` und isometrischer Hub führen zu `/scan`, nicht direkt in den Raum ([ADR-009 Nachtrag #83](../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-05-30--fest-freischaltung-nur-per-raum-qr-83)).
- **Startseiten-CTAs** ([ADR-009 Nachtrag CTAs](../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas)): [`home-screen.tsx`](../app/components/home/home-screen.tsx) steuert per [`getHomeFooterCta`](../app/lib/home-cta.ts) (`fest-split` | `fest-scan` | `heft-suggestion` | `none`). `fest` 1–10: [`home-fest-scan-cta.tsx`](../app/components/home/home-fest-scan-cta.tsx) (ein Button, beide Hälften → `/scan`). `heft`: Vorschlag in der Karte via [`next-station-row.tsx`](../app/components/raum/next-station-row.tsx); kein Scan-Button auf `/`. Nächste Station: [`getNextStation`](../app/lib/next-station.ts) (Home: erste unbesuchte; Footer: nächste unbesuchte nach `currentSlug`, ohne aktuellen Raum).
- **Hub:** [`schoolhouse-hub.tsx`](../app/components/schoolhouse/schoolhouse-hub.tsx) — `useVisitedStations`, Re-Read bei `storage`, `sn:visited`, `pageshow`, `visibilitychange`.
- **Zurücksetzen:** DevTools → Application → Local Storage → `sn_visited_slugs` löschen.

---

## Coolify — Schulnavigator (Issue #16)

### Preflight (vor erstem Build)

| Schritt | Beschreibung |
|---------|--------------|
| GitHub-Quelle | In Coolify unter **Settings → Source** prüfen, ob die **GitHub-App** Zugriff auf das private Repo `flxln/schulnavigator` hat. Ohne Zugriff schlägt der Clone fehl. **Submodule:** siehe Abschnitt unten *Fehler beim Clone: private Git-Submodule* — für den Docker-Build aus `app/` meist **Submodules in Coolify deaktivieren**. |
| DNS | **Wildcard** `*.mpz.schule` → **`217.154.120.240`** (Coolify-VPS) — deckt u. a. `schulnavigator.mpz.schule` ab; kein separater A-Record pro Subdomain nötig. Prüfen: `dig +short schulnavigator.mpz.schule` → VPS-IP |
| VPS-RAM | Optional per SSH: `ssh coolify-server` (Alias → `felixlein@217.154.120.240`, Key `~/.ssh/coolify-access`) und `free -h` — `npm run build` im Image kann speicherintensiv sein. |
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
# Erwartung ohne Cookie: 307/308 → /eintritt

curl -sSI https://schulnavigator.mpz.schule/raum/musik
curl -sSI https://schulnavigator.mpz.schule/scan
curl -sSI 'https://schulnavigator.mpz.schule/eintritt?t=fest-2026'
# Erwartung: Set-Cookie sn_access=… + Redirect /

curl -sS https://schulnavigator.mpz.schule/robots.txt
# Erwartung: Disallow: /
```

**Browser:** Entry `?t=fest-2026` → Puzzle-Hub gesperrt + `/scan`; `?t=heft-2026-27` → voller Hub; `/eintritt` ohne Cookie = Hinweis.

**Troubleshooting:** Antwort **`503`** / Text **`no available server`** → Proxy (Traefik) ist erreichbar, aber **kein laufender App-Container** hinter der Domain (Coolify-Application noch nicht deployed, Build fehlgeschlagen oder Container crashed) — in Coolify **Logs** und **Deployments** prüfen. **`curl: (60) SSL certificate problem`** → Zertifikatskette oder lokales Trust-Store; zur Abgrenzung im **Browser** öffnen oder Let's-Encrypt-Erneuerung in Coolify prüfen.

**Build schlägt fehl:** `Cannot find module '@tailwindcss/postcss'` (Next/Turbopack bei `globals.css`) — Coolify setzt beim Image-Build oft **`NODE_ENV=production`**. Dann installiert ein nacktes **`npm ci`** keine `devDependencies`, obwohl `next build` PostCSS/Tailwind-Plugins daraus braucht. Im Repo ist die **`deps`-Stage** im [`app/Dockerfile`](../app/Dockerfile) auf **`RUN npm ci --include=dev`** gestellt; nach Pull erneut deployen. Im Log zur Kontrolle: **hunderte** installierte Pakete in der deps-Stage, nicht nur ~20.

**Build schlägt fehl:** `validate:tokens: ENOENT … /auftraggeber/.../colors_and_type.css` — der Docker-Kontext ist nur [`app/`](../app/); `validate:tokens` nutzt dort [`app/scripts/reference/colors_and_type.css`](../app/scripts/reference/colors_and_type.css). Nach Änderungen an der Auftraggeber-Quelle die Referenzkopie mitpflegen und `gs39-tokens.css` synchron halten.

**Optional:** kostenloses Monitoring (z. B. UptimeRobot) auf `https://…/api/health`.

### Staging / Dev (Coolify-Projekt „Schulprojekte“)

Zweite Application für Tests vor Prod — **manuell** angelegt (Coolify erlaubt kein Kopieren einzelner Ressourcen innerhalb eines Projekts).

| | Prod | Dev |
|---|------|-----|
| Coolify-Name | `schulnavigator:main-…` | `schulnavigator:development-feature` |
| Application-UUID | `q1a8t4zswynvgutbw9og5l7n` | `jjgl5u105ucxjvbeuwflsjq4` |
| URL | `https://schulnavigator.mpz.schule` | `https://schulnavigator-dev.mpz.schule` |
| Branch (Stand 2026-05-28) | `main` | Feature-Branches für QA, z. B. `feat/raum-ui-dialog-topbar-chip-zentrieren` ([#72](https://github.com/flxln/schulnavigator/issues/72) / [PR #73](https://github.com/flxln/schulnavigator/pull/73)); nach Merge wieder **`main`** |

Build-Einstellungen wie Prod: Base **`/app`**, Dockerfile **`/Dockerfile`**, Port **`3000`**, Env `PORT=3000`, `NODE_ENV=production`.

**Feature-QA auf Dev:** Coolify → Application Dev → **Source → Branch** auf den PR-Branch stellen → **Redeploy**. Dialog-Test: `https://schulnavigator-dev.mpz.schule/eintritt?t=fest-2026`, dann `/raum/daz` (X neben Zurück, Chip zentriert). Siehe [`lokal-testen-und-anschauen.md`](lokal-testen-und-anschauen.md).

**Pflicht bei jeder neuen Application:** unter **Advanced** / **Build** → **Git Submodules deaktivieren** (sonst schlägt der Clone wegen privater Submodule in [`.gitmodules`](../.gitmodules) fehl — siehe Abschnitt unten).

**Submodule-Status per SSH prüfen:**

```bash
ssh coolify-server "docker exec coolify-db psql -U coolify -d coolify -t -A -c \
  \"SELECT a.name, s.is_git_submodules_enabled FROM applications a \
  JOIN application_settings s ON s.application_id = a.id \
  WHERE a.git_repository LIKE '%schulnavigator%';\""
```

Erwartung: `is_git_submodules_enabled` = `f` (false) für Prod und Dev.

**Smoke-Tests Dev:** Domain in den Befehlen aus dem Abschnitt *Smoke-Tests* durch `schulnavigator-dev.mpz.schule` ersetzen.

**Hinweis:** QR-Codes und `NEXT_PUBLIC_BASE_URL` bleiben auf der **Prod-Domain** — Dev ist nur für manuelles Testen im Browser/Handy.

### Rollback

In Coolify: **Application → Deployments** → stabiles vorheriges Image **Redeploy**. Kein manuelles SSH nötig für den Standardfall.

### QR-Codes mit Produktions-Domain

```bash
cd app
NEXT_PUBLIC_BASE_URL=https://schulnavigator.mpz.schule npm run generate:qr
```

Oder dauerhaft in `app/.env.local` setzen (nicht committen). Stichprobe: Raum-QR und Entry-QR mit dem Handy scannen.
