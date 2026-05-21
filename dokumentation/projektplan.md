# Projektplan — Schulnavigator

Stand: 2026-05-21 | Schulfest (Hard Deadline): 2026-06-26

---

## Übersicht

```
Phase 0 │ Architektur-Entscheidungen     │ bis 14.05.
Phase 1 │ Foundation                     │ bis 28.05.
Phase 2 │ Content-Struktur + UI          │ bis 12.06.
Phase 3 │ Content-Integration            │ 12.–24.06.
Phase 4 │ Live am Schulfest              │ 24.–26.06.
Phase 5 │ Post-Fest / Admin-Interface    │ ab Juli
```

---

## Phase 0 — Architektur-Entscheidungen (bis 14.05.) ✅

**Ziel:** Alle offenen Grundsatzfragen schriftlich entscheiden, bevor Code entsteht. **Status (21.05.): abgeschlossen.**

### Muss-Entscheidungen

| Frage | Empfehlung | Begründung |
|---|---|---|
| Frontend-Framework | Next.js (App Router) | ✅ ADR-002 |
| Routing | `/raum/[slug]` | ✅ ADR-002 |
| Video-Hosting | Upload MPZ-Server; YouTube später nach Rechtsklärung | ✅ ADR-004 |
| Content-Management | **MVP:** JSON im Repo · **Ziel:** Directus | ✅ ADR-003; kein Custom-Admin |
| Zugangskontrolle | Entry-Token, Modi fest/heft, In-App-Scanner | ✅ ADR-005 |
| Raum-Viewer | Gyro (Standard), Hotspots, Tap-Fallback; normales Foto | ✅ ADR-006 |
| Stationen | **11 Stationen** (von Schule geliefert) | Verbindliche Grundlage seit Material-Lieferung |
| Wartung nach 26.6. | Schule pflegt via Directus; MPZ Betrieb | ✅ ADR-003 |

### Deliverable
- ✅ ADR-Dokumente 001–006
- ✅ Stationen-Liste: **11 Stationen** + Slugs in [`zuordnung-stationen-bilder.md`](../auftraggeber/material/stationen/zuordnung-stationen-bilder.md) (JSON-Datei → Phase 1)
- ✅ AVV-Entwurf an Schule versendet (21.05.; Unterschrift → Phase 4)

---

## Phase 1 — Foundation (bis 28.05.)

**Ziel:** Lauffähiges Grundgerüst ohne echten Content. Jede Station ist erreichbar.

### Aufgaben

- [ ] Next.js-Projekt anlegen (TypeScript strict, Tailwind)
- [ ] Dockerfile (Multi-stage Build, Port via ENV, `/api/health`)
- [ ] Routing: `/raum/[slug]` — statische Seite pro Raum
- [ ] Datenmodell definieren (JSON: slug, titel, beschreibung, bild, medien[], hotspots[]) — [ADR-006](./adr/006-raum-viewer-gyro-hotspots.md)
- [ ] Platzhalter-Seite: `RaumViewer`-Stub (Gyro/Hotspots Phase 2), Titel, Beschreibung, Media-Slots
- [ ] Startseite: Schulhaus-SVG mit 11 Segmenten (Puzzle-Layout; Freischaltung Phase 2)
- [ ] QR-Code-Script: 11× Raum (`/raum/[slug]`) + Entry (`/eintritt?t=…`)
- [ ] Deployment-Test auf MPZ-Server (Coolify)

### Nicht in Phase 1
- Gamification (Phase 2), vollständiger RaumViewer (Phase 2), Kamera-AR/360°, Admin-UI, Mehrsprachigkeit

### Deliverable
- Deploy-Link, den Sten/Tina im Browser aufrufen können
- Leere Stationsseiten für alle **11** Räume
- Termin am 10.06. vorbereiten: Demo der leeren Shell

---

## Phase 2 — Content-Struktur + UI (bis 12.06.)

