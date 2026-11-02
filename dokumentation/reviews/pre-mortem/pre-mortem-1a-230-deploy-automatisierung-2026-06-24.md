---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-24
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #230 Deploy-Automatisierung

**Plan:** `.cursor/plans/issue_230_phase-3_8ef70de3.plan.md`
**Relevanter Code:** `app/lib/mpz-deploy-runner.ts` (Zeilen 35-39, 83-130), `app/lib/mpz-deploy-runner.test.ts` (Zeilen 1-53), `app/components/mpz-studio/deploy-tab.tsx` (Zeilen 1-147, 260-325), `app/lib/mpz-studio-guard.ts` (Zeilen 1-24)

Positiv: Die Trennung zwischen UI, Runner und den bestehenden Validierungs-Schritten ist sauber genug, um den neuen Flow als eigenen Deploy-Zweig aufzusetzen. Die Risiken liegen nicht in der Architektur, sondern in den Shell- und I/O-Rahmenbedingungen.

### [Shell-Runner bleibt am falschen Timeout hängen] — `runShellScript()` ist noch kein echter Abstraktionspunkt
- **Warum später teuer:** Der aktuelle Runner kennt nur `runNpmScript()` und hängt seine Laufzeit an feste NPM-Defaults; der Standard liegt bei 60 Sekunden (`app/lib/mpz-deploy-runner.ts:35-39, 83-130`). Für `deploy-content.sh` sind aber rsync-Läufe, optionaler Push und Webhook explizit als Langläufer geplant. Wenn die neue Shell-Logik nur als dünner `execFile('bash', ...)`-Einzeiler in Route oder Helper landet, fehlen der 15-Minuten-Timeout, saubere `cwd`-Weitergabe und ein testbarer Mock-Punkt.
- **Wann es beißt:** Beim ersten echten Medien-Deploy über die API-Route oder per Studio-Button, sobald rsync oder git push länger als der NPM-Default brauchen. In Tests schlägt derselbe Fehler auf, wenn `mpz-deploy-content.test.ts` auf einen realen Bash-Spawn ausweicht statt auf einen exportierten Runner.
- **Billige Gegenmaßnahme jetzt:** `runShellScript()` als exportierte, separat testbare Funktion bauen. Sie braucht explizit `timeoutMs`, `cwd`, `env` und `maxBuffer`, damit der Deploy-Flow nicht aus Versehen die NPM-Rahmenbedingungen erbt.

### [Sudo blockiert den non-interaktiven Deploy] — `sudo rsync`/`sudo chown` hängen ohne TTY
- **Warum später teuer:** Der Deploy-Tab schickt Aktionen per `fetch()` aus einem Client-Component-Flow ab (`app/components/mpz-studio/deploy-tab.tsx:88-147, 260-325`). Der Runner verwendet `execFile` und hat damit kein TTY-Verhalten (`app/lib/mpz-deploy-runner.ts:83-130`). Wenn `deploy-content.sh` auf einem Host mit Passwortabfrage `sudo rsync` oder `sudo chown` ausführt, wartet der Prozess still auf eine Eingabe, die nie kommen kann.
- **Wann es beißt:** Beim ersten Lauf auf einem MPZ-Rechner oder Server, auf dem `sudo` nicht als Passwortlos-Regel eingerichtet ist oder das Timestamp-Fenster abgelaufen ist. Der Nutzer sieht im UI nur einen Hänger oder später eine generische Fehlermeldung.
- **Billige Gegenmaßnahme jetzt:** Vor dem eigentlichen Sync ein `sudo -n true`-Preflight oder ein gleichwertiger Prüfschritt. Wenn NOPASSWD nicht vorhanden ist, muss das Skript sofort mit einer klaren Meldung abbrechen, statt rsync und chown in einen stillen Deadlock zu schicken.

### [Deploy-Env ist noch nicht durchverdrahtet] — der Runner kann keine kontrollierte Umgebungsbasis mitgeben
- **Warum später teuer:** `runNpmScript()` kann aktuell nur `cwd`, `timeoutMs` und `maxBuffer`; ein explizites `env`-Mapping gibt es nicht (`app/lib/mpz-deploy-runner.ts:29-33, 83-99`). Der geplante Deploy-Flow hängt aber an mehreren Env-Variablen (`DEPLOY_SSH`, `DEPLOY_REMOTE_BASE`, `DEPLOY_SSH_IDENTITY_FILE`, `COOLIFY_DEPLOY_WEBHOOK_URL`). Wenn diese Werte nur aus dem zufälligen Prozessumfeld kommen, verhält sich der CLI-Deploy anders als der API-Deploy und ist in Tests kaum reproduzierbar.
- **Wann es beißt:** Beim ersten Route-Test mit stubbed `process.env`, bei einem Studio-Start mit unvollständiger `.env.local` oder wenn der MPZ-Rechner die Variablen im Shell-Profil hat, die Next.js-Route aber nicht. Dann ist nicht klar, ob der Fehler aus fehlender Konfiguration oder aus dem eigentlichen Deploy-Skript kommt.
- **Billige Gegenmaßnahme jetzt:** `env?: NodeJS.ProcessEnv` in den Runner aufnehmen und in `mpz-deploy-content.ts` eine kleine Vorprüfung bauen, die die Pflichtvariablen vor dem Spawn explizit benennt. So sind CLI, API und Tests auf derselben Konfigurationsebene.

