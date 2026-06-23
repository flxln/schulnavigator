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

**Content einpflegen (JSON + Dateien, Hotspots):** [content-einpflegen.md](./content-einpflegen.md).

**MPZ Studio (optional, nur `development`):** [ADR-022](../dokumentation/adr/022-mpz-studio-internes-ingest-tool.md) — internes Ingest-Tool unter `/mpz/studio` (Dashboard, Stationen-Detail mit Tabs, Coach, Embeds, Hub, Brand, Deploy). Siehe Abschnitt [MPZ Studio](#mpz-studio-lokal-adr-022) unten. Epic v2 [#170](https://github.com/flxln/schulnavigator/issues/170) abgeschlossen; v2.1 [#186](https://github.com/flxln/schulnavigator/issues/186) Medien-Datei ersetzen + Thumbnail/Poster abgeschlossen.

---

## MPZ Studio (lokal, ADR-022)

Nur bei `NODE_ENV=development` erreichbar; in Production liefern `/mpz/*` und `/api/mpz/*` **404**. Nicht auf Coolify deployen oder Secrets in Prod setzen.

1. In `app/.env.local`: `SN_MPZ_STUDIO_SECRET` setzen (siehe `.env.example`).
2. Dev-Server starten: `npm run dev`.
3. Browser: [`/mpz/unlock`](http://localhost:3000/mpz/unlock) — Secret eingeben → Session-Cookie.
4. [`/mpz/studio`](http://localhost:3000/mpz/studio) — Dashboard mit Validierungsstatus und Links zu allen 12 Stationen.
5. **Station-Detail (v1 #158, v2 #171–#176, v2.1 #187–#189):** [`/mpz/studio/stationen`](http://localhost:3000/mpz/studio/stationen) → Kachel **Bearbeiten** oder direkt [`/mpz/studio/stationen/{slug}`](http://localhost:3000/mpz/studio/stationen/kunst) — Tabs **Stammdaten**, **Medien**, **Hotspots**, **Dialog** (Tab Dialog bei allen Hub-Stationen; ohne `dialog`-Block: Empty-State „Dialog hinzufügen“, #199).
6. **Querschnitt (v2 #174–#180):** Coach, Embeds & Links, Hub-Karte, Brand & Design, Deploy — jeweils eigene Navigationspunkte in der Studio-Shell.

**Station-Detail (#159–#176)**

Route: `/mpz/studio/stationen/[slug]?tab={stammdaten|medien|hotspots|dialog}` (Default: `stammdaten`). Shell: [`StationDetailShell`](../app/components/mpz-studio/station-detail-shell.tsx). Medien-Upload nur über Tab **Medien** (Modal). Legacy-Routen `/mpz/studio/ingest` und `/mpz/studio/dialog-audio` leiten um (#198).

| Tab | UI | Schreib-API |
|-----|-----|-------------|
| Stammdaten | `titel`, `beschreibung`, `viewer`; read-only: `slug`; Raumbild-Upload Flat/360° (#173) | `PATCH …/stammdaten`; `POST …/raumbild` |
| Medien | Tabelle, Bearbeiten (PATCH #171), Datei ersetzen (#188), Thumbnail/Poster hochladen (#189), link/embed anlegen (#172, Modal), Entfernen (#161) | `PATCH`/`POST`/`DELETE` …/medien; `POST` …/file`, `…/thumbnail`, `…/poster`; `POST /api/mpz/media/ingest` |
| Hotspots | Tabelle, Anlegen/Bearbeiten/Entfernen inkl. Dialog-Hotspot (#176), Kalibrier-Links (#162, #165–#168) | `POST`/`PATCH`/`DELETE` …/hotspots |
| Dialog | Figuren, Segmente, Gruppen, `bubble` (#175); anlegen/entfernen (#199); Dialog-WAV-Upload im Studio folgt #200 — bis dahin CLI/curl | `POST`/`DELETE` …/dialog; `PATCH`/`POST`/`DELETE` …/dialog/*; `POST /api/mpz/dialog-audio/ingest` |

**Stammdaten-Flow:** Formular sendet partielles JSON (`titel`, `beschreibung`, `viewer`). Domain: [`patchStationStammdaten`](../app/lib/mpz-station-stammdaten.ts) in `withMpzWriteLock` → `writeStations({ strict: true, postValidate: true })`. Bei Erfolg: `markMpzStudioDirty()` → `validateNow()` → `router.refresh()`. `viewer`-Wechsel mit bestehenden Hotspots zeigt Warnung; blockierende Konstellationen werden serverseitig abgelehnt.

**Lesen:** `GET /api/mpz/stations/[slug]` liefert die Station für das Detail-Formular (serverseitig beim ersten Render aus `readStations()`).

**Plan A (Pflicht + Fallback):** CLI und manuelles JSON ([content-einpflegen.md](./content-einpflegen.md)) bleiben für den Projekttag maßgeblich.

**API (Auswahl):**

- `POST /api/mpz/view/sphere` — Body `{ slug, startYaw, startPitch }` schreibt den Sphere-Startblick in `stations.json` (#153, ADR-023).
- `POST` / `PATCH` / `DELETE` `/api/mpz/stations/[slug]/hotspots` bzw. `…/hotspots/[hotspotId]` — Hotspot anlegen (#165), bearbeiten (#167), entfernen (#162). Fehler-Mapping: `NOT_FOUND` → 404; Client-Domain-Codes (`DUPLICATE_ID`, `INVALID_COORDS`, …) → 400; `NOT_EDITABLE` nur bei PATCH → 403 (#168).
- `PATCH /api/mpz/stations/[slug]/stammdaten` — Stammdaten (`titel`, `beschreibung`, `viewer`) (#160).
- `POST /api/mpz/stations/[slug]/raumbild` — Raumbild Flat oder 360° (#173, `public/stations/` bzw. `public/stations/360/`). **POST** `multipart/form-data`: `variant` (`flat` \| `pano360`), `file`, optional `collision` (`reject` \| `replace`, Default `reject`). Erfolg **200** `{ path, variant }`. `MISSING_FILE`, `MISSING_FIELDS` → **400**; `VALIDATION` → **422**; `COLLISION` → **409**.
- `PATCH /api/mpz/stations/[slug]/medien/[mediumId]` — Medien-Metadaten (#171). Felder typabhängig (`untertitel`, `thumbnail`, `poster`, `videoSource`, `quelle`, `openIn`, `embedAllow`); `id`/`typ` nicht patchbar. `INVALID_JSON` / `INVALID_BODY` / `NO_FIELDS` → **400**; `NOT_FOUND` → **404**; Domain (`FIELD_NOT_ALLOWED`, `INVALID_QUELLE`, …) → **422**.
- `POST /api/mpz/stations/[slug]/medien` — link/embed anlegen (#172). Body `{ id, typ: 'link'|'embed', quelle, … }`. `INVALID_TYP`, `INVALID_ID`, `DUPLICATE_ID` → **400**; `INVALID_QUELLE`, `INVALID_EMBED_ALLOW`, … → **422**.
- `DELETE /api/mpz/stations/[slug]/medien/[mediumId]` — Medium entfernen (#161).
- `POST /api/mpz/stations/[slug]/medien/[mediumId]/file` — Mediendatei ersetzen bei gleicher `medium.id` (#187, v2.1). **POST** `multipart/form-data`: `file` (Pflicht). Domain: [`mpz-medium-replace.ts`](../app/lib/mpz-medium-replace.ts). Erfolg **200** `{ medium, quelle, previousQuelle, fileReplaced, previousFileDeleted, mtime, validation? }`. `MISSING_FILE` → **400**; `NOT_FOUND` → **404**; `FIELD_NOT_ALLOWED` (link/embed/YouTube) / `VALIDATION` → **422**; `IO` → **500**.
- `POST /api/mpz/stations/[slug]/medien/[mediumId]/thumbnail` — Thumbnail-Bild hochladen (#189, v2.1). **POST** `multipart/form-data`: `file` (Pflicht). Domain: [`mpz-medium-asset-upload.ts`](../app/lib/mpz-medium-asset-upload.ts) mit `UPLOAD_RULES.foto` → `/media/{slug}/fotos/…`. Erfolg **200** `{ medium, field, path, previousPath, previousFileDeleted, mtime, validation? }`. Für alle `MediumTyp`-Werte. `MISSING_FILE` → **400**; `NOT_FOUND` → **404**; `VALIDATION` → **422**; `IO` → **500**.
- `POST /api/mpz/stations/[slug]/medien/[mediumId]/poster` — Poster-Bild hochladen (#189, v2.1). Wie Thumbnail, nur `typ: video` (unabhängig von `videoSource`, auch YouTube). `FIELD_NOT_ALLOWED` bei anderen Typen → **422**.
- `POST` / `DELETE` `/api/mpz/stations/[slug]/dialog` — Dialog-Block anlegen bzw. entfernen (#199). **POST** legt `{ figuren: ['frieda','otto'], segmente: [], gruppen: [] }` an. **DELETE** entfernt den Block; `DIALOG_IN_USE` wenn Dialog-Hotspots existieren → **400**.
- `PATCH /api/mpz/stations/[slug]/dialog` — `figuren`, `bubble` (#175).
- `POST` / `PATCH` / `DELETE` `/api/mpz/stations/[slug]/dialog/segmente` bzw. `…/segmente/[segmentId]` — Dialog-Segmente (#175). Strukturelle Änderungen (Löschen, `rolle`) renummerieren WAV-Clips unter `content/dialog-audio/{slug}/`.
- `POST` / `PATCH` / `DELETE` `/api/mpz/stations/[slug]/dialog/gruppen` bzw. `…/gruppen/[gruppeId]` — Dialog-Gruppen (#175).
- `GET` / `PUT` `/api/mpz/embed-allowlist` — Globale Embed-Domain-Allowlist (#178, `data/embed-allowlist.json`). Domain: [`mpz-embed-allowlist.ts`](../app/lib/mpz-embed-allowlist.ts). Route: [`/mpz/studio/embeds`](http://localhost:3000/mpz/studio/embeds). Post-Write: Inline-Validator + Cross-Check gegen `stations.json`. **PUT** (volle Liste). CSP `frame-src` erst nach Dev-Neustart/`build`. Domain-Fehler → **422**; malformed Body → **400** `INVALID_BODY`.
- `GET` / `PUT` `/api/mpz/hub-config` — Hub-Slug-Map, Station-Akzente, Lucide-Icons (#179, `data/hub-slug-map.json`, `data/station-accents.json`, `data/station-icons.json`). Domain: [`mpz-hub-config.ts`](../app/lib/mpz-hub-config.ts). Route: [`/mpz/studio/design`](http://localhost:3000/mpz/studio/design) (Tab Hub-Karte). Post-Write: Inline-Validator + Cross-Check gegen `stations.json`. **PUT** (atomar alle drei Dateien). Slot-Geometrie (`HUB_SLOTS`) bleibt Code. Hub-Vorschau in der App erst nach Dev-Neustart/`build`. malformed Body → **400** `INVALID_BODY`; Validierungsfehler → **422** `VALIDATION`.
- `GET` `/api/mpz/brand` sowie `POST` `/api/mpz/brand/upload` — Brand-Assets (#180, `public/brand/{logos,mascots,motifs}/`). Domain: [`mpz-brand-ingest.ts`](../app/lib/mpz-brand-ingest.ts). Route: [`/mpz/studio/design?tab=brand`](http://localhost:3000/mpz/studio/design?tab=brand). Slot-basiert (feste Dateinamen); **POST** `multipart/form-data` mit `slot` + `file`. Größenlimit wird vor `arrayBuffer()` geprüft. Response **201** `{ path, filename, mtime }`. Unbekannter/fehlender Slot → **400** `MISSING_FIELDS`; Validierung → **422** `VALIDATION`.
- `GET` / `POST` `/api/mpz/coach/messages` sowie `PATCH` / `DELETE` `/api/mpz/coach/messages/[messageId]` — Coach-Nachrichten (#177, optional `layout` seit #192, optional `quelle` seit #193, `content/coach-messages.json`). Domain: [`mpz-coach-messages.ts`](../app/lib/mpz-coach-messages.ts), Layout-Resolver: [`coach-layout.ts`](../app/lib/coach-layout.ts), Audio: [`coach-audio.ts`](../app/lib/coach-audio.ts). Route: [`/mpz/studio/coach`](http://localhost:3000/mpz/studio/coach). Post-Write: TS-Inline-Validator (spiegelt `validate:coach`). Domain-Fehler → **422** (`INVALID_LAYOUT`, `INVALID_QUELLE` u. a.); malformed Request → **400**.
- `POST` `/api/mpz/coach-audio/ingest` sowie `GET` `/api/mpz/coach-audio/status` — Coach-WAV-Upload und Audit (#193, `content/coach-audio/{messageId}.wav`). Domain: [`mpz-coach-audio-ingest.ts`](../app/lib/mpz-coach-audio-ingest.ts). Runtime: `GET /api/coach/[messageId]` (Cookie-Gate, Range/206, [ADR-025](../dokumentation/adr/025-coach-audio-autoplay.md)).

Guard wie alle `/api/mpz/*`-Routen.

**Fehler-Codes:** JSON-Feld `error` ist durchgängig `SCREAMING_SNAKE_CASE` (z. B. `NOT_FOUND`, `INVALID_JSON`, `INTERNAL_ERROR`). Domain-Codes werden unverändert durchgereicht. Konvention für Agenten: [`.cursor/rules/error-conventions.mdc`](../.cursor/rules/error-conventions.mdc).

**Validierung (#150, #155):** Nach jedem Studio-Write läuft Post-Validate (`validateStationsFile` + `validateStationAssets` importiert). Bei Fehlern im Scope der geänderten Station wird **kein rename** ausgeführt (`stations.json` bleibt unverändert). Medien-Ingest läuft in `withMpzWriteLock`. Ingest-APIs liefern `validation` + `mtime` inline.

**Grenzen:** Schreibt nur lokale Dateien (`data/stations.json`, `data/embed-allowlist.json`, `data/hub-slug-map.json`, `data/station-accents.json`, `data/station-icons.json`, `content/coach-messages.json`, `content/coach-audio/`, `public/media/`, `public/stations/` inkl. `360/`, `public/brand/`, `content/dialog-audio/`, ggf. `public/qr/`, `lib/access-token-constants.mjs`, `.env.local`). Kein Git-Commit aus dem Studio — nach Änderungen manuell `git commit`, Deploy (Build führt `validate:stations`, `validate:coach`, `validate:embed-allowlist` und `validate:hub-config` aus).

**Deploy-Tab (#174):** [`/mpz/studio/deploy`](http://localhost:3000/mpz/studio/deploy) — Env (`NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_EMBED_ENABLED`), QR-Generierung, Token-Rotation (Dry-Run/Live), validate-all, Vorschau-Links.

| Aktion | API |
|--------|-----|
| Env lesen/speichern | `GET` / `PATCH /api/mpz/deploy/env` |
| QR generieren | `POST /api/mpz/deploy/generate-qr` — Body `{ dryRun?, preset?: 'all' \| 'schulfest' }` |
| Token rotieren | `POST /api/mpz/deploy/rotate-tokens` — Body `{ dryRun: boolean }` |
| Validate-all | `POST /api/mpz/deploy/validate-all` — `validate:stations`, `validate:coach`, `validate:tokens`, `test` |
| Vorschau-Links | `GET /api/mpz/deploy/preview-links` |

Nach Änderungen an `NEXT_PUBLIC_*` in `.env.local`: **Dev-Server neu starten** (`npm run dev`), damit Next.js die Werte lädt. Subprocess-Aktionen (QR, Token, validate-all) rufen dieselben npm-Skripte wie Plan A auf; kein Coolify-Deploy aus dem Studio.

Details und Testrouten: [lokal-testen-und-anschauen.md](./lokal-testen-und-anschauen.md) (Abschnitt MPZ Studio).

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
| `npm run validate:coach` | Prüft Coach-JSON gegen Schema und `stations.json` — wird von `build` mitaufgerufen |
| `npm run validate:embed-allowlist` | Prüft `data/embed-allowlist.json` — wird von `build` mitaufgerufen |
| `npm run validate:hub-config` | Prüft `data/hub-slug-map.json`, `data/station-accents.json`, `data/station-icons.json` — wird von `build` mitaufgerufen |
| `npm run validate:access-config` | Prüft Token-Konfiguration (Sync mit QR-Specs) — wird von `build` mitaufgerufen |
| `npm run generate:qr`  | QR-PNGs + Druck-PDFs + `manifest.json` unter `public/qr/` (Issue #15, PDF-Erweiterung #130); `--preset=schulfest` für Schulfest-Set (12 Räume + Entry fest) — [schulfest-gs39-playbook.md](./schulfest-gs39-playbook.md) |
| `npm run rotate:access-tokens` | Entry-Token rotieren, `access-token-constants.mjs` + Manifeste + beide QR-Sets; Coolify-JSON auf stdout — [#141](https://github.com/flxln/schulnavigator/issues/141), siehe [Token rotieren](#token-pflegen--rotieren) |

---

## Verzeichnisstruktur (`app/`)

| Pfad               | Inhalt                                                        |
| ------------------ | ------------------------------------------------------------- |
| `app/app/`         | Next.js App Router (`page.tsx`, `eintritt/`, `scan/`, `raum/[slug]/`, `api/health`, `robots.ts`) |
| `components/`      | React-Komponenten (`PascalCase.tsx`); u. a. `schoolhouse/` (Startseite #14)   |
| `lib/`             | Hilfsfunktionen, Typen, Daten-Loader; u. a. `access-tokens.ts`, `scan-url.ts` (#23), `schoolhouse-segments.ts` (#14), `qr-urls.ts` (#15) |
| `middleware.ts`    | Zugangskontrolle: Cookie `sn_access`, Entry `?t=`, Redirect `/eintritt` (#23, ADR-007) |
| `data/`            | `stations.json` (Phase 1, Issue #12)                          |
| `public/stations/` | Raumbilder (`{slug}.jpg`, ≤ 500 KB) — Gyro-Viewer (ADR-006); Slug-Liste + Anforderungen: [`dokumentation/content/verzeichnisstruktur.md`](../dokumentation/content/verzeichnisstruktur.md) |
| `public/media/`    | Öffentliche Stations-Medien (`{slug}/audio/`, `/video/`, `/fotos/`, `/texte/`) — statisch ausgeliefert; wird befüllt wenn echte Inhalte vorliegen (bis dahin `/demo/`) |
| `content/`         | Dialog-Audio WAV-Clips (`dialog-audio/{slug}/{nn}-{sprecher}.wav`) — Cookie-geschützt via `GET /api/dialog/…` (ADR-010); `COPY content/ ./content/` im Dockerfile |
| `public/qr/`       | generierte QR-PNGs + Druck-PDFs (`pdf/`) + `manifest.json` (Issue #15, #130; PNGs/PDFs gitignored) |

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

**Browser-Pinch-Zoom** (Issue **#96**, Folge zu #56): Projektweit in [`app/app/layout.tsx`](../app/app/layout.tsx) — Viewport `userScalable: false`, `body { touch-action: manipulation }`, Client-Komponente [`DisableZoom`](../app/components/ui/disable-zoom.tsx) für iOS Safari (`touchmove` bei >1 Finger, `gesturestart`). Coolify deployt nicht automatisch — nach Push **Redeploy manuell** anstoßen.

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

### Equirectangular 360° (Sphere-Viewer, ADR-018)

| Anforderung | Wert |
|-------------|------|
| Format | Equirectangular **2:1** (JPEG/WebP) |
| Pfad | `public/stations/360/{slug}.jpg` → `panorama360` in `stations.json` |
| Größe | max. **4 MB** (`validate:stations` prüft Ratio + Magic-Bytes) |
| Export | `cd app && npm run export:pano360` (macOS `sips`, Rohdatei im Submodule `stationen-360-pano/flat/{slug}/raw/*360*.JPG`) |

8 Panorama-Stationen nutzen `viewer: "equirectangular"`; `kunst`, `hort`, `schulsozialarbeit` bleiben ohne 360°-Content auf Flat bzw. ohne `bild`.

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

Produktion: Multi-Stage-Image wie in [`app/Dockerfile`](../app/Dockerfile), Health-Check `GET /api/health`. Ziel-Hosting: **MPZ-Hetzner / Coolify** ([ADR-001](../dokumentation/adr/001-hosting-coolify.md)). **Live-URL:** **`https://schulnavigator.mpz.schule`**.

Die App setzt **`robots.txt`** (`Disallow: /`) und **`noindex`** im Root-Layout (Phase 1, Issue #16), damit die Subdomain nicht in Suchmaschinen indexiert wird.

### Security-Header (CSP, #143)

In [`next.config.ts`](../app/next.config.ts) über [`lib/security-headers.ts`](../app/lib/security-headers.ts):

| Header | Inhalt |
|--------|--------|
| `Content-Security-Policy` | `default-src 'self'`, `object-src 'none'`, Embed-`frame-src` (Allowlist), `worker-src blob:` (PSV), `script/style` mit `'unsafe-inline'` (Next.js) |
| `Permissions-Policy` | `camera`, `gyroscope`, `accelerometer`, `magnetometer` für `(self)` — QR-Scan + Raum-Viewer |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

Nach Änderung an `data/embed-allowlist.json`: Dev-Server neu starten bzw. neu deployen — `frame-src` wird beim Build aus der Allowlist gelesen.

**HSTS** (`Strict-Transport-Security`) setzt die App nicht selbst — liegt bei Coolify/Traefik (Proxy). Bei Bedarf mit Ops abstimmen.

Smoke nach Deploy:

```bash
curl -sI https://schulnavigator.mpz.schule/ | grep -iE 'content-security|permissions-policy'
```

### Git LFS — Raumbilder (`public/stations/*.jpg`)

Panorama-Exporte unter `public/stations/` werden per [`.gitattributes`](../app/.gitattributes) als **Git LFS** versioniert. `npm run validate:stations` bricht den Build ab, wenn eine `.jpg` ein LFS-Pointer statt echter JPEG-Daten ist.

**Nach Push prüfen (erster LFS-Deploy):**

```bash
# Altes 4:3-Platzhalter: content-length 457340
# Neues Pano musik.jpg: ~349000
curl -sI https://schulnavigator.mpz.schule/stations/musik.jpg | grep -i content-length
curl -s https://schulnavigator.mpz.schule/stations/musik.jpg | head -c 2 | xxd   # ff d8
```

**Wenn Coolify-Build mit LFS-Fehler abbricht** (`ist ein Git-LFS-Pointer` in `validate:stations`):

1. Coolify: Build-Umgebung muss `git-lfs` haben und beim Clone smudgen (`git lfs pull` nach Checkout), **oder**
2. Nixpacks/Pre-Build-Hook: `apk add git-lfs && git lfs pull` (Alpine) vor `docker build`.

Details und History-Entscheidung: [`dokumentation/build-kontext-submodule-regeln.md`](../dokumentation/build-kontext-submodule-regeln.md) (Abschnitt Git LFS).

**Panorama neu exportieren (lokal):**

```bash
cd app && node scripts/export-pano.mjs
```

---

## Zugangskontrolle (Issue #23, ADR-005/007)

- **Token-Quelle:** [`app/lib/access-tokens.ts`](../app/lib/access-tokens.ts) — muss mit [`app/scripts/qr-config.mjs`](../app/scripts/qr-config.mjs) synchron bleiben (Vitest-Sync-Guard in `access-tokens.test.ts`).
- **Cookie:** `sn_access` (HttpOnly, `Secure` nur in Production, `SameSite=Lax`). Inhalt = Token-String; Ablauf/Modus werden bei jedem Request gegen die Token-Liste validiert.
- **Middleware:** [`app/middleware.ts`](../app/middleware.ts) — gültiges `?t=` → Cookie + Redirect `/`; ohne Cookie → `/eintritt` (`?reason=expired` wenn Token bekannt, aber abgelaufen).
- **Scanner:** `html5-qrcode` in `components/scan/qr-scanner.tsx`; gemeinsame Vollbild-Shell `components/scan/scan-fullscreen-shell.tsx` (`sn-scan-shell`, `color-scheme: dark`) — Entry auf `/eintritt/scan` (`EintrittScanScreen`, `mode: entry`), Räume auf `/scan` (`ScanScreen`, `mode: room`); `parseEntryScan` / `parseRoomScan` in `lib/scan-url.ts` — Entry ohne Token-Whitelist im Client (#57, #82, ADR-008). Global `color-scheme: light` auf `html` (#106).

### Token pflegen / rotieren

Ein Befehl orchestriert den Workflow bis auf Druck und Coolify:

```bash
cd app
npm run rotate:access-tokens -- --dry-run   # Vorschau
npm run rotate:access-tokens                # Tokens + QR-Sets + Test
```

**Flags:** `--fest-only`, `--heft-only`, `--fest-expires=YYYY-MM-DD`, `--heft-expires=YYYY-MM-DD`, `--no-qr`, `--no-test`, `--entropy-bytes=N`

Das Skript erzeugt Zufallstokens (`fest-…` / `heft-…`), schreibt [`app/lib/access-token-constants.mjs`](../app/lib/access-token-constants.mjs), gibt `SN_ACCESS_TOKENS`-JSON für Coolify aus, führt `npm run test` und `generate:qr` (volles Set + `--preset=schulfest`) aus.

**Manuell nach Rotation:**

1. `SN_ACCESS_TOKENS` in Coolify **Prod und Dev** setzen (**vor** Deploy — Fail-closed in `validate-runtime.mjs`).
2. `git add` `access-token-constants.mjs`, `public/qr/manifest.json`, `manifest-schulfest.json` → Commit, Push, Deploy.
3. Entry-QRs aus `public/qr/pdf/` drucken; alte gedruckte QRs sind ungültig.

**Einzelne Schritte ohne Skript:** Token in `access-token-constants.mjs` ändern → `npm run test` → `generate:qr` (+ ggf. `--preset=schulfest`) → Coolify ENV.

### Lokal testen (Zugang)

1. `npm run dev` — einmal Entry scannen: `http://localhost:3000/eintritt?t=<fest-token>` (Wert aus `app/lib/access-token-constants.mjs`; Cookie persistiert; `Secure` ist in Dev aus).
2. Ohne Cookie: `/` → Redirect `/eintritt`.
3. Cross-Tab: nach Entry neuen Tab mit `/raum/musik` öffnen — sollte erreichbar sein.
4. Modus-Wechsel: `/eintritt?t=<heft-token>` überschreibt Cookie → voller Hub.

**Cookie zurücksetzen:** DevTools → Application → Cookies löschen, oder privates Fenster.

### Besuchs-Stempel (Issue #21, Nachtrag #83)

- **Speicher:** `localStorage` Key `sn_visited_slugs` — JSON-Array gültiger Slugs; **nicht** mit Cookie `sn_access` verwechseln.
- **Logik:** [`app/lib/visited-stations.ts`](../app/lib/visited-stations.ts), Freischaltung [`app/lib/hub-mode.ts`](../app/lib/hub-mode.ts) (`fest` = nur besuchte Segmente, `heft` = alle).
- **Markierung (`fest`):** nur bei erfolgreichem Raum-QR in [`app/components/scan/qr-scanner.tsx`](../app/components/scan/qr-scanner.tsx) (`markVisitedSlug` vor `router.push`).
- **Markierung (`heft`):** [`app/components/station-visit-recorder.tsx`](../app/components/station-visit-recorder.tsx) auf `/raum/[slug]` (einmal pro Mount); im `fest`-Modus ist der Recorder ein No-Op.
- **Hub-Navigation:** Gesperrte Stationen — Footer in `/raum/…` und isometrischer Hub führen zu `/scan`, nicht direkt in den Raum ([ADR-009 Nachtrag #83](../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-05-30--fest-freischaltung-nur-per-raum-qr-83)).
- **Startseiten-CTAs** ([ADR-009 Nachtrag CTAs](../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-06-01--startseite-modusabhängige-ctas), [#104](../dokumentation/adr/009-hub-isometrisch.md#nachtrag-2026-06-11--scan-cta-ohne-stationsvorschlag-104)): [`home-screen.tsx`](../app/components/home/home-screen.tsx) steuert per [`getHomeFooterCta`](../app/lib/home-cta.ts) (`fest-scan` | `scan-next` | `none`). `fest`/`heft` 1–10: [`home-fest-scan-cta.tsx`](../app/components/home/home-fest-scan-cta.tsx) → `/scan` („Scanne die nächste Station!“). Fortschrittskarte tippbar → `/stationen`. Raum-Footer: [`next-station-footer.tsx`](../app/components/raum/next-station-footer.tsx) (gleicher Scan-CTA). [`getNextStation`](../app/lib/next-station.ts) nur für Sichtbarkeit (unbesuchte Stationen übrig).
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

5. **Umgebungsvariablen:** `PORT=3000`, optional `NODE_ENV=production`. Für Zugangskontrolle (ADR-021) siehe Abschnitt [Zugang & Embedding](#zugang--embedding-adr-021) — **vor erstem Deploy nach ADR-021** `SN_ACCESS_TOKENS` in Coolify setzen.

6. **Health Check** (Coolify UI, bei Application-Typ): Pfad `/api/health`, erwarteter Status **200**. Zusätzlich enthält das Image einen Docker-`HEALTHCHECK` auf dieselbe URL.

7. **Deploy** auslösen und Build-Logs bis „Running“ verfolgen.

### Fehler beim Clone: private Git-Submodule

**Typische Logzeilen:** `fatal: could not read Username for 'https://github.com'` / `Failed to clone 'auftraggeber'` nach `git submodule update`.

**Ursache:** Das Repo [`/.gitmodules`](../.gitmodules) verweist auf **private** GitHub-Repos per HTTPS. Coolify klont zuerst das Hauptrepo, führt dann **`git submodule update`** aus — dafür gibt es **keine** Anmeldedaten für die Submodule-URLs.

**Wichtig:** Der **Docker-Build** nutzt nur den Ordner [`app/`](../app/) (`COPY . .` im `Dockerfile`). Die Submodule liegen **außerhalb** von `app/` und werden für das Image **nicht** benötigt.

**Lösung (empfohlen):** In Coolify bei der Application unter **Advanced** / **Build** die Option **Submodules** (o. ä.) **deaktivieren** — dann wird nur das Hauptrepo geklont, der Build aus `app/` kann normal laufen.

**Alternativen:** dieselbe **GitHub-App** (oder Deploy-Key) auch auf die Repos `schulnavigator-auftraggeber` und `schulnavigator-protokolle` mit Leserechten installieren; oder Submodule-URLs in `.gitmodules` auf **SSH/relative Pfade** umstellen (Coolify-Doku / GitHub-Org gleicher Owner).

### Zugang & Embedding (ADR-021)

| Variable | Default | Bedeutung |
|----------|---------|-----------|
| `SN_ACCESS_MODE` | `gated` | `gated` = Entry-Token + Middleware wie bisher; `open` = alle App-Routen ohne Token |
| `SN_ACCESS_TOKENS` | — (Dev: Fallback in Code) | JSON-Array: `[{ "token", "mode": "fest"\|"heft", "expiresAt": "YYYY-MM-DD" }]` — **Runtime-Secret in Coolify**, nicht im Docker-Build |
| `SN_EMBED_ANCESTORS` | leer → kein Framing | Kommagetrennte `https://`-Origins für CSP `frame-ancestors` |

**Pilot (`schulnavigator.mpz.schule`):** `SN_ACCESS_MODE` weglassen oder `gated`; `SN_ACCESS_TOKENS` mit aktuellen Entry-Tokens setzen (Werte aus `app/lib/access-token-constants.mjs` bzw. nach `npm run generate:qr` in `public/qr/manifest.json`). Alte Tokens `fest-2026` / `heft-2026-27` sind ungültig.

**Deploy-Reihenfolge (gated):**

1. `SN_ACCESS_TOKENS` in Coolify Prod **und** Dev setzen (gleiche Werte wie gedruckte Entry-QRs).
2. Code deployen — Container startet nur, wenn Runtime-Validierung (`scripts/validate-runtime.mjs`) grün ist.
3. Neue Entry-QRs drucken, falls Token rotiert wurden.

**`open` + Einbettung (separates Deployment):** `SN_ACCESS_MODE=open`, `SN_EMBED_ANCESTORS=https://…` (Schulwebsite-Origin). Vor Go-Live: `curl -sSI https://… \| grep -iE 'content-security-policy|x-frame-options'` — kein widersprüchliches `X-Frame-Options` vom Proxy.

Beispiel `SN_ACCESS_TOKENS` (Platzhalter — echte Werte nur in Coolify):

```json
[
  {"token":"fest-…","mode":"fest","expiresAt":"2026-07-31"},
  {"token":"heft-…","mode":"heft","expiresAt":"2027-07-31"}
]
```

Vollständig: [ADR-021](../dokumentation/adr/021-zugangsmodus-konfigurierbar.md), [`app/.env.example`](../app/.env.example).

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
# FEST_TOKEN aus SN_ACCESS_TOKENS / manifest.json ersetzen:
curl -sSI 'https://schulnavigator.mpz.schule/eintritt?t=FEST_TOKEN'
# Erwartung: Set-Cookie sn_access=… + Redirect /

curl -sS https://schulnavigator.mpz.schule/robots.txt
# Erwartung: Disallow: /
```

**Browser:** Entry `?t=<fest-token>` → Puzzle-Hub gesperrt + `/scan`; `?t=<heft-token>` → voller Hub; `/eintritt` ohne Cookie = Hinweis.

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

**Feature-QA auf Dev:** Coolify → Application Dev → **Source → Branch** auf den PR-Branch stellen → **Redeploy**. Dialog-Test: Entry-URL aus `manifest.json`, dann `/raum/daz` (X neben Zurück, Chip zentriert). Siehe [`lokal-testen-und-anschauen.md`](lokal-testen-und-anschauen.md).

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
