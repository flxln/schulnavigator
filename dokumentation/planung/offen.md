# Offene Punkte — Schulnavigator

**Stand:** 2026-07-04 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

**Letzter Abgleich:** 2026-07-04 — **#24** i18n nur noch Phase 5 (Post-Fest) in Archiv-Doku; GitHub-Milestone war bereits korrekt. Zuvor 2026-06-27 Post-Fest GS39 auf `kunde/39-gs`.

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Technik (MPZ / Viewer)

*(Schüler-Medien Deploy-Trennung Epic #226 abgeschlossen 2026-06-24 — [ADR-027](../adr/027-schuelermedien-nicht-in-git.md); History [#232](https://github.com/flxln/schulnavigator/issues/232) erledigt)*

*(keine offenen Startblick/Startpan-Issues — #185 erledigt 2026-06-20; CSP-Enforcement #143 erledigt 2026-06-20)*

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| Epic [#205](https://github.com/flxln/schulnavigator/issues/205) | MPZ Studio v3 Visual Polish | #214, #217–#220; [epic-mpz-studio-v3-visual-polish.md](./epic-mpz-studio-v3-visual-polish.md); nächstes: [#218](https://github.com/flxln/schulnavigator/issues/218) Design & Hub oder [#214](https://github.com/flxln/schulnavigator/issues/214) Flat-Kalibrierung (`#206`–`#216`, `#233` ✅) |
| [#17](https://github.com/flxln/schulnavigator/issues/17) | Raumbilder liefern (extern) | 8/11; fehlen: `kunst`, `hort`, `schulsozialarbeit` |
| Epic [#86](https://github.com/flxln/schulnavigator/issues/86) | Schulfest GS39 Nachtrag | bis #90/#91; Details [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md) |
| [#89](https://github.com/flxln/schulnavigator/issues/89) | Sonnentest QR-Druck | technisch erledigt; Feldtest ausstehend |
| [#221](https://github.com/flxln/schulnavigator/issues/221) | Dialog: Text-only-Segmente | Sprechblase ohne Audio; Pilot Lesewelt; Milestone Phase 5 |
| [#24](https://github.com/flxln/schulnavigator/issues/24) | i18n-Struktur Menütexte (DE + EN) | `de.json`/`en.json`; Umschalter inaktiv; Voraussetzung für #48; Milestone Phase 5 |

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
