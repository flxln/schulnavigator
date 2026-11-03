---
title: "ADR: Medien-Storage (`public/`-Volumes vs. Directus-Assets vs. Object Storage) — Gate-kompatibel"
github_number: 254
github_url: "https://github.com/flxln/schulnavigator/issues/254"
status: offen
parent: "#47"
depends_on:
  - "#251"
---

# ADR: Medien-Storage (Gate-kompatibel)

## Ziel

ADR-031 festlegen: Medien-Storage für den Directus-Piloten (E3), kompatibel zum Entry-Cookie-Gate (Audit S1) und ADR-027; Folgen für #255 und #259 dokumentieren. Kein App-Code.

## Akzeptanzkriterien

- [ ] Neue ADR unter `dokumentation/adr/` (`031-…`, Nummer beim Anlegen verifiziert)
- [ ] E3-Option entschieden; verworfene Alternativen mit Gate-/Spike-Beleg
- [ ] Fünf E3-Kriterien für die gewählte Option beantwortet (Ja/Nein/Abweichung)
- [ ] Scope-Frage Lehrkräfte-Upload im ADR geklärt
- [ ] Eintrag in `dokumentation/entscheidungen.md`
- [ ] Folgen für #255, #259 (Backup T5 / AVV wo relevant) benannt
- [ ] Kein App-Code geändert

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md` (E3)
- Checkliste: [`checkliste-#254-adr-medien-storage.md`](../checklists/checkliste-%23254-adr-medien-storage.md)
- Triage: [`triage-#254-adr-medien-storage.md`](../triage/triage-%23254-adr-medien-storage.md)
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Spike: `dokumentation/reviews/spike-directus-2026-07.md` (Phase 6)
- Blockiert durch: #251 (geschlossen)
- Blockiert: #255 (GitHub); #259 (Planung, noch nicht als blocking in GitHub)
