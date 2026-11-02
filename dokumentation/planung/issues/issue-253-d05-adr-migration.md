---
title: "ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze"
github_number: 253
github_url: "https://github.com/flxln/schulnavigator/issues/253"
status: offen
parent: "#47"
depends_on:
  - "#251"
  - "#252"
---

# ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze

## Ziel

ADR-030 (nächste freie Nummer beim Anlegen prüfen) festlegen: Migrationsstrategie JSON ↔ Directus und Content-Freeze-Regeln für den Directus-Pilot; E2-Fragen belegt; Folgen für #255, #259, #262 dokumentieren. Kein App-Code.

## Akzeptanzkriterien

- [ ] Neue ADR unter `dokumentation/adr/` (Migrationsstrategie + Content-Freeze)
- [ ] Vier E2-Themen entschieden (SoT-Wechsel, Freeze, MPZ Studio, kanonische Slugs)
- [ ] Freeze-Regeln für #259 mechanisch anwendbar
- [ ] Konsistent mit ADR-022, ADR-028, ADR-029
- [ ] Eintrag in `dokumentation/entscheidungen.md`
- [ ] Folgen für #255, #259, #262 benannt
- [ ] Kein App-Code geändert

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md` (E2)
- Checkliste: [`checkliste-#253-adr-migration-freeze.md`](../checklists/checkliste-%23253-adr-migration-freeze.md)
- Triage: [`triage-#253-adr-migrationsstrategie.md`](../triage/triage-%23253-adr-migrationsstrategie.md)
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Vorgabe Runtime: [ADR-029](../../adr/029-runtime-datenpfad-directus.md) (#252)
- Blockiert durch: #251, #252 (ADR-029)
- Blockiert: #259, #255
<!-- planung-berechnet: abhaengigkeiten -->
<!-- /planung-berechnet -->
