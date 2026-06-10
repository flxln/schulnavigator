# Epic: Externe Medien & Hotspot-Marker (ADR-017)

**Milestone:** Phase 5 — Post-Fest  
**Fällig:** 31.10.2026 (Epic gesamt; Stufen sukzessiv Juli–Herbst)  
**Status:** auf GitHub angelegt (2026-06-10); Sub-issues #98–#100 unter #97 verknüpft

**Quellen:**

- [ADR-017](../adr/017-externe-medien-hotspot-marker.md)
- [Umsetzungsplan](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md)
- Schulwunsch: Delightex (PC-Raum), externe Links, Hotspot-Icons statt gelber Punkt
- Abschluss Wunschliste [#50](./issues-phase-5.md) (Teilpunkte)

---

## Übersicht

| Rolle | Nr. | Titel (kurz) | Labels | Blockiert durch |
|-------|-----|--------------|--------|-----------------|
| **Epic (Parent)** | `#97` | Externe Medien & Hotspot-Marker (ADR-017) | `tech`, `design` | — |
| Unterissue | `#98` | Hotspot-Marker & `thumbnail` (Stufe 1) | `tech`, `design` | — |
| Unterissue | `#99` | Medientyp `link` (Stufe 2) | `tech` | `#98` (empfohlen) |
| Unterissue | `#100` | Medientyp `embed` / iframe Delightex (Stufe 3) | `tech` | `#99`, DSB-Freigabe |
| Organisatorisch | — | Delightex Share-URL + DSB (Schule) | `extern`, `org` | `#100` |

**Empfohlene Reihenfolge:** `#98` → `#99` → (Schule: URL + DSB) → `#100`.

## GitHub-Links

| Issue | URL |
|-------|-----|
| #97 (Epic) | https://github.com/flxln/schulnavigator/issues/97 |
| #98 (Stufe 1) | https://github.com/flxln/schulnavigator/issues/98 |
| #99 (Stufe 2) | https://github.com/flxln/schulnavigator/issues/99 |
| #100 (Stufe 3) | https://github.com/flxln/schulnavigator/issues/100 |

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

- [ ] `#98` — Hotspot-Marker & `thumbnail` (Stufe 1)
- [ ] `#99` — Medientyp `link` (Stufe 2)
- [ ] `#100` — Medientyp `embed` / iframe (Stufe 3)

### Nicht im Scope

- Echtes Kamera-AR / WebXR (bleibt separate Wunschliste #50)
- YouTube-Embed (eigenes Thema ADR-004)
- Directus-Collections (#47) — Felder vormerken, aber Migration separat
- Schulfest 26.06. — keine `embed`-Stationen ohne Freigabe

### Epic erledigt wenn

- [ ] Alle drei Unterissues geschlossen
- [ ] `content-einpflegen.md` und Validator dokumentieren die neuen Felder (live, nicht nur „geplant“)
- [ ] Mindestens eine Demo-Station mit Icon-Hotspot (`klassenzimmer` oder PC-Raum)
- [ ] PC-Raum: `typ: link` **oder** `typ: embed` mit echter Delightex-URL (wenn Schule liefert)
- [ ] `#50` Kommentar: ADR-017-Punkte abgehakt

---

## `#98` — Hotspot-Marker & `thumbnail` (Stufe 1)

**Parent:** #97  
**Labels:** `tech`, `design`  
**Assignee:** Felix

### Ziel

Optionale Felder `hotspots[].icon`, `hotspots[].iconSize`, `medien[].thumbnail`. Fallback: Thumbnail → Typ-Preset → gelber Punkt. Dialog-Maskottchen unverändert.

### Akzeptanzkriterien

- [ ] Schema + Validator in `validate-stations.ts`
- [ ] `HotspotOverlay` rendert Bild-Marker, Touch ≥ 44 px
- [ ] `MediaSlot` zeigt `thumbnail`
- [ ] Preset-Icons unter `public/brand/hotspot-icons/`
- [ ] Demo in `klassenzimmer` (min. 1 Hotspot mit Icon)
- [ ] `npm run test` + `npm run build` grün
- [ ] Doku `content-einpflegen.md` (Felder aktiv, nicht „geplant“)

**Spezifikation:** [Umsetzungsplan Stufe 1](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-1--hotspot-marker-und-thumbnail)

---

## `#99` — Medientyp `link` (Stufe 2)

**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** `#98` empfohlen (Icons für Link-Hotspots)

### Ziel

`typ: link` mit `quelle: https://…`, `openIn: external`. Panel-Hinweis „Sie verlassen die App“; öffnet neuen Tab bei Nutzer-Geste.

### Akzeptanzkriterien

- [ ] Validator lehnt `http://` und lokale Pfade ab
- [ ] `LinkViewer` + `MediaPlayerByTyp` + `MediaSlot`
- [ ] Hotspot `mediumId` → Link wie andere Medientypen
- [ ] Tests Validator + Viewer
- [ ] Optional: PC-Raum-Content wenn Share-URL von Schule vorliegt (`extern`)

**Spezifikation:** [Umsetzungsplan Stufe 2](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-2--typ-link)

---

## `#100` — Medientyp `embed` / iframe Delightex (Stufe 3)

**Parent:** #97  
**Labels:** `tech`  
**Assignee:** Felix  
**Blockiert durch:** DSB-Freigabe Delightex; öffentliche Embed-URL

### Ziel

`typ: embed` mit Domain-Allowlist (`delightex.com`), CSP `frame-src`, `EmbedViewer` im Panel, Fehler-Fallback wenn Einbettung blockiert.

### Akzeptanzkriterien

- [ ] Validator: HTTPS + Allowlist
- [ ] `next.config` CSP `frame-src`
- [ ] Mobile getestet (iPhone Safari, Android Chrome) — dokumentiert in `lokal-testen-und-anschauen.md`
- [ ] Fehlerzustand + Link-Fallback
- [ ] `dsgvo.md` / technische Fragen: Delightex-Einbettung dokumentiert
- [ ] **Keine** Produktions-Station mit `embed` ohne dokumentierte DSB-Freigabe

**Spezifikation:** [Umsetzungsplan Stufe 3](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md#stufe-3--typ-embed-iframe)

---

## Abhängigkeiten

| Thema | Issue / Doku |
|-------|----------------|
| ADR-004 YouTube-Muster (Drittanbieter) | [ADR-004](../adr/004-video-hosting-mpz.md) |
| Hotspot-Koordinaten | [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md) |
| Wunschliste evaluiert | [#50](./issues-phase-5.md) |
| Directus-Felder | [#47](./issues-phase-5.md) (später) |

---

## Sync-Hinweis

Nach Abschluss je Stufe: Checkbox in Epic #97 und in [issues-phase-5.md](./issues-phase-5.md) pflegen.
