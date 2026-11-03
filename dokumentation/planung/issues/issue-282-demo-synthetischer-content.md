## Demo-Instanz: synthetischer Content und erster Redeploy

**Labels:** `tech` `content`

Nach ADR-033 zeigt `schulnavigator.mpz.schule` nur synthetische Daten. Die Application läuft auf einem alten Image. Ein Redeploy von `main` brächte die GS39-Stationstexte ins Image und Medienpfade, die ohne Volumes 404 liefern.

**Aufgaben:**
- [ ] Synthetische `stations.json` für die zwölf Slugs (Texte, Hotspots, Dialog ohne echte Namen) und synthetische Medien
- [ ] Ablageweg festlegen: eigenes Content-Volume und eigene Medien-Volumes der Demo (Lesepfad aus #257), keine Host-Pfade unter `/data/schulnavigator/*`
- [ ] Entscheiden: Fallback der Demo auf das Image-JSON (GS39-Texte) akzeptieren oder Demo-Seed im Image
- [ ] Eigene Entry-Tokens für die Demo, nicht die der Schule
- [ ] Erster bewusster Redeploy von `main`, Smoke-Test, Ergebnis in `anleitungen/fuer-entwickler.md`

**Akzeptanzkriterium:** Die Demo läuft auf aktuellem `main`, zeigt nur synthetische Inhalte und Medien, und keine Datei der 39. GS ist dort erreichbar.

---

## Kontext

- ADR-033, ADR-032 (Produktionsmodus wird zuerst auf der Demo eingeschaltet)
- Epic: #273
- Blockiert durch: #257
