# ADR-027 — Schüler-Medien nicht in Git (Deploy-Trennung)

**Datum:** 2026-06-24  
**Status:** entschieden

## Kontext

Der MVP speicherte zunächst alle Inhalte — einschließlich Fotos, Videos und Dialog-Audio mit Kinderstimmen — im gleichen Git-Repository unter `app/public/media/` und `app/content/dialog-audio/`. `git push` legte diese Dateien auf GitHub (teils Git LFS). Für die 39. Grundschule Dresden ist das **unzulässig**: Schüler-Inhalte dürfen **nicht** auf GitHub liegen.

Gleichzeitig soll der Betrieb **nah am Ist-Zustand** bleiben: **Code** über GitHub und **Coolify**; **Medien** vom MPZ-Rechner möglichst **automatisiert** beim Deploy auf den MPZ-Hetzner-Server (Deutschland).

Ausführliche Planung: [`dokumentation/planung/schuelermedien-deploy-trennung/`](../planung/schuelermedien-deploy-trennung/README.md).

## Entscheidung

1. **Bahn A — Code:** Weiter versionieren in GitHub; Coolify baut die App ohne Schüler-Binärdateien im Clone (`validate:stations:structure` und `validate:coach:structure` im Build).
2. **Bahn B — Schüler-Medien:** **Nicht** in Git; Sync vom MPZ-Laptop per **rsync/SSH** auf **Persistent Volumes** am Server, zur Laufzeit in den Container gemountet (`/app/public/media`, `/app/content/dialog-audio`, `/app/content/coach-audio`).
3. **Deploy:** [`app/scripts/deploy-content.sh`](../../app/scripts/deploy-content.sh) (`npm run deploy:content`) und MPZ-Studio-Deploy-Tab führen lokal Vollvalidierung, optional `git push`, Medien-Sync und optional Coolify-Redeploy aus. Anleitung: [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md) (Abschnitt „Alltags-Deploy").
4. **`stations.json`:** Weiter in Git (DSB **Option A**, 2026-06-24) — nur Schüler-**Binärmedien** werden aus GitHub entfernt; Texte/Namen in JSON bleiben versioniert. Details: [05-offene-punkte.md](../planung/schuelermedien-deploy-trennung/05-offene-punkte.md) O1.

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

- **Umgesetzt (#228–#230):** `.gitignore`, `git rm --cached`, `.gitkeep`, Icon-Umzug nach `public/stations-icons/`, LFS-Bereinigung für Bahn-B-Pfade, Coolify-Volumes, `:structure`-Validatoren im Build, [`deploy-content.sh`](../../app/scripts/deploy-content.sh), MPZ-Studio-Deploy-Tab. Details: [04-umsetzungsplan.md](../planung/schuelermedien-deploy-trennung/04-umsetzungsplan.md).
- MPZ-Anleitung und Deploy-Tab dokumentieren den Zwei-Bahnen-Workflow.
- **Bestehende Git/LFS-History** mit Schüler-Medien: separates Bereinigungsvorhaben [#232](https://github.com/flxln/schulnavigator/issues/232) mit DSB.
- Ergänzt ADR-003 (Content), ADR-004 (Video auf MPZ), ADR-022 (MPZ Studio lokal) — widerspricht ihnen nicht.
