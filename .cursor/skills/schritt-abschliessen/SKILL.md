---
name: schritt-abschliessen
description: >-
  Schließt einen abgeschlossenen Arbeitsschritt im Schulnavigator end-to-end ab:
  Kontext vom aktuellen Branch, Repo-Doku, GitHub-Issues syncen, Commit und Push.
  Erweitert den globalen Skill um Schulnavigator-Pfade und -Konventionen.
  Aktiviert bei: Schritt abschließen, /schritt-abschliessen, Feature fertig
  dokumentieren, Issue schließen, Epic anlegen, GitHub Project aktualisieren,
  Branch abschließen und pushen.
disable-model-invocation: true
---

# Schritt abschließen — Schulnavigator

**Zuerst** den globalen Skill `~/.cursor/skills/schritt-abschliessen/SKILL.md` vollständig anwenden.
Dieses Dokument ergänzt ihn mit festen Schulnavigator-Werten (keine Duplikation des Kern-Workflows).

## Feste Projektparameter

| Variable | Wert |
|----------|------|
| `GH_REPO` | `flxln/schulnavigator` |
| `DOC_ROOT` | `dokumentation/` |
| `PLAN_DIR` | `dokumentation/planung/` |
| `ADR_DIR` | `dokumentation/adr/` |
| `OFFEN_MD` | `dokumentation/planung/offen.md` |

Sprache: Deutsch (Doku, Issue-Bodies, Commit-Messages).

## Zusätzliche Regeln

- Entschiedene ADRs nicht überschreiben — bei ADR-Bedarf Skill `.cursor/skills/adr-erstellen/SKILL.md` befolgen.
- Sync-Regel: [planung/README.md](../../dokumentation/planung/README.md)

## Phase 2 — Schulnavigator-Doku

### 2b — Planung

| Situation | Datei |
|-----------|-------|
| Neues Epic | `epic-<thema>.md` (Vorlage: [epic-externe-medien-hotspot-marker.md](../../dokumentation/planung/epic-externe-medien-hotspot-marker.md)) |
| Einzelnes Issue | `planung/archiv/issues-phase-N.md` oder [offen.md](../../dokumentation/planung/offen.md) |
| Epic-Update | bestehende `epic-*.md` |
| Milestones | [milestones.md](../../dokumentation/planung/milestones.md) |

Labels aus [labels.md](../../dokumentation/planung/labels.md). Milestone-Namen exakt wie in `milestones.md`.

### 2c — Weitere Doku (bei Bedarf)

| Änderung | Datei |
|----------|-------|
| Content-Schema | `anleitungen/content-einpflegen.md` |
| Lokales Testen | `anleitungen/lokal-testen-und-anschauen.md` |
| DSGVO | `dokumentation/dsgvo.md` |
| Phasenstand | `dokumentation/archiv/projektplan.md` |
| Agenten-Überblick | `CLAUDE.md` |

### 2d — Checkliste

[planung/README.md](../../dokumentation/planung/README.md) und [offen.md](../../dokumentation/planung/offen.md): `[x]` setzen, Abgleich-Datum aktualisieren.

## Phase 3 — `gh`

`--repo flxln/schulnavigator` bei allen `gh`-Befehlen.

Draft-Dateien: `/tmp/` oder `dokumentation/planung/.draft-*` (nicht committen).

## Staging (zusätzlich)

Stagen: `dokumentation/`, `anleitungen/`, `CLAUDE.md`, `.cursor/skills/`, App-Code unter `app/`.

Nicht stagen: `app/.env.local`, `.draft-*`, `.cursor/debug-*.log`.

## Referenzen

| Thema | Pfad |
|-------|------|
| Globaler Skill | `~/.cursor/skills/schritt-abschliessen/SKILL.md` |
| ADR-Workflow | `.cursor/skills/adr-erstellen/SKILL.md` |
| Sync-Regel | `dokumentation/planung/README.md` |
| Entscheidungsindex | `dokumentation/entscheidungen.md` |
