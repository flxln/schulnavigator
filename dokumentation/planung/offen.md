# Offene Punkte — Schulnavigator

**Stand:** 2026-07-04 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

**Letzter Abgleich:** 2026-07-04 — `kunde/39-gs` → `feature/mpz-studio` Funktionsport (`9df7355`, [Post-Mortem](../reviews/post-mortem/post-mortem-mpz-kunde-feature-port-2026-07-04.md)); zuvor #218 D1 Design & Hub erledigt ([218](../reviews/post-mortem/post-mortem-218-2026-07-04.md)). Epic **#205** — nächstes [#219](https://github.com/flxln/schulnavigator/issues/219) oder [#214](https://github.com/flxln/schulnavigator/issues/214).

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Technik (MPZ / Viewer)

*`feature/mpz-studio` (2026-07-04): Deploy (#228–#230, #233), ADR-026-Code, Raumbild-Limits, MPZ-Banner von `kunde/39-gs` portiert — [Post-Mortem](../reviews/post-mortem/post-mortem-mpz-kunde-feature-port-2026-07-04.md). Prod: `kunde/39-gs`.*

*(keine offenen Startblick/Startpan-Issues — #185 erledigt 2026-06-20; CSP-Enforcement #143 erledigt 2026-06-20)*

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| Epic [#205](https://github.com/flxln/schulnavigator/issues/205) | MPZ Studio v3 Visual Polish | #214, #217, #219–#220; [epic-mpz-studio-v3-visual-polish.md](./epic-mpz-studio-v3-visual-polish.md); Funktionsport kunde→feature ✅ (2026-07-04); nächstes: [#219](https://github.com/flxln/schulnavigator/issues/219) oder [#214](https://github.com/flxln/schulnavigator/issues/214) (`#206`–`#218` ✅) |
| [#221](https://github.com/flxln/schulnavigator/issues/221) | Dialog: Text-only-Segmente | Code auf `feature/mpz-studio` (ADR-026); Lesewelt-Pilot-Content offen |
| [#17](https://github.com/flxln/schulnavigator/issues/17) | Raumbilder liefern (extern) | 8/11; fehlen: `kunst`, `hort`, `schulsozialarbeit` |
| Epic [#86](https://github.com/flxln/schulnavigator/issues/86) | Schulfest GS39 Nachtrag | bis #90/#91; Details [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md) |
| [#89](https://github.com/flxln/schulnavigator/issues/89) | Sonnentest QR-Druck | technisch erledigt; Feldtest ausstehend |

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

- Coach-Texte final mit MPZ abstimmen (`app/content/coach-messages.json`)
- `prefers-reduced-motion` für Coach manuell am Gerät prüfen

## Technische Fragen (ohne ADR)

Siehe [technische-fragen.md](../technische-fragen.md) — u. a. YouTube-Recht, H5P/DSB, Directus-Rollen.
