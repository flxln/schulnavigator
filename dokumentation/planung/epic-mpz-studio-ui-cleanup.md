# Epic: MPZ Studio UI-Cleanup — IA & Navigation (ADR-022)

**Milestone:** [MPZ Studio UI-Cleanup](https://github.com/flxln/schulnavigator/milestone/12) (GitHub #12)
**Status:** offen (2026-06-22)
**GitHub Epic:** [#195](https://github.com/flxln/schulnavigator/issues/195)
**Parent:** Epic [#186](./archiv/epics/epic-mpz-studio-v2.1.md) (v2.1 abgeschlossen)

**Roadmap:** [ROADMAP.md](../archiv/design/mpz-studio-claude-design-cleanup/ROADMAP.md) · **Soll-IA:** [NAVIGATION-SOLL.md](../archiv/design/mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md) · **Brief:** [00-cleanup-brief.md](../archiv/design/mpz-studio-claude-design-cleanup/00-cleanup-brief.md) · **Spec:** [mpz-studio.md](../spezifikationen/mpz-studio.md)

---

## Ziel

Das MPZ Studio ist **funktionsvollständig** (v0–v2.1), wirkt aber unübersichtlich: flache Sidebar mit 9 Punkten, doppelte Einstiege (Medien-Upload, Dialog-Audio), vermischte Domänen, überladene Station-Tabs. Dieses Epic **refaktoriert Informationsarchitektur und UI** — ohne Verlust der Domänen-CRUD-Funktion.

**Nicht:** neue Domänen-Features (v3 Polish), Directus, Production-Studio. **Ja:** gruppierte Navigation, Redundanzen entfernen, Dialog-Lifecycle vervollständigen, Sphere-Kalibrierung ins MPZ-Tool, einheitliche Formular-Patterns.

Leitplanken unverändert (ADR-022): nur `NODE_ENV=development`, `assertMpzStudioAccess`, `writeStations` mit Backup + `postValidate`.

---

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#195` | MPZ Studio UI-Cleanup — IA & Navigation (ADR-022) | `tech`, `design` | — |
| Unterissue | `#196` | Design-Freeze: Soll-Navigation & Claude-Design-Abnahme | `design`, `documentation` | — — **erledigt** (2026-06-22) |
| Unterissue | `#197` | Studio-Shell: gruppierte Sidebar + Design-&-Hub-Route | `tech`, `blocker` | #196 — **erledigt** (2026-06-22, Post-Mortem unten) |
| Unterissue | `#198` | Redundanzen: Medien-Modal, `/ingest`, Dialog-Audio global | `tech` | #197 |
| Unterissue | `#199` | Dialog-Lifecycle: Tab immer + Create-API | `tech`, `blocker` | #197 |
| Unterissue | `#200` | Dialog-Editor: Segment-Audio-Zeile + einklappbare Sub-Bereiche | `tech` | #199, #198 |
| Unterissue | `#201` | Sphere-Kalibrierung `/mpz/calib/sphere/[slug]` (S14) | `tech` | #197 |
| Unterissue | `#202` | Formular-Patterns, Dirty-State, Save-Feedback | `tech` | #197 |
| Unterissue | `#203` | Mobile Sidebar einklappbar | `tech`, `design` | #197 |
| Unterissue | `#204` | Abnahme & Doku | `tech`, `documentation` | #197–#203 |

**Empfohlene Reihenfolge:** Design-Freeze → Shell (#blocker) → Redundanzen ∥ Dialog-Lifecycle → Dialog-Editor → Sphere ∥ Patterns ∥ Mobile → Abnahme

---

## Scope — drin / draußen

| In Epic | Nicht in Epic |
|---------|----------------|
| Sidebar-Gruppen (Übersicht · Stationen · Global · Erscheinungsbild · Betrieb) | Markdown-WYSIWYG (v3) |
| Brand + Hub → `/mpz/studio/design` mit Redirects | YouTube-Pflege im Studio (v3) |
| Medien-Upload nur aus Tab Medien (Modal S9) | Directus / Lehrkräfte-Admin |
| Dialog-Audio nur in Segment-Zeile (Expandable Row) | Besucher-App-Änderungen |
| Dialog-Tab immer + `POST …/dialog` Create-Pfad | Production-Studio |
| Sphere-Calib `/mpz/calib/sphere/[slug]` (symmetrisch zu Flat) | |
| Dirty-Badge, einheitliche Tabellen/Modals/Fehler | |
| Mobile einklappbare Sidebar | |

---

## Phasen (Roadmap)

| Phase | Inhalt | Issues |
|-------|--------|--------|
| **2–3** | Claude Design + Design-Freeze IA ([`NAVIGATION-SOLL`](../archiv/design/mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md)) | #196 ✅ |
| **4.1** | `studio-shell.tsx` — gruppierte Nav, Top-Bar, `/design` | #197 ✅ |
| **4.2** | Redundanzen entfernen | Redundanzen |
| **4.3** ⚠️ Feature | Dialog Gating + Empty-State + Create-API | Dialog-Lifecycle |
| **4.4** | Dialog Sub-IA (Gruppen/Bubble unter Segment-Tabelle) | Dialog-Editor |
| **4.5–4.6** | Formular-Patterns, Dirty-State | Patterns |
| **4.7** | Mobile Sidebar | Mobile |
| **4.8** | Sphere-Kalibrierung S14 | Sphere |
| **5** | Manuelle Tests, `npm run build`, Doku | Abnahme |

---

## Verbindliche Entscheidungen (Pre-Mortem 1a/1b)

| Thema | Entscheidung |
|-------|--------------|
| Dialog anlegen | `POST /api/mpz/stations/[slug]/dialog` — minimaler Block `{ figuren:['frieda','otto'], segmente:[] }` |
| Brand + Hub | Container `/mpz/studio/design` (Tabs Hub + Brand); Redirects `/hub`, `/brand` |
| Medien-Upload | Nur Modal aus Tab Medien; `/ingest` + Sidebar-Eintrag entfallen |
| Dialog-Audio | Nur Segment-Zeile (aufklappbare Sub-Zeile/Popover), kein globaler Tab |
| Sphere-Calib-Links | Interne Route statt `target="_blank"` / Besucher-App `?hotspot-calib=1` |
| `videoSource` | Optional, Default `upload` — Spec-Wortlaut korrigieren (Doku) |

Details: [ROADMAP.md — Pre-Mortem-Härtung](../archiv/design/mpz-studio-claude-design-cleanup/ROADMAP.md#pre-mortem-härtung-2026-06-22)

---

## Akzeptanzkriterien (Epic)

**Navigation & IA**

- [x] Sidebar: 4 Gruppen, 6 Einträge (ohne Dialog-Audio, ohne globalen Medien-Upload) — **#197**
- [x] `/mpz/studio/design` mit Tabs Hub + Brand; `/hub` und `/brand` redirecten — **#197**
- [ ] `/mpz/studio/ingest` und `/mpz/studio/dialog-audio` redirecten oder entfallen

**Station Detail**

- [ ] Tab Dialog bei jeder Station sichtbar; ohne Dialog → „Dialog hinzufügen“
- [ ] Dialog-Lifecycle E2E: anlegen → Segment → Dialog-Hotspot → Save-Validate grün
- [ ] Audio Upload/Play nur in Segment-Zeile

**Kalibrierung**

- [ ] Flat unverändert `/mpz/calib/flat/[slug]`
- [ ] Sphere `/mpz/calib/sphere/[slug]` — keine externen Links zur Besucher-App

**Querschnitt**

- [ ] Dirty-State sichtbar in Top-Bar
- [ ] Mobile: Sidebar einklappbar
- [ ] `cd app && npm run build` grün
- [ ] `anleitungen/fuer-entwickler.md` — Studio-Abschnitt aktualisiert

---

## GitHub-Links

| Issue | URL |
|-------|-----|
| #195 | https://github.com/flxln/schulnavigator/issues/195 |
| #196 | https://github.com/flxln/schulnavigator/issues/196 |
| #197 | https://github.com/flxln/schulnavigator/issues/197 |
| #198 | https://github.com/flxln/schulnavigator/issues/198 |
| #199 | https://github.com/flxln/schulnavigator/issues/199 |
| #200 | https://github.com/flxln/schulnavigator/issues/200 |
| #201 | https://github.com/flxln/schulnavigator/issues/201 |
| #202 | https://github.com/flxln/schulnavigator/issues/202 |
| #203 | https://github.com/flxln/schulnavigator/issues/203 |
| #204 | https://github.com/flxln/schulnavigator/issues/204 |

---

## Kontext

- [ADR-022](../adr/022-mpz-studio-internes-ingest-tool.md)
- [08-bekannte-ui-probleme.md](../archiv/design/mpz-studio-claude-design-cleanup/08-bekannte-ui-probleme.md)
- [15-dialog-segment-zeilenmodell.md](../archiv/design/mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md)
- [16-sphere-calib-screen.md](../archiv/design/mpz-studio-claude-design-cleanup/16-sphere-calib-screen.md)
- [NAVIGATION-SOLL.md](../archiv/design/mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md)
- Code: `app/components/mpz-studio/*`

## Checkliste (Epic)

- [x] GitHub Milestone „MPZ Studio UI-Cleanup“ angelegt (#12)
- [x] Epic + Unterissues auf GitHub (#195–#204)
- [x] Design-Freeze IA ([`NAVIGATION-SOLL.md`](../archiv/design/mpz-studio-claude-design-cleanup/NAVIGATION-SOLL.md)) — Mockups Stitch-HTML, bekannt inkonsistent ([#196](../reviews/post-mortem-196-2026-06-22.md))
- [x] Shell + Design-Route (#197, Post-Mortem: [post-mortem-197-2026-06-22.md](../reviews/post-mortem-197-2026-06-22.md))
- [ ] Redundanzen
- [ ] Dialog-Lifecycle (Feature)
- [ ] Dialog-Editor
- [ ] Sphere-Kalibrierung
- [ ] Patterns + Dirty-State
- [ ] Mobile Sidebar
- [ ] Abnahme & Doku
