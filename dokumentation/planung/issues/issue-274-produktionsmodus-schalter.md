## Produktionsmodus-Schalter und Guard für MPZ Studio

ADR-032 Abschnitt 2 und 3. Studio läuft heute nur bei `NODE_ENV=development` (`isMpzStudioEnabled()`). Der Produktionsmodus bekommt einen eigenen Schalter.

**Aufgaben:**
- [ ] Eigene Runtime-Variable für den Produktionsmodus; `NODE_ENV` bleibt unangetastet
- [ ] Guard unterscheidet Dev-Modus, Produktionsmodus und aus; ohne Variable antworten alle Studio-Routen in Production weiter mit 404
- [ ] Allowlist der Routen im Produktionsmodus: vier Stations-Tabs (Stammdaten, Medien, Hotspots, Dialog) und Kalibrierung Fläche/Kugel
- [ ] Alle anderen Studio-Routen (Deploy, Raumbild, Hub, Akzente, Icons, Embed-Allowlist, Coach, Brand, QR) bleiben im Produktionsmodus 404
- [ ] Tests je Modus und Route, inklusive `/api/mpz/*` (Middleware matcht `/api/*` nicht, Guard pro Route nach ADR-022)

**Akzeptanzkriterium:** Mit gesetzter Variable sind genau die Routen der Allowlist erreichbar (noch hinter dem bestehenden Secret, Konten folgen); ohne Variable ist das Verhalten in Production unverändert.

---

## Kontext

- Epic-Parent: #273
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`)
- Bestehender Guard: `app/lib/mpz-studio-guard.ts`
