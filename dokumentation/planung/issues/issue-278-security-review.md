## Security-Review der schreibenden Studio-Routen vor Go-Live

ADR-032 Konsequenzen (Sicherheit). Der Live-Server bekommt erstmals schreibende Routen mit Login und Upload.

**Prüfumfang:**
- [ ] Guard und Allowlist: keine Dev-only-Route im Produktionsmodus erreichbar
- [ ] Login: Hashing, Session, Cookie-Flags, Login-Bremse, Origin-Prüfung, Logout
- [ ] Autorisierung: `redaktion` schreibt nur eigene Slugs, serverseitig geprüft
- [ ] Uploads: Typprüfung, Größen, Pfad-Traversal, Auslieferung nur hinter dem Cookie
- [ ] Save-Pfad: Validierung vor Umbenennen, keine Teil-Schreibvorgänge, Sicherungen
- [ ] CSP und Header für die Studio-Seiten in Production
- [ ] Logs ohne Passwörter oder Session-Werte

**Akzeptanzkriterium:** Befunde mit Schweregrad dokumentiert unter `dokumentation/reviews/`; kritische und hohe Befunde behoben, bevor der Produktionsmodus auf `39-gs.mpz.schule` eingeschaltet wird.

---

## Kontext

- Epic-Parent: #273
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`)
- Bestehender Guard: `app/lib/mpz-studio-guard.ts`
- Blockiert durch: #274, #275, #276, #277, #256, #257, #258