**Ziel:** App sieht aus wie das Endprodukt, Content-Slots sind befüllbar.

### Aufgaben

**Raum-Viewer** ([ADR-006](./adr/006-raum-viewer-gyro-hotspots.md))
- [ ] `RaumViewer`: Gyro-Pan (Standard), Hotspot-Overlay, Medien-Panel bei Treffer/Tap
- [ ] Tap-Fallback + optional Wischen; iOS-Orientierung nach Nutzer-Geste
- [ ] Ohne `bild`: statische Ansicht + Medienliste

**Medien**
- [ ] Audio-Player-Komponente (native HTML5, kein externes Plugin)
- [ ] Video-Player-Komponente (MPZ-Upload; YouTube-Feld im Schema, MVP nicht nutzen)
- [ ] Bild-Galerie-Komponente (für Fotosets)
- [ ] Medientyp-Routing: Station zeigt je nach Inhalt automatisch den richtigen Player

**Gamification (Minimal)**
- [ ] Stempel-System via `localStorage`: Station besucht = Häkchen gesetzt
- [ ] Startseite zeigt Fortschritt (z.B. 3/11 Stationen besucht)
- [ ] Abschluss-Animation wenn alle 11 erledigt (einfaches Konfetti, keine externe Library)

**Zugangskontrolle** ([ADR-005](./adr/005-zugangskontrolle-token.md))
- [ ] `/eintritt` — Token prüfen, `localStorage` (Token + `mode: fest|heft` + Ablauf)
- [ ] Middleware: ohne Token → Hinweisseite
- [ ] Startseite: `heft` = voller Hub; `fest` = Puzzle-Hub (Segmente nach Scan freischalten) + Scan-CTA
- [ ] `/scan` — In-App-QR-Scanner für Raum-QRs (nach Entry)
- [ ] Token-Script: mindestens `fest-2026`, `heft-2026-27` mit Ablaufdatum

**Mehrsprachigkeit (Struktur)**
- [ ] Menü-Texte in i18n-Datei auslagern (DE + EN-Platzhalter)
- [ ] Content selbst bleibt vorerst deutsch — Struktur ist vorbereitet

### Termin 10.06. — Meeting MPZ
- Demo der vollständigen UI ohne Content
- Content-Lieferplan von Schule einfordern: Raum → Medientyp → Klasse → Verantwortlich
- WLAN-Situation klären: Turnhalle, Außenbereich — Mobilfunk-Test vereinbaren

### Deliverable bis 12.06.
- Fertige App-Shell (alle Komponenten, keine Platzhalter mehr)
- Content-Lieferplan der Schule (Voraussetzung für Phase 3)

---

## Phase 3 — Content-Integration (12.–24.06.)

**Ziel:** Echter Content der Kinder landet in der App.

### Voraussetzung
Die Schule liefert bis **12.06.** einen Plan: welche Klasse macht welchen Raum in welchem Format (Audio/Video/Foto/Text).

### Aufgaben

**Schule (Sten/Tina)**
- [ ] Raumfotos für alle **11** Stationen (Sten/Tina; Material als Fallback)
- [ ] Zwei Wochen vor Schulfest: Kinder produzieren Content in Klassen
- [ ] Content gesammelt und an Felix übergeben (spätestens 22.06.)

**Felix/Julia (MPZ)**
- [ ] Content-Dateien in Projektstruktur einpflegen (JSON + Mediendateien)
- [ ] Hotspot-Koordinaten pro Station (min. 1–2 zum Start; siehe [Zuordnungstabelle](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md))
- [ ] Qualitätskontrolle: max. 60 Sekunden, verständlich, brauchbare Tonqualität
- [ ] QR-Codes drucken: 11× Raum + Entry Schulfest
- [ ] WLAN-Test vor Ort: alle Stationspunkte mit echtem Gerät prüfen

