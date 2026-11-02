---
tags:
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-24
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: Schüler-Medien Deploy-Trennung

Der Plan ist in der Architektur stimmig. Die code-nahen Risiken liegen
an drei Stellen: ein nicht trennscharfer Validator-Vertrag, ein Mount,
der Git-Assets verdeckt, und ein Deploy-Pfad, der SSH/ENV-Details
vorab festnageln muss.

### Docker Volume-Mount verschattet Git-getrackte Unterordner (z. B. `icons/`)
- **Warum später teuer:** Die Zielarchitektur mountet `host:/data/schulnavigator/media` direkt nach `/app/public/media` ([03-zielarchitektur.md](./03-zielarchitektur.md#doker--coolify--technische-leitplanken)). Das kollidiert mit dem Phase-1-Plan, der `!/public/media/**/icons/` als Git-Ausnahme vorsieht ([04-umsetzungsplan.md](./04-umsetzungsplan.md#phase-1--repo--ignore)). Alles, was nur im Image liegt, wird zur Laufzeit vom Volume verdeckt.
- **Wann es beißt:** Sobald ein Icon oder Platzhalter unter `app/public/media/.../icons/` per Git getrackt ist, aber nicht auf den Server-Volume-Sync gehört. Der Build bleibt grün, live kommt ein 404.
- **Billige Gegenmaßnahme jetzt:** `public/media/` und `content/dialog-audio/` *komplett* entkoppeln. Icons oder andere generische Assets, die ins Git gehören, in einen separaten Ordner (z. B. `public/stations-icons/`) verschieben, der nicht von einem Volume überlagert wird.

### `.gitignore` ignoriert keine bereits versionierten Dateien (fehlendes `git rm --cached`)
- **Warum später teuer:** Der Plan setzt auf `.gitignore` für Bahn-B-Pfade, aber der aktuelle Code-Plan behandelt das Entfernen aus dem Index erst indirekt. Git ignoriert bereits getrackte Dateien nicht von selbst. Ohne `git rm -r --cached` bleiben bestehende Medien in `git ls-files` und gehen weiter nach GitHub.
- **Wann es beißt:** Beim ersten sauberen Phase-1-Commit oder beim nächsten Medien-Update, sobald jemand annimmt, `.gitignore` reiche alleine aus.
- **Billige Gegenmaßnahme jetzt:** Phase 1 so schreiben, dass `git rm -r --cached public/media content/dialog-audio content/coach-audio` ein expliziter, vor dem Commit verpflichtender Schritt ist.

### `rsync` im Node-Prozess hängt unendlich bei unbekanntem SSH-Host
- **Warum später teuer:** Der Deploy-Plan nennt `rsync` über SSH als Transport und erwähnt `accept-new` erst im Review-Härtepunkt, nicht im eigentlichen Umsetzungsplan ([03-zielarchitektur.md](./03-zielarchitektur.md#deploy-ablauf-ziel-ux), [04-umsetzungsplan.md](./04-umsetzungsplan.md#phase-3--deploy-automatisierung)). Sobald der Aufruf aus dem Studio-Tab oder einem Script ohne TTY läuft, blockiert ein unbekannter Host-Key den Prozess.
- **Wann es beißt:** Erster Deploy von einem frischen MPZ-Rechner oder nach einer Server-Key-Änderung.
- **Billige Gegenmaßnahme jetzt:** Den SSH-Wrapper samt `StrictHostKeyChecking=accept-new` direkt in den Plan aufnehmen, nicht nur als spätere Betriebsannahme.

### `SKIP_ASSET_VALIDATE` im TypeScript-Code nicht implementiert
- **Warum später teuer:** Phase 2.5 baut auf einem Flag `SKIP_ASSET_VALIDATE` oder einer getrennten Strukturvalidierung auf ([03-zielarchitektur.md](./03-zielarchitektur.md#doker--coolify--technische-leitplanken), [04-umsetzungsplan.md](./04-umsetzungsplan.md#phase-2--server--coolify)). Der aktuelle Validator `validate:stations` prüft aber direkt Existenz und Asset-Formate (`app/scripts/validate-station-assets.ts:24-39`, `:291-312`). Zusätzlich bleibt `validate:coach` im Build aktiv und prüft Coach-WAVs stur per `existsSync` (`app/scripts/validate-coach-messages.mjs:189-200`).
- **Wann es beißt:** Erster Coolify-Build ohne lokale Medien oder später beim ersten Coach-Audio-Fall mit ausgelagerten Dateien.
- **Billige Gegenmaßnahme jetzt:** Vor dem Implementieren festlegen, ob das Flag beide Validatoren steuert oder ob es getrennte `:structure`-Skripte gibt. Ohne diese Entscheidung wird die Build-Pipeline rot, obwohl der Plan „ohne Asset-Check“ verspricht.
