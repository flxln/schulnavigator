# Offene Punkte — Schulnavigator

**Stand:** 2026-06-23 · Führend für neue Arbeit: [GitHub Issues](https://github.com/flxln/schulnavigator/issues). Diese Datei ist die schlanke Repo-Übersicht.

**Letzter Abgleich:** 2026-06-23 — MPZ Studio UI-Cleanup Epic #195; #197–#202 erledigt (#202 Formular-Patterns); nächstes: [#203](https://github.com/flxln/schulnavigator/issues/203) Mobile Sidebar.

Historischer Phasenplan: [archiv/projektplan.md](../archiv/projektplan.md) (eingefroren). Abgeschlossene Epics: [archiv/epics/](./archiv/epics/).

---

## Technik (MPZ / Viewer)

*(keine offenen Startblick/Startpan-Issues — #185 erledigt 2026-06-20; CSP-Enforcement #143 erledigt 2026-06-20)*

## GitHub — noch offen

| Issue | Thema | Hinweis |
|-------|--------|---------|
| Epic [#195](https://github.com/flxln/schulnavigator/issues/195) | MPZ Studio UI-Cleanup | #196–#204; [epic-mpz-studio-ui-cleanup.md](./epic-mpz-studio-ui-cleanup.md); nächstes: [#203](https://github.com/flxln/schulnavigator/issues/203) Mobile Sidebar |
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
| MPZ Studio v3 (Polish) | [ideen/archiv/mpz-studio-ui.md](../ideen/archiv/mpz-studio-ui.md) — Komfort-Editoren, Batch |

## Content / MPZ

- Coach-Texte final mit MPZ abstimmen (`app/content/coach-messages.json`)
- `prefers-reduced-motion` für Coach manuell am Gerät prüfen

## Technische Fragen (ohne ADR)

Siehe [technische-fragen.md](../technische-fragen.md) — u. a. YouTube-Recht, H5P/DSB, Directus-Rollen.
