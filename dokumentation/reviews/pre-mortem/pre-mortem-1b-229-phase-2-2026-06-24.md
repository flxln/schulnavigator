---
tags:
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-24
---
# Pre-Mortem 1b — Phase 2: Server, Coolify-Volumes & Structure-Validatoren (#229)

**Gutachter-Analyse** basierend auf `1b_pre-mortem-logik.md`.
**Ziel:** Logikbrüche, API-Vertrags-Konflikte und Wartbarkeitsfallen vor der Implementierung von Phase 2 aufdecken.

---

### [Rechte-Deadlock beim Initial-rsync] — rsync vs. chown 1001:1001
- **Warum später teuer:** Der Plan definiert `sudo chown -R 1001:1001 /data/schulnavigator` (Schritt 2.1) und danach `rsync` via `$DEPLOY_SSH` (Schritt 2.3). Wenn `$DEPLOY_SSH` nicht `root` ist, schlägt der `rsync` mit `Permission denied` fehl, da das Zielverzeichnis dem User 1001 gehört. Ist `$DEPLOY_SSH` hingegen `root`, überschreibt `rsync -a` die Eigentümer mit den lokalen Laptop-UIDs (z. B. 501 für macOS). Der anschließende `docker exec -u nextjs`-Lesetest (bzw. späterer Schreibzugriff) wird fehlschlagen.
- **Wann es beißt:** Unmittelbar bei Umsetzung von 2.3 (Initial-rsync) bzw. im Folge-Issue #230 (Deploy-Skript-Automatisierung).
- **Billige Gegenmaßnahme jetzt:** 
  - Im Plan 2.3 für das `rsync`-Kommando die Parameter `--no-o --no-g` ergänzen.
  - Wenn `$DEPLOY_SSH` root ist, stattdessen `rsync -a --chown=1001:1001` nutzen.
  - Klarstellen, dass ein `sudo chown 1001:1001` im Zweifel *nach* dem ersten rsync wiederholt werden muss.

### [Inkonsistente Validator-Architektur] — Duplizierung vs. Flag
- **Warum später teuer:** Für den Coach-Validator sieht der Plan ein sauberes Flag `checkAudioFiles` vor. Für den Stations-Validator fordert der Plan jedoch eine **Neue Funktion** `validateStationAssetStructure`, die „dieselben Felder wie validateStationAssets iteriert“. Diese Code-Duplizierung des 100-Zeilen-Durchlaufs führt dazu, dass bei neuen Media-Typen (z. B. 3D-Objekten) nur einer von beiden Validatoren aktualisiert wird.
- **Wann es beißt:** Bei künftigen Features (z. B. Issue für "3D-Modelle in Stations" oder "PDF-Hotspots"), wenn Entwickler das Feld nur im Haupt-Validator ergänzen und das Deploy wegen nicht existierender Dateien zur Laufzeit kaputtgeht, weil der Structure-Build-Validator blind grün war.
- **Billige Gegenmaßnahme jetzt:** Auch `validateStationAssets` so anpassen, dass es ein `checkFiles: boolean` Flag in den `Options` akzeptiert, statt eine duplizierte Schleife zu schreiben.

### [CLI-Einstieg geht verloren] — validate:coach (Voll) vs. Extraktion
- **Warum später teuer:** Der Plan verlangt: „Validierungslogik extrahieren“ aus `validate-coach-messages.mjs`. Dieses Skript ist aktuell aber als reines Top-Level-CLI-Skript geschrieben (führt Code direkt aus). Wenn es zu einer Library (`export function validateCoach(...)`) umgebaut wird, bricht der bestehende lokale Befehl `npm run validate:coach`, da dieser weiterhin direkt `node scripts/validate-coach-messages.mjs` aufruft.
- **Wann es beißt:** Bei der "Lokalen Verifikation (vor Push)" (Plan 2.5), wenn `npm run validate:coach` stumm durchläuft oder crasht, weil keine Logik mehr am Top-Level ausgeführt wird.
- **Billige Gegenmaßnahme jetzt:** Im Plan explizit festhalten, dass in `validate-coach-messages.mjs` ein CLI-Ausführungsblock (z. B. am Dateiende) erhalten bleibt, der die extrahierte Funktion mit `checkAudioFiles: true` aufruft, falls das Skript direkt über Node gestartet wurde.

### [Fehlende LFS/Null-Byte Checks bei Structure] — Keine Größen-Prüfung im Build
- **Warum später teuer:** Der Plan fordert für den Structure-Validator: „keine Größen-/Format-Checks“. Das bedeutet, dass der Coolify-Build auch Dateien akzeptieren würde, die nur als leere Git-LFS-Pointer vorliegen. Da die Medien aber ohnehin nicht mehr in Git liegen (Bahn B), ist dies für Medien irrelevant. Was aber, wenn ein `stations-icons/`-Icon (Bahn A, in Git) nur als fehlerhafter LFS-Pointer heruntergeladen wurde?
- **Wann es beißt:** Wenn ein LFS-Pull auf Coolify fehlschlägt, geht der Build grün durch (da der Pfad aufgelöst werden kann und die Pointer-Datei existiert), aber das Image enthält kaputte Bilder.
- **Billige Gegenmaßnahme jetzt:** Ein Satz im Plan: Es ist akzeptiert, dass der Build LFS-Fehler bei `stations-icons` nicht mehr fängt. (Der lokale volle Validator würde sie fangen, das reicht als Absicherung).
