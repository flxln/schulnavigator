---
title: "ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze"
github_number: 253
github_url: "https://github.com/flxln/schulnavigator/issues/253"
status: abgeschlossen
parent: "#47"
depends_on:
  - "#251"
  - "#252"
---

# ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze

## Ziel

ADR-030 (nächste freie Nummer beim Anlegen prüfen) festlegen: Migrationsstrategie JSON ↔ Directus und Content-Freeze-Regeln für den Directus-Pilot; E2-Fragen belegt; Folgen für #255, #256, #257, #259, #261, #262 dokumentieren. Kein App-Code.

## Akzeptanzkriterien

- [x] Neue ADR unter `dokumentation/adr/` (Migrationsstrategie + Content-Freeze)
- [x] Vier E2-Themen entschieden (SoT-Wechsel, Freeze, MPZ Studio, kanonische Slugs)
- [x] Freeze-Regeln für #259 mechanisch anwendbar
- [x] Konsistent mit ADR-022, ADR-028, ADR-029
- [x] Eintrag in `dokumentation/entscheidungen.md`
- [x] Folgen für #255, #256, #257, #259, #261, #262 benannt
- [x] Kein App-Code geändert

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md` (E2)
- Checkliste: [`checkliste-#253-adr-migration-freeze.md`](../checklists/checkliste-%23253-adr-migration-freeze.md)
- Triage: [`triage-#253-adr-migrationsstrategie.md`](../triage/triage-%23253-adr-migrationsstrategie.md)
- Pre-Mortem: [`pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md`](../../reviews/pre-mortem/pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md)
- Post-Mortem: [`post-mortem-253-2026-11-02.md`](../../reviews/post-mortem/post-mortem-253-2026-11-02.md)
- Ergebnis: [ADR-030](../../adr/030-migrationsstrategie-content-freeze.md)
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Vorgabe Runtime: [ADR-029](../../adr/029-runtime-datenpfad-directus.md) (#252)
- Entblockt nach Merge: #255, #259
<!-- planung-berechnet: abhaengigkeiten -->
<!-- /planung-berechnet -->
