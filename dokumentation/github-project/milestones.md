# Milestones

Jede Phase des Projektplans wird ein GitHub Milestone mit Fälligkeitsdatum.
Der Fortschrittsbalken in GitHub ergibt sich automatisch aus den geschlossenen Issues.

---

## Phase 0 — Architektur-Entscheidungen

**Fällig:** 14.05.2026
**Beschreibung:** Alle Grundsatzentscheidungen schriftlich treffen, bevor Code entsteht. Blockiert Phase 1.

---

## Phase 1 — Foundation

**Fällig:** 28.05.2026
**Beschreibung:** Lauffähiges Grundgerüst ohne echten Content. Alle Stationsseiten erreichbar, Deploy auf MPZ-Server umgesetzt. **Ist (21.05.):** Issues **#9–#16** erledigt (Code, Docker, QR, Runbook, Go-Live-Härtung, Live-URL `https://schulnavigator.mpz.schule`); **#17** (Raumfotos) extern.

---

## Phase 2 — Content-Struktur + UI

**Fällig:** 12.06.2026
**Beschreibung:** Fertige App-Shell mit allen UI-Komponenten inkl. Raum-Viewer (Gyro, Hotspots, ADR-006, #56) und GS39-Jubiläums-UI (#58, ADR-009: isometrischer Hub). Gleichzeitig muss die Schule den Content-Lieferplan abgeben — das ist der härteste Abhängigkeitspunkt.

---

## Phase 3 — Content-Integration

**Fällig:** 24.06.2026
**Beschreibung:** Echter Kinder-Content in der App, QR-Codes gedruckt, WLAN-Test vor Ort abgeschlossen.

---

## Phase 4 — Live am Schulfest

**Fällig:** 26.06.2026
**Beschreibung:** Hard Deadline. 11 Stationen live (`fest`: isometrischer Hub + Scanner, ADR-009), Entry-QR am Eingang, Tablet-Fallback.

---

## Phase 5 — Post-Fest

**Fällig:** 31.10.2026
**Beschreibung:** Directus, Mehrsprachigkeit, Mandanten-Vorbereitung. Kein harter Termin — Prioritäten nach Auswertung.
