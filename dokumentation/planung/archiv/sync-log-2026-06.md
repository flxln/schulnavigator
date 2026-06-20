# Sync-Log — GitHub-Abgleich (bis 2026-06-20)

Aus dem ehemaligen `github-project/README.md` übernommen. Nur Archiv — neue Einträge in [offen.md](../offen.md).

- [ ] Alle sechs Milestone-Beschreibungen mit [milestones.md](milestones.md) verglichen und bei Abweichung auf GitHub gepatcht.
- [x] Offene Issue-Titel und Bodies zu „11 Stationen“, Directus (#46/#47) und Raum-Viewer (#55/#56) geprüft — #55/#56 in [issues-phase-2.md](./issues-phase-2.md) abgehakt, Code umgesetzt.
- [x] Issue **#55** (Raum-Viewer Gyro + Hotspots) — existiert, umgesetzt und auf GitHub geschlossen.
- [x] Issue **#56** (Raum-Viewer Mobil-Härtung) — dokumentiert, Code umgesetzt (GitHub-Status bei Bedarf mit Issue-Body abgleichen).
- [x] Issue **#85** (Portrait Gimbal-Lock: gamma-Fallback + Post-Settle Re-Anchor, Folge #56) — geschlossen (`e59cd1e`, Doku `raum-viewer-gyro-feintuning.md`)
- [x] Issue **#23** (Zugangskontrolle Cookie/Middleware/Scanner) — umgesetzt, ADR-007
- [x] Issue **#57** (Eintritt In-App-Scanner auf `/eintritt`) — umgesetzt, ADR-008
- [x] Issue **#82** (Eintritt-Scan Route `/eintritt/scan` + Shell, Folge #57) — umgesetzt 2026-05-30, ADR-008 Nachtrag
- [x] Issue **#83** (Fest: Hub-Vorschlag + Stempel nur per Raum-QR, Folge #21) — umgesetzt 2026-05-30, ADR-009 Nachtrag
- [x] Issue **#84** (Startseite: modusabhängige CTAs Fest/Heft, Sub-Issue #83) — umgesetzt 2026-06-01, ADR-009 Nachtrag CTAs
- [x] Issue **#21** (Stempel + Hub-Freischaltung) — geschlossen (`sn_visited_slugs`, `hub-with-progress`)
- [x] Epic **#58** (GS39 UI) + Teil-Issues **#59–#63** — geschlossen (PR #64–#68, merged 2026-05-27)
- [x] Issue **#22** (Abschluss-Animation) — geschlossen (über #63 / `SparkleBurst`)
- [ ] Suche im Repo-Issue-Tracker nach veralteten Formulierungen (z. B. „8 Stationen“, „Admin-Interface entwickeln“ ohne Directus-Kontext).

- [x] Issue **#69** (Otto-Frieda-Dialog `daz`/`pc-raum`, ADR-010, gated Audio) — geschlossen (2026-05-28)
- [x] Issue **#71** (Maskottchen-Hotspots UI, ADR-011) — geschlossen (2026-05-28, `main` @ `14cb740`)
- [x] Issue **#72** (Raum-UI TopBar/Chip, Follow-up #71) — geschlossen (2026-05-28, [PR #73](https://github.com/flxln/schulnavigator/pull/73) → `main` @ `7fc23c6`)
- [x] Issue **#81** (Scan-Chrome: Kamerabild füllt Rahmen, Folge #62) — geschlossen (2026-05-30, Sub-Issue von #62)
- [x] Epic **#74** (Tablet/iPad Layout) + **#75–#78** — geschlossen 2026-06-14, Branch `feat/tablet-ipad-layout`; [ADR-012](../../adr/012-tablet-ipad-responsive-layout.md) entschieden
- [x] Issue **#27** (Raumfotos einpflegen) — geschlossen 2026-06-08: 8× Panorama in `public/stations/`, LFS, `export-pano.mjs`
- [ ] Issue **#17** (Raumfotos liefern, extern) — Teillieferung 8/11; offen: `kunst`, `hort`, `schulsozialarbeit`
- [x] Issues **#18–#20** (Audio-/Video-Player, Foto-Viewer) — geschlossen 2026-06-09: `app/components/media/`, `MediaPlayerByTyp`, `poster?`-Schema
- [x] Issue **#93** (TextViewer inline + Demo `klassenzimmer`) — geschlossen 2026-06-10: `TextViewer`, `public/media/klassenzimmer/`, 4 Hotspots

- [x] Epic **#97** (ADR-017) — abgeschlossen (#98 PR #101, #99 PR #102, #100, #109); [epic-externe-medien-hotspot-marker.md](epic-externe-medien-hotspot-marker.md)

- [x] Issue **#103** (Startseite: Hub volle Breite, Wordmark Dresden-Plauen, `Gs39ChipMark`, Folge ADR-016) — umgesetzt 2026-06-10
- [x] Issue **#104** (Scan-CTA ohne Stationsnamen, Fortschrittskarte → `/stationen`, Folge #84) — umgesetzt 2026-06-11
- [x] Issue **#105** (Stationssymbole statt Nummerierung — Lucide, Hub/Liste/Raum) — umgesetzt 2026-06-11
- [x] Issue **#106** (Scanner: Lesbarkeit bei System-Dark-Mode, `color-scheme` light/dark) — umgesetzt 2026-06-11
- [x] Issue **#107** (Raum-Viewer: Einmaliges Swipe-Onboarding, `PanOnboardingOverlay`, iOS-Bugfix Timer-Entkopplung) — umgesetzt + gemergt PR #108, 2026-06-11
- [x] Issue **#109** (Delightex-Fallback Mobile, Folge #100 / ADR-017 Aufgabe 3.6) — umgesetzt 2026-06-11, Branch `feature/delightex-fallback`
- [x] Issue **#111** (Raum-Inhaltskarte Card-Peek + iOS-Viewport-Fix, Folge #72) — umgesetzt 2026-06-11, Branch `feat/raum-card-peek-layout`

- [x] Issue **#113** (360°-Sphere-Viewer: PSV-Koexistenz, Gyro-Panning, ADR-018, Pilot Musikraum) — umgesetzt 2026-06-11, Branch `feature/360-sphere-viewer`
- [x] Issue **#114** (360°-Sphere-Viewer: Rollout 8 Stationen, Maskottchen-Marker, Gyro-Bugfix, Folge #113) — umgesetzt 2026-06-11, Branch `feature/360-sphere-viewer`
- [x] Issue **#116** (Sphere-Viewer: Zoom-Sperre + Gyro-Neustart nach Pinch, Folge #114) — umgesetzt 2026-06-11, Branch `feature/sphere-zoom-sperre`
- [x] Issue **#119** (Sphere-Hotspots: sphärisches Mapping, Layer-Marker, Kalibrier-Helfer, Folge #114) — geschlossen 2026-06-14, PR [#118](https://github.com/flxln/schulnavigator/pull/118) → `main`
- [x] Issue **#120** (Sphere-Marker: PSV-Tooltips entfernen, Kalibrier-Yaw normalisieren, Folge #119) — geschlossen 2026-06-14, `main`
- [x] Epic **#121** (Coach Fortschritts-Einblendungen, ADR-019) + **#122** (Raum-Overlay-Priorität) — geschlossen 2026-06-14, [PR #123](https://github.com/flxln/schulnavigator/pull/123) → `main`; [epic-coach-fortschritt.md](epic-coach-fortschritt.md)

- [x] Epic **#124** (Hub Wegweiser Schulhof/Turnhalle, ADR-020) — geschlossen 2026-06-14, [PR #125](https://github.com/flxln/schulnavigator/pull/125) → `main`; [epic-hub-wegweiser.md](epic-hub-wegweiser.md)

- [x] Issue **#128** (Book Creator Embed Lesewelt, ADR-017) — geschlossen 2026-06-15, Branch `feature/bookcreator-lesewelt`
- [x] Issue **#130** (QR-Druck-PDFs) — geschlossen 2026-06-15, [PR #131](https://github.com/flxln/schulnavigator/pull/131)
- [x] Issue **#87** (Schulfest-Playbook) — geschlossen 2026-06-15 (gleicher PR-Stand)
- [ ] Epic **#86** — offen bis #90/#91; Druckset 12 Räume erledigt
- [ ] Issue **#89** — technisch erledigt; Sonnentest offen

- [x] Epic **#132** (ADR-021 Zugangsmodus konfigurierbar) + **#133–#139** — umgesetzt, [PR #140](https://github.com/flxln/schulnavigator/pull/140); [epic-zugangsmodus-konfigurierbar.md](epic-zugangsmodus-konfigurierbar.md)

- [x] Issue **#141** (`rotate:access-tokens`) — geschlossen 2026-06-15, [PR #142](https://github.com/flxln/schulnavigator/pull/142) → `main`

- [x] Epic **#144** (MPZ Studio v0, ADR-022) — abgeschlossen, [PR #156](https://github.com/flxln/schulnavigator/pull/156) merged; [#157](https://github.com/flxln/schulnavigator/issues/157) Duplikat-Slugs behoben
- [x] Issue **#152** (Sphere-Startblick Runtime + Pre-Mortem Gyro-Gating, ADR-023) — umgesetzt 2026-06-17 (`a1b272d`, `4a59010`), Branch `feature/mpz-studio`
- [x] Issue **#153** (MPZ Sphere-Startblick persistieren, ADR-023) — umgesetzt 2026-06-17 (`057ca71`), Branch `feature/mpz-studio`, Issue geschlossen
- [x] Issue **#159** (MPZ Studio v1: Station-Detail-Shell) — umgesetzt 2026-06-17, Branch `mpz-studio-v1`
- [x] Issue **#160** (MPZ Studio v1: Stammdaten-Editor) — umgesetzt 2026-06-17, Branch `mpz-studio-v1`
- [x] Issue **#161** (MPZ Studio v1: Medien-Tabelle) — umgesetzt 2026-06-17, Branch `mpz-studio-v1`
- [x] Issue **#162** (MPZ Studio v1: Hotspots-Tabelle) — umgesetzt 2026-06-17, Branch `mpz-studio-v1`
- [x] Issue **#165** (Hotspot anlegen: Medium, Koordinaten, Icon, iconSize) — umgesetzt 2026-06-18, Branch `mpz-studio-v1`, [Hotspot-Editor-Spec](../../spezifikationen/mpz-studio-hotspot-editor.md)
- [x] Issue **#166** (Hotspot-Icon-Ingest) — umgesetzt 2026-06-17, Branch `mpz-studio-v1`
- [x] Issue **#167** (Hotspot bearbeiten PATCH) — umgesetzt 2026-06-18, Branch `mpz-studio-v1`, Post-Mortem [post-mortem-167-2026-06-18.md](../../reviews/post-mortem/post-mortem-167-2026-06-18.md)
- [x] Issue **#163** (MPZ Studio v1: Dialog-Audio-Tab pro Station) — umgesetzt 2026-06-18, Branch `mpz-studio-v1`, Post-Mortem [post-mortem-163-2026-06-18.md](../../reviews/post-mortem/post-mortem-163-2026-06-18.md)
- [x] Issue **#168** (DELETE Hotspot Fehler-Mapping) — umgesetzt 2026-06-18, Branch `mpz-studio-v1`, Post-Mortem [post-mortem-168-2026-06-18.md](../../reviews/post-mortem/post-mortem-168-2026-06-18.md)
- [x] Issue **#164** (MPZ Studio v1: Doku & Epic-Abschluss) — umgesetzt 2026-06-18, Branch `mpz-studio-v1`; schließt Epic [#158](https://github.com/flxln/schulnavigator/issues/158)
- [x] Epic **#158** (MPZ Studio v1 — Station-Detail & Content-Pflege) — abgeschlossen 2026-06-18, [epic-mpz-studio-v1.md](epic-mpz-studio-v1.md); GitHub-Issues #159–#168 **alle geschlossen**; Milestone „MPZ Studio v1" **0 offen**
- [x] **Merge** Branch `mpz-studio-v1` → `main` — [PR #169](https://github.com/flxln/schulnavigator/pull/169)
- [x] Branch **`mpz-studio-v2`** von `main` angelegt (Entwicklung v2)
- [x] Epic **#170** (MPZ Studio v2) + Unterissues **#171–#181** — [epic-mpz-studio-v2.md](epic-mpz-studio-v2.md)
- [x] Issue **#171** (Medien PATCH Metadaten) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-171-2026-06-18.md](../../reviews/post-mortem/post-mortem-171-2026-06-18.md)
- [x] Issue **#172** (Medien link/embed im Studio anlegen) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-172-2026-06-18.md](../../reviews/post-mortem/post-mortem-172-2026-06-18.md)
- [x] MPZ-API Fehler-Codes vereinheitlicht (`SCREAMING_SNAKE_CASE`, Cursor-Regel `.cursor/rules/error-conventions.mdc`) — 2026-06-18, Branch `mpz-studio-v2`, Issue #182
- [x] Issue **#173** (Raumbild-Upload Flat + 360°) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-173-2026-06-18.md](../../reviews/post-mortem/post-mortem-173-2026-06-18.md)
- [x] Issue **#174** (Deploy-Tab: Env, QR, Token, validate-all) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-174-2026-06-18.md](../../reviews/post-mortem/post-mortem-174-2026-06-18.md)
- [x] Issue **#175** (Dialog-Tab: Segmente, Gruppen, bubble) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-175-2026-06-18.md](../../reviews/post-mortem/post-mortem-175-2026-06-18.md)
- [x] Issue **#176** (Dialog-Hotspot anlegen/bearbeiten) — umgesetzt 2026-06-19, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-176-2026-06-19.md](../../reviews/post-mortem/post-mortem-176-2026-06-19.md)
- [x] Issue **#177** (Coach-Editor: coach-messages.json CRUD) — umgesetzt 2026-06-19, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-177-2026-06-19.md](../../reviews/post-mortem/post-mortem-177-2026-06-19.md)
- [x] Issue **#178** (Embed-Allowlist: `embed-allowlist.json` + Studio-UI) — umgesetzt 2026-06-19, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-178-2026-06-19.md](../../reviews/post-mortem/post-mortem-178-2026-06-19.md)
- [x] Issue **#179** (Hub/Icons-Config: `hub-slug-map.json`, Akzente, Icons + Studio-UI) — umgesetzt 2026-06-20, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-179-2026-06-20.md](../../reviews/post-mortem/post-mortem-179-2026-06-20.md)
- [x] Issue **#180** (Brand-Uploads: Logos, Maskottchen, Motive + Studio-UI) — umgesetzt 2026-06-20, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-180-2026-06-20.md](../../reviews/post-mortem/post-mortem-180-2026-06-20.md)
- [x] Issue **#181** (Doku & Epic-Abschluss) — umgesetzt 2026-06-20, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-181-2026-06-20.md](../../reviews/post-mortem/post-mortem-181-2026-06-20.md); schließt Epic [#170](https://github.com/flxln/schulnavigator/issues/170)
- [x] Epic **#170** (MPZ Studio v2 — Content & Betrieb) — abgeschlossen 2026-06-20, [epic-mpz-studio-v2.md](epic-mpz-studio-v2.md); GitHub-Issues #171–#181 **alle erledigt**
- [x] **Merge** Branch `mpz-studio-v2` → `main` — [PR #183](https://github.com/flxln/schulnavigator/pull/183) (2026-06-20)
- [x] **#154** Flat-Startpan (ADR-024) — umgesetzt 2026-06-20, Branch `feature/flat-startpan`, Post-Mortem [post-mortem-154-2026-06-20.md](../../reviews/post-mortem/post-mortem-154-2026-06-20.md)
- [x] Branch **`mpz-studio-v2.1`** von `main` angelegt (Entwicklung v2.1)
- [x] Epic **#186** (MPZ Studio v2.1) + Unterissues **#187–#190** — [epic-mpz-studio-v2.1.md](epics/epic-mpz-studio-v2.1.md)
- [x] Issue **#187** (Domain + API Datei ersetzen) — umgesetzt 2026-06-20, Branch `mpz-studio-v2.1`, Post-Mortem [post-mortem-187-2026-06-20.md](../../reviews/post-mortem/post-mortem-187-2026-06-20.md)
- [x] Issue **#188** (UI Datei ersetzen) — umgesetzt 2026-06-20, Branch `mpz-studio-v2.1`
- [x] Issue **#189** (Thumbnail-/Poster-Upload) — umgesetzt 2026-06-20, Branch `mpz-studio-v2.1`, Post-Mortem [post-mortem-189-2026-06-20.md](../../reviews/post-mortem/post-mortem-189-2026-06-20.md)
- [x] Issue **#190** (Doku & Epic-Abschluss v2.1) — umgesetzt 2026-06-20, Branch `mpz-studio-v2.1`, Post-Mortem [post-mortem-190-2026-06-20.md](../../reviews/post-mortem/post-mortem-190-2026-06-20.md); schließt Epic [#186](https://github.com/flxln/schulnavigator/issues/186)
- [x] Epic **#186** (MPZ Studio v2.1 — Medien-Datei ersetzen) — abgeschlossen 2026-06-20, [epic-mpz-studio-v2.1.md](epics/epic-mpz-studio-v2.1.md); GitHub-Issues #187–#190 **alle erledigt**
- [x] **Merge** Branch `mpz-studio-v2.1` → `main` — [PR #194](https://github.com/flxln/schulnavigator/pull/194) (2026-06-20, Commit `4f7accc`)
- [x] Epic **#191** (Coach-Erweiterungen) — abgeschlossen 2026-06-20, [epic-coach-erweiterungen.md](epics/epic-coach-erweiterungen.md); in PR #194 gemerged

Letzter dokumentierter Abgleich: **2026-06-20** (PR #194 gemerged: v2.1 #186–#190 + Coach #191–#193).
