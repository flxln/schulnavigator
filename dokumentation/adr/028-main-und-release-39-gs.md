# ADR-028 — `main` als Stamm, Schule deployt von `release/39-gs`

**Datum:** 2026-11-02
**Status:** entschieden; Punkt 4 **ersetzt durch [ADR-033](./033-demo-instanz-schulnavigator-mpz-schule.md)** (Demo-Instanz, 2026-11-03); Punkt 5 erledigt (`kunde/39-gs` gelöscht, Tag `archiv/kunde-39-gs`)

## Kontext

`main` war eingefroren (Regeldatei `.cursor/rules/branch-freeze-kunde.mdc`, mit diesem ADR entfernt). Der GS39-Betrieb lief auf `kunde/39-gs`, 97 Commits vor `main`. Der echte Content (`app/data/stations.json`) lag nur dort. Die Feature-Pipeline legt Issue-Branches von `origin/main` an und setzt `main` als Stamm voraus.

Die Schule erreichte die App über Coolify-Application `jjgl5u105ucxjvbeuwflsjq4` (`https://39-gs.mpz.schule`) direkt vom Entwicklungsbranch. Die ältere Application `q1a8t4zswynvgutbw9og5l7n` (`https://schulnavigator.mpz.schule`) lief auf `main` und hat keine Schüler-Medien-Volumes.

## Entscheidung

1. **`main` ist wieder der Entwicklungsstamm.** `kunde/39-gs` geht per Merge-Commit nach `main` (kein Squash), damit die Historie bleibt (#264).
2. **Die Schule deployt von `release/39-gs`.** Der Branch ist ein Zeiger. Er wird nur bewusst per Fast-Forward auf einen Commit von `main` verschoben. Keine direkten Commits, kein Rebase, kein Force-Push.
3. **Coolify GS39:** Application `jjgl5u105ucxjvbeuwflsjq4` zeigt auf `release/39-gs`. Auto-Deploy ist aus. Ein Push auf `main` erreicht die Schule nicht.
4. **Legacy `schulnavigator.mpz.schule`** bleibt auf dem zuletzt gebauten Image erreichbar. Auto-Deploy aus. Die Application hat keine Schüler-Medien-Volumes und wird nicht auf `release/39-gs` umgestellt und nicht neu deployt. Abschalten der Domain ist ein eigener Schritt, weil gedruckte URLs noch darauf zeigen können.
5. **`kunde/39-gs` ist veraltet.** Der Branch bleibt, bis `release/39-gs` in Coolify bestätigt ist. Keine neuen Commits.
6. **Sichtbarer Kunstraum-Untertitel** nennt keinen Vornamen. Medien-IDs und Dateipfade bleiben, weil die Volume-Dateien daran hängen.
7. Diese Entscheidung **ersetzt** die Branch-Freeze-Regel. Neue Regel: [`.cursor/rules/release-39-gs.mdc`](../../.cursor/rules/release-39-gs.mdc).

## Begründung

- Die Pipeline und neue Issues brauchen einen Stamm, der den laufenden Content enthält.
- Ein beweglicher `main` darf nicht automatisch bei der Schule ankommen. Dafür reicht ein Zeiger, den nur ein bewusster Schritt verschiebt, plus ausgeschaltetes Auto-Deploy.
- Die Legacy-Domain ohne Medien-Volumes würde nach einem Redeploy auf den GS39-Stand Medien mit 404 ausliefern. Sie bleibt deshalb auf dem alten Image, folgt aber `main` nicht mehr automatisch.

## Verworfene Alternativen

- **Freeze behalten, Content nur per Pfad-Port:** Verworfen. `main` bleibt ohne Schulcontent, die Pipeline startet von einem leeren Stamm.
- **Schule deployt weiter von `main`:** Verworfen. Jeder Merge würde die Schule erreichen.
- **Schule deployt weiter von `kunde/39-gs`:** Verworfen. Das ist ein Entwicklungsbranch, kein Release-Zeiger.
- **Squash-Merge:** Verworfen. Die Historie der Content-Commits soll erhalten bleiben.
- **Legacy-Domain sofort abschalten oder auf `release/39-gs` stellen:** Verworfen. Abschalten kann gedruckte Links brechen. Umstellen ohne Volumes liefert die App ohne Schüler-Medien.

## Konsequenzen

- `pipeline-git start` darf Issue-Branches von `origin/main` anlegen. Code-Schritte sind nicht mehr durch den Freeze blockiert.
- Schul-Deploy: `release/39-gs` fast-forwarden, pushen, Medien per rsync, Coolify manuell redeployen. `deploy-content.sh` und `DEFAULT_DEPLOY_BRANCH` zeigen auf `release/39-gs`.
- `kunde/39-gs` nicht löschen, bis der Smoke auf `https://39-gs.mpz.schule` nach dem Redeploy grün ist.
- Ergänzt ADR-001 (Coolify) und ADR-027 (Medien nicht in Git).
