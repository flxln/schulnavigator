# Offene Punkte — Schulnavigator

**Stand:** 2026-07-04 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

**Letzter Abgleich:** 2026-07-04 — Runtime- und Compliance-Port nach `main` (Dialog ADR-026, Legal, Media-Gate S1, ADR-027); MPZ Studio v3 (**#205**) eingefroren — Schulfest-Zweck erfüllt, Studio laut ADR-022 temporär.

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Technik (MPZ / Viewer)

*(Schüler-Medien Deploy-Trennung Epic #226 abgeschlossen 2026-06-24 — [ADR-027](../adr/027-schuelermedien-nicht-in-git.md); History [#232](https://github.com/flxln/schulnavigator/issues/232) erledigt)*

**ADR-026-Restthema:** Eingebettete Dialog-Bubble zeigt für Text-only-Segmente noch kein „Weiter“ — Viewer-Cutscene (`DialogPlayer`) ist abgedeckt; Follow-up optional.

*(keine offenen Startblick/Startpan-Issues — #185 erledigt 2026-06-20; CSP-Enforcement #143 erledigt 2026-06-20)*

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| Epic [#205](https://github.com/flxln/schulnavigator/issues/205) | MPZ Studio v3 Visual Polish | **eingefroren** (2026-07-04) — Schulfest-Zweck erfüllt; #219, #214, #217, #220 nicht weiterverfolgt |
| [#17](https://github.com/flxln/schulnavigator/issues/17) | Raumbilder liefern (extern) | 8/11; fehlen: `kunst`, `hort`, `schulsozialarbeit` |
| Epic [#86](https://github.com/flxln/schulnavigator/issues/86) | Schulfest GS39 Nachtrag | bis #90/#91; Details [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md) |
| [#89](https://github.com/flxln/schulnavigator/issues/89) | Sonnentest QR-Druck | technisch erledigt; Feldtest ausstehend |
| [#221](https://github.com/flxln/schulnavigator/issues/221) | Dialog: Text-only-Segmente | Sprechblase ohne Audio; Pilot Lesewelt; Milestone Phase 5 |
| [#48](https://github.com/flxln/schulnavigator/issues/48) | i18n + Englisch-Menü aktivieren | `de.json`/`en.json`, Sprachumschalter; inkl. ehem. #24; Milestone Phase 5 |

## Repo-Wartung

- [ ] Issue-Tracker auf veraltete Formulierungen prüfen (z. B. „8 Stationen“, Admin ohne Directus-Kontext)
- [ ] Milestone-Beschreibungen mit [milestones.md](./milestones.md) abgleichen

## Ideen (noch nicht umgesetzt)

| Idee | Datei |
|------|--------|
| Dialog: engere Maskottchen-Positionen | [ideen/archiv/dialog-maskottchen-abstand-und-pan.md](../ideen/archiv/dialog-maskottchen-abstand-und-pan.md) — Mitpan erledigt (ADR-013), Abstand offen |
| Hub: Maskottchen als dauerhafter CTA | [ideen/archiv/maskottchen-fest-umfang.md](../ideen/archiv/maskottchen-fest-umfang.md) — Punkt 2 nicht umgesetzt |
| MPZ Studio v3 (Polish) | [ideen/archiv/mpz-studio-ui.md](../ideen/archiv/mpz-studio-ui.md) — Komfort-Editoren (Markdown, Bubble-Drag) **nicht** in #205 |

## Content / MPZ

- [x] **Post-Fest GS39** (`kunde/39-gs`): Heft-Hub per Fest-Entry-QR ohne Neudruck — [Playbook §8](../../anleitungen/schulfest-gs39-playbook.md), ADR-021 Nachtrag 2026-06-27
- Coach-Texte final mit MPZ abstimmen (`app/content/coach-messages.json`)
- `prefers-reduced-motion` für Coach manuell am Gerät prüfen

## Technische Fragen (ohne ADR)

Siehe [technische-fragen.md](../technische-fragen.md) — u. a. YouTube-Recht, H5P/DSB, Directus-Rollen.
