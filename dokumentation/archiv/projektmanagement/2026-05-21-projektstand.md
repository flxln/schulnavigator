# Schulnavigator — Projektstand

**Stand:** 2026-05-28 (Phase 1 #9–#16; **#55/#56/#58–#63/#69** umgesetzt; Demo Dialog Otto/Frieda [ADR-010](../adr/010-dialog-cutscene-gated-audio.md); Live `schulnavigator.mpz.schule`)  
**Projekt:** Schulnavigator (39. Grundschule Dresden)  
**Auftraggeber:** Sten, Tina (Schule) · **Umsetzung:** MPZ (Felix, Julia, Thomas)  
**Hard Deadline:** Schulfest am **26.06.2026**

---

## Kurzfassung

Konzept und Planung sind weit fortgeschritten; **Next.js-App in `app/` läuft** (lokal, per Docker-Image und **live** unter `https://schulnavigator.mpz.schule` nach Coolify-Deploy). **Phase 0** ist abgeschlossen; **Phase 1** umfasst **#9–#16** (Scaffold, Docker, Routing, `stations.json`, Stations-Shell, **Startseite Schulhaus-Hub**, Vitest, **QR-Generator**, **Deploy + Go-Live-Härtung**, Issue **#16** geschlossen). Offen in Phase 1: **#17** (Raumfotos, extern). Betrieb/DNS: Wildcard **`*.mpz.schule`** → VPS — Details in [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md). Bis zum Schulfest bleiben **~5 Wochen**. Von der Schule liegen **Raumfotos, Stationstexte und Maskottchen-Material** vor; Zuordnung Foto ↔ Station: [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md).

---

## Status nach Bereichen

| Bereich                     | Status               | Anmerkung                                                                                               |
| --------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| Auftraggeber-Gespräch       | ✅ Erledigt          | `auftraggeber/antworten.md`, Transkript, Council-Analyse 08.05.                                         |
| Projektplan + GitHub-Issues | ✅ Vorhanden         | Phasen 0–5 in `dokumentation/archiv/projektplan.md`                                                            |
| Hosting (ADR-001)           | ✅ Entschieden       | MPZ-Hetzner, Coolify, Docker                                                                            |
| Architektur Frontend/CMS    | ✅ Entschieden       | [ADR-002](../adr/002-frontend-nextjs.md), [ADR-003](../adr/003-content-mvp-json-directus.md)            |
| Video-Hosting               | ✅ Entschieden       | [ADR-004](../adr/004-video-hosting-mpz.md) — MPZ; YouTube nach Rechtsklärung                            |
| Zugangskontrolle            | ✅ Entschieden       | [ADR-005](../adr/005-zugangskontrolle-token.md) — Token, Modi fest/heft, In-App-Scanner                 |
| Raum-Viewer                 | ✅ Umgesetzt (#55/#56) | [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md) — Gyro Portrait `alpha`/Armschwenk, Hotspots, Panel, Mobil-Härtung; Demo `/raum/musik` |
| Dialog (Otto/Frieda)        | ✅ Demo (#69, UI #71, Polish #72) | Audio [ADR-010](../adr/010-dialog-cutscene-gated-audio.md); UI [ADR-011](../adr/011-dialog-mascot-hotspots.md); TopBar/Chip [#72](https://github.com/flxln/schulnavigator/issues/72) ([PR #73](https://github.com/flxln/schulnavigator/pull/73)); `daz`, `pc-raum` |
| AVV / DSGVO                 | 🟡 Entwurf versendet | AVV-Entwurf an Schule (21.05., Thomas); **Unterschrift** bis Schulfest → Phase 4 (#43)                  |
| Anwendungscode              | 🟢 Phase 1 + #55/#56 | Wie Phase 1; zusätzlich **Raum-Viewer** (Gyro/Hotspots, Mobil-Härtung), **GS39-Theme**, `validate:tokens`; Ops: [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md) |
| Content von der Schule      | 🟡 Teilweise         | 11 Stationen + Texte/Fotos; **Content-Lieferplan** (Medientyp/Klasse) bis 12.06. offen                  |
| Maskottchen-Rechte          | ✅ Freigabe          | PDF in `verlagsinfo/`; **Verlagsnennung** im Impressum → Phase 2/4                                      |

---

## Zeitplan vs. Realität

| Phase             | Zieltermin | Inhalt                                                 | Ist-Zustand                                                          |
| ----------------- | ---------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| **0** Architektur | bis 14.05. | ADRs, Stationen, AVV                                   | **Abgeschlossen** — ADR 001–006; 11 Stationen; AVV-Entwurf versendet |
| **1** Foundation  | bis 28.05. | Next.js, Docker, Routing, leere Stationen, Startseite, QR, Deploy-Test | **Technisch erledigt (#9–#16)** — inkl. Live-URL; **#17** (Raumfotos) extern / Content |
| **2** UI-Shell    | bis 12.06. | Player, Stempel, Token, i18n-Struktur                  | **#55/#56 erledigt** (Raum-Viewer + Theme + Mobil-Härtung); Rest ausstehend |
| **3** Content     | 12.–24.06. | Kinder-Content einpflegen, QR drucken                  | Ausstehend                                                           |
| **4** Live        | 26.06.     | Schulfest                                              | Hard Deadline                                                        |
| **5** Post-Fest   | ab Juli    | Directus, Migration, Erweiterungen                     | Geplant                                                              |

**Nächster externer Termin:** Meeting MPZ mit Sten am **10.06.2026** (Demo App-Shell, Content-Lieferplan).

---

## Material von der Schule

### Stationen (`auftraggeber/material/stationen/`)

| Artefakt                        | Beschreibung                                                            |
| ------------------------------- | ----------------------------------------------------------------------- |
| `001.jpeg`–`012.jpeg`           | Raumfotos (lokal, ggf. nicht versioniert)                               |
| `001.txt`–`012.txt`             | Platzhalter — **noch ohne Text**                                        |
| `Virtueller Schulrundgang.html` | Word-Export mit **11 Stationen** inkl. Texten und eingebetteten Bildern |
| `Virtueller Schulrundgang.fld/` | Zugehörige Bilddateien aus dem HTML-Export                              |

**11 Stationen im Material** (Texte in HTML/DOCX):

1. Klassenzimmer
2. DaZ-Zimmer
3. PC-Raum
4. Werkenzimmer
5. Turnhalle
6. Speiseraum
7. Kunstzimmer
8. Lesewelt
9. Hortzimmer
10. Musikzimmer
11. Schulsozialarbeiterzimmer

### Maskottchen (`auftraggeber/material/maskottchen/`)

| Datei              | Inhalt                            |
| ------------------ | --------------------------------- |
| `Frieda_Maske.png` | Giraffe (Schulplaner-Maskottchen) |
| `Otto_Maske.png`   | Maus (Schulplaner-Maskottchen)    |
| `*_GSP_25.pdf`     | Verlagsmaterial (Schulplaner)     |

**Rechtlich:** Die als PDF vorliegende Mail gilt als schriftliche Freigabe (`auftraggeber/material/verlagsinfo/freigabe-bilder-bildrechte.pdf`). Nutzung der Maskottchen ist danach möglich; **Verlagsnennung** muss im UI/Impressum erfolgen.

---

## Stationen-Scope (entschieden)

Im Gespräch vom 07.05. war zunächst ein MVP mit **7–8 Stationen** diskutiert. Tina hat Material mit **11 Stationen** geliefert (`Virtueller Schulrundgang.html`); das ist die **verbindliche Grundlage** für Routing, JSON und QR-Codes (Slugs: [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md)).

**Noch offen (Phase 2, nicht Phase 0):** Content-Lieferplan — pro Station Medientyp und verantwortliche Klasse (Meeting 10.06.).

---

## Architektur (entschieden / offen)

### Zielbild (gestaffelt)

| Phase                            | Stack                             | Content-Pflege      |
| -------------------------------- | --------------------------------- | ------------------- |
| **MVP** (bis 26.06.)             | Next.js + Tailwind + JSON im Repo | MPZ                 |
| **Langfristig** (ab Herbst 2026) | Next.js + **Directus** (Coolify)  | Schule (Lehrkräfte) |

**Verworfen:** eigenes Custom-Admin-Interface → Directus übernimmt Redaktion, Medien und Rollen.

ADRs: [001](../adr/001-hosting-coolify.md) · [002](../adr/002-frontend-nextjs.md) · [003](../adr/003-content-mvp-json-directus.md) · [004](../adr/004-video-hosting-mpz.md) · [005](../adr/005-zugangskontrolle-token.md) · [006](../adr/006-raum-viewer-gyro-hotspots.md)

### Zugang (ADR-005, Kurz)

| Modus                  | Entry                               | Startseite                                     | Räume erreichen           |
| ---------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------- |
| **`fest`** (26.06.)    | QR Eingang, System-Kamera, einmalig | **Puzzle-Hub** (Segmente nach Scan) + Scan-CTA | In-App-Scanner an der Tür |
| **`heft`** (Schuljahr) | QR im Heft, einmalig                | Voller Hub (alle 11 klickbar)                  | Klick oder Scan           |

Token in **`localStorage`** (tabübergreifend). Raum-QRs = Navigation, kein Freischalten pro Raum.

**Offen (Recht):** YouTube-Embed nach DSB-Klärung (ADR-004). Delightex-Embed technisch live (ADR-017 Stufe 3); Datenschutzerklärung um Drittanbieter-Absatz noch offen.

---

## Aufgaben — diese Woche (Priorität)

### Blockierend (mit Schule / MPZ)

- [x] **Maskottchen:** Verlagsfreigabe liegt vor (PDF)
- [x] **AVV:** Entwurf von Thomas an Schule gesendet (21.05.)
- [ ] **Maskottchen:** Verlagsnennung im UI/Impressum (Phase 2/4)

### Technisch (MPZ)

- [x] **Next.js / Docker / Routing / JSON / Shell / Startseite / QR-Generator** (#9–#15): siehe `app/`, `anleitungen/lokal-testen-und-anschauen.md`, `anleitungen/qr-codes-drucken.md`
- [x] **Live-Deployment** MPZ/Coolify — `https://schulnavigator.mpz.schule` (Issue #16 geschlossen; Runbook [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md))
- [x] **Raum-Viewer + GS39-Theme** (Issue #55 geschlossen; Demo `/raum/musik`, Doku in `architektur.md` / `fuer-entwickler.md`)
- [ ] Bilder nach `public/stations/` (#17 / Material); fehlendes Foto `schulsozialarbeit` nachliefern

### Bewusst nicht jetzt

Kamera-AR/WebXR, 360°-Panorama, Lego-Trigger, **Directus** (erst nach Schulfest), aktive Mehrsprachigkeit — siehe Phase 5. **Im MVP:** Gyro-Viewer ([ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)).

---

## Aufgaben — bis 10.06.2026 (Meeting)

- [x] Demo der App-Shell vorbereitet — Hub, Scan, `/raum/musik` (4 Medientypen), `/raum/daz` + `/raum/pc-raum` (Dialog); Ablauf [`2026-06-10-mpz-demo-meeting.md`](../../archiv/projektmanagement/2026-06-10-mpz-demo-meeting.md)
- [ ] Content-Lieferplan von Schule einfordern: Raum → Medientyp → Klasse → Verantwortlich
- [ ] WLAN/Mobilfunk: Testplan für Turnhalle und Außenbereich vereinbaren

---

## Aufgaben — bis 12.06.2026

- [ ] Content-Lieferplan der Schule liegt vor (Voraussetzung Phase 3)
- [ ] UI-Shell fertig (Phase 2 Deliverable)

---

## Aufgaben — Projekttag (24./25.06.2026)

- [ ] **Einverständniserklärungen:** Von der Schule am Projekttag klären/einholen — kein Blocker davor
- [ ] Kinder-Content **nur mit Einwilligung** aufnehmen; **was an dem Tag mit Einverständnis entsteht, reicht** für den Live-Betrieb am 26.06.
- [ ] Direktes Einpflegen und Live-Test aller Stationen (Felix/Julia vor Ort)

**Bis dahin:** App mit geliefertem Material (Texte, Raumfotos) lauffähig halten; Audio/Video mit Kinderstimmen erst ab Projekttag.

---

## Risiken

| Risiko                                  | Einstufung | Gegenmaßnahme                                                                                      |
| --------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| 11 Stationen bis 26.06. produktionsreif | Mittel     | JSON-Schema + parallele Kinder-Medien planen                                                       |
| Phase 1 verzögert                       | Gering     | #16 live; Fokus **#17** (Raumfotos) und Content-Lieferplan bis 10.06.                                                     |
| Content kommt nicht rechtzeitig         | Hoch       | Commitment am 10.06., Projekttag 24./25.06.                                                        |
| WLAN-Ausfall am Schulfest               | Mittel     | Mobilfunk primär; Tablet-Fallback                                                                  |
| Verlagsnennung unvollständig            | Niedrig    | Text aus `verlagsinfo/freigabe-bilder-bildrechte.pdf` ins Impressum                                |
| Wenig Kinder-Content am Projekttag      | Mittel     | Nur mit Einwilligung aufnehmen; Umfang „was kommt, reicht“; Texte/Bilder aus Material als Fallback |

---

## Ansprechpartner

| Rolle            | Person     |
| ---------------- | ---------- |
| Schule           | Sten, Tina |
| MPZ Technik      | Felix      |
| MPZ Koordination | Julia      |
| MPZ / AVV        | Thomas     |

---

## Referenzen im Repo

- Projektplan: [`dokumentation/archiv/projektplan.md`](../archiv/projektplan.md)
- Antworten Gespräch: [`auftraggeber/antworten.md`](../../auftraggeber/antworten.md)
- Technische Fragen: [`dokumentation/technische-fragen.md`](../technische-fragen.md)
- ADR-Index: [`dokumentation/entscheidungen.md`](../entscheidungen.md)
- Council-Analyse: [`protokolle/2026-05-08-council-analyse-39-grundschule.md`](../../protokolle/2026-05-08-council-analyse-39-grundschule.md)

---

_Dieses Dokument dient als Arbeitsgrundlage für Twenty und wird bei wesentlichen Projektänderungen aktualisiert._
