## Export: Live-Stand vom Content-Volume nach Git

ADR-032 Abschnitt 6. Nach dem Einschalten ist die Volume-Fassung von `stations.json` die Wahrheit. Der Export hält Fallback und Versionsgeschichte in Git aktuell.

**Aufgaben:**
- [ ] Weg festlegen, wie das MPZ die Volume-Fassung holt (z. B. Skript per SSH oder geschützter Download im Produktionsmodus für `admin`)
- [ ] Export validiert mit `validateStationsFile` und schreibt `app/data/stations.json` als Commit auf einem Branch
- [ ] Pflicht vor jedem Verschieben von `release/39-gs` und vor Schema-Änderungen: in `anleitungen/fuer-entwickler.md` und `.cursor/rules/release-39-gs.mdc` festhalten
- [ ] Schema-Migration: Ablauf, der auch die Volume-Fassung umbaut
- [ ] Prüfung vor Release: Image-JSON und Volume-Fassung stimmen überein, sonst Abbruch

**Akzeptanzkriterium:** Vor einem Release lässt sich mit einem Befehl der Live-Stand nach Git holen, und ein Release mit veraltetem Fallback fällt auf.

---

## Kontext

- Epic-Parent: #273
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`)
- Bestehender Guard: `app/lib/mpz-studio-guard.ts`
- Blockiert durch: #257, #256
