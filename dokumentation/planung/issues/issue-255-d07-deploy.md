> **Überholt durch [ADR-032](../../adr/032-mpz-studio-produktions-admin.md)** (3. November 2026), auf GitHub als „not planned“ geschlossen. Nachfolger-Epic: [#273](https://github.com/flxln/schulnavigator/issues/273). Text unten ist Historie.


---

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md`
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Blockiert durch: #251, #252, #253, #254, laufendes Deploy auf dem neuen IONOS-Server
- Blockiert: #256, #257, #258, #260
- Pipeline-Triage (03b): VOLL · Fable (Score 6/8; B=2 Admin-Zugang)

## Halt

Stand 3. November 2026 (Felix): Die 39. Grundschule bekommt vorerst kein Directus. `https://39-gs.mpz.schule` bleibt auf JSON und `release/39-gs`. Directus ist für eine eigene Instanz auf dem neuen IONOS-Server vorgesehen. Dort gibt es derzeit Deploy-Probleme. Dieses Issue startet erst, wenn der Server deployt. Die ADRs 029, 030 und 031 gelten für diese künftige Instanz und werden nicht auf die 39. GS angewendet.
