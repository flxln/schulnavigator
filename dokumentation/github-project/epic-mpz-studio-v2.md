# Epic: MPZ Studio v2 — Content-Vollständigkeit & Betrieb (ADR-022)

**Milestone:** [MPZ Studio v2](https://github.com/flxln/schulnavigator/milestone/9) (GitHub #9, fällig 31.08.2026)
**Status:** in Arbeit — Branch **`mpz-studio-v2`**
**Parent:** Epic [#158](https://github.com/flxln/schulnavigator/issues/158) (v1 abgeschlossen, [PR #169](https://github.com/flxln/schulnavigator/pull/169))

**Domänen-Übersicht:** [mpz-studio-ui.md](../kurzfristige-ideen/mpz-studio-ui.md) · **Spec:** [2026-06-16-mpz-studio-spezifikation.md](../projektmanagement/2026-06-16-mpz-studio-spezifikation.md) (Phasierung v2/v3)

## Übersicht

| Rolle | Nr. | Titel | Labels | Blockiert durch |
|-------|-----|-------|--------|-----------------|
| **Epic (Parent)** | `#170` | MPZ Studio v2 — Content-Vollständigkeit & Betrieb (ADR-022) | `tech` | — |
| Unterissue | `#171` | Medien PATCH (Metadaten bearbeiten) | `tech`, `blocker` | v1 Merge ✓ |
| Unterissue | `#172` | Medien link/embed im Studio anlegen | `tech` | #171 |
| Unterissue | `#173` | Raumbild-Upload Flat + 360° | `tech` | — |
| Unterissue | `#174` | Deploy-Tab (QR, Token, Env, validate-all) | `tech` | — |
| Unterissue | `#175` | Dialog-Tab (Segmente, Gruppen, bubble) | `tech` | — |
| Unterissue | `#176` | Dialog-Hotspot anlegen/bearbeiten | `tech` | v1 #165–#168 ✓ |
| Unterissue | `#177` | Coach-Editor (`coach-messages.json` CRUD) | `tech` | — |
| Unterissue | `#178` | `embed-allowlist.json` extrahieren + Studio-UI | `tech` | — |
| Unterissue | `#179` | Hub-Slug-Map + Station-Akzente/Icons (Config) | `tech` | — |
| Unterissue | `#180` | Brand-Uploads (Logos, Maskottchen) | `tech` | — |
| Unterissue | `#181` | Doku & Epic-Abschluss | `tech`, `documentation` | #171–#180 |

## Ziel

v0+v1 decken Ingest, Station-Detail, Medien-Upload/Löschen und Hotspot-CRUD ab. **v2 schließt die Lücken**, die heute nur über Plan A (JSON/CLI) pflegbar sind — ohne v3-Polish (WYSIWYG, Batch-Import).

Leitplanken unverändert (ADR-022): nur `NODE_ENV=development`, nie Coolify, kein Git aus dem Studio.

## Scope v2 — drin / draußen

| In v2 | Nicht v2 (v3 oder Directus) |
|-------|------------------------------|
| Raumbild-Upload, Medien-PATCH, link/embed-Formular | Markdown-WYSIWYG |
| Dialog-Editor (Formular), Dialog-Hotspots | Dialog-Bubble visuell |
| Coach-CRUD | Batch-Import `auftraggeber/` |
| Deploy-Tab | YouTube im Studio (ADR-004) |
| Config-Extraktion (Allowlist, Hub, Brand) | Lehrkräfte-Admin (Directus #47) |

**Empfohlene Reihenfolge:** #171 → #172 → #173 → #174 → #175/#176 → #177 → #178–#180 → #181

## GitHub-Links

| Issue | URL |
|-------|-----|
| #170 | https://github.com/flxln/schulnavigator/issues/170 |
| #171 | https://github.com/flxln/schulnavigator/issues/171 |
| #172 | https://github.com/flxln/schulnavigator/issues/172 |
| #173 | https://github.com/flxln/schulnavigator/issues/173 |
| #174 | https://github.com/flxln/schulnavigator/issues/174 |
| #175 | https://github.com/flxln/schulnavigator/issues/175 |
| #176 | https://github.com/flxln/schulnavigator/issues/176 |
| #177 | https://github.com/flxln/schulnavigator/issues/177 |
| #178 | https://github.com/flxln/schulnavigator/issues/178 |
| #179 | https://github.com/flxln/schulnavigator/issues/179 |
| #180 | https://github.com/flxln/schulnavigator/issues/180 |
| #181 | https://github.com/flxln/schulnavigator/issues/181 |

## Kontext

- [epic-mpz-studio-v1.md](./epic-mpz-studio-v1.md) (abgeschlossen)
- [epic-mpz-studio.md](./epic-mpz-studio.md) (v0)
- [ADR-022](../adr/022-mpz-studio-internes-ingest-tool.md)

## Checkliste (Epic)

- [x] GitHub Epic + Unterissues angelegt (#170–#181)
- [x] Milestone „MPZ Studio v2“ (#9) · Branch `mpz-studio-v2`
- [x] Medien PATCH (#171) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-171-2026-06-18.md](../reviews/post-mortem-171-2026-06-18.md)
- [x] Medien link/embed (#172) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-172-2026-06-18.md](../reviews/post-mortem-172-2026-06-18.md)
- [x] Raumbild-Upload (#173) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-173-2026-06-18.md](../reviews/post-mortem-173-2026-06-18.md)
- [x] Deploy-Tab (#174) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-174-2026-06-18.md](../reviews/post-mortem-174-2026-06-18.md)
- [x] Dialog-Tab (#175) — umgesetzt 2026-06-18, Branch `mpz-studio-v2`, Post-Mortem [post-mortem-175-2026-06-18.md](../reviews/post-mortem-175-2026-06-18.md)
- [ ] Dialog-Hotspots (#176)
- [ ] Coach-Editor (#177)
- [ ] embed-allowlist (#178)
- [ ] Hub/Icons-Config (#179)
- [ ] Brand-Uploads (#180)
- [ ] Doku & Epic-Abschluss (#181)
