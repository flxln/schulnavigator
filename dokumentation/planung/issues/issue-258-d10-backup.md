## #258 Content-Volume in Backup T5 aufnehmen, Restore-Test

**Umgewidmet am 3. November 2026 (ADR-032):** Statt Directus-DB und Uploads-Volume wird das Content-Volume des Studio-Produktionsmodus gesichert.

**Aufgaben:**
- [ ] Content-Volume (Live-`stations.json`, Sicherungen, Konten) in Backup T5 aufnehmen (`dokumentation/dsgvo.md`)
- [ ] Restore-Test: Volume aus Backup zurückspielen, App liest den wiederhergestellten Stand
- [ ] Prüfen, dass die Kontodatei nur Hashes enthält, bevor sie ins Backup geht
- [ ] Ablauf in `anleitungen/fuer-entwickler.md` dokumentieren

**Akzeptanzkriterium:** Ein Restore-Test ist durchgeführt und dokumentiert, bevor der Produktionsmodus auf `39-gs.mpz.schule` eingeschaltet wird.

---

## Kontext

- Epic-Parent: #273 (vorher #47 Directus, geschlossen)
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`, PR #272)
- Bericht: `dokumentation/reviews/cms-alternativen-2026-11-03.md`
