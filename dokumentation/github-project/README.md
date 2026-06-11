# GitHub-Projekt (Schulnavigator)

Dieser Ordner ist die **führende Spezifikation** für Milestones und Issues in [flxln/schulnavigator](https://github.com/flxln/schulnavigator). GitHub spiegelt den Stand nach manuellem Abgleich wider.

## Dateien

| Datei | Inhalt |
|-------|--------|
| [milestones.md](milestones.md) | Beschreibungstexte und Fälligkeiten der Phasen-Milestones (1:1 für GitHub nutzbar) |
| [issues-phase-0.md](issues-phase-0.md) … [issues-phase-5.md](issues-phase-5.md) | Issues pro Phase inkl. Labels, Assignees, Akzeptanzkriterien |
| [issues-schulfest-gs39-nachtrag.md](issues-schulfest-gs39-nachtrag.md) | Epic **#86** (Vorlage): GS39-Nachtrag Schulfest/Hof-QR/Content — Unterissues #87–#91, Anpassung #39 |
| [epic-tablet-ipad-layout.md](epic-tablet-ipad-layout.md) | Epic **#74** (geplant): Tablet/iPad-Layout — Parent + Unterissues #75–#78, Issue-Bodies für GitHub |
| [epic-externe-medien-hotspot-marker.md](epic-externe-medien-hotspot-marker.md) | Epic **#97**: ADR-017 — Hotspot-Marker, `link`, `embed` — Unterissues #98–#100 |
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
- [ ] Epic **#74** (Tablet/iPad Layout) + **#75–#78** — angelegt 2026-05-28; Spezifikation [epic-tablet-ipad-layout.md](epic-tablet-ipad-layout.md), [ADR-012](../adr/012-tablet-ipad-responsive-layout.md)
- [x] Issue **#27** (Raumfotos einpflegen) — geschlossen 2026-06-08: 8× Panorama in `public/stations/`, LFS, `export-pano.mjs`
- [ ] Issue **#17** (Raumfotos liefern, extern) — Teillieferung 8/11; offen: `kunst`, `hort`, `schulsozialarbeit`
- [x] Issues **#18–#20** (Audio-/Video-Player, Foto-Viewer) — geschlossen 2026-06-09: `app/components/media/`, `MediaPlayerByTyp`, `poster?`-Schema
- [x] Issue **#93** (TextViewer inline + Demo `klassenzimmer`) — geschlossen 2026-06-10: `TextViewer`, `public/media/klassenzimmer/`, 4 Hotspots

- [ ] Epic **#97** (ADR-017) — Stufe 1–2 erledigt (#98 PR #101, #99 PR #102); #100 offen; [epic-externe-medien-hotspot-marker.md](epic-externe-medien-hotspot-marker.md)

- [x] Issue **#103** (Startseite: Hub volle Breite, Wordmark Dresden-Plauen, `Gs39ChipMark`, Folge ADR-016) — umgesetzt 2026-06-10
- [x] Issue **#104** (Scan-CTA ohne Stationsnamen, Fortschrittskarte → `/stationen`, Folge #84) — umgesetzt 2026-06-11
- [x] Issue **#105** (Stationssymbole statt Nummerierung — Lucide, Hub/Liste/Raum) — umgesetzt 2026-06-11

Letzter dokumentierter Abgleich: **2026-06-11** (#105 Stationssymbole; #104 CTA; Epic #97: #100 auf Branch `feature/100-typ-embed`); zuvor **2026-06-10** (#103 Wordmark/Layout).
