# SE 13 — Qualitätsregeln (MPZ Studio Cleanup)

Ausgefüllt für dieses Paket. Leitplanken: Apple HIG — Klarheit, Zurückhaltung, Tiefe.

---

## Produkt

**MPZ Studio** — internes Content-Ingest-Tool für den Schulnavigator (39. Grundschule Dresden). Nur MPZ/Felix, lokal auf dem Laptop.

---

## Plattform

- Web Desktop-first (1280–1440 px)
- Responsive: Sidebar einklappbar
- Kein Dark Mode

---

## Nutzer

- Felix (MPZ), technisch versiert
- Zeitdruck bei Projekttagen, sonst gelegentliche Pflege
- Kennt JSON/CLI — Studio soll schneller sein

---

## Design-System

- GS39-Tokens (`03-design-system-gs39-tokens.css`)
- Gs39Button, Gs39Card als Referenz
- Werkzeug-UI: dichter als Besucher-App

---

## Barrierefreiheit

- Ziel: WCAG 2.1 AA wo praktikabel
- Touch-Targets ≥ 44×44 px
- Fehler: Farbe **und** Text
- Logische Fokus-Reihenfolge in Formularen und Modals

---

## Kern-User-Stories

1. Medien ingestieren (6 Typen) → Validierung → Vorschau
2. Hotspot kalibrieren (Flat/Sphere)
3. Dialog pflegen (Segmente, Audio)
4. Coach-Nachricht anlegen
5. Deploy vorbereiten (validate-all, QR, Token)
6. Validierung fehlgeschlagen → Rollback-Feedback

---

## Bewusst ausgeschlossen

- Lehrkräfte-Admin / Directus
- Production-Studio
- Dark Mode
- Implementierungscode

---

## Lieferformat (Pflicht)

1. Informationsarchitektur (neu gruppiert)
2. Lösungen für `08-bekannte-ui-probleme.md`
3. Komponenteninventar mit Zuständen
4. Interaktionsflüsse mit Fehlerpfaden
5. Visuelle Systematik (Tokens benennen)
6. High-Fidelity-Mockups — Empty, Filled, Error, Loading
7. Mindestens 3 konkrete A11y-Entscheidungen

---

## Qualitätsregeln

- Kein generisches Admin-Template — GS39 durchgängig
- Kein Scope über v2.1 hinaus (kein v3 Polish)
- Kein Implementierungscode
- Offene Fragen aus `08-bekannte-ui-probleme.md` beantworten, nicht offen lassen
- Jede Kern-Story hat einen Fehlerpfad
