# Epic: Coach — Fortschritts-Maskottchen (ADR-019)

**Milestone:** Phase 2 — Content-Struktur + UI  
**Status:** abgeschlossen (PR [#123](https://github.com/flxln/schulnavigator/pull/123) → `main` @ `f8ccb97`)

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#121` | Coach: Fortschritts-Maskottchen-Einblendungen (ADR-019) | `tech`, `design` | — |
| Unterissue | `#122` | Raum-Overlay-Priorität: Gyro → Pan → Coach | `tech` | #121 |

## Ziel

Fortschritts-getriggerte Maskottchen-Einblendungen (Frieda/Otto) getrennt vom Dialog-Hotspot: Hub-Meilensteine, Room-first-Hinweise, sequenzielle 11/11-Sequenz (Coach `complete` vor `SparkleBurst`). Raumseiten: Gyro-Berechtigung und Pan-Onboarding blockieren den Room-Coach bis zur Reihenfolge Gyro → Pan → Coach.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #121 | https://github.com/flxln/schulnavigator/issues/121 |
| #122 | https://github.com/flxln/schulnavigator/issues/122 |

## Kontext

- ADR: [019-coach-fortschritt-einblendung.md](../adr/019-coach-fortschritt-einblendung.md)
- Plan: `.cursor/plans/coach_sparkle_mvp_d9e82ce2.plan.md`, `.cursor/plans/raum-overlay-priorität_cc46226d.plan.md`
- Kurzidee: [maskottchen-fortschritt-einblendung.md](../kurzfristige-ideen/maskottchen-fortschritt-einblendung.md)

## Checkliste (Epic)

- [x] ADR-019, `coach-messages.json`, Validator, `coach-seen`/`coach-triggers`
- [x] `MascotPeekOverlay`, `CoachNudgeLayer`, `use-coach-nudge`
- [x] Hub: Meilensteine + Sparkle-Orchestrierung (`home-screen.tsx`)
- [x] Raum: Room-first-Coach, Dialog-/Panel-Guard
- [x] iOS: Coach-Overlay via Portal (`document.body`)
- [x] Raum-Overlay-Priorität (#122): `checking`-State, Viewer-Gate, Pan-Onboarding-Härtung
- [x] PR merge → `main` ([PR #123](https://github.com/flxln/schulnavigator/pull/123))
- [ ] Copy mit MPZ final abstimmen
- [ ] Manueller iOS-Test vor Schulfest
