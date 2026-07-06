# Planung — GitHub Issues & Milestones

Abgleich mit [flxln/schulnavigator](https://github.com/flxln/schulnavigator). **Offene Punkte:** [offen.md](./offen.md).

## Root

| Datei | Inhalt |
|-------|--------|
| [offen.md](./offen.md) | Schlanke Liste offener Issues und Ideen |
| [milestones.md](./milestones.md) | Milestone-Beschreibungen für GitHub |
| [labels.md](./labels.md) | Label-Konventionen |
| [epics/](./epics/) | Aktive Epic-Spezifikationen (derzeit: [Directus #47](./epics/epic-directus.md)) — nach Abschluss ins Archiv |
| [issues/](./issues/) | GitHub-Issue-Bodies (`gh issue create --body-file`); derzeit Directus #249–#262 |

## Archiv

| Pfad | Inhalt |
|------|--------|
| [archiv/issues-phase-0.md](./archiv/issues-phase-0.md) … [phase-5](./archiv/issues-phase-5.md) | Historische Issues pro Phase |
| [archiv/epics/](./archiv/epics/) | Epic-Spezifikationen (abgeschlossen und Nachträge) |

Domänen-Matrix MPZ Studio: [ideen/archiv/mpz-studio-ui.md](../ideen/archiv/mpz-studio-ui.md).

## Verwandte Doku (nicht in `planung/`)

| Thema | Ort |
|-------|-----|
| Backup T5 (Ops, #243–#248) | [anleitungen/backup-t5/](../../anleitungen/backup-t5/) |
| Directus Auth (#47) | [spezifikationen/directus-auth-konzept.md](../spezifikationen/directus-auth-konzept.md) |
| Schulfest GS39 Playbook | [anleitungen/schulfest-gs39-playbook.md](../../anleitungen/schulfest-gs39-playbook.md) |
| Meeting #44 Leitfaden | [archiv/projektmanagement/2026-06-meeting-44-leitfaden.md](../archiv/projektmanagement/2026-06-meeting-44-leitfaden.md) |

## Sync-Regel

1. Neue offene Punkte in [offen.md](./offen.md) und auf GitHub pflegen.
2. Abgeschlossene Epics nicht löschen — in `archiv/epics/` belassen.
3. Große Planänderungen: GitHub anpassen (`gh issue edit`, `gh issue create`).

Vollständiger Abgleich-Log (bis 2026-06-20): [archiv/sync-log-2026-06.md](./archiv/sync-log-2026-06.md).

Siehe auch [entscheidungen.md](../entscheidungen.md), [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren).
