## #256 Save-Pfad Produktionsmodus: Schema-Vertrag und kein Schüler-PII erzwingen

**Umgewidmet am 3. November 2026 (ADR-032):** Statt Directus-Collections geht es um den Save-Pfad des Studio-Produktionsmodus.

**Aufgaben:**
- [ ] Jeder Save im Produktionsmodus validiert das Gesamtdokument aller zwölf Stationen mit `validateStationsFile` (temporäre Datei, Sicherung, atomares Umbenennen auf dem Content-Volume)
- [ ] Keine neuen, umbenannten oder gelöschten Slugs (QR-fixiert); der Produktionsmodus bietet nur die vier Stations-Tabs
- [ ] **Kein Schüler-PII:** keine Freitextfelder für Personenlisten; Hilfetexte mit PII-Warnung in den Formularen; Validatoren nach Save
- [ ] redaktion-Konten schreiben nur Slugs ihrer Liste (Stufe 2 vorbereiten, Prüfung serverseitig)

**Akzeptanzkriterium:** Ein Save, der das Schema verletzt oder einen fremden Slug betrifft, wird serverseitig abgelehnt; die Live-Datei bleibt unverändert.

---

## Kontext

- Epic-Parent: #273 (vorher #47 Directus, geschlossen)
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`, PR #272)
- Bericht: `dokumentation/reviews/cms-alternativen-2026-11-03.md`
- Blockiert durch: Produktionsmodus-Schalter und Konten (Issues folgen im Epic)
