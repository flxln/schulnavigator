## Demo-Instanz: synthetischer Content und erster Redeploy

**Labels:** `tech` `content`

Nach ADR-033 zeigt `schulnavigator.mpz.schule` nur synthetische Daten. Die Application läuft auf einem alten Image. Ein Redeploy von `main` brächte die GS39-Stationstexte ins Image und Medienpfade, die ohne Volumes 404 liefern.

**Aufgaben:**
- [x] Synthetische `stations.json` für die zwölf Slugs (Texte, Hotspots, Dialog ohne echte Namen) und synthetische Medien
- [x] Ablageweg festlegen: Seed im Image (`app/demo-seed/`, Build-Variable `SN_INSTANCE=demo`), keine Host-Pfade unter `/data/schulnavigator/*`. Ein Content-Volume folgt mit #257, ist für den ersten Stand nicht nötig.
- [x] Entschieden: Fallback der Demo auf das Image-JSON der 39. GS ist nicht akzeptabel. Der Demo-Build ersetzt `stations.json`, Coach-Texte und öffentliche Schuldateien vor `next build`.
- [ ] Eigene Entry-Tokens für die Demo, nicht die der Schule. Der Container startet nur, wenn `SN_ACCESS_TOKENS` die Schul-Token nicht enthält.
- [ ] Erster bewusster Redeploy von `main`, Smoke-Test, Ergebnis in `anleitungen/fuer-entwickler.md`

**Akzeptanzkriterium:** Die Demo läuft auf aktuellem `main`, zeigt nur synthetische Inhalte und Medien, und keine Datei der 39. GS ist dort erreichbar.

---

## Kontext

- ADR-033, ADR-032 (Produktionsmodus wird zuerst auf der Demo eingeschaltet)
- Epic: #273
- Der erste Stand liegt im Image (`SN_INSTANCE=demo`). Ein Content-Volume kommt mit #257 dazu, blockiert diesen Seed nicht.
