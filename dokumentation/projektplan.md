# Projektplan — Schulnavigator

Stand: 2026-05-08 | Schulfest (Hard Deadline): 2026-06-26

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

## Phase 0 — Architektur-Entscheidungen (bis 14.05.)

**Ziel:** Alle offenen Grundsatzfragen schriftlich entscheiden, bevor Code entsteht.

### Muss-Entscheidungen

| Frage | Empfehlung | Begründung |
|---|---|---|
| Frontend-Framework | Next.js (App Router) | Bereits im CLAUDE.md empfohlen, SSR + statische Routen |
| Routing | `/raum/[slug]` | Lesbare URLs, einfache QR-Code-Generierung |
| Video-Hosting | Eigener Upload auf MPZ-Server | Datenschutz (kein YouTube), Daten bleiben in DE |
| Content-Management | JSON-Dateien im Repo (Phase 1), später CMS | Einfachster Start, kein Extra-System nötig |
| Zugangskontrolle | Entry-QR-Code mit zeitlich begrenztem Token in URL | Kein Login für Gäste, aber nicht öffentlich indexierbar |
| Stationen MVP | **Maximal 8 Stationen** zum 26.6. | Realistisch produzierbar, lieber 8 fertige als 15 halbfertige |
| Wartung nach 26.6. | MPZ pflegt ein, Schule liefert Materialien | Entscheid nötig: bestimmt ob Admin-UI Pflicht ist |

### Deliverable
- ADR-Dokumente für alle Entscheidungen
- Sten/Tina schriftlich bestätigen: **8 Stationen, welche genau?**
- AVV-Entwurf an Schule schicken

---

## Phase 1 — Foundation (bis 28.05.)

**Ziel:** Lauffähiges Grundgerüst ohne echten Content. Jede Station ist erreichbar.

### Aufgaben

- [ ] Next.js-Projekt anlegen (TypeScript strict, Tailwind)
- [ ] Dockerfile (Multi-stage Build, Port via ENV, `/api/health`)
- [ ] Routing: `/raum/[slug]` — statische Seite pro Raum
- [ ] Datenmodell definieren (JSON-Schema pro Station: slug, titel, beschreibung, bild, medien[])
- [ ] Platzhalter-Seite: Raumbild + Titel + Textblock + Media-Slot (leer)
- [ ] Startseite: schematisches Schulhaus-Bild, anklickbare Punkte je Station
- [ ] QR-Code-Generator (Script, der pro Station einen QR-Code als PNG erzeugt)
- [ ] Deployment-Test auf MPZ-Server (Coolify)

### Nicht in Phase 1
- Gamification, AR, interaktive Features, Admin-UI, Mehrsprachigkeit

### Deliverable
- Deploy-Link, den Sten/Tina im Browser aufrufen können
- Leere Stationsseiten für alle 8 vereinbarten Räume
- Termin am 10.06. vorbereiten: Demo der leeren Shell

---

## Phase 2 — Content-Struktur + UI (bis 12.06.)

**Ziel:** App sieht aus wie das Endprodukt, Content-Slots sind befüllbar.

### Aufgaben

**Medien**
- [ ] Audio-Player-Komponente (native HTML5, kein externes Plugin)
- [ ] Video-Player-Komponente (direkter Upload, kein YouTube)
- [ ] Bild-Galerie-Komponente (für Fotosets)
- [ ] Medientyp-Routing: Station zeigt je nach Inhalt automatisch den richtigen Player

**Gamification (Minimal)**
- [ ] Stempel-System via `localStorage`: Station besucht = Häkchen gesetzt
- [ ] Startseite zeigt Fortschritt (z.B. 3/8 Stationen besucht)
- [ ] Abschluss-Animation wenn alle 8 erledigt (einfaches Konfetti, keine externe Library)

**Zugangskontrolle**
- [ ] Entry-QR-Code generiert Token mit Ablaufdatum (z.B. gültig 1 Schuljahr)
- [ ] App prüft Token beim ersten Aufruf, speichert in `sessionStorage`
- [ ] Ohne gültigen Token: Hinweisseite statt Inhalt

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
- [ ] Raumfotos für alle 8 Stationen (Sten macht das bei Sonnenschein)
- [ ] Zwei Wochen vor Schulfest: Kinder produzieren Content in Klassen
- [ ] Content gesammelt und an Felix übergeben (spätestens 22.06.)

**Felix/Julia (MPZ)**
- [ ] Content-Dateien in Projektstruktur einpflegen (JSON + Mediendateien)
- [ ] Qualitätskontrolle: max. 60 Sekunden, verständlich, brauchbare Tonqualität
- [ ] QR-Codes drucken und laminieren (für alle 8 Stationen)
- [ ] WLAN-Test vor Ort: alle Stationspunkte mit echtem Gerät prüfen

### Projekttage in der Schule (ca. 24./25.06.)
- Felix/Julia vor Ort
- Kinder nehmen Content auf (Mikrofon vorhanden)
- Content wird direkt eingepflegt
- Letzter Live-Test aller Stationen

---

## Phase 4 — Live am Schulfest (26.06.)

**Ziel:** 8 Stationen, stabil, ohne Überraschungen.

### Checkliste
- [ ] Alle 8 QR-Codes gedruckt und an Räumen befestigt
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
- [ ] Entscheidung: Admin-Interface ja/nein — und wer es benutzt

### Mittelfristig (Herbst 2026)
- [ ] Admin-Interface für Lehrkräfte (Content einpflegen ohne Entwickler)
- [ ] Englisch-Menü aktivieren
- [ ] Weitere Stationen nachrüsten (Phase-2-Features der Wunschliste)

### Langfristig (2027+)
- [ ] Mandantenfähigkeit: andere Schulen können eigene Instanz aufsetzen
- [ ] Onboarding-Dokumentation für neue Schulen
- [ ] AR / interaktive Features als opt-in Erweiterung

---

## Risiken und Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Gegenmaßnahme |
|---|---|---|
| Content kommt nicht bis 12.06. | Hoch | Festes Commitment der Schule am 10.06. einholen |
| WLAN-Ausfall am Schulfest | Mittel | Tablet-Fallback + Mobilfunk als primärer Weg |
| Scope Creep (AR, Lego-Trigger etc.) | Hoch | Phase-2-Liste schriftlich, explizit als "nicht 26.6." kommunizieren |
| Content-Qualität zu schlecht | Mittel | Felix/Julia am Projekttag vor Ort zur Qualitätssicherung |
| Maskottchen-Rechte (Giraffe/Maus) | Niedrig | Tina klärt mit Verlag bis 14.05. |

---

## Nächste konkrete Schritte (diese Woche)

1. **Scope schriftlich fixieren:** Tina/Sten bestätigen die 8 Stationen namentlich
2. **ADRs schreiben:** Routing, Video-Hosting, CMS, Auth (je ein ADR-Dokument)
3. **AVV-Entwurf:** Thomas/MPZ schickt Entwurf an Schule
4. **Mascottchen-Rechte:** Tina kontaktiert Verlag (Heike)
5. **Projektsetup:** Next.js-Repo anlegen, Dockerfile, erstes Deployment auf MPZ-Server testen
