# Issues — Phase 0: Architektur-Entscheidungen

Milestone: **Phase 0** | Fällig: 14.05.2026

---

## #1 — Stationen-Scope schriftlich fixieren

**Labels:** `org` `blocker` `extern`
**Assignee:** Sten / Tina

Tina/Sten nennen schriftlich die 8 Stationen für den 26.6., jeweils mit:
- Raumname
- Gewünschter Medientyp (Audio / Video / Foto / Text)
- Verantwortliche Klasse

Ohne diese Liste können Routing und Datenmodell nicht final gebaut werden.

---

## #2 — ADR: Routing-Schema

**Labels:** `tech` `blocker`
**Assignee:** Felix

Entscheidung dokumentieren: `/raum/[slug]` vs. `/raum/[id]`.
Empfehlung: `slug` (lesbar, QR-Code-freundlich, stabil bei Umbenennungen wenn slug bewusst gewählt).
ADR nach Vorlage `dokumentation/adr/000-template.md` erstellen.

---

## #3 — ADR: Video-Hosting

**Labels:** `tech` `blocker`
**Assignee:** Felix

Entscheidung dokumentieren: eigener Upload auf MPZ-Server vs. YouTube-Embed.
Empfehlung: eigener Upload (Datenschutz, Daten bleiben in DE, kein Drittanbieter-Tracking).
Implikation: Server braucht ausreichend Speicher, Upload-Limit pro Datei festlegen.

---

## #4 — ADR: Content-Management

**Labels:** `tech`
**Assignee:** Felix

Entscheidung dokumentieren: JSON-Dateien im Repo (Phase 1) vs. CMS (Phase 5).
Empfehlung: JSON für 26.6., CMS-Entscheidung nach Auswertung.
Implikation: Admin-Interface ist für 26.6. nicht nötig — Felix pflegt direkt ein.

---

## #5 — ADR: Zugangskontrolle

**Labels:** `tech`
**Assignee:** Felix

Entscheidung dokumentieren: Entry-QR-Code setzt zeitlich begrenzten Token in URL/sessionStorage.
Kein Login, keine Accounts. Token läuft nach Ablauf des Schuljahres ab.
Implikation: QR-Codes müssen bei Tokenwechsel neu gedruckt werden (jährlich).

---

## #6 — ADR: Wartung nach Schulfest

**Labels:** `org` `blocker`
**Assignee:** Thomas / Felix

Wer ist nach dem 26.6.2026 verantwortlich für das System?

- Option A: MPZ wartet, Schule liefert Materialien → Admin-Interface ist Phase-5-Feature
- Option B: Schule pflegt selbst → Admin-Interface ist Pflicht vor 26.6.

**Diese Entscheidung bestimmt den Entwicklungsaufwand mehr als alle anderen.**
Muss am Meeting 10.06. final geklärt sein, idealerweise schon vorher.

---

## #7 — AVV-Entwurf an Schule schicken

**Labels:** `org`
**Assignee:** Thomas

Auftragsverarbeitungsvertrag (AVV) zwischen MPZ und 39. Grundschule aufsetzen und zur Unterschrift schicken.
Muss bis zum Schulfest unterschrieben vorliegen.
Enthält: Hosting-Details, Speicherort der Daten (Deutschland), Verantwortlichkeiten.

---

## #8 — Maskottchen-Rechte klären (Giraffe / Maus)

**Labels:** `org` `extern`
**Assignee:** Tina

Tina kontaktiert die Chefin des Schulplaner-Verlags (deren Enkelin besucht die Schule).
Ziel: Nutzungserlaubnis für Giraffe und Maus als App-Maskottchen, idealerweise Original-Bilddateien.
Falls Rechte nicht geklärt: eigene neutrale Illustrationen als Fallback einplanen.
