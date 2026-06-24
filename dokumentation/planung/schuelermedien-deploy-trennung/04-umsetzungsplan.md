# Umsetzungsplan

**Stand:** 2026-06-24  
**Voraussetzung:** Freigabe DSB/Schule ([05-offene-punkte.md](./05-offene-punkte.md)); ADR-027 auf **entschieden**

## Phase 0 — Sofortmaßnahmen (ohne Code)

| # | Aufgabe | Verantwortung |
|---|---------|---------------|
| 0.1 | Keine neuen Schüler-Medien mehr `git push`en, bis Phase 2 live | MPZ |
| 0.2 | Inventar: welche Commits/LFS-Objekte auf GitHub liegen | MPZ + ggf. DSB |
| 0.3 | Entscheidung `stations.json` (Namen/Texte) | Schule/DSB |

## Phase 1 — Repo & Ignore

| # | Aufgabe | Dateien / Artefakte |
|---|---------|---------------------|
| 1.0 | **Bereits getrackte** Schüler-Medien aus dem Index nehmen: `git rm -r --cached public/media content/dialog-audio content/coach-audio`, danach Platzhalter per `git add -f` zurückholen und committen ⁴ | Git-Index |
| 1.1 | `.gitignore` unter `app/`: Schüler-Medien-Pfade (siehe unten) | `app/.gitignore` |
| 1.2 | `.gitkeep` in den leeren Bahn-B-Ordnern, per `git add -f` versioniert | `public/media/.gitkeep`, `content/dialog-audio/.gitkeep`, `content/coach-audio/.gitkeep` ⁴⁶ |
| 1.3 | Personenfreie Hotspot-/UI-Icons aus `public/media/**/icons/` nach `public/stations-icons/{slug}/…` verschieben und `stations.json`-Referenzen anpassen; schülerbezogene Bild-Icons bleiben Bahn B | `app/data/stations.json`, `public/stations-icons/` ² |
| 1.4 | `.gitattributes`: LFS-Regeln für `public/media/**`, `content/dialog-audio/**`, `content/coach-audio/**` **entfernen** (nicht mehr in Git); LFS nur noch für `public/stations/**` (Raumbilder) | `app/.gitattributes` ⁶ |
| 1.5 | Anleitung: „Medien nie committen“ | `anleitungen/fuer-entwickler.md`, `content-einpflegen.md` |

**Vorschlag `.gitignore` (feinjustieren nach DSB):** ³⁶

```gitignore
# Schüler-Medien — nur Server-Sync (Bahn B), nicht GitHub
/public/media/*
!/public/media/.gitkeep
/content/dialog-audio/*
!/content/dialog-audio/.gitkeep
/content/coach-audio/*
!/content/coach-audio/.gitkeep
```

*(Keine `icons/`-Ausnahme mehr: der Volume-Mount auf `/app/public/media` würde git-getrackte Icons darin verdecken. Personenfreie Icons liegen stattdessen im Schwester-Ordner `public/stations-icons/` — außerhalb des Mounts, daher von dieser `.gitignore` unberührt.)* ²³

## Phase 2 — Server & Coolify

| # | Aufgabe | Details |
|---|---------|---------|
| 2.1 | Persistent Volumes auf Hetzner anlegen | z. B. `/data/schulnavigator/media`, `dialog-audio` |
| 2.2 | Coolify: Volume-Mounts in Application konfigurieren | Pfade siehe [03-zielarchitektur.md](./03-zielarchitektur.md) |
| 2.3 | Bestehende Medien von Laptop **einmalig** auf Volumes rsyncen | Initialbefüllung |
| 2.4 | Dockerfile: `COPY public`/`content` darf bleiben (Mount überdeckt sie); sicherstellen, dass darin keine git-getrackten Schüler-Dateien liegen | `app/Dockerfile` ¹ |
| 2.5 | Strukturvalidatoren einführen: `validate:stations:structure` **und** `validate:coach:structure` (Pfad-/Vertrag-Check **ohne** `existsSync`); `build`-Script auf die `:structure`-Varianten umstellen; volle Validatoren (`validate:stations`, `validate:coach`) laufen nur lokal/im Deploy | `scripts/validate-station-assets.ts`, `scripts/validate-coach-messages.mjs`, `package.json` ⁵ |

## Phase 3 — Deploy-Automatisierung

| # | Aufgabe | Details |
|---|---------|---------|
| 3.1 | Skript `app/scripts/deploy-content.sh` (oder Repo-Root) | rsync + optional `git push` + Coolify-Webhook |
| 3.2 | Env-Vorlage: `DEPLOY_SSH_HOST`, `DEPLOY_MEDIA_PATH`, SSH-Key | `app/.env.example` (ohne Secrets) |
| 3.3 | MPZ Studio Deploy-Tab: Doku + optional Button „Medien deployen“; Skript **non-interaktiv** aufrufen (kein TTY) — `accept-new` + `ConnectTimeout` verhindern Hänger, Fehler im UI sichtbar machen | `components/mpz-studio/deploy-tab.tsx` ⁷ |
| 3.4 | Checkliste in Anleitung | `anleitungen/fuer-entwickler.md` |

