# Issues: Startblick (Sphere) und Startpan (Flat)

**ADR:** [023 — Sphere-Startblick](../adr/023-sphere-startblick.md), [024 — Flat-Startpan](../adr/024-flat-startpan.md)  
**Abgrenzung:** Nicht Teil von #149 (Hotspot-Kalibrierung).

| Issue | Titel | Labels | Blockiert durch | Epic |
|-------|-------|--------|-----------------|------|
| `#152` | Sphere-Startblick: Schema, Runtime, `recenterView` | `tech` | — | — |
| `#153` | MPZ Studio: Sphere-Startblick kalibrieren & persistieren | `tech` | #146, #152 | #144 |
| `#154` | Flat-Startpan: Schema, Runtime, `recenterView` | `tech` | — | — |

## GitHub-Links

| Issue | URL |
|-------|-----|
| #152 | https://github.com/flxln/schulnavigator/issues/152 |
| #153 | https://github.com/flxln/schulnavigator/issues/153 |
| #154 | https://github.com/flxln/schulnavigator/issues/154 |

## #152 — Sphere-Startblick (Runtime)

**Ziel:** [ADR-023](../adr/023-sphere-startblick.md) umsetzen — Produktionsverhalten auf `/raum/{slug}`.

**Akzeptanz:**

- [ ] `Station`: optionale Felder `startYaw`, `startPitch`; Validator (−180…180 / −90…90); nur bei `viewer: 'equirectangular'`
- [ ] `stations.schema.json`, `types.ts`, Snippet in `.vscode/schulnavigator-content.code-snippets`
- [ ] `SphereRaumViewerInner`: nach Panorama-Load Kamera auf Startblick; `recenterView()` → Startblick
- [ ] Unit-Tests Validator + ggf. Viewer-Init
- [ ] Doku: `content-einpflegen.md` (bereits ADR-Verweis), `architektur.md`

**Nicht im Scope:** MPZ-UI (#153), Flat (#154).

## #153 — MPZ Studio: Sphere-Startblick

**Ziel:** Aktuelle Kamera-Position aus Dev-Kalibrierung in `stations.json` schreiben (ADR-022).

**Akzeptanz:**

- [ ] `POST /api/mpz/view/sphere` (oder äquivalent): `{ slug, startYaw, startPitch }` + `withMpzStudioAccess`
- [ ] Domain-Layer `lib/mpz-view-ingest.ts` (analog Hotspot-Ingest) → `writeStations({ strict: true, validateAssets: false })`
- [ ] Erweiterung `SphereHotspotCalibOverlay` oder Studio-Panel: Button **„Als Startblick übernehmen“** (aktuelle PSV-Position)
- [ ] Hinweis in `lokal-testen-und-anschauen.md`; Link von `/mpz/studio`
- [ ] Route-Tests Guard 401/404

**Blockiert durch:** #152 (Felder + Runtime), #146 (IO).

**Epic #144:** Optional Post-v0-DoD; blockiert #149–#151 nicht.

## #154 — Flat-Startpan (Runtime)

**Ziel:** [ADR-024](../adr/024-flat-startpan.md) umsetzen.

**Akzeptanz:**

- [ ] `Station`: optionales `startPanX` (0…1); nur bei Flat; Validator
- [ ] `RoomImagePane`: Initial-`panPx` aus `startPanX`; `recenterView()` respektiert Feld
- [ ] Tests: `recenter-pan`, Pane-Init
- [ ] Optional später: Klick in `/mpz/calib/flat/{slug}` (#149) → `startPanX` setzen (Folge-Task, nicht Blocker)

**Priorität:** Niedriger als #152 — die meisten Live-Stationen sind `equirectangular`.

## Checkliste (Dokumentation, erledigt 2026-06-16)

- [x] ADR-023, ADR-024
- [x] `entscheidungen.md`, ADR-006/018 Querverweise
- [x] `content-einpflegen.md`, `architektur.md`
- [x] GitHub-Issues #152–#154
- [x] `epic-mpz-studio.md` (#153)
