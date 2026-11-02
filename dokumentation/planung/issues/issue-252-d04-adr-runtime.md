---
title: "ADR: Runtime-Datenpfad (Build-JSON vs. Runtime-Fetch vs. Webhook-Rebuild)"
github_number: 252
github_url: "https://github.com/flxln/schulnavigator/issues/252"
status: umgesetzt
parent: "#47"
depends_on:
  - "#251"
---

# ADR: Runtime-Datenpfad

## Ziel

ADR-029 festlegen: Runtime-Fetch + Data-Cache (Option b) für Directus-Content; E1-Kriterien belegt; Folgen für #256–#257 dokumentieren. Kein App-Code.

## Akzeptanzkriterien

- [x] Neue ADR unter `dokumentation/adr/` (`029-runtime-datenpfad-directus.md`)
- [x] Option b entschieden; a/c unter „Verworfene Alternativen“ (c mit Re-Trigger)
- [x] Fünf E1-Kriterien nur für b beantwortet (Preview = Abweichung)
- [x] Eintrag in `dokumentation/entscheidungen.md`
- [x] Folgen für #256, #257, #255, #253, #259 benannt
- [x] Kein App-Code geändert

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md` (E1)
- Checkliste: [`checkliste-#252-adr-runtime-datenpfad.md`](../checklists/checkliste-%23252-adr-runtime-datenpfad.md)
- Post-Mortem: [`post-mortem-252-2026-11-02.md`](../../reviews/post-mortem/post-mortem-252-2026-11-02.md)
- Ergebnis: [ADR-029](../../adr/029-runtime-datenpfad-directus.md)
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Entblockt nach Merge: #256, #257
<!-- planung-berechnet: abhaengigkeiten -->
<!-- /planung-berechnet -->
