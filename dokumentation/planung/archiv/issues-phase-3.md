# Issues — Phase 3: Content-Integration

Milestone: **Phase 3** | Fällig: 24.06.2026

**Voraussetzung:** Content-Lieferplan (#25). **11 Stationen** (Issue #1 / Material Tina).

**Referenz (Phase 2, #93):** `klassenzimmer` hat Demo-Medien unter `public/media/klassenzimmer/` — Vorlage für weitere Stationen.

**Content-Pipeline:** JSON + Dateien in `/public` — [ADR-003](../../adr/003-content-mvp-json-directus.md). Videos: MPZ-Upload — [ADR-004](../../adr/004-video-hosting-mpz.md). Raum-Viewer: [ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md).

| Nr. | Slug (Vorschlag) | Raum |
|-----|------------------|------|
| 1 | `klassenzimmer` | Klassenzimmer |
| 2 | `daz` | DaZ-Zimmer |
| 3 | `pc-raum` | PC-Raum |
| 4 | `werken` | Werkenzimmer |
| 5 | `turnhalle` | Turnhalle |
| 6 | `speiseraum` | Speiseraum |
| 7 | `kunst` | Kunstzimmer |
| 8 | `lesewelt` | Lesewelt |
| 9 | `hort` | Hortzimmer |
| 10 | `musik` | Musikzimmer |
| 11 | `schulsozialarbeit` | Schulsozialarbeiterzimmer |

---

## #27 — Raumfotos einpflegen

**GitHub:** https://github.com/flxln/schulnavigator/issues/27 — **geschlossen** (2026-06-08, MVP 8/11 Panorama)

**Labels:** `content`  
**Assignee:** Felix

- Fotos Sten/Tina (#17) oder aus `material/stationen/` — alle **11** Stationen
- Zuordnung nach [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md) → `public/stations/{slug}.jpg`
- WebP/optimiertes JPG, max. ~500 KB; **Panorama** für Gyro-Viewer: **≥ 2,5 : 1**, min. 2400 px Breite ([ADR-006](../../adr/006-raum-viewer-gyro-hotspots.md), Briefing [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md))
- `schulsozialarbeit`: bis HD-Foto fehlt → ohne Gyro (statisch)

### Umsetzung (08.06.2026)

- [x] Export-Skript [`app/scripts/export-pano.mjs`](../../app/scripts/export-pano.mjs) — `sips`, Rohquelle `auftraggeber/.../flat/{slug}/raw/`, Ziel `export/` + `app/public/stations/`
- [x] **8** Panorama-Exporte (4320×1440 → optimiert ≤500 KB, Ratio 3:1): `klassenzimmer`, `daz`, `pc-raum`, `werken`, `turnhalle`, `speiseraum`, `lesewelt`, `musik`
- [x] Erster **Git-LFS**-Push (`public/stations/*.jpg`); `validate:stations` mit JPEG-Magic-Byte-Check; Live-Deploy verifiziert (`musik.jpg` ~349 KB)
- [x] `schulsozialarbeit`: `bild` aus `stations.json` entfernt, Platzhalter-JPG gelöscht
- [x] Doku: [`app/public/stations/README.md`](../../app/public/stations/README.md), [`build-kontext-submodule-regeln.md`](../build-kontext-submodule-regeln.md) (LFS), [`fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md)

### Nicht im Scope (bleibt **#17**)

- [ ] `kunst`, `hort` — weiterhin 4:3-Platzhalter (kein Pano-Rohmaterial)
- [ ] `schulsozialarbeit` — Foto-Nachlieferung Schule
- [ ] Hotspot-Feintuning `daz`/`pc-raum` nach Sichtkontrolle Handy ([`lokal-testen-und-anschauen.md`](../../anleitungen/lokal-testen-und-anschauen.md))

---

## #28 — Content einpflegen: Station 1 — Klassenzimmer

**Labels:** `content`  
**Assignee:** Felix / Julia

- Text aus Material/HTML; Medien von Schule/Projekttag
- Hotspots in JSON (min. 1–2, Koordinaten 0–1); `mediumId` verknüpft
- QC: Audio/Video max. 60 s; Text kurz; Bild min. 800 px

---

## #29 — Content einpflegen: Station 2 — DaZ-Zimmer

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #30 — Content einpflegen: Station 3 — PC-Raum

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #31 — Content einpflegen: Station 4 — Werkenzimmer

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #32 — Content einpflegen: Station 5 — Turnhalle

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #33 — Content einpflegen: Station 6 — Speiseraum

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #34 — Content einpflegen: Station 7 — Kunstzimmer

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #35 — Content einpflegen: Station 8 — Lesewelt

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #52 — Content einpflegen: Station 9 — Hortzimmer

**GitHub:** https://github.com/flxln/schulnavigator/issues/52

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #53 — Content einpflegen: Station 10 — Musikzimmer

**GitHub:** https://github.com/flxln/schulnavigator/issues/53

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #54 — Content einpflegen: Station 11 — Schulsozialarbeiterzimmer

**GitHub:** https://github.com/flxln/schulnavigator/issues/54

**Labels:** `content`  
**Assignee:** Felix / Julia

*(siehe #28)*

---

## #36 — QR-Codes drucken und laminieren

**Labels:** `org`  
**Assignee:** Felix / MPZ

- PNGs, **Druck-PDFs** (`public/qr/pdf/`) und `manifest.json` vorab mit `npm run generate:qr` im Ordner `app/` erzeugen (Issue **#15**, Erweiterung **#130**); Druckablauf: [`anleitungen/qr-codes-drucken.md`](../../anleitungen/qr-codes-drucken.md)
- **12 Raum-QRs** → `https://[domain]/raum/[slug]` (**ohne** Token) — [ADR-005](../../adr/005-zugangskontrolle-token.md)
- **1 Entry-QR Schulfest** → `/eintritt?t=fest-2026` (Modus `fest`)
- Optional: **1 Entry-QR Heft** für Tests / Schulstartheft-Vorbereitung
- Laminieren, wetterfest; Aufhängung mit Schule klären

---

## #37 — Projekttag in der Schule (24./25.06.)

**Labels:** `content` `org`  
**Assignee:** Felix / Julia

- Einverständnisse: Schule am Projekttag — nur Content **mit** Einwilligung
- Kinder 4b/4c: Audio/Video; MPZ unterstützt, Mikrofon
- Direktes Einpflegen (JSON + `/public`) + Redeploy
- Test: In-App-Scanner, Puzzle-Freischaltung, **11** Stationen
- Mitbringen: Mikrofon, Akku, Laptop

---

## #38 — Abschlusstest: alle Stationen live prüfen

**Labels:** `tech` `org`  
**Assignee:** Felix

**Status (2026-06-15):** Geräte-QA auf Produktion durchgeführt — Protokoll [`2026-06-15-abschlusstest-geraete.md`](../../archiv/projektmanagement/2026-06-15-abschlusstest-geraete.md). Offen: Mobilfunk am Schulgelände (#91), finales 12/12-Abschluss optional.

**12 Stationen** + Entry-Flow (`fest`-Token):

- [ ] Entry per System-Kamera → Puzzle-Startseite
- [ ] In-App-Scan pro Raum → Stempel + Segment frei
- [ ] Gesperrtes Puzzle-Segment nicht klickbar
- [ ] Medien (inkl. Video vom MPZ-Server) laden unter Mobilfunk
- [ ] Gyro-Viewer + Hotspot (Portrait: Armschwenk/drehen; Tap für Medien) auf iPhone Safari getestet
- [ ] 12/12 → Abschluss-Animation
- [ ] Raum-QR per Kamera in neuem Tab (localStorage-Token)

Test-Protokoll dokumentieren.
