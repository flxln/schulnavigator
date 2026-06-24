# ADR-027 — Schüler-Medien nicht in Git (Deploy-Trennung)

**Datum:** 2026-06-24  
**Status:** offen

## Kontext

Der MVP speichert alle Inhalte — einschließlich Fotos, Videos und Dialog-Audio mit Kinderstimmen — im gleichen Git-Repository unter `app/public/media/` und `app/content/dialog-audio/`. `git push` legt diese Dateien auf GitHub (teils Git LFS). Für die 39. Grundschule Dresden ist das **unzulässig**: Schüler-Inhalte dürfen **nicht** auf GitHub liegen.

Gleichzeitig soll der Betrieb **nah am Ist-Zustand** bleiben: **Code** über GitHub und **Coolify**; **Medien** vom MPZ-Rechner möglichst **automatisiert** beim Deploy auf den MPZ-Hetzner-Server (Deutschland).

Ausführliche Planung: [`dokumentation/planung/schuelermedien-deploy-trennung/`](../planung/schuelermedien-deploy-trennung/README.md).

## Entscheidung (Vorschlag)

1. **Bahn A — Code:** Weiter versionieren in GitHub; Coolify baut die App ohne Schüler-Binärdateien im Clone.
2. **Bahn B — Schüler-Medien:** **Nicht** in Git; Sync vom MPZ-Laptop per **rsync/SSH** auf **Persistent Volumes** am Server, zur Laufzeit in den Container gemountet (`/app/public/media`, `/app/content/dialog-audio`, ggf. `coach-audio`).
3. **Deploy:** Ein dokumentiertes Skript (später optional MPZ Studio Deploy-Tab) führt lokal Validierung, optional `git push`, Medien-Sync und Coolify-Redeploy aus.
4. **`stations.json`:** Vorerst weiter in Git — **vor Umsetzung** mit DSB klären, ob Texte/Namen darin GitHub-tauglich sind ([05-offene-punkte.md](../planung/schuelermedien-deploy-trennung/05-offene-punkte.md)).

## Begründung

- **Datenschutz:** Schüler-Medien bleiben in DE auf MPZ-Infrastruktur; GitHub dient nur als Code-Host (ADR-001/004 bleiben für Live-Auslieferung gültig).
- **Betrieb:** Coolify-Workflow für App-Updates bleibt erhalten; Medien-Sync ist ein zusätzlicher, automatisierbarer Schritt.
- **MVP:** Kein Directus-Zwang; trennt Verantwortlichkeiten ohne Lehrkräfte-Portal.

## Verworfene Alternativen

- **Alles weiter in Git (privates Repo):** Verworfen — Anforderung Schule/MPZ: keine Schüler-Medien auf GitHub.
- **Nur manueller SCP/FTP:** Verworfen — zu fehleranfällig; Automatisierung gewünscht.
- **Medien in Object Storage (S3) sofort:** Overengineering für MVP; Volumes + rsync reichen zunächst.
- **Self-hosted Git (Gitea) für Medien:** Aufwand hoch; Medien gehören ohnehin nicht in Git.
- **Directus sofort:** Langfristig ADR-003; blockiert Schulfest nicht nötig.

## Konsequenzen

- `.gitignore`, Dockerfile, `validate:stations` und Coolify-Volumes anpassen (siehe [04-umsetzungsplan.md](../planung/schuelermedien-deploy-trennung/04-umsetzungsplan.md)).
- Git LFS-Regeln für ausgelagerte Pfade entfallen oder schrumpfen.
- MPZ-Anleitungen und Deploy-Tab dokumentieren Zwei-Bahnen-Workflow.
- **Bestehende Git/LFS-History** mit Schüler-Medien: separates Bereinigungsvorhaben mit DSB.
- Ergänzt ADR-003 (Content), ADR-004 (Video auf MPZ), ADR-022 (MPZ Studio lokal) — widerspricht ihnen nicht.
