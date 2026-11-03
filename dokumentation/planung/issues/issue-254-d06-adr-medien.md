---
title: "ADR: Medien-Storage (`public/`-Volumes vs. Directus-Assets vs. Object Storage) — Gate-kompatibel"
github_number: 254
github_url: "https://github.com/flxln/schulnavigator/issues/254"
status: abgeschlossen
parent: "#47"
depends_on:
  - "#251"
---

# ADR: Medien-Storage (Gate-kompatibel)

## Ziel

ADR-031 festlegen: Medien-Storage für den Directus-Piloten (E3), kompatibel zum Entry-Cookie-Gate (Audit S1) und ADR-027; Folgen für #255–#260, #262, #263 dokumentieren. Kein App-Code.

## Akzeptanzkriterien

- [x] Neue ADR unter `dokumentation/adr/` (`031-medien-storage-directus-proxy.md`, Nummer beim Anlegen verifiziert)
- [x] E3-Option entschieden (b-Proxy); verworfene Alternativen mit Gate-/Spike-Beleg (a allein, b-direkt, c)
- [x] Fünf E3-Kriterien für die gewählte Option beantwortet (Ja/Nein/Abweichung) mit Beleg und Folge-Issue
- [x] Scope-Frage Lehrkräfte-Upload im ADR geklärt (Felix, 2026-11-03: Lehrkräfte laden hoch; Re-Trigger formuliert)
- [x] Eintrag in `dokumentation/entscheidungen.md`
- [x] Pfad-Vertrag für `quelle` (Form 1 & 2 inkl. `icons`) und D-7-Klarstellung im ADR enthalten
- [x] Folgen für #255, #256, #257, #258, #259, #260, #262, #263 benannt
- [x] Kein App-Code geändert

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md` (E3)
- Checkliste: [`checkliste-#254-adr-medien-storage.md`](../checklists/checkliste-%23254-adr-medien-storage.md)
- Triage: [`triage-#254-adr-medien-storage.md`](../triage/triage-%23254-adr-medien-storage.md)
- Pre-Mortem: [`pre-mortem-1b-adr-medien-storage-254-2026-11-03.md`](../../reviews/pre-mortem/pre-mortem-1b-adr-medien-storage-254-2026-11-03.md)
- Post-Mortem: [`post-mortem-254-2026-11-03.md`](../../reviews/post-mortem/post-mortem-254-2026-11-03.md)
- Ergebnis: [ADR-031](../../adr/031-medien-storage-directus-proxy.md)
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Spike: `dokumentation/reviews/spike-directus-2026-07.md` (Phase 6)
- Blockiert durch: #251 (geschlossen)
- Entblockt nach Merge: #255, #259
<!-- planung-berechnet: abhaengigkeiten -->
<!-- /planung-berechnet -->
