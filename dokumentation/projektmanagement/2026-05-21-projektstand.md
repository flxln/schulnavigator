# Schulnavigator — Projektstand

**Stand:** 2026-05-21  
**Projekt:** Schulnavigator (39. Grundschule Dresden)  
**Auftraggeber:** Sten, Tina (Schule) · **Umsetzung:** MPZ (Felix, Julia, Thomas)  
**Hard Deadline:** Schulfest am **26.06.2026**

---

## Kurzfassung

Konzept und Planung sind weit fortgeschritten; **die Entwicklung hat noch nicht begonnen** (`app/` existiert nicht). **Phase-0-ADRs (001–005) sind entschieden** — Umsetzung in `app/` steht aus. Bis zum Schulfest bleiben **~5 Wochen**. Neu eingetroffen: **Raumfotos, Stationstexte und Maskottchen-Material** von der Schule — Scope (8 vs. 11 Stationen) muss noch schriftlich geklärt werden.

---

## Status nach Bereichen

| Bereich | Status | Anmerkung |
|---|---|---|
| Auftraggeber-Gespräch | ✅ Erledigt | `auftraggeber/antworten.md`, Transkript, Council-Analyse 08.05. |
| Projektplan + GitHub-Issues | ✅ Vorhanden | Phasen 0–5 in `dokumentation/projektplan.md` |
| Hosting (ADR-001) | ✅ Entschieden | MPZ-Hetzner, Coolify, Docker |
| Architektur Frontend/CMS | ✅ Entschieden | [ADR-002](../adr/002-frontend-nextjs.md), [ADR-003](../adr/003-content-mvp-json-directus.md) |
| Video-Hosting | ✅ Entschieden | [ADR-004](../adr/004-video-hosting-mpz.md) — MPZ; YouTube nach Rechtsklärung |
| Zugangskontrolle | ✅ Entschieden | [ADR-005](../adr/005-zugangskontrolle-token.md) — Token, Modi fest/heft, In-App-Scanner |
| AVV / DSGVO | 🟡 Entwurf | `dokumentation/dsgvo.md` — AVV-Entwurf an Schule ausstehend |
| Anwendungscode | ❌ Nicht gestartet | Kein Next.js-Projekt, kein Deployment |
| Content von der Schule | 🟡 Teilweise | Bilder + Texte + Maskottchen; Zuordnung und MVP-Scope offen |
| Maskottchen-Rechte | ✅ Freigabe | PDF in `verlagsinfo/`; Nennung im Impressum umsetzen |

---

## Zeitplan vs. Realität

| Phase | Zieltermin | Inhalt | Ist-Zustand |
|---|---|---|---|
| **0** Architektur | bis 14.05. | ADRs, Stationen, AVV | **Weitgehend** — ADR 001–005; Umsetzung offen |
| **1** Foundation | bis 28.05. | Next.js, Docker, Routing, leere Stationen, Deploy-Test | **Nicht begonnen** |
| **2** UI-Shell | bis 12.06. | Player, Stempel, Token, i18n-Struktur | Ausstehend |
| **3** Content | 12.–24.06. | Kinder-Content einpflegen, QR drucken | Ausstehend |
| **4** Live | 26.06. | Schulfest | Hard Deadline |
| **5** Post-Fest | ab Juli | Directus, Migration, Erweiterungen | Geplant |

**Nächster externer Termin:** Meeting MPZ mit Sten am **10.06.2026** (Demo App-Shell, Content-Lieferplan).

---

## Material von der Schule

### Stationen (`auftraggeber/material/stationen/`)

| Artefakt | Beschreibung |
|---|---|
| `001.jpeg`–`012.jpeg` | Raumfotos (lokal, ggf. nicht versioniert) |
| `001.txt`–`012.txt` | Platzhalter — **noch ohne Text** |
| `Virtueller Schulrundgang.html` | Word-Export mit **11 Stationen** inkl. Texten und eingebetteten Bildern |
| `Virtueller Schulrundgang.fld/` | Zugehörige Bilddateien aus dem HTML-Export |

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

| Datei | Inhalt |
|---|---|
| `Frieda_Maske.png` | Giraffe (Schulplaner-Maskottchen) |
| `Otto_Maske.png` | Maus (Schulplaner-Maskottchen) |
| `*_GSP_25.pdf` | Verlagsmaterial (Schulplaner) |

**Rechtlich:** Die als PDF vorliegende Mail gilt als schriftliche Freigabe (`auftraggeber/material/verlagsinfo/freigabe-bilder-bildrechte.pdf`). Nutzung der Maskottchen ist danach möglich; **Verlagsnennung** muss im UI/Impressum erfolgen.

---

## Scope-Abweichung (kritisch)

