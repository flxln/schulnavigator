## Uploads im Produktionsmodus auf die Bahn-B-Volumes hinter dem Cookie

ADR-032 Abschnitt 4 (Medien). Uploads aus den Tabs Medien und Dialog landen in den bestehenden Volumes (`/app/public/media`, `/app/content/dialog-audio`, ADR-027) und werden nur über `/media/*` und `/api/dialog/*` ausgeliefert.

**Aufgaben:**
- [ ] Upload-Ziel im Produktionsmodus auf die Volumes legen; Image-Pfade bleiben für den Laufzeit-User schreibgeschützt
- [ ] `validateUpload` und `UPLOAD_RULES` unverändert anwenden (Magic-Bytes, Größen)
- [ ] Kein Upload unter `/stations/` oder anderen öffentlichen Pfaden
- [ ] Prüfen: Rechte des Container-Users auf den Volume-Pfaden am Host (im Bericht nicht nachgesehen)
- [ ] Test: hochgeladene Datei ist ohne Entry-Cookie 403, mit Cookie 200/206
- [ ] Verwaiste Dateien nach Ersetzen/Löschen eines Mediums: Verhalten festlegen

**Akzeptanzkriterium:** Ein im Produktionsmodus hochgeladenes Medium ist nach Save sofort in der Station sichtbar und ohne Entry-Cookie nicht abrufbar.

---

## Kontext

- Epic-Parent: #273
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`)
- Bestehender Guard: `app/lib/mpz-studio-guard.ts`
- Blockiert durch: #274, #275, #256
