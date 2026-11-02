---
tags:
  - pre-mortem
  - review
  - issue-230
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag (#230 Phase 3 Deploy-Automatisierung)

Dieses Gutachten bewertet den Implementierungsplan zu **Issue #230** (`.cursor/plans/issue_230_phase-3_8ef70de3.plan.md`) anhand der Logik- und Spec-Konsistenz (Methodik `1b_pre-mortem-logik.md`). Der Abgleich erfolgte insbesondere mit der definierten Zielarchitektur (`03-zielarchitektur.md`) und dem Umsetzungsplan (`04-umsetzungsplan.md`).

---

### Coolify-Webhook vs. Git HEAD (Widerspruch im Deploy-Pfad)
- **Warum später teuer:** Der Plan definiert den Push-Befehl als `git push origin HEAD` mit der expliziten Anforderung „kein erzwungenes main“. Danach wird der Coolify-Webhook ausgelöst. Coolify baut jedoch standardmäßig immer den konfigurierten Tracking-Branch (in der Regel `main`). Wenn ein Redakteur auf einem Feature-Branch arbeitet und den „Vollständig deployen“-Button drückt, lädt das Skript die Medien hoch und pusht den Feature-Branch. Der ausgelöste Webhook bringt Coolify jedoch dazu, den veralteten Stand von `main` zu bauen — die neuen Code-Änderungen (z. B. neue Station in `stations.json`) fehlen im Container.
- **Wann es beißt:** Sobald ein Redakteur das MPZ Studio auf einem anderen Branch als `main` betreibt, um z. B. Inhalte vorzubereiten. Medien gehen live, aber die Frontend-Änderungen werden verschluckt. Code und Media-Volume driften asynchron.
- **Billige Gegenmaßnahme jetzt:** Im Bash-Skript vor dem Git-Push prüfen, ob der aktuelle Branch der Coolify-Tracking-Branch (`main`) ist. Falls nicht, das Skript bei Voll-Deploy mit `Exit 1` abbrechen ("Deploy via Webhook nur vom main-Branch möglich. Nutze --media-only für Tests auf Branches"). Alternativ den Webhook überspringen, wenn `HEAD != main`.

### Rechte-Deadlock bei Skript-Abbruch (Unvollständiger Fehlerpfad)
- **Warum später teuer:** Der Plan sieht `set -euo pipefail` und drei aufeinanderfolgende `rsync`-Befehle vor, die über `--rsync-path="sudo rsync"` als `root` auf dem Server schreiben. Erst ganz am Ende des Skripts läuft `ssh ... sudo chown -R 1001:1001 $DEPLOY_REMOTE_BASE`. Schlägt jedoch das zweite oder dritte `rsync` fehl (z. B. Netzwerk-Timeout), bricht das Skript hart ab. Der `chown`-Befehl wird nie ausgeführt.
- **Wann es beißt:** Die zuvor hochgeladenen Dateien verbleiben im Besitz von `root:root`. Wenn Next.js zur Laufzeit Schreibrechte in diesen Ordnern bräuchte (Cache, Temp), hagelt es Permission-Errors. Gravierender: Ein erneuter (manueller) Deploy-Versuch ohne `sudo` scheitert an den Root-Rechten der bestehenden Dateien.
- **Billige Gegenmaßnahme jetzt:** Das manuelle `chown` am Ende streichen und stattdessen direkt beim `rsync`-Aufruf das Flag `--chown=1001:1001` mitgeben. Da der Empfänger-`rsync` ohnehin als `root` läuft, setzt dieses Flag die Besitzrechte der übertragenen Dateien sofort korrekt, ohne dass ein nachgelagerter Aufräum-Schritt nötig ist. (Alternativ: `trap 'ssh ... sudo chown ...' EXIT` in Bash).

### Fehlende Env-Validierung vor Seiteneffekten (Unvollständige Diskriminierung)
- **Warum später teuer:** Laut Plan soll das Bash-Skript bei fehlendem `DEPLOY_SSH` mit `stderr + exit 1` abbrechen, was auch über die API-Route (422) abgesichert wird. Wenn ein Entwickler das Skript aber lokal im Terminal via `npm run deploy:content` startet und vergisst, die Variable zu exportieren, schlägt das Bash-Skript wegen `set -u` erst in dem Moment fehl, wenn `DEPLOY_SSH` beim `rsync` aufgelöst wird.
- **Wann es beißt:** Zu diesem Zeitpunkt sind die langläufigen Validatoren (`validate:stations`, `validate:coach`) und vor allem der `git push origin HEAD` bereits erfolgreich durchgelaufen. Es wird ungewollt Code auf GitHub veröffentlicht, ohne dass das Deployment der zugehörigen Medien durchläuft.
- **Billige Gegenmaßnahme jetzt:** Ganz an den Anfang von `deploy-content.sh` (direkt nach `set -euo pipefail`) eine explizite Vorab-Prüfung setzen: `if [ -z "${DEPLOY_SSH:-}" ]; then echo "Fehler: DEPLOY_SSH nicht gesetzt" >&2; exit 1; fi`.
