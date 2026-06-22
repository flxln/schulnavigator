# MPZ Studio — Claude Design (10-MD-Paket)

**Datum:** 2026-06-22  
**Zweck:** UI-Cleanup MPZ Studio v2.1 — angepasst an **max. 10 Markdown-Uploads** in Claude Design

---

## Claude-Design-Upload-Limits (Recherche)

| Limit | Wert | Quelle |
|-------|------|--------|
| Markdown-Dateien (Design-System-Kontext) | **max. 10** | Nutzerbestätigung Claude Design UI |
| Dateien pro Chat (allgemein) | bis 20 | [Claude Help / Drittanbieter-Docs](https://support.claude.com) |
| Größe pro Datei | 30 MB | Claude.ai Chat |
| Bilder (PNG/JPG) | separat, bis 30 MB | Vision-Modelle |

**Strategie dieses Pakets:** Alle Inhalte (Tokens, Schema, Mock-JSON) in **10 MD-Dateien** eingebettet. Screenshots optional als **PNG** zusätzlich hochladen (zählen nicht als MD).

**Alternative bei mehr Kontext:** GitHub-Subfolder `app/components/mpz-studio/` in Claude Design verlinken (laut Anthropic-Docs Juni 2026).

---

## Upload — genau diese 10 Dateien

1. `01-ANLEITUNG-UND-PROMPT.md` (diese Datei)
2. `02-BRIEF.md`
3. `03-SCREENS-UND-PROBLEME.md`
4. `04-QUALITAETSREGELN.md`
5. `05-DESIGN-SYSTEM.md`
6. `06-DATENMODELL.md`
7. `07-SPEZIFIKATION-UND-IST.md`
8. `08-MOCK-STATIONEN.md`
9. `09-MOCK-GLOBAL.md`
10. `10-SCREENSHOTS.md`

Optional: PNG-Screenshots (siehe `10-SCREENSHOTS.md`).

---

## Prompt (nach Upload kopieren)

```
Du bist Interface-Architekt im Modus SE 13 (UI-Design-Konzept). Leitplanken: Klarheit, Zurückhaltung, Tiefe (Apple HIG). Du lieferst UI-Konzept und High-Fidelity-Mockups — **keinen** React-/HTML-/CSS-Implementierungscode.

## Auftrag

Räume **MPZ Studio v2.1** auf: klare IA, gruppierte Navigation, einheitliche Muster — volle Funktionsabdeckung.

MPZ Studio = internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Nur lokal, nur MPZ/Felix, kein CMS für Lehrkräfte.

Lies alle 10 hochgeladenen MD-Dateien vollständig. Verbindlich:
- 02-BRIEF.md — Ziel, Scope
- 03-SCREENS-UND-PROBLEME.md — Screens S1–S24 + Ist-Probleme
- 04-QUALITAETSREGELN.md
- 05-DESIGN-SYSTEM.md — GS39-Tokens (eingebettet)
- 06-DATENMODELL.md — Typen + JSON-Schema (eingebettet)
- 07-SPEZIFIKATION-UND-IST.md — Spec + Komponenten-Inventar
- 08-MOCK-STATIONEN.md, 09-MOCK-GLOBAL.md — Mock-Daten

## Design-System

Farben/Typo/Spacing **ausschließlich** aus 05-DESIGN-SYSTEM.md (GS39-Tokens). Kein Dark Mode. Werkzeug-UI, dichter als Besucher-App.

## Cleanup-Pflicht (03-SCREENS-UND-PROBLEME.md)

1. 9-Punkte-Nav → gruppierte IA
2. Dialog-Audio: **Segment-Zeilenmodell** in 03 — kein globaler Nav, Text+Audio pro Zeile (Upload/Play/Löschen)
3. Medien-Upload → einheitlicher Einstieg
4. Brand vs. Hub → sinnvolle Bündelung
5. Dialog-Editor entlasten
6. Save & Validate — Dirty-State klarer
7. Mobile Sidebar scanbar

8. Sphere-Kalibrierung: S14 wie S13 — siehe Abschnitt in 03

## Screens v2.1 (Empty, Filled, Error, Loading)

**Stationen:** S5–S15 inkl. Dialog-Segment-Zeile · **Global:** S17–S21 · **Kein** Dialog-Audio-Sidebar

## Kern-User-Stories + Fehlerpfade

Medien ingestieren · Hotspot kalibrieren · Dialog pflegen · Coach · Deploy · Validierung fehlgeschlagen

## Lieferformat

1. Informationsarchitektur
2. Lösungen für alle Probleme in 03
3. Komponenteninventar mit Zuständen
4. Interaktionsflüsse
5. Visuelle Systematik (Token-Namen)
6. High-Fidelity-Mockups, Desktop 1280 px
7. Abweichungen Besucher-App

Kein Scope über v2.1. Kein Code. Offene Fragen in 03 beantworten.
```

---

## Nach dem Design

Umsetzung in `app/components/mpz-studio/`. Vollspec: `dokumentation/spezifikationen/mpz-studio.md`.
