---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-25
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #230 Medien-Deploy Publish-Flow

**Plan:** `.cursor/plans/medien-deploy_publish_484e1578.plan.md`
**Relevanter Code:** `app/scripts/deploy-content.sh` (Zeilen 12-22, 52-64, 111-114), `app/lib/mpz-content-io.ts` (Zeilen 34-39, 174-195), `app/lib/mpz-deploy-content.ts` (Zeilen 34-46, 59-75), `app/app/api/mpz/deploy/sync-content/route.ts` (Zeilen 34-52), `app/components/mpz-studio/deploy-tab.tsx` (Zeilen 41-49, 148-214, 409-434), `app/.gitignore` (Zeilen 49-52)

Positiv: Die grundsätzliche Entkopplung der Subprozesse über `runShellScript()` und die Trennung zwischen Studio-UI und API-Guard ist robust aufgesetzt. Die eigentlichen Stolpersteine liegen auf Shell-Ebene beim Argumenten-Parsing, in der unbeabsichtigten Erfassung lokaler Zwischendateien durch Git sowie in der Synchronität von Git Commit und Git Push.

### [Bash-Arg-Parsing bricht bei Flag-Werten mit Leerzeichen ab] — `for arg in "$@"` verhindert sauberes Multi-Token-Parsing
- **Warum später teuer:** Der Plan fordert das neue Flag `--commit-message "..."` für `deploy-content.sh`. Das bestehende Skript iteriert aber starr über `for arg in "$@"; do case "$arg" in ...` (`app/scripts/deploy-content.sh:12-22`). Wird `--commit-message "Hotspots Kunst"` übergeben, sind dies im positional array `$@` zwei getrennte Tokens. Im Schleifendurchlauf für `--commit-message` kann der Wert nicht direkt konsumiert werden; im darauffolgenden Durchlauf landet der Text `"Hotspots Kunst"` als eigenes Argument im `case`, trifft den Wildcard-Fallback `*) echo "Unbekanntes Argument: ..."; exit 1` und bricht das gesamte Deploy-Skript ab.
- **Wann es beißt:** Direkt beim ersten echten Test des neuen Publish-Flows im MPZ Studio oder über die CLI, sobald eine Commit-Nachricht Leerzeichen enthält.
- **Billige Gegenmaßnahme jetzt:** Im Plan ausdrücklich vorschreiben, dass der Argumenten-Loop in `deploy-content.sh:12` auf eine `while [[ $# -gt 0 ]]; do case "$1" in --commit-message) COMMIT_MESSAGE="$2"; shift 2 ;; ... shift ;; esac; done` Schleife umgestellt werden muss.

### [Stille Git-Add Fehler bei fehlenden Pfaden oder Erfassung lokaler Backups] — starre Pathspecs in `deploy-git-commit.mjs` brennen den Klon an
- **Warum später teuer:** Der Plan spezifiziert eine feste Whitelist für `deploy-git-commit.mjs` (u. a. `public/brand/`, `data/station-icons.json`, `public/stations-icons/`). Wenn das Node-Skript starr `git add -- <alle_whitelist_pfade>` ausführt und auch nur ein Pfad (z. B. noch ungenutzte Brand-Slots oder neue Konfig-Dateien) auf der Festplatte fehlt, bricht Git standardmäßig mit `fatal: pathspec '...' did not match any files` und Exit-Code 128 ab. Gleichzeitig riskieren zu breite Ordner-Pfade wie `data/` das unabsichtliche Committen lokaler `.bak`-Dateien (`data/embed-allowlist.json.bak` etc.), da diese im Gegensatz zu `data/stations.json.bak` (`app/.gitignore:50`) nicht explizit in `.gitignore` stehen.
- **Wann es beißt:** In frischen Entwickler-Setups, CI-Pipelines oder beim ersten Studio-Save einer Station, bei der noch keine Custom-Hotspot-Icons angelegt wurden.
- **Billige Gegenmaßnahme jetzt:** In `deploy-git-commit.mjs` vor dem `git add` die Whitelist-Pfade dynamisch per `existsSync()` filtern (oder `git add --ignore-errors` nutzen) und in `mpz-deploy-git-paths.ts` explizit `*.bak` und `*.tmp` ausschließen.

### [Remote-Pushes von lokalen Test-Branches bei `$MEDIA_ONLY`] — bestehender Branch-Guard ist an `$DO_PUSH` gekoppelt
- **Warum später teuer:** Das aktuelle Skript unterbindet Pushes bei `--media-only` über `if $MEDIA_ONLY ... DO_PUSH=false` (`app/scripts/deploy-content.sh:52-55`). Der Plan führt einen neuen `DO_PUBLISH`-Block ein (`if $MEDIA_ONLY && [ -n "$COMMIT_MESSAGE" ]`), in dem `node deploy-git-commit.mjs` und anschließend `git push origin HEAD` ausgeführt werden. Der bestehende Branch-Check (`if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]`, Zeilen 58–62) sitzt aber ausschließlich innerhalb des alten `$DO_PUSH`-Blocks! Wird dieser Check für `DO_PUBLISH` nicht dupliziert oder vorgezogen, pusht `--media-only` lokale Entwickler-Branches (`feature/...`) auf den Remote-Server `origin` und löst über den anschließenden Webhook ein kaputtes Coolify-Production-Deploy aus.
- **Wann es beißt:** Sobald ein Entwickler im MPZ Studio lokal auf einem Feature-Branch arbeitet und den Button „Medien deployen“ mit einer Commit-Nachricht testet.
- **Billige Gegenmaßnahme jetzt:** Den Branch-Check `[ "$CURRENT_BRANCH" == "$DEPLOY_BRANCH" ]` aus dem `$DO_PUSH`-Block herauslösen und ganz nach oben vor jegliche Commit- und Push-Logik stellen.

### [Divergierende Git-History bei gescheitertem `git push`] — `git commit` und `git push` laufen asynchron zum Remote-Stand
- **Warum später teuer:** In `deploy-content.sh` führt `deploy-git-commit.mjs` zunächst lokal `git commit` aus. Scheitert direkt danach `git push origin HEAD` (z. B. kurzer Netzwerk-Ausfall oder `non-fast-forward` Rejection, weil ein anderer MPZ-Editor parallel gepusht hat), bricht das Skript ab (`set -e`). Der Commit bleibt aber im lokalen Repo des MPZ-Rechners bestehen. Beim nächsten Klick auf „Medien deployen“ im Studio erzeugt das Skript einen weiteren Commit; Pushes schlagen dauerhaft fehl, bis ein Admin das Terminal auf dem MPZ-Rechner öffnet und manuell `git pull --rebase` ausführt.
- **Wann es beißt:** Im Schulalltag, wenn zwei Redakteure kurz hintereinander im MPZ Studio speichern oder die WLAN-Verbindung des MPZ-Rechners beim Push flackert.
- **Billige Gegenmaßnahme jetzt:** Vor dem `git push` im Skript ein automatisches `git pull --rebase origin "$DEPLOY_BRANCH"` (oder `git fetch origin` + Check) ausführen oder im Studio-Feedback ausdrücklich eine Handlungsanweisung für hängengebliebene Pushes ausgeben.