**Skizze Deploy-Skript:**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
RSYNC_SSH="ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
npm run validate:stations     # voller Asset-Check, lokal
npm run validate:coach        # voller Asset-Check, lokal
git push origin HEAD
rsync -avz -e "$RSYNC_SSH" public/media/         "${DEPLOY_SSH}:/data/schulnavigator/media/"
rsync -avz -e "$RSYNC_SSH" content/dialog-audio/ "${DEPLOY_SSH}:/data/schulnavigator/dialog-audio/"
rsync -avz -e "$RSYNC_SSH" content/coach-audio/  "${DEPLOY_SSH}:/data/schulnavigator/coach-audio/"
# optional: curl Coolify deploy webhook
```

`-e "ssh -o StrictHostKeyChecking=accept-new"` verhindert das Hängen bei unbekanntem Host-Key (kein TTY im Studio/Node-Prozess). ⁷
Kein `--delete` im Default — Löschen auf dem Server bei unvollständigem lokalen Stand riskiert Datenverlust (T2); Spiegeln/Pruning nur über expliziten `--prune`-Aufruf. ⁸

## Phase 4 — Doku & Compliance

| # | Aufgabe |
|---|---------|
| 4.1 | ADR-027 Status → **entschieden** |
| 4.2 | `dsgvo.md`: Speicherorte GitHub vs. Hetzner |
| 4.3 | AVV-Anhang falls nötig (Subprozessor GitHub nur für Code) |
| 4.4 | GitHub Issue/Epic abhaken — Epic [#226](https://github.com/flxln/schulnavigator/issues/226), Milestone [#14](https://github.com/flxln/schulnavigator/milestone/14) |

## Akzeptanzkriterien (Gesamt)

- [x] `git ls-files public/media content/dialog-audio content/coach-audio` liefert nach Phase 1 **nur** `.gitkeep` — keine Schüler-Dateien mehr getrackt ⁴⁹
- [x] Coolify-Build grün **ohne** Medien im Clone, weil `build` nur die `:structure`-Validatoren ausführt ⁵ *(lokal verifiziert 2026-06-24; Coolify auf `kunde/39-gs`)*
- [ ] Hotspot-Icons live erreichbar (kein 404): `public/stations-icons/` aus Git, Bahn-B-Icons via rsync ² *(nach Redeploy `kunde/39-gs` — `main` eingefroren)*
- [x] `rsync` Initialbefüllung auf Hetzner-Volumes (2026-06-24)
- [x] `git status` nach Studio-Upload zeigt Medien als ignoriert (oder nicht trackbar)
- [ ] MPZ-Anleitung in ≤ 1 Seite beschreibt den Alltags-Workflow *(→ #230)*
- [ ] Smoke: `/api/health`, eine Raum-URL mit Video, eine mit Dialog-Audio, eine Coach-Message mit gesetzter `quelle` (`/api/coach/{id}`) ⁶ *(nach Prod-Deploy)*

## Grobe Aufwandsschätzung

| Phase | Aufwand (grob) |
|-------|----------------|
| 0 | 0,5–1 Tag (Org) |
| 1 | 0,5–1 Tag (inkl. Icon-Umzug + `git rm --cached`) |
| 2 | 1–2 Tage (Coolify-Zugang, `:structure`-Validatoren, Tests) |
| 3 | 1 Tag |
| 4 | 0,5 Tag |

## Nicht in Phase 1–4

- Git-History bereinigen (LFS-Objekte von GitHub entfernen) — separates Vorhaben, DSB-pflichtig. **Wichtig:** `git rm --cached` (Phase 1.0) stoppt nur **künftige** Pushes; bereits gepushte Dateien/LFS-Objekte bleiben in der History und müssen separat entfernt werden (siehe O3). ⁴
- Directus-Migration
- Automatischer Deploy bei jedem Studio-Save (weiter manuell bewusst auslösen)

## Änderungslog (Plan-Härtung 2026-06-24)

- ¹ Phase 2.4 präzisiert: `COPY` darf bleiben, da der Mount das Image überdeckt — entscheidend ist „keine git-Dateien in den Bahn-B-Bäumen“ (1a #1 / 1b #2).
- ² Neue Phase 1.3: personenfreie Icons aus `public/media/**/icons/` nach `public/stations-icons/` umziehen + `stations.json`-Referenzen anpassen; Akzeptanzkriterium „Icons kein 404“ (1a #1 / 1b #2 — 13 reale Icon-Referenzen).
- ³ `.gitignore`-Vorschlag: `!/public/media/**/icons/`-Ausnahme entfernt (inkompatibel mit dem Mount) (1a #1 / 1b #2).
- ⁴ Neue Phase 1.0: `git rm -r --cached …` + `git add -f` Platzhalter; Akzeptanzkriterium `git ls-files … = nur .gitkeep`; Klarstellung, dass History-Bereinigung separat bleibt (1a #2).
- ⁵ Phase 2.5 ersetzt: dedizierte `:structure`-Validatoren für **stations und coach** statt nicht-implementiertem `SKIP_ASSET_VALIDATE`; Build nutzt `:structure`, volle Validatoren lokal (1a #4 / 1b #1).
- ⁶ `content/coach-audio` durchgängig ergänzt: `.gitignore`, `.gitattributes`, Platzhalter, rsync-Zeile, `validate:coach` lokal, Coach-Smoke-Test (1b #3).
- ⁷ Deploy-Skript + Phase 3.3: `rsync -e "ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"`, non-interaktiver Studio-Aufruf (1a #3).
- ⁸ Deploy-Skript: `--delete` aus dem Default entfernt, nur per `--prune` opt-in (T2).
- ⁹ Akzeptanzkriterien um nachprüfbare Trennung erweitert (`git ls-files`, Build ohne Medien, Coach-Smoke) (1a #2 / 1b #3).
