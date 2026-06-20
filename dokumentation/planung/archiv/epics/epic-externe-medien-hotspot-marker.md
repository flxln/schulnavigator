# Epic: Externe Medien & Hotspot-Marker (ADR-017)

**Milestone:** Phase 5 — Post-Fest  
**Fällig:** 31.10.2026 (Epic gesamt; Stufen sukzessiv Juli–Herbst)  
**Status:** abgeschlossen (2026-06-11) — Stufe 1–3 live auf `main` (#98 PR #101, #99 PR #102, #100, Delightex-Fallback #109); DSB-Freigabe Delightex liegt vor

**Quellen:**

- [ADR-017](../../adr/017-externe-medien-hotspot-marker.md)
- [Umsetzungsplan](../../../archiv/projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md)
- Schulwunsch: Delightex (PC-Raum), externe Links, Hotspot-Icons statt gelber Punkt
- Abschluss Wunschliste [#50](./issues-phase-5.md) (Teilpunkte)

---

## Übersicht

| Rolle | Nr. | Titel (kurz) | Labels | Blockiert durch |
|-------|-----|--------------|--------|-----------------|
| **Epic (Parent)** | `#97` | Externe Medien & Hotspot-Marker (ADR-017) | `tech`, `design` | — |
| Unterissue | `#98` | Hotspot-Marker & `thumbnail` (Stufe 1) | `tech`, `design` | — **erledigt** |
| Unterissue | `#99` | Medientyp `link` (Stufe 2) | `tech` | — **erledigt** |
| Unterissue | `#100` | Medientyp `embed` / iframe Delightex (Stufe 3) | `tech` | — **erledigt** |
| Unterissue | `#128` | Book Creator Embed Lesewelt | `tech`, `content` | — **erledigt** |
| Organisatorisch | — | Delightex Share-URL + DSB (Schule) | `extern`, `org` | `#100` |

**Empfohlene Reihenfolge:** `#98` → `#99` → (Schule: URL + DSB) → `#100`.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #97 (Epic) | https://github.com/flxln/schulnavigator/issues/97 |
| #98 (Stufe 1) | https://github.com/flxln/schulnavigator/issues/98 |
| #99 (Stufe 2) | https://github.com/flxln/schulnavigator/issues/99 |
| #100 (Stufe 3) | https://github.com/flxln/schulnavigator/issues/100 |
| #128 (Book Creator Lesewelt) | https://github.com/flxln/schulnavigator/issues/128 |

---

## Epic `#97` — Externe Medien & Hotspot-Marker (ADR-017)

**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Milestone:** Phase 5 — Post-Fest

### Ziel

Drei Post-Fest-Erweiterungen des Content-Modells sukzessiv umsetzen:

1. **Stufe 1:** Erkennbare Hotspot-Marker (`icon`, `thumbnail`) statt gelber Punkte
2. **Stufe 2:** Externe HTTPS-Links als Medium (`typ: link`) — z. B. Delightex im neuen Tab
3. **Stufe 3:** iframe-Einbettung (`typ: embed`) — Delightex im Medien-Panel, nur nach DSB-Freigabe

### Unterissues

- [x] `#98` — Hotspot-Marker & `thumbnail` (Stufe 1) — PR #101
- [x] `#99` — Medientyp `link` (Stufe 2) — PR #102
- [x] `#100` — Medientyp `embed` / iframe (Stufe 3) — gemergt (#100)
- [x] `#128` — Book Creator Embed Lesewelt — Branch `feature/bookcreator-lesewelt`

### Nicht im Scope

- Echtes Kamera-AR / WebXR (bleibt separate Wunschliste #50)
- YouTube-Embed (eigenes Thema ADR-004)
- Directus-Collections (#47) — Felder vormerken, aber Migration separat
- Schulfest 26.06. — keine `embed`-Stationen ohne Freigabe

### Epic erledigt wenn

- [x] `#100` geschlossen (Stufe 3)
- [x] `content-einpflegen.md` und Validator: Stufe 1–3 live dokumentiert
- [x] Demo: `klassenzimmer` Icon-Hotspot; `pc-raum` mit `typ: embed` (`https://edu.delightex.com/WVX-NAQ`)
- [x] Echte Delightex-Embed-URL in `stations.json` (DSB-Freigabe)
- [x] `#50`: Hotspot-Icons + externe Links + iframe abgehakt

---

## `#98` — Hotspot-Marker & `thumbnail` (Stufe 1) — erledigt

**Parent:** #97  
**Labels:** `tech`, `design`  
**Assignee:** Felix  
**Status:** geschlossen (PR #101, 2026-06-10)

### Ziel

Optionale Felder `hotspots[].icon`, `hotspots[].iconSize`, `medien[].thumbnail`. Fallback: Thumbnail → Typ-Preset → gelber Punkt. Dialog-Maskottchen unverändert.

### Akzeptanzkriterien

- [x] Schema + Validator in `validate-stations.ts`
- [x] `HotspotOverlay` rendert Bild-Marker, Touch ≥ 44 px
- [x] `MediaSlot` zeigt `thumbnail`
- [x] Preset-Icons unter `public/brand/hotspot-icons/`
- [x] Demo in `klassenzimmer` (min. 1 Hotspot mit Icon)
- [x] `npm run test` + `npm run build` grün
- [x] Doku `content-einpflegen.md` (Felder aktiv)

**Spezifikation:** [Umsetzungsplan Stufe 1](../../../archiv/projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-1--hotspot-marker-und-thumbnail)

---

## `#99` — Medientyp `link` (Stufe 2) — erledigt

**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Status:** geschlossen (PR #102, 2026-06-10)

### Ziel

`typ: link` mit `quelle: https://…`, `openIn: external`. Panel-Hinweis „Sie verlassen die App“; öffnet neuen Tab bei Nutzer-Geste.

### Akzeptanzkriterien

- [x] Validator lehnt `http://` und lokale Pfade ab
- [x] `LinkViewer` + `MediaPlayerByTyp` + `MediaSlot`
- [x] Hotspot `mediumId` → Link wie andere Medientypen
- [x] Tests Validator + Viewer
- [x] PC-Raum-Demo mit `typ: link` (Delightex-URL nach DSB)

**Spezifikation:** [Umsetzungsplan Stufe 2](../../../archiv/projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-2--typ-link)

---

## `#100` — Medientyp `embed` / iframe Delightex (Stufe 3) — erledigt

**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Status:** geschlossen (2026-06-11, gemergt #100)

### Ziel

`typ: embed` mit Domain-Allowlist (`delightex.com`), CSP `frame-src`, `EmbedViewer` im Panel, permanenter „Im Browser öffnen“-Button als Fallback.

### Akzeptanzkriterien

- [x] Validator: HTTPS + Allowlist (`embedAllow` nur Subset)
- [x] `next.config` CSP `frame-src` aus `embed-allowlist.ts`
- [x] Mobile-Matrix in `lokal-testen-und-anschauen.md` (manuell nach Deploy)
- [x] `EmbedViewer` + Feature-Flag `NEXT_PUBLIC_EMBED_ENABLED`
- [x] `dsgvo.md`: Delightex-Einbettung dokumentiert
- [x] DSB-Freigabe dokumentiert; Demo `pc-delightex` mit Embed-URL

**Spezifikation:** [Umsetzungsplan Stufe 3](../../../archiv/projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-3--typ-embed-iframe)

---

## `#109` — Delightex-Fallback Mobile (Folge #100) — erledigt

**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Status:** geschlossen (2026-06-11, Branch `feature/delightex-fallback`)

### Ziel

Auf Touch-Geräten kein Delightex-iframe; stattdessen Fallback-Karte mit Hinweis, „Im Browser öffnen“ und App-Store-Links. Desktop: iframe + Panel darunter.

### Akzeptanzkriterien

- [x] `DelightexFallbackPanel` für `embed` und `link`
- [x] `shouldSkipEmbedIframe()` via `pointer: coarse`
- [x] Kein Auto-`window.open` bei Delightex-`typ: link`
- [x] Mobile-Matrix in `lokal-testen-und-anschauen.md`

**GitHub:** https://github.com/flxln/schulnavigator/issues/109

---

## Abhängigkeiten

| Thema | Issue / Doku |
|-------|----------------|
| ADR-004 YouTube-Muster (Drittanbieter) | [ADR-004](../../adr/004-video-hosting-mpz.md) |
| Hotspot-Koordinaten | [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md) |
| Wunschliste evaluiert | [#50](./issues-phase-5.md) |
| Directus-Felder | [#47](./issues-phase-5.md) (später) |

---

## Sync-Hinweis

Nach Abschluss je Stufe: Checkbox in Epic #97 und in [issues-phase-5.md](./issues-phase-5.md) pflegen.
