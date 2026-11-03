## #257 Lesepfad: Stationen zur Request-Zeit vom Content-Volume, Fallback Image

**Umgewidmet am 3. November 2026 (ADR-032):** Quelle ist das Content-Volume statt Directus. Der Fallback-Gedanke aus ADR-029 bleibt.

**Aufgaben:**
- [ ] `app/lib/stations.ts` liest zur Request-Zeit die Volume-Fassung von `stations.json`, wenn sie existiert und `validateStationsFile` besteht
- [ ] Sonst gilt `stations.json` aus dem Image; ungültige Volume-Datei führt zu Fallback und Log-Zeile, nie zu einem Fehler für Besucher
- [ ] Build und `generateStaticParams()` lesen weiter die Datei im Image
- [ ] Cache-Strategie festlegen (z. B. mtime-Prüfung oder Revalidate nach Save), Änderung sofort sichtbar nach Save
- [ ] Tests für: Volume fehlt, Volume ungültig, Volume gültig

**Akzeptanzkriterium:** Nach einem Save sieht ein Besucher den neuen Stand ohne Redeploy; bei fehlender oder kaputter Volume-Datei antwortet `/raum/[slug]` weiter mit 200.

---

## Kontext

- Epic-Parent: #273 (vorher #47 Directus, geschlossen)
- Entscheidung: ADR-032 (`dokumentation/adr/032-mpz-studio-produktions-admin.md`, PR #272)
- Bericht: `dokumentation/reviews/cms-alternativen-2026-11-03.md`
