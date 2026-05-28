# GitHub-Projekt (Schulnavigator)

Dieser Ordner ist die **führende Spezifikation** für Milestones und Issues in [flxln/schulnavigator](https://github.com/flxln/schulnavigator). GitHub spiegelt den Stand nach manuellem Abgleich wider.

## Dateien

| Datei | Inhalt |
|-------|--------|
| [milestones.md](milestones.md) | Beschreibungstexte und Fälligkeiten der Phasen-Milestones (1:1 für GitHub nutzbar) |
| [issues-phase-0.md](issues-phase-0.md) … [issues-phase-5.md](issues-phase-5.md) | Issues pro Phase inkl. Labels, Assignees, Akzeptanzkriterien |
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
- [x] Issue **#21** (Stempel + Hub-Freischaltung) — geschlossen (`sn_visited_slugs`, `hub-with-progress`)
- [x] Epic **#58** (GS39 UI) + Teil-Issues **#59–#63** — geschlossen (PR #64–#68, merged 2026-05-27)
- [x] Issue **#22** (Abschluss-Animation) — geschlossen (über #63 / `SparkleBurst`)
- [ ] Suche im Repo-Issue-Tracker nach veralteten Formulierungen (z. B. „8 Stationen“, „Admin-Interface entwickeln“ ohne Directus-Kontext).

- [x] Issue **#69** (Otto-Frieda-Dialog `daz`/`pc-raum`, ADR-010, gated Audio) — geschlossen (2026-05-28)
- [x] Issue **#71** (Maskottchen-Hotspots UI, ADR-011) — geschlossen (2026-05-28, `main` @ `14cb740`)
- [x] Issue **#72** (Raum-UI TopBar/Chip, Follow-up #71) — geschlossen (2026-05-28, [PR #73](https://github.com/flxln/schulnavigator/pull/73) → `main` @ `7fc23c6`)

Letzter dokumentierter Abgleich: **2026-05-28** (#72 merged; #71 ADR-011; #69 Audio; zuvor 2026-05-27 #58/#59–#63/#22).
