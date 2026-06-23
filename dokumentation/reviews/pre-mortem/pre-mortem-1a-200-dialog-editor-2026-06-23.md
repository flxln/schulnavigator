---
tags:
  - pre-mortem
  - 1a-code-praxis
erstellt: 2026-06-23
---

# Pre-Mortem 1a — Code-Praxis: Issue #200 (Dialog-Editor)

Basierend auf dem Implementierungsplan `dialog-editor_#200_ec35f5cf.plan.md` und der Vorlage `1a_pre-mortem-codepraxis.md`.

## Funde für die Code-Praxis

### 1. `dialogApiQuelle` im Client führt zu Compiler-Fehler
- **Warum später teuer:** Die Funktion `dialogApiQuelle` in `@/lib/dialog-audio` importiert implizit Server-Abhängigkeiten (`node:path`, `getStationsPaths`). Da die neue Komponente `station-dialog-segment-audio-row.tsx` als Client-Komponente (`'use client'`) läuft, löst ein direkter Import dieser Hilfsfunktion sofort einen `Module not found: Can't resolve 'node:path'` Build-Fehler aus.
- **Wann es beißt:** Am ersten Tag, sobald die Play-URL-Logik im Client eingefügt wird und der Dev-Server neu baut.
- **Billige Gegenmaßnahme jetzt:** Den URL-String für die Play-Route im Client direkt inline zusammenbauen (z. B. ``const playUrl = `/api/dialog/${slug}/${audit.expectedClip}` ``) anstatt die serverseitige Funktion zu importieren.

### 2. Verschachtelte Buttons im Gruppen-Collapsible (Hydration Error)
- **Warum später teuer:** Die `Gruppen`-Sektion hat aktuell den Button `Gruppe hinzufügen` in der Header-Zeile. Das im Plan unter Punkt 8 geforderte Pattern aus `coach-message-form` legt jedoch üblicherweise einen `<button>`-Tag über die *gesamte* Header-Zeile, um das Aufklappen zu steuern. Belässt man den Hinzufügen-Button in dieser Zeile, entsteht ein `<button>` in einem `<button>`. Das führt zu invalidem HTML, Klick-Konflikten und React-Hydration-Errors.
- **Wann es beißt:** Beim ersten Testen im Browser (Sektion klappt nicht auf oder feuert stattdessen das "hinzufügen"-Event; Konsolen-Error: "cannot nest button inside button").
- **Billige Gegenmaßnahme jetzt:** Den Button `Gruppe hinzufügen` entweder in den Inhaltsbereich verschieben, sodass er erst nach dem Aufklappen sichtbar ist, oder den Collapsible-Header im DOM als `<div>` mit Flexbox strukturieren, sodass der Toggle-Klick nur auf Text+Icon liegt und der Hinzufügen-Button ein legitimer Sibling bleibt.

### 3. Staler Validation-Report (Top-Bar) nach Clip-Delete
- **Warum später teuer:** Der Plan sagt für den Löschvorgang: `loadAudioStatus() + markMpzStudioDirty() + applyReport(validation) wenn Ingest-Response validation liefert`. Da die neue Route `DELETE /api/mpz/dialog-audio/clip` keinen Validation-Report zurückgibt, passiert das `applyReport` nach dem Löschen nicht. Die globale Studio-Validierung (Top-Bar) verbleibt auf dem alten Stand und registriert nicht, dass die WAV-Datei nun fehlt, da der Report gecached ist.
- **Wann es beißt:** Nach dem Klick auf "Clip entfernen" wird die Audio-Zeile zwar korrekt zu "Audio fehlt" aktualisiert, aber das Fehler-Badge in der Top-Bar ändert sich nicht, bis die Seite manuell neu geladen oder anderweitig validiert wird.
- **Billige Gegenmaßnahme jetzt:** Nach dem erfolgreichen Clip-Delete im Client zwingend `validateNow()` (aus `useStudioValidation()`) aufrufen, um den globalen Audit-State neu vom Server abzugreifen, genau wie es `deleteSegment` bereits tut.
