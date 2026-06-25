---
tags:
  - pre-mortem
  - review
  - issue-230
  - 01b-logik-spec
erstellt: 2026-06-25
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag (#230 Medien-Deploy Publish)

**Plan:** `.cursor/plans/medien-deploy_publish_484e1578.plan.md`  
**Referenzen:** GitHub-Issue [#230](https://github.com/flxln/schulnavigator/issues/230), `dokumentation/planung/schuelermedien-deploy-trennung/03-zielarchitektur.md`, `04-umsetzungsplan.md`, ADR-027  
**Relevanter Code:** `app/scripts/deploy-content.sh`, `app/lib/mpz-deploy-content.ts`, `app/app/api/mpz/deploy/sync-content/route.ts`, `app/components/mpz-studio/deploy-tab.tsx`

Der grundlegende Zwei-Bahnen-Vertrag bleibt konsistent: Die drei Bahn-B-Bäume werden ausschließlich per rsync ausgeliefert; die geplante Git-Pfadliste enthält sie nicht. Vor der Implementierung müssen aber Publish-Erfolg, Commit-Scope und API-Rückgabe präzisiert werden.

### Publish kann ohne Redeploy erfolgreich enden — Akzeptanzkriterium und Env-Vertrag widersprechen sich
- **Warum später teuer:** Der Plan verspricht für den Studio-Button „live sichtbar“ und definiert den Flow bis zum Coolify-Webhook (`Plan:60-64,166-169`). Gleichzeitig bleibt ein fehlender Webhook ausdrücklich nur ein dokumentiertes Risiko (`Plan:177-179`). Der bestehende Env-Validator verlangt ausschließlich `DEPLOY_SSH` (`app/lib/mpz-deploy-content.ts:28-32`), und das Shell-Skript behandelt `COOLIFY_DEPLOY_WEBHOOK_URL` als optional (`app/scripts/deploy-content.sh:111-114`). Damit kann die Route `ok: true` liefern, obwohl nach Aussage des Plans kein Auto-Redeploy stattgefunden hat und die neue JSON-Version nicht live ist.
- **Wann es beißt:** Beim ersten Publish vom MPZ-Rechner mit fehlender oder nicht in den Next.js-Prozess geladener Webhook-Variable. Commit, Push und rsync sind erfolgreich, das Studio zeigt Erfolg, aber Coolify baut nicht neu.
- **Billige Gegenmaßnahme jetzt:** Für `media-only + commitMessage` einen eigenen Publish-Preflight festlegen: `COOLIFY_DEPLOY_WEBHOOK_URL` ist Pflicht und fehlt sie, wird vor Commit/Push mit einem stabilen Validierungsfehler abgebrochen. Alternativ muss die API einen Zustand wie `ok: true, redeployTriggered: false` liefern und die UI darf dann nicht „live sichtbar“ bzw. vollständigen Erfolg melden.

### Die Pfad-Whitelist begrenzt `git add`, aber nicht den anschließenden Commit
- **Warum später teuer:** Der Plan führt `git add -- <Whitelist>` aus, prüft danach jedoch den gesamten Index mit `git diff --cached --quiet` und ruft anschließend `git commit -m` ohne Pathspec auf (`Plan:83-91`). Bereits vorher gestagte Dateien außerhalb der Whitelist werden dadurch mitcommittet. Der behauptete Commit-Scope „Bahn-A-Whitelist“ und das Akzeptanzkriterium „Schüler-Medien landen nie im Commit“ sind deshalb nicht durch den beschriebenen Algorithmus garantiert; `.gitignore` schützt zudem keine bereits getrackten oder mit `git add -f` gestagten Dateien.
- **Wann es beißt:** Wenn vor dem Studio-Publish noch gestagte Code-, Doku- oder versehentlich force-gestagte Medienänderungen im Index liegen. Der automatisch benannte Content-Commit enthält dann fachfremde oder unzulässige Dateien und wird unmittelbar gepusht.
- **Billige Gegenmaßnahme jetzt:** Den Index-Vertrag explizit machen: Vor dem Whitelist-Add bei beliebigen bereits gestagten Pfaden abbrechen und die Pfade nennen, oder den Commit technisch auf exakt die Whitelist begrenzen. Der Test muss einen vorab gestagten Fremdpfad enthalten und beweisen, dass er weder committed noch gepusht wird.

### Commit-Ergebnis ist nur Freitext — UI und Shell haben keinen stabilen API-Vertrag
- **Warum später teuer:** Die UI soll Erfolg anhand von `stdout`-Texten wie `commit: skipped` und `commit: abc1234` unterscheiden (`Plan:138-145`). Die bestehende Route liefert jedoch nur generisches, gekürztes `stdout`/`stderr` (`app/app/api/mpz/deploy/sync-content/route.ts:44-52`); ein strukturiertes Commit-Ergebnis existiert nicht. Damit wird eine menschenlesbare Logzeile faktisch zum API-Protokoll. Wortlautänderungen, zusätzliche Präfixe oder Output-Trunkierung brechen die Anzeige, obwohl der Deploy selbst korrekt war.
- **Wann es beißt:** Bei der nächsten Anpassung der Shell-Ausgabe, Lokalisierung oder Log-Kürzung. Der Frontend-Test kann mit einem fest verdrahteten String grün sein, während reale Runner-Ausgaben nicht mehr erkannt werden.
- **Billige Gegenmaßnahme jetzt:** Den Response-Vertrag erweitern, z. B. um `publish: { commit: { status: 'created' | 'skipped', hash?: string }, pushed: boolean, mediaSynced: boolean, redeployTriggered: boolean }`. Falls der Bash-Prozess die Quelle bleibt, soll er eine eindeutig markierte maschinenlesbare Ergebniszeile ausgeben, die serverseitig geparst und validiert wird; die UI wertet nicht direkt `stdout` aus.
