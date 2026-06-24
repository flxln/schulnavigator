# Anforderungen — Schüler-Medien ohne GitHub

**Stand:** 2026-06-24

## Verbindlich (MPZ / Auftraggeber)

1. **Keine Schüler-Medien auf GitHub** — weder im normalen Git-Objektstore noch in Git LFS. Gemeint sind insbesondere:
   - Fotos und Videos mit erkennbaren Kindern (`app/public/media/…`)
   - Dialog-Audio mit Kinderstimmen (`app/content/dialog-audio/…`)
   - Coach-Audio mit Kinderstimmen (`app/content/coach-audio/…`), falls betroffen

2. **Deploy-Weg möglichst nah am Ist-Zustand:**
   - **Code:** weiter `git commit` → `git push` → **Coolify** baut und startet die App
   - **Medien:** vom **MPZ-Rechner** (nach MPZ Studio / lokaler Pflege) **automatisiert** mit dem Deploy auf den **MPZ-Server (Hetzner, DE)**

3. **Live-Auslieferung** an Besucher weiter nur über MPZ-Infrastruktur in Deutschland (ADR-004, AVV).

4. **MPZ Studio** bleibt lokales Pflege-Werkzeug (`NODE_ENV=development`); kein Studio auf Production.

## Wünschenswert

- Ein **einzelner Befehl** oder ein klarer Studio-/Deploy-Tab-Flow: „Code pushen + Medien synchronisieren + App neu starten“
- Weiterhin `stations.json` im Repo versionieren (Struktur, Texte, Hotspots) — **sofern** DSB das freigibt (siehe [05-offene-punkte.md](./05-offene-punkte.md))
- Kein manuelles Kopieren per USB/FTP als Dauerlösung

## Nicht-Ziele (dieses Vorhaben)

- Directus / Lehrkräfte-Admin (ADR-003, langfristig)
- YouTube oder andere US-CDNs für Schüler-Inhalte
- Öffentliches GitHub-Repo
- Medien dauerhaft nur auf dem Laptop ohne Server-Backup (Server bleibt Source of Truth für Live)

## Erfolgskriterien (wenn umgesetzt)

- [ ] Schüler-Medien sind in `.gitignore` und tauchen in `git push` nicht mehr auf
- [ ] Coolify-Build läuft **ohne** Schüler-Dateien im Clone
- [ ] Nach Deploy sind alle in `stations.json` referenzierten Medien auf der Live-Seite erreichbar
- [ ] Dokumentierter Workflow für MPZ (Anleitung + ggf. Skript)
- [ ] ADR-027 **entschieden**; `dsgvo.md` aktualisiert
