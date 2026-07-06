## #262 — MPZ Studio nach Directus-Go auf Dev-/Notfall-Ingest begrenzen (ADR-022-Nachtrag)

**Labels:** `org` · **Blockiert durch:** #261

Chairman: Studio-Rolle nach Directus-Go **explizit** begrenzen, damit kein stiller Ersatz-Pflegepfad entsteht (Schema-Drift, „Felix pflegt schnell ein“).

**Aufgaben:**
- [ ] ADR-022-Nachtrag oder neues ADR: Studio = Dev-/Notfall-Ingest für Directus-geführte Inhalte; Directus ist die Wahrheit
- [ ] Prüfen: Studio-Warnhinweis/Read-only für Bereiche, deren Source of Truth Directus ist (abhängig von #253)
- [ ] `CLAUDE.md` und `fuer-entwickler.md` entsprechend aktualisieren

**Akzeptanzkriterium:** Es ist schriftlich eindeutig, welcher Pfad für welchen Content-Typ gilt; kein Dual-Write möglich oder zumindest kein undokumentierter.
---

## Kontext

- Epic-Parent: #47
- Spezifikation: `dokumentation/planung/epics/epic-directus.md`
- Gates: `dokumentation/spezifikationen/directus-auth-konzept.md`
- Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`
- Blockiert durch: #261
