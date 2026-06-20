# MPZ Studio — Domänen-CRUD (Planung)

_Inhaltliche Kategorisierung für Feature-Planung und Issues — unabhängig von der UI-Navigation in der [Studio-Spezifikation](../../spezifikationen/mpz-studio.md)._

**Status:** ✅ v0–v2 umgesetzt (Epic #170, [PR #183](https://github.com/flxln/schulnavigator/pull/183)). v3 Polish offen.

**Epics:** [v0 #144](https://github.com/flxln/schulnavigator/issues/144) · [v1 #158](https://github.com/flxln/schulnavigator/issues/158) · [v2 #170](https://github.com/flxln/schulnavigator/issues/170) **abgeschlossen** (auf `main`, [PR #183](https://github.com/flxln/schulnavigator/pull/183)) · v3 Polish nach Bedarf

**Phasierung (Spec):** v2 erledigt — fehlende Content-Pflege + Betrieb · v3 = Komfort-Editoren und Batch — siehe [Roadmap v2/v3](#roadmap-v2--v3) unten.

**Legende:** `Studio` = MPZ Studio (nur `npm run dev`) · `Plan A` = CLI, JSON, Snippets, Kalibrier-URLs · **Status** ✓ umgesetzt · ~ teilweise · — offen

Detaillierte Issue-Listen: [epic-mpz-studio.md](../../planung/archiv/epics/epic-mpz-studio.md) · [epic-mpz-studio-v1.md](../../planung/archiv/epics/epic-mpz-studio-v1.md) · [epic-mpz-studio-v2.md](../../planung/archiv/epics/epic-mpz-studio-v2.md)

---

## Raum (12 feste Stationen)

Kein Anlegen oder Löschen — Slugs sind fix (QR-Codes gedruckt).

### konfigurieren

- Titel, Beschreibung
- Viewer-Modus (`flat` / `equirectangular`)
- Raumbild Flat (`/stations/{slug}.jpg`)
- Panorama 360° (`/stations/360/{slug}.webp`)

---

## Medien

Verknüpfung mit dem Raum erfolgt indirekt über **Hotspots** (oder Medienliste ohne Hotspot).

### erstellen

- **audio** — MP3, WAV, M4A
- **video** — MP4-Upload (YouTube optional, rechtlich offen)
- **foto** — JPG, WebP
- **text** — Markdown oder Plaintext
- **link** — externe URL (z. B. Book Creator)
- **embed** — iframe (aktuell Delightex; Allowlist + `EMBED_ENABLED`)

### bearbeiten

- Metadaten (`id`, `untertitel`, `poster`, `thumbnail`, `embedAllow`, …)

### löschen

- JSON-Eintrag; lokale Datei nur wenn nicht mehr referenziert

---

## Hotspots

### Medien-Hotspot

- mit existierendem Medium im Raum verknüpfen (`mediumId`)
- Icon festlegen (Preset oder Custom unter `/media/{slug}/icons/`)
- Position festlegen — **Flat:** `x`/`y` · **360°:** `yaw`/`pitch`
- optional: `radius`, `iconSize`

### Dialog-Hotspot

- Maskottchen (Frieda / Otto)
- Position im Raum (`action: "dialog"`)
- optional: `mascotSize`, `mascotFlipX`, `bubblePitchOffset` (Sphere)

### bearbeiten / löschen

- Koordinaten, Label, Icon, Medium-Zuordnung

---

## Dialog (nur `daz`, `pc-raum`)

### Segmente & Texte

- Figuren (`frieda`, `otto`)
- Segmente: `id`, `rolle`, `text`, `gruppe`, `tail`
- Gruppen-Texte für „beide“-Segmente
- Sprechblasen-Layout (`dialog.bubble`)

### Audio-Clips

- WAV-Upload mit Namenskonvention (`01-frieda.wav`, …)
- API-Pfad `/api/dialog/{slug}/…` (cookie-geschützt)

### bearbeiten / löschen

- Segmente und Clips einzeln pflegen

---

## Coach (global, nicht pro Raum)

Fortschritts-getriggerte Maskottchen-Texte in `app/content/coach-messages.json`.

### erstellen / bearbeiten / löschen

- **hub-milestone** — nach X besuchten Stationen (`milestone`)
- **hub-complete** — alle Stationen besucht
- **room-first** — erster Besuch eines Raums (`slug`)
- Felder: `mascot`, `placement`, `text`, optional `modes` (`fest` / `heft`)

---

## Querschnitt (v2 — Betrieb & Konfiguration)

Nicht pro Raum, aber für vollständiges Studio relevant ([Spec](../../spezifikationen/mpz-studio.md#phasierung-zeitplan)):

| Modul | Inhalt | Phase |
|-------|--------|-------|
| **Embeds & Links** | Globale Allowlist + Übersicht embed/link-Medien | v2 ✓ |
| **Deploy** | Env, QR, Token-Rotation, validate-all | v2 ✓ |
| **Brand & Design** | Logos, Maskottchen, optionale Motive | v2 ✓ |
| **Hub-Karte** | Slug ↔ Fenster-Slot (Geometrie bleibt Code) | v2 ✓ |

---

## Roadmap v2 / v3

Die offenen Lücken sind **nicht viele**, aber sie sind inhaltlich unterschiedlich schwer. In der [Studio-Spec](../../spezifikationen/mpz-studio.md) heißen die nächsten Schritte bereits **v2** (Betrieb, August 2026) und **v3** (Polish). v3 wäre also **nicht** der Sammelbecken für alles Offene — nur für Komfort über Plan A hinaus.

### v2 — Content & Betrieb (Epic #170, erledigt 2026-06-20)

Alles, was zuvor **nur Plan A (JSON/CLI)** war und fürs Studio-Alltag sinnvoll war — umgesetzt in Issues #171–#180:

| Paket | Domäne | Was | Issue |
|-------|--------|-----|-------|
| **v2-A Raum** | Raum | Raumbild Flat + 360° hochladen | #173 |
| **v2-B Medien** | Medien | Metadaten bearbeiten (PATCH); link/embed im Studio anlegen | #171, #172 |
| **v2-C Dialog** | Dialog | Tab „Dialog“: Segmente, Gruppen, `bubble` (Formular) | #175 |
| **v2-C Dialog** | Hotspots | Dialog-Hotspot anlegen/bearbeiten | #176 |
| **v2-D Coach** | Coach | CRUD `coach-messages.json` + Trigger-Typen | #177 |
| **v2-E Betrieb** | Querschnitt | Deploy-Tab (QR, Token, Env, validate-all) | #174 |
| **v2-F Konfig** | Querschnitt | `embed-allowlist.json`, Hub-Slug-Map, Akzente/Icons, Brand-Uploads | #178–#180 |

**Grober Umfang v2:** Epic mit 11 Unterissues (#171–#181) — abgeschlossen.

### v3 — Polish (optional, nach Bedarf)

Komfort, den Plan A oder einfache Formulare in v2 schon abdecken:

| Was | Warum v3 |
|-----|----------|
| Markdown-Inline-Editor für Text-Medien | v2: Datei ersetzen reicht meist |
| Dialog-Bubble **visuell** positionieren | v2: JSON-Felder `bubble.y/x/…` reichen |
| Batch-Import aus `auftraggeber/` | Einmal-Migration, kein Dauerworkflow |
| YouTube-Video im Studio | Recht/DSB noch offen (ADR-004) |

### Was **nicht** ins Studio gehört (Directus / Phase 5)

Lehrkräfte-Admin, Multi-User, Git aus dem Studio, Production-Schreibzugriff — bleibt außerhalb ([ADR-003](../../adr/003-content-mvp-json-directus.md), [ADR-022](../../adr/022-mpz-studio-internes-ingest-tool.md)).

---

## Fortschritt: Domäne × CRUD × Issue × Umsetzung

| Domäne | Aktion | Issue(s) | Status | Studio | Plan A |
|--------|--------|----------|--------|--------|--------|
| **Raum** | konfigurieren (Stammdaten, Viewer) | [#160](https://github.com/flxln/schulnavigator/issues/160), Shell [#159](https://github.com/flxln/schulnavigator/issues/159) | ✓ | ja | JSON |
| **Raum** | Raumbilder Flat / 360° hochladen | [#173](https://github.com/flxln/schulnavigator/issues/173) | ✓ | ja | Datei + `export:pano` / `export:pano360` |
| **Medien** | erstellen (audio, video, foto, text) | [#147](https://github.com/flxln/schulnavigator/issues/147) | ✓ | ja (Upload) | `content:ingest` |
| **Medien** | erstellen (link, embed) | [#172](https://github.com/flxln/schulnavigator/issues/172) | ✓ | ja (Modal) | JSON + Snippet |
| **Medien** | bearbeiten (Metadaten) | [#171](https://github.com/flxln/schulnavigator/issues/171) | ✓ | ja | JSON |
| **Medien** | löschen | [#161](https://github.com/flxln/schulnavigator/issues/161) | ✓ | ja | JSON |
| **Medien** | Tabelle + Link zu Ingest | [#161](https://github.com/flxln/schulnavigator/issues/161) | ✓ | ja | — |
| **Hotspots** | Medien-Hotspot erstellen | [#165](https://github.com/flxln/schulnavigator/issues/165) | ✓ | ja | JSON + Kalibrier-URL |
| **Hotspots** | Dialog-Hotspot erstellen | [#176](https://github.com/flxln/schulnavigator/issues/176) | ✓ | ja | JSON + Kalibrier-URL |
| **Hotspots** | Position kalibrieren (Flat) | [#149](https://github.com/flxln/schulnavigator/issues/149) | ✓ | `/mpz/calib/flat/{slug}` | `?hotspot-calib=1` (Sphere) |
| **Hotspots** | Startblick Sphere persistieren | [#153](https://github.com/flxln/schulnavigator/issues/153) | ✓ | ja | JSON |
| **Hotspots** | Icon hochladen | [#166](https://github.com/flxln/schulnavigator/issues/166) | ✓ | ja | Datei manuell |
| **Hotspots** | bearbeiten | [#167](https://github.com/flxln/schulnavigator/issues/167), [#176](https://github.com/flxln/schulnavigator/issues/176) | ✓ | ja | JSON |
| **Hotspots** | löschen | [#162](https://github.com/flxln/schulnavigator/issues/162), [#168](https://github.com/flxln/schulnavigator/issues/168) | ✓ | ja | JSON |
| **Hotspots** | Tabelle + Kalibrier-Links | [#162](https://github.com/flxln/schulnavigator/issues/162) | ✓ | ja | — |
| **Dialog** | Segmente & Texte | [#175](https://github.com/flxln/schulnavigator/issues/175) | ✓ | ja | JSON + Snippet |
| **Dialog** | Sprechblasen-Layout (`bubble`) | [#175](https://github.com/flxln/schulnavigator/issues/175) | ✓ | ja | JSON |
| **Dialog** | Audio-Clips hochladen | [#148](https://github.com/flxln/schulnavigator/issues/148), Tab [#163](https://github.com/flxln/schulnavigator/issues/163) | ✓ | ja | `content:ingest-dialog` |
| **Dialog** | Audio-Status / fehlende Clips | [#148](https://github.com/flxln/schulnavigator/issues/148), [#163](https://github.com/flxln/schulnavigator/issues/163) | ✓ | ja | — |
| **Dialog** | bearbeiten / löschen (Segmente) | [#175](https://github.com/flxln/schulnavigator/issues/175) | ✓ | ja | JSON |
| **Coach** | erstellen / bearbeiten / löschen | [#177](https://github.com/flxln/schulnavigator/issues/177) | ✓ | ja | `coach-messages.json` |
| **Querschnitt** | Save & Validieren, Rollback | [#150](https://github.com/flxln/schulnavigator/issues/150), [#155](https://github.com/flxln/schulnavigator/issues/155) | ✓ | ja | `validate:stations` |
| **Querschnitt** | Dashboard, Stations-Grid, Vorschau | [#151](https://github.com/flxln/schulnavigator/issues/151) | ✓ | ja | — |
| **Querschnitt** | Dev-Guard (`/mpz/*` nur lokal) | [#145](https://github.com/flxln/schulnavigator/issues/145) | ✓ | ja | — |
| **Querschnitt** | Atomarer Schreib-Layer | [#146](https://github.com/flxln/schulnavigator/issues/146) | ✓ | (intern) | CLI nutzt gleiche IO |
| **Querschnitt** | Deploy (Env, QR, Token, validate-all) | [#174](https://github.com/flxln/schulnavigator/issues/174) | ✓ | ja | Skripte / `.env.local` |
| **Querschnitt** | Embed-Allowlist | [#178](https://github.com/flxln/schulnavigator/issues/178) | ✓ | ja | `embed-allowlist.json` |
| **Querschnitt** | Hub-Slug-Map, Akzente, Icons | [#179](https://github.com/flxln/schulnavigator/issues/179) | ✓ | ja | `hub-slug-map.json` usw. |
| **Querschnitt** | Brand-Uploads | [#180](https://github.com/flxln/schulnavigator/issues/180) | ✓ | ja | Dateien / Code |

**Stand:** Epic [#170](https://github.com/flxln/schulnavigator/issues/170) **abgeschlossen** (2026-06-20) — auf `main` ([PR #183](https://github.com/flxln/schulnavigator/pull/183)).

---

## Studio-Routen (umgesetzt)

| Route | Issue | Zweck |
|-------|-------|-------|
| `/mpz/studio` | #151 | Dashboard, Validierung |
| `/mpz/studio/stationen` | #151 | Stations-Grid |
| `/mpz/studio/stationen/[slug]` | #159 | Detail-Shell + Tabs |
| Tab Stammdaten | #160, #173 | Titel, Beschreibung, Viewer, Raumbild-Upload |
| Tab Medien | #161, #171, #172 | Liste, Bearbeiten (PATCH), Entfernen, Modal Ingest (alle Typen) |
| Tab Hotspots | #162, #165–#168 | CRUD, Kalibrier-Links |
| Tab Dialog | #175 | Figuren, Segmente, Gruppen, bubble, Audio-Audit-Banner |
| Tab Dialog-Audio | #163 | Upload + Segment-Audit |
| `/mpz/studio/ingest` | #147, #172 | Deep-Link öffnet Medien-Modal |
| `/mpz/studio/dialog-audio` | #148 | Dialog-Audio (global) |
| `/mpz/studio/coach` | #177 | Coach-Nachrichten (`coach-messages.json`) |
| `/mpz/studio/embeds` | #178 | Globale Embed-Allowlist + link/embed-Übersicht |
| `/mpz/studio/hub` | #179 | Hub-Slug-Map, Akzente, Lucide-Icons |
| `/mpz/studio/brand` | #180 | Logos, Maskottchen, optionale Motive (`public/brand/`) |
| `/mpz/studio/deploy` | #174 | Env, QR, Token-Rotation, validate-all, Vorschau |
| `/mpz/calib/flat/[slug]` | #149 | Flat-Hotspot-Kalibrierung |
