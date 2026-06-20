# Offene Punkte — Schulnavigator

**Stand:** 2026-06-20 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Technik (MPZ / Viewer)

*(keine offenen Startblick/Startpan-Issues — #185 erledigt 2026-06-20; CSP-Enforcement #143 erledigt 2026-06-20)*

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| [#17](https://github.com/flxln/schulnavigator/issues/17) | Raumbilder liefern (extern) | 8/11; fehlen: `kunst`, `hort`, `schulsozialarbeit` |
| Epic [#86](https://github.com/flxln/schulnavigator/issues/86) | Schulfest GS39 Nachtrag | bis #90/#91; Details [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md) |
| [#89](https://github.com/flxln/schulnavigator/issues/89) | Sonnentest QR-Druck | technisch erledigt; Feldtest ausstehend |

## Repo-Wartung

- [ ] Issue-Tracker auf veraltete Formulierungen prüfen (z. B. „8 Stationen“, Admin ohne Directus-Kontext)
- [ ] Milestone-Beschreibungen mit [milestones.md](./milestones.md) abgleichen

## Ideen (noch nicht umgesetzt)

| Idee | Datei |
|------|--------|
| Coach-Audio mit Autoplay | [ideen/offen/coach-audio.md](../ideen/offen/coach-audio.md) — ADR-Ergänzung zu ADR-019 nötig |
| Dialog: engere Maskottchen-Positionen | [ideen/archiv/dialog-maskottchen-abstand-und-pan.md](../ideen/archiv/dialog-maskottchen-abstand-und-pan.md) — Mitpan erledigt (ADR-013), Abstand offen |
| Hub: Maskottchen als dauerhafter CTA | [ideen/archiv/maskottchen-fest-umfang.md](../ideen/archiv/maskottchen-fest-umfang.md) — Punkt 2 nicht umgesetzt |
| MPZ Studio v3 (Polish) | [ideen/archiv/mpz-studio-ui.md](../ideen/archiv/mpz-studio-ui.md) — Komfort-Editoren, Batch |

## Content / MPZ

- Coach-Texte final mit MPZ abstimmen (`app/content/coach-messages.json`)
- `prefers-reduced-motion` für Coach manuell am Gerät prüfen

## Technische Fragen (ohne ADR)

Siehe [technische-fragen.md](../technische-fragen.md) — u. a. YouTube-Recht, H5P/DSB, Directus-Rollen.
