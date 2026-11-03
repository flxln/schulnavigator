## Konten und Login für den Studio-Produktionsmodus

ADR-032 Abschnitt 5. Ersetzt im Produktionsmodus das gemeinsame Secret (`SN_MPZ_STUDIO_SECRET`) durch Konten pro Person.

**Aufgaben:**
- [ ] Kontodatei auf dem Content-Volume; Rollen `admin` (alle Slugs) und `redaktion` (Slug-Liste)
- [ ] Passwörter nur als Hash (scrypt oder argon2)
- [ ] Skript im Container: Konto anlegen, sperren, Passwort zurücksetzen; keine Oberfläche, kein Self-Signup
- [ ] Login-Seite und Session-Cookie: `httpOnly`, `Secure`, `SameSite=Strict`, 8 Stunden
- [ ] Schreibende Routen prüfen zusätzlich `Origin`; Fehlversuche beim Login werden gebremst
- [ ] Log-Zeile je gespeicherter Änderung: Konto, Zeit, Slug
- [ ] Entscheiden und festhalten: zweiter Faktor für `admin` ja/nein (offen aus ADR-032)

**Akzeptanzkriterium:** Im Produktionsmodus kommt nur ein angemeldetes Konto in die Studio-Routen; das Secret wird dort nicht mehr akzeptiert; der Dev-Modus bleibt beim Secret.

---

## Kontext

- Epic-Parent: #273
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`)
- Bestehender Guard: `app/lib/mpz-studio-guard.ts`
- Blockiert durch: #274