Im Gespräch vom 07.05. war für den **26.06. ein MVP mit 7–8 Stationen** vereinbart, u. a.:

- Musikzimmer, Werkraum/Robotik, Klassenzimmer (interaktive Tafel), PC-Raum  
- Sporthalle, Kunstzimmer + Lesewelt, Speiseraum  
- Optional: Hort  

Das gelieferte Material beschreibt **11 Stationen** (inkl. DaZ, Hort, Schulsozialarbeit als eigene Station).

**→ Stand: Die 11 Stationen wurden von Tina geliefert und bilden nun die verbindliche Grundlage für die Umsetzung.**

---

## Architektur (entschieden / offen)

### Zielbild (gestaffelt)

| Phase | Stack | Content-Pflege |
|---|---|---|
| **MVP** (bis 26.06.) | Next.js + Tailwind + JSON im Repo | MPZ |
| **Langfristig** (ab Herbst 2026) | Next.js + **Directus** (Coolify) | Schule (Lehrkräfte) |

**Verworfen:** eigenes Custom-Admin-Interface → Directus übernimmt Redaktion, Medien und Rollen.

ADRs: [001](../adr/001-hosting-coolify.md) · [002](../adr/002-frontend-nextjs.md) · [003](../adr/003-content-mvp-json-directus.md) · [004](../adr/004-video-hosting-mpz.md) · [005](../adr/005-zugangskontrolle-token.md)

### Zugang (ADR-005, Kurz)

| Modus | Entry | Startseite | Räume erreichen |
|---|---|---|---|
| **`fest`** (26.06.) | QR Eingang, System-Kamera, einmalig | Kein Hub; Scan-CTA + Stempel | In-App-Scanner an der Tür |
| **`heft`** (Schuljahr) | QR im Heft, einmalig | Hub mit allen 11 Stationen | Klick oder Scan |

Token in **`localStorage`** (tabübergreifend). Raum-QRs = Navigation, kein Freischalten pro Raum.

**Offen (Recht):** YouTube-Embed nach DSB-Klärung (ADR-004).

---

## Aufgaben — diese Woche (Priorität)

### Blockierend (mit Schule / MPZ)

- [x] **Maskottchen:** Verlagsnennung im UI/Impressum umsetzen (Freigabe liegt vor)  
- [x] **AVV:** Entwurf von Thomas an Schule senden  

### Technisch (MPZ)

- [ ] Next.js-Projekt in `app/` scaffolden (Dockerfile, `/api/health`)  
- [ ] Erstes Deployment auf MPZ/Coolify testen  
- [ ] Content-Mapping: HTML-Texte → JSON; Fotos den **11** Stationen zuordnen  

### Bewusst nicht jetzt

AR, Lego-Trigger, **Directus** (erst nach Schulfest), aktive Mehrsprachigkeit — siehe Phase 5 im Projektplan.

---

## Aufgaben — bis 10.06.2026 (Meeting)

- [ ] Demo der App-Shell (leere Stationen, Startseite)  
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

| Risiko | Einstufung | Gegenmaßnahme |
|---|---|---|
| 11 Stationen bis 26.06. produktionsreif | Mittel | JSON-Schema + parallele Kinder-Medien planen |
| Phase 0/1 verzögert | Hoch | ADRs + Scaffold parallel starten |
| Content kommt nicht rechtzeitig | Hoch | Commitment am 10.06., Projekttag 24./25.06. |
| WLAN-Ausfall am Schulfest | Mittel | Mobilfunk primär; Tablet-Fallback |
| Verlagsnennung unvollständig | Niedrig | Text aus `verlagsinfo/freigabe-bilder-bildrechte.pdf` ins Impressum |
| Wenig Kinder-Content am Projekttag | Mittel | Nur mit Einwilligung aufnehmen; Umfang „was kommt, reicht“; Texte/Bilder aus Material als Fallback |

---

## Ansprechpartner

| Rolle | Person |
|---|---|
| Schule | Sten, Tina |
| MPZ Technik | Felix |
| MPZ Koordination | Julia |
| MPZ / AVV | Thomas |

---

## Referenzen im Repo

- Projektplan: [`dokumentation/projektplan.md`](../projektplan.md)  
- Antworten Gespräch: [`auftraggeber/antworten.md`](../../auftraggeber/antworten.md)  
- Technische Fragen: [`dokumentation/technische-fragen.md`](../technische-fragen.md)  
- ADR-Index: [`dokumentation/entscheidungen.md`](../entscheidungen.md)  
- Council-Analyse: [`protokolle/2026-05-08-council-analyse-39-grundschule.md`](../../protokolle/2026-05-08-council-analyse-39-grundschule.md)

---

*Dieses Dokument dient als Arbeitsgrundlage für Twenty und wird bei wesentlichen Projektänderungen aktualisiert.*
