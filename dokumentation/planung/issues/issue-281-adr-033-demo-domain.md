## ADR-033: schulnavigator.mpz.schule als Demo- und Testinstanz

**Labels:** `tech` `documentation`

ADR-028 Punkt 4 behandelt `schulnavigator.mpz.schule` als Legacy-Domain, die nicht neu deployt wird. Entscheidung von Felix (3. November 2026, Triage #255): Die Domain wird die Demo- und Testinstanz des MPZ mit synthetischen Daten. Das Directus-Vorhaben, an dem diese Entscheidung hing, ist durch ADR-032 überholt; die Domain-Entscheidung bleibt.

Ist-Stand per Coolify-API am 3. November 2026: Application `q1a8t4zswynvgutbw9og5l7n`, Branch `main`, Auto-Deploy aus, altes Image, Entry-Token aktiv, keine Volumes.

**Aufgaben:**
- [ ] ADR-033 schreiben, ADR-028 Punkt 4 ersetzen, Punkt 5 (`kunde/39-gs`) als erledigt vermerken
- [ ] `.cursor/rules/release-39-gs.mdc`, `anleitungen/fuer-entwickler.md`, `dokumentation/architektur.md`, `CLAUDE.md` anpassen
- [ ] Regel festhalten: keine weitere Application mountet `/data/schulnavigator/*`

**Akzeptanzkriterium:** Agenten-Regel und Doku nennen `schulnavigator.mpz.schule` als Demo; keine Stelle verbietet mehr den Redeploy der Demo.

---

## Kontext

- ADR-028, ADR-032
- Triage: `dokumentation/planung/triage/triage-#255-directus-deploy-ionos.md`
- Folge: synthetischer Demo-Content (#282)