### Projekttage in der Schule (ca. 24./25.06.)
- Felix/Julia vor Ort
- Einverständniserklärungen: Klärung/Einholung durch die Schule **am Projekttag** (nicht Voraussetzung davor)
- Kinder nehmen Content auf (Mikrofon vorhanden) — **nur mit Einwilligung**; Umfang: was an dem Tag entsteht, reicht für den 26.06.
- Content wird direkt eingepflegt
- Letzter Live-Test aller Stationen

---

## Phase 4 — Live am Schulfest (26.06.)

**Ziel:** 11 Stationen, stabil, ohne Überraschungen.

### Checkliste
- [ ] Alle **11** Raum-QRs an Türen; Entry-QR am Eingang
- [ ] Entry-QR-Code für Schulstartheft / Eingang vorbereitet
- [ ] Mobilfunk-Abdeckung als primärer Zugangspfad (kein WLAN-Verlass)
- [ ] Tablet-Fallback: 1–2 Tablets mit geladenen Inhalten, betreut durch Schüler
- [ ] Ansprechperson vor Ort (Felix oder Julia) für technische Probleme
- [ ] AVV liegt unterschrieben vor

---

## Phase 5 — Post-Fest (ab Juli 2026)

**Ziel:** Aus dem Event-Produkt wird ein dauerhaft nutzbares System.

### Kurzfristig (Juli–August)
- [ ] Auswertung: Was hat funktioniert, was nicht? (Sten/Tina befragen)
- [ ] Bekannte Bugs und UX-Probleme dokumentieren
- [ ] Directus-Anforderungen aus MVP-Erfahrung festhalten (Collections, Rollen)

### Mittelfristig (Herbst 2026)
- [ ] **Directus** deployen (Coolify), JSON-Content migrieren
- [ ] Lehrkräfte-Onboarding (Directus-Admin, keine Custom-UI)
- [ ] Englisch-Menü aktivieren
- [ ] Weitere Stationen nachrüsten (Phase-2-Features der Wunschliste)

### Langfristig (2027+)
- [ ] Mandantenfähigkeit: andere Schulen können eigene Instanz aufsetzen
- [ ] Onboarding-Dokumentation für neue Schulen
- [ ] Echtes AR (WebXR/Kamera), 360°-Panorama, Lego-/Tafel-Trigger als opt-in Erweiterung (MVP hat Gyro-Viewer, siehe ADR-006)

---

## Risiken und Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Gegenmaßnahme |
|---|---|---|
| Content kommt nicht bis 12.06. | Hoch | Festes Commitment der Schule am 10.06. einholen |
| WLAN-Ausfall am Schulfest | Mittel | Tablet-Fallback + Mobilfunk als primärer Weg |
| Scope Creep (Kamera-AR, Lego-Trigger etc.) | Mittel | ADR-006: Gyro-Viewer im MVP; echtes AR explizit Post-Fest (#50) |
| Content-Qualität zu schlecht | Mittel | Felix/Julia am Projekttag vor Ort zur Qualitätssicherung |
| Maskottchen-Rechte (Giraffe/Maus) | Niedrig | Freigabe liegt vor; Verlagsnennung im Impressum (Phase 2/4) |

---

## Nächste konkrete Schritte (diese Woche)

1. ~~**Scope:** 11 Stationen verbindlich (Material Tina, Slugs in `zuordnung-stationen-bilder.md`)~~ — Phase 0 erledigt
2. ~~**ADRs 001–006**~~ — Phase 0 erledigt; bei Änderungen neue ADR-Nummer
3. ~~**AVV-Entwurf** an Schule~~ — versendet 21.05.; Unterschrift bis 26.06. (Phase 4)
4. ~~**Maskottchen-Rechte**~~ — Freigabe liegt vor; Impressum in Phase 2/4
5. **Projektsetup (Phase 1):** Next.js in `app/`, Dockerfile, `/api/health`, erstes Deployment auf MPZ/Coolify testen
6. **Content-Lieferplan** bei Meeting 10.06. einfordern (Medientyp + Klasse pro Station)
