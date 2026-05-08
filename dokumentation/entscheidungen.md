# Schulnavigator — Architekturentscheidungen (Index)

Jede wichtige Entscheidung wird als eigenständiger ADR (Architecture Decision Record) im Ordner [`adr/`](./adr/) abgelegt. Diese Datei dient als Übersicht und Pflegeort.

## Übersicht

| Nr. | Titel | Status | Datum |
|---|---|---|---|
| [001](./adr/001-hosting-coolify.md) | Hosting: MPZ-Hetzner-Server mit Coolify | entschieden | 2026-05-07 |

## Konventionen

- **Dateinamen:** `NNN-kebab-case-titel.md`, fortlaufend nummeriert
- **Status:** `offen` → `entschieden` → ggf. `ersetzt durch ADR-XXX`
- **Vorlage:** [`adr/000-template.md`](./adr/000-template.md)
- Einmal getroffene und entschiedene ADRs werden **nicht überschrieben**, sondern bei Bedarf durch neue ADRs ersetzt (Status: `ersetzt durch …`).
