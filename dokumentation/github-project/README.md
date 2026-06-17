# GitHub-Projekt (Schulnavigator)

Dieser Ordner ist die **führende Spezifikation** für Milestones und Issues in [flxln/schulnavigator](https://github.com/flxln/schulnavigator). GitHub spiegelt den Stand nach manuellem Abgleich wider.

## Dateien

| Datei | Inhalt |
|-------|--------|
| [milestones.md](milestones.md) | Beschreibungstexte und Fälligkeiten der Phasen-Milestones (1:1 für GitHub nutzbar) |
| [issues-phase-0.md](issues-phase-0.md) … [issues-phase-5.md](issues-phase-5.md) | Issues pro Phase inkl. Labels, Assignees, Akzeptanzkriterien |
| [issues-schulfest-gs39-nachtrag.md](issues-schulfest-gs39-nachtrag.md) | Epic **#86** (Vorlage): GS39-Nachtrag Schulfest/Hof-QR/Content — Unterissues #87–#91, Anpassung #39 |
| [epic-tablet-ipad-layout.md](epic-tablet-ipad-layout.md) | Epic **#74** (umgesetzt 2026-06-14): Tablet/iPad-Layout — Parent + Unterissues #75–#78 |
| [epic-externe-medien-hotspot-marker.md](epic-externe-medien-hotspot-marker.md) | Epic **#97**: ADR-017 — Hotspot-Marker, `link`, `embed` — Unterissues #98–#100 |
| [epic-coach-fortschritt.md](epic-coach-fortschritt.md) | Epic **#121**: ADR-019 — Coach Fortschritts-Einblendungen — Unterissue #122 (Raum-Overlay-Priorität) |
| [epic-hub-wegweiser.md](epic-hub-wegweiser.md) | Epic **#124**: ADR-020 — Hub Wegweiser Schulhof/Turnhalle, 12 Stationen |
| [epic-zugangsmodus-konfigurierbar.md](epic-zugangsmodus-konfigurierbar.md) | Epic **#132**: ADR-021 — Zugangsmodus `open`/`gated`, Tokens ENV, Embedding/CSP — Unterissues #133–#139 |
| [epic-mpz-studio.md](epic-mpz-studio.md) | Epic **#144**: ADR-022 — MPZ Studio v0 (internes Dev-only-Ingest-Tool) — Unterissues #145–#151, #153 · eigener Milestone „MPZ Studio v0" |
| [issues-startblick.md](issues-startblick.md) | Startblick Sphere (#152, #153) und Flat-Startpan (#154) — ADR-023/024 |
| [labels.md](labels.md) | Label-Konventionen |

Architektur und Phasenlogik siehe außerdem [projektplan.md](../projektplan.md) und [entscheidungen.md](../entscheidungen.md).

## Sync-Regel

1. Änderungen **zuerst** in den Markdown-Dateien hier festhalten.
2. Anschließend GitHub anpassen (`gh issue edit`, `gh issue create`, Milestone per `gh api …/milestones/{n}`).
3. Bei neuen Issues die Zeile **GitHub:** in der zugehörigen Phase-Datei mit der Issue-URL ergänzen.

## Checkliste nach größeren Planänderungen

- [ ] Alle sechs Milestone-Beschreibungen mit [milestones.md](milestones.md) verglichen und bei Abweichung auf GitHub gepatcht.
- [x] Offene Issue-Titel und Bodies zu „11 Stationen“, Directus (#46/#47) und Raum-Viewer (#55/#56) geprüft — #55/#56 in [issues-phase-2.md](issues-phase-2.md) abgehakt, Code umgesetzt.
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
- [x] Epic **#74** (Tablet/iPad Layout) + **#75–#78** — geschlossen 2026-06-14, Branch `feat/tablet-ipad-layout`; [ADR-012](../adr/012-tablet-ipad-responsive-layout.md) entschieden
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

- [x] Epic **#144** (MPZ Studio v0, ADR-022) — #145–#149 erledigt; #150–#151, #153 offen; [epic-mpz-studio.md](epic-mpz-studio.md)
- [ ] **#152–#154** Startblick/Startpan (ADR-023/024) — [issues-startblick.md](issues-startblick.md)

Letzter dokumentierter Abgleich: **2026-06-17** (#149 Nacharbeit: `withMpzWriteLock`, Sphere-Kalib-Navigation; #152–#154 Startblick/Startpan).
