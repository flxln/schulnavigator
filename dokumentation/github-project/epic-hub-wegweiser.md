# Epic: Hub Wegweiser — Außen-Stationen (ADR-020)

**Milestone:** Phase 2 — Content-Struktur + UI  
**Status:** abgeschlossen (Branch `feature/hub-wegweiser` → `main`)

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#124` | Hub: Wegweiser-Slots für Schulhof und Turnhalle (ADR-020) | `tech`, `design` | — |

## Ziel

Turnhalle und Schulhof als Wegweiser-Schildarme am Hub-Portal; zwölfte Station `schulhof` mit Minimal-Panorama; erweiterter Slot-Vertrag für rotierte Trefferflächen.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #124 | https://github.com/flxln/schulnavigator/issues/124 |

## Kontext

- ADR: [020-hub-wegweiser-aussen-stationen.md](../adr/020-hub-wegweiser-aussen-stationen.md)
- Ergänzt [ADR-016](../adr/016-hub-frontansicht-39gs.md)
- Plan: `.cursor/plans/hub_wegweiser_slots_c7386ac9.plan.md`

## Checkliste (Epic)

- [x] Slot-Typ `wegweiser`, `hitFrame`/`chipAnchor`/`rotation`
- [x] Hub-SVG + `front-schoolhouse.tsx` Rendering
- [x] Station `schulhof`, QR-Manifest 12 Stationen, Tests/Build
- [x] ADR-020, `entscheidungen.md`, Content-Verzeichnis
- [ ] Schulhof-Medien/Hotspots (separates Content-Issue)
- [ ] Manueller Hub-/Raum-Check vor Schulfest
