---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-24
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #229 Phase 2

Gutachter-Analyse bezüglich Code-Implementierung, Imports, Seiteneffekten und Unit-Tests für Phase 2 (Server, Coolify-Volumes & Structure-Validatoren).

**PLAN:**
[issue_229_phase-2_24ed5ebf.plan.md](../../../.cursor/plans/issue_229_phase-2_24ed5ebf.plan.md)

**RELEVANTER CODE:**
- [validate-station-assets.ts](../../../app/scripts/validate-station-assets.ts)
- [validate-coach-messages.mjs](../../../app/scripts/validate-coach-messages.mjs)
- [package.json](../../../app/package.json)
- [tsconfig.json](../../../app/tsconfig.json)

---

### [Broken Imports / Private Hilfsfunktion] — `resolveAssetPath` ist nicht exportiert
- **Warum später teuer:** Die neue Einstiegsdatei `validate-station-assets-structure.ts` muss Pfade auflösen. Der Plan verweist hierfür auf `resolveAssetPath`. In [validate-station-assets.ts](../../../app/scripts/validate-station-assets.ts#L24) ist diese Funktion jedoch als private Hilfsfunktion deklariert (`function resolveAssetPath`) und nicht exportiert.
- **Wann es beißt:** Sofort am ersten Tag beim Schreiben des neuen CLI-Skripts — der TypeScript-Compiler bricht mit einem Import-Fehler ab.
- **Billige Gegenmaßnahme jetzt:** Die Funktion `resolveAssetPath` exportieren (`export function resolveAssetPath`). Noch besser (wie im 1b-Pre-Mortem empfohlen): `validateStationAssets` direkt in-place mit einem optionalen `checkFiles: boolean` (default: `true`) in den Options ausstatten. Dadurch entfällt eine separate Funktion für Strukturprüfungen und Code-Duplikate.

### [Import-Seiteneffekte] — Top-Level Ausführung in `validate-coach-messages.mjs`
- **Warum später teuer:** Das Skript [validate-coach-messages.mjs](../../../app/scripts/validate-coach-messages.mjs#L80) führt seinen Code sofort beim Import aus (Top-Level I/O und Prozess-Exits). Wenn das Skript refaktoriert wird, um die Validierungslogik zu exportieren, führt jeder Import in `validate-coach-messages-structure.mjs` (und in Tests) zum sofortigen Abbruch der CLI/Tests mit `process.exit(1)`, da die echten WAV-Dateien lokal fehlen.
- **Wann es beißt:** Beim Importieren der Validierungsfunktion in den neuen Struktur-Wrapper oder in die Vitest-Unit-Tests.
- **Billige Gegenmaßnahme jetzt:** Den Ausführungsblock in `validate-coach-messages.mjs` mit einer `isMain`-Bedingung absichern (z. B. `if (isMain)` via `fileURLToPath(import.meta.url) === process.argv[1]`), damit der Code nur bei direktem Skriptstart top-level ausgeführt wird.

### [Test-Desynchronisation durch Dateiendung] — `.test.mjs` vs. Vitest-Konventionen
- **Warum später teuer:** Der Plan schlägt `validate-coach-messages-structure.test.mjs` als neue Testdatei vor. Alle bisherigen Unit-Tests im Projekt liegen jedoch als `.test.ts` oder `.test.tsx` unter `app/lib/`. Die Vitest-Konfiguration und die Dateityp-Pfade in `tsconfig.json` decken `.test.mjs`-Dateien nicht ab. Der Test würde stumm ignoriert werden.
- **Wann es beißt:** Während des Builds oder PR-Verifikationen — Tests laufen nicht mit, Fehler im Struktur-Validator gelangen unentdeckt in die Produktion.
- **Billige Gegenmaßnahme jetzt:** Die Testdatei als `app/lib/validate-coach-messages-structure.test.ts` anlegen. Vitest kann `.mjs`-Einstiege problemlos in TypeScript importieren, wodurch der Test automatisch miterfasst wird.

### [Unkontrollierte CLI-Crashes] — Unbehandelte Exceptions von `validateStationsFile`
- **Warum später teuer:** Das neue CLI-Skript `validate-station-assets-structure.ts` soll `validateStationsFile` aufrufen. Diese Funktion wirft bei JSON-Fehlern harte Exceptions (`assert(...)`). Ohne Behandlung stürzt das Skript mit einem unschönen JavaScript-Stacktrace ab, was das Build-Protokoll unübersichtlich macht.
- **Wann es beißt:** Wenn ein JSON-Fehler in `stations.json` bei einem automatischen Build auftritt und das Fehlerprotokoll schwer lesbar ist.
- **Billige Gegenmaßnahme jetzt:** Den Aufruf von `validateStationsFile` in einem `try-catch`-Block im CLI-Skript kapseln, den Fehler sauber ausgeben (`console.error(err.message)`) und den Prozess kontrolliert mit `process.exit(1)` beenden.

### [Hardcodierter Pfad-Resolver] — Globale `appRoot` im Coach-Validator
- **Warum später teuer:** Das Skript [validate-coach-messages.mjs](../../../app/scripts/validate-coach-messages.mjs#L6) löst die Pfade für die WAV-Dateien gegen eine modul-globale `appRoot` auf. Wird dies in eine Funktion ausgelagert, muss `appRoot` konfigurierbar sein. Bleibt es global, können Tests keine abweichenden Mock-Pfade (z. B. in temporären Ordnern) prüfen.
- **Wann es beißt:** Beim Schreiben von Unit-Tests, die fehlende/vorhandene WAV-Dateien in einem simulierten Sandbox-Ordner verifizieren wollen.
- **Billige Gegenmaßnahme jetzt:** Der ausgelagerten Validierungsfunktion `appRoot` als Parameter oder Option übergeben (z. B. `{ appRoot, checkAudioFiles = true }`), anstatt auf das Modul-Level-Global zuzugreifen.
