# Issues — Phase 4: Live am Schulfest

Milestone: **Phase 4** | Fällig: 26.06.2026

**Voraussetzung:** Phase 3 abgeschlossen, Abschlusstest (#38) bestanden.

**Live-Modus:** Entry-Token **`fest`** — Puzzle-Hub, In-App-Scanner — [ADR-005](../adr/005-zugangskontrolle-token.md)

---

## #39 — QR-Codes an Räumen befestigen

**Labels:** `org`  
**Assignee:** Sten / Tina

> **Scope Nachtrag 2026-06-03:** Nicht mehr pauschal „11× an Türen“. Schulfest: nur **offene Räume** + **Hof-Virtualisierungen** laut Playbook — siehe [issues-schulfest-gs39-nachtrag.md](./issues-schulfest-gs39-nachtrag.md) (Epic **#86**, Issues **#87–#91**). Tag der offenen Tür: Tür-QRs separat planen.

- **Raum-QRs** für alle 12 Stationen generiert (`--preset=schulfest`); **physische** Platzierung nur für im Playbook (#87) vorgesehene Slugs (Tür/Innen oder Hof-Virtualisierung)
- **Offene Räume:** QR an Tür oder im Raum, Augenhöhe Erwachsene
- **Hof-Virtualisierung:** Outdoor-Spec (#89) — beschriftet, matt laminiert, ≥5 cm
- Nur Raum-URL, kein Entry-Token auf dem Sticker
- **Nicht** aushängen: QR an geschlossenen Klassentüren „für alle 11 Stationen“

---

## #40 — Entry-QR-Code am Schuleingang platzieren

**Labels:** `org`  
**Assignee:** Sten / Tina

- **Entry-QR** (`fest-2026`) am Eingang gut sichtbar — einmalig System-Kamera, dann In-App-Rundgang
- Kurzer Hinweistext: „Danach Stationen in der App scannen“
- Schulstartheft-Entry (`heft`) separat — nicht am Schulfest-Tag zwingend

---

## #41 — Tablet-Fallback vorbereiten

**Labels:** `org`  
**Assignee:** Sten / Tina

- 1–2 Tablets: Browser, **Entry-URL einmal öffnen**, dann App/Scanner nutzen
- Betreuung durch vertrauenswürdigen Schüler
- Fallback ohne eigenes Smartphone / schwacher Mobilfunk

**Software (Phase 2):** UI-Skalierung für Tablets — Epic **#74** / [ADR-012](../adr/012-tablet-ipad-responsive-layout.md) / [epic-tablet-ipad-layout.md](./epic-tablet-ipad-layout.md) (Unterissues #75–#78). Organisatorisches (#41) und Layout-Epic sind getrennt.

---

## #42 — Ansprechperson am Schulfest

**Labels:** `org`  
**Assignee:** Felix / Julia

- MPZ erreichbar (Telefon/Chat); Sten/Tina haben Ansprechpartner

---

## #43 — AVV unterschrieben vorliegend prüfen

**Labels:** `org`  
**Assignee:** Thomas

- AVV unterschrieben vor Live-Betrieb mit Schüler-Content
- Entwurf (#7) reicht für Entwicklung nicht für öffentlichen Schüler-Content ohne Unterschrift
