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
**Beschreibung:** Lauffähiges Grundgerüst ohne echten Content. Alle Stationsseiten erreichbar, Deploy auf MPZ-Server umgesetzt. **Ist:** Issues **#9–#16** erledigt; **#27** (Raumfotos einpflegen) geschlossen (8/11 Panorama, 08.06.2026). **#17** (Lieferung Schule) offen für `kunst`, `hort`, `schulsozialarbeit`.

---

## Phase 2 — Content-Struktur + UI

**Fällig:** 12.06.2026
**Beschreibung:** Fertige App-Shell mit allen UI-Komponenten inkl. Raum-Viewer (Gyro, Hotspots, ADR-006, #56), GS39-Jubiläums-UI (#58, ADR-009: isometrischer Hub) und Medien-Player (#18–#20: Audio, Video, Foto). Gleichzeitig muss die Schule den Content-Lieferplan abgeben — das ist der härteste Abhängigkeitspunkt.

---

## Phase 3 — Content-Integration

**Fällig:** 24.06.2026
**Beschreibung:** Echter Kinder-Content in der App, QR-Codes gedruckt, WLAN-Test vor Ort abgeschlossen.

---

## Phase 4 — Live am Schulfest

**Fällig:** 26.06.2026
**Beschreibung:** Hard Deadline. Schulfest-Pilot (`fest`: Hub + Scanner, ADR-009): Entry-QR am Eingang, **≤7** Raum-QRs (offene Räume + Hof-Virtualisierung, nicht 11× Tür) — [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md). Tablet-Fallback.

---

## Phase 5 — Post-Fest

**Fällig:** 31.10.2026
**Beschreibung:** Directus, Mehrsprachigkeit, Mandanten-Vorbereitung. **ADR-017:** Epic [#97](https://github.com/flxln/schulnavigator/issues/97) (Hotspot-Marker #98, `link` #99, `embed` #100). Kein harter Termin — Prioritäten nach Auswertung.
