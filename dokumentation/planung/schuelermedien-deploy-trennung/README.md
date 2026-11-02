# Schüler-Medien: Trennung GitHub / Deploy

**Stand:** 2026-06-24  
**Status:** Epic abgeschlossen (#231, 2026-06-24); ADR-027 entschieden; History [#232](https://github.com/flxln/schulnavigator/issues/232) bereinigt (2026-06-24)  
**Auslöser:** MPZ Studio schreibt Medien lokal ins Repo; `git push` legt Kinder-Inhalte (Fotos, Videos, Dialog-WAVs) auf GitHub — datenschutzrechtlich nicht akzeptabel.

## Ziel in einem Satz

**Code und Konfiguration über GitHub + Coolify; Schüler-Medien nur vom MPZ-Rechner direkt auf den IONOS-VPS — möglichst in einem automatisierten Deploy-Schritt.**

## Dokumente in diesem Ordner

| Datei | Inhalt |
|-------|--------|
| [01-anforderungen.md](./01-anforderungen.md) | Verbindliche Anforderungen (DSGVO, Workflow) |
| [02-ist-zustand.md](./02-ist-zustand.md) | Wie der MVP heute funktioniert und wo das scheitert |
| [03-zielarchitektur.md](./03-zielarchitektur.md) | Zwei-Bahnen-Modell, Volumes, Deploy-Ablauf |
| [04-umsetzungsplan.md](./04-umsetzungsplan.md) | Phasen, betroffene Dateien, Akzeptanzkriterien |
| [05-offene-punkte.md](./05-offene-punkte.md) | DSB/Schule, `stations.json`, Git-History, Coolify (T1–T6 technisch entschieden; O1–O5 entschieden 2026-06-24) |
| [07-inventar-github.md](./07-inventar-github.md) | Inventar Pre/Post-Rewrite (#227/#232); Handoff #228/#229 |
| [08-github-support-ticket-232.md](./08-github-support-ticket-232.md) | GitHub-Support-Vorlage LFS-Purge (#232) |
| [pre-mortem 1a](../../reviews/pre-mortem/pre-mortem-1a-schuelermedien-deploy-trennung.md) | Code-Praxis-Review: Mount-Masking, `git rm --cached`, rsync/SSH |
| [pre-mortem 1b](../../reviews/pre-mortem/pre-mortem-1b-repo-ignore.md) | Phase-1-Review: Studio-Ingest, Bahn-A-Presets, Path-Traversal (#228) |

> **Plan-Härtung 2026-06-24:** Die Funde aus Pre-Mortem 1a + 1b sind in `03`–`05` eingearbeitet (Fußnoten ¹–⁹, je Datei ein Abschnitt „Änderungslog"). Kernentscheide: Mount-Grenze + Icon-Umzug nach `public/stations-icons/`, `git rm --cached`, `:structure`-Validatoren im Build, `coach-audio` durchgängig Bahn B, rsync mit `accept-new` ohne `--delete`.

## Verwandte Entscheidungen

| ADR / Doku | Bezug |
|------------|--------|
| [ADR-004 — Video-Hosting MPZ](../../adr/004-video-hosting-mpz.md) | Auslieferung an Besucher aus DE — bleibt gültig |
| [ADR-022 — MPZ Studio](../../adr/022-mpz-studio-internes-ingest-tool.md) | Lokales Ingest — bleibt; Deploy-Pfad wird ergänzt |
| [ADR-027 — Schüler-Medien nicht in Git](../../adr/027-schuelermedien-nicht-in-git.md) | Architekturentscheidung (Status: **entschieden**, 2026-06-24) |
| [dsgvo.md](../../dsgvo.md) | AVV, Einwilligungen, Schüler-Medien |
| [build-kontext-submodule-regeln.md](../../build-kontext-submodule-regeln.md) | Docker-Build nur `app/`; Git LFS heute |

## GitHub

| Artefakt | Link |
|----------|------|
| Milestone | [#14 — Schüler-Medien Deploy-Trennung](https://github.com/flxln/schulnavigator/milestone/14) |
| Epic | [#226](https://github.com/flxln/schulnavigator/issues/226) |
| Epic-Doku | [epic-schuelermedien-deploy-trennung.md](../epic-schuelermedien-deploy-trennung.md) |

## Abgeschlossen (2026-06-24)

1. ~~[#227 — Abstimmung DSB/Schule](https://github.com/flxln/schulnavigator/issues/227)~~ — erledigt
2. ~~[#228 Phase 1](https://github.com/flxln/schulnavigator/issues/228)~~ — Repo & Ignore
3. ~~[#229 Phase 2](https://github.com/flxln/schulnavigator/issues/229)~~ — Coolify-Volumes, Structure-Validatoren, Media-Route
4. ~~[#230 Phase 3](https://github.com/flxln/schulnavigator/issues/230)~~ — Deploy-Automatisierung
5. ~~[#231 Phase 4](https://github.com/flxln/schulnavigator/issues/231)~~ — Doku & Compliance, ADR-027 entschieden

**Separat erledigt:** [#232](https://github.com/flxln/schulnavigator/issues/232) Git-History bereinigt (2026-06-24); GitHub-Support LFS-Purge: [08-github-support-ticket-232.md](./08-github-support-ticket-232.md)
