# Dokumentation — Schulnavigator

Landkarte der Projekt-Dokumentation. **Anleitungen** (How-to) liegen in [`anleitungen/`](../anleitungen/).

## Kern (Root)

| Datei | Inhalt |
|-------|--------|
| [entscheidungen.md](./entscheidungen.md) | ADR-Index |
| [architektur.md](./architektur.md) | Tech-Stack, Datenmodell, Viewer |
| [technische-fragen.md](./technische-fragen.md) | Offene Punkte ohne ADR |
| [dsgvo.md](./dsgvo.md) | Datenschutzkonzept |
| [build-kontext-submodule-regeln.md](./build-kontext-submodule-regeln.md) | Docker nur `app/`; Submodule nicht im Image |

## Ordner

| Ordner | Inhalt |
|--------|--------|
| [adr/](./adr/) | Architecture Decision Records |
| [content/](./content/) | Slugs, Pfade, Pflege-Übersicht |
| [planung/](./planung/) | GitHub-Issues, Milestones, offene Punkte |
| [spezifikationen/](./spezifikationen/) | Feature-Specs (z. B. MPZ Studio) |
| [ideen/](./ideen/) | Produktideen (offen / archiv) |
| [reviews/](./reviews/) | Pre-/Post-Mortems zu Issues |
| [archiv/](./archiv/) | Eingefrorene Pläne, Meetings, Design-Prototypen |

## Schnellzugriff nach Rolle

| Rolle | Start hier |
|-------|------------|
| Entwickler | [architektur.md](./architektur.md), [anleitungen/fuer-entwickler.md](../anleitungen/fuer-entwickler.md) |
| Content / MPZ | [content/pflege-uebersicht.md](./content/pflege-uebersicht.md), [anleitungen/content-einpflegen.md](../anleitungen/content-einpflegen.md) |
| Planung / Issues | [planung/offen.md](./planung/offen.md), [GitHub Project](https://github.com/flxln/schulnavigator/projects) |
| Agenten | [CLAUDE.md](../CLAUDE.md), [build-kontext-submodule-regeln.md](./build-kontext-submodule-regeln.md) |

## Pflege-Regeln

- **Architekturentscheidung** → neuer ADR in `adr/`, Eintrag in `entscheidungen.md`
- **Feature-Idee** → `ideen/offen/`; nach Umsetzung nach `ideen/archiv/` mit Verweis auf ADR
- **Issue-Spec** → GitHub führend; Repo: `planung/offen.md` + ggf. Epic in `planung/archiv/epics/`
- **Spike / Meeting** → `archiv/projektmanagement/` mit Datum im Dateinamen
- **Temporäre Agenten-Pläne** → `.cursor/plans/`; nach Merge Essenz in ADR oder Post-Mortem
