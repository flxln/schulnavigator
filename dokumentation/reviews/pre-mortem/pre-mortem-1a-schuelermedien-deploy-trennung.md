---
tags:
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-24
---
# Pre-Mortem 1a: Schüler-Medien Deploy-Trennung

### Docker Volume-Mount verschattet Git-getrackte Unterordner (z. B. `icons/`)
- **Warum später teuer:** Das Docker-Image wird von Coolify aus dem GitHub-Repo gebaut. Wenn Dateien wie in der `.gitignore` angedeutet (Ausnahme `!/public/media/**/icons/`) dort weiterhin getrackt werden, landen diese im Image. Wenn Coolify zur Laufzeit aber das Hetzner-Volume auf `/app/public/media/` mountet, **überschreibt/verdeckt** dieser Mount das komplette Verzeichnis. Alles, was im Image lag (die Icons), verschwindet.
- **Wann es beißt:** Ein Entwickler fügt per Pull Request ein neues Platzhalter-Icon hinzu. Der Build läuft durch, aber auf dem Live-System gibt es einen 404-Fehler für das Bild, weil das Icon nie per `rsync` vom MPZ-Laptop synchronisiert wurde und der Volume-Mount es verdeckt.
- **Billige Gegenmaßnahme jetzt:** `public/media/` und `content/dialog-audio/` *komplett* entkoppeln. Icons oder andere generische Assets, die ins Git gehören, in einen separaten Ordner (z. B. `public/stations-icons/`) verschieben, der nicht von einem Volume überlagert wird.

### `.gitignore` ignoriert keine bereits versionierten Dateien (fehlendes `git rm --cached`)
- **Warum später teuer:** Man fügt Pfade zur `.gitignore` hinzu, committet und denkt, die Trennung ist vollzogen. Git wendet `.gitignore` jedoch **nicht** auf Dateien an, die bereits im Index sind. Wenn ein Redakteur später ein existierendes Bild austauscht oder ändert, landet es beim nächsten `git push` munter wieder auf GitHub. Der Datenschutz-Verstoß bleibt aktiv.
- **Wann es beißt:** Sofort beim ersten Commit nach Phase 1, sobald bestehende Medien angefasst werden.
- **Billige Gegenmaßnahme jetzt:** In Phase 1.1 zwingend den Befehl `git rm -r --cached public/media content/dialog-audio` vorschreiben. Danach müssen `public/media/.gitkeep` etc. explizit per `git add -f` wieder hinzugefügt werden, bevor der Commit erstellt wird.

### `rsync` im Node-Prozess hängt unendlich bei unbekanntem SSH-Host
- **Warum später teuer:** Wenn das Deploy-Skript später über den "MPZ Studio Deploy-Tab" (also via Node.js `child_process.exec`) ausgeführt wird, gibt es dort kein interaktives Terminal. Fragt SSH nach der Bestätigung des neuen Host-Keys ("Are you sure you want to continue connecting (yes/no)?"), hängt der Node-Prozess ewig und das Studio-UI blockiert ohne Fehlermeldung.
- **Wann es beißt:** Beim allerersten Deploy von einem neuen MPZ-Rechner aus, oder falls sich der Server-Key ändert (bzw. wenn man Phase 3.3 testet).
- **Billige Gegenmaßnahme jetzt:** Im Deploy-Skript `rsync` zwingend mit `-e "ssh -o StrictHostKeyChecking=accept-new"` aufrufen, damit SSH den Fingerprint automatisch speichert, anstatt auf eine nicht mögliche User-Eingabe zu warten.

### `SKIP_ASSET_VALIDATE` im TypeScript-Code nicht implementiert
- **Warum später teuer:** Der Umsetzungsplan (Phase 2.5) spricht von einem Flag `SKIP_ASSET_VALIDATE=1`. Das Skript `validate-station-assets.ts` – und höchstwahrscheinlich auch `validate-coach-messages.mjs` – wertet diese Umgebungsvariable aktuell im Code aber überhaupt nicht aus (es prüft stur `fs.existsSync`).
- **Wann es beißt:** Beim ersten Coolify-Build nach der Umstellung. Der Build bricht ab, weil die Medien nicht im Clone sind, die Skripte das Flag ignorieren und das Fehlen der Dateien monieren.
- **Billige Gegenmaßnahme jetzt:** In Phase 2.5 als TODO aufnehmen: In `validate-station-assets.ts` (und ggf. weiteren Validatoren, die Dateien prüfen) am Skriptanfang `if (process.env.SKIP_ASSET_VALIDATE) { console.log('Skipped'); process.exit(0); }` (oder einen sauberen Return) einbauen.
