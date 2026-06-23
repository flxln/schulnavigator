---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
erstellt: 2026-06-23
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: #208 Save Dashboard

**Plan:** `.cursor/plans/#208_save_dashboard_6181c036.plan.md`
**Relevanter Code:** [save-validate-panel.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/save-validate-panel.tsx), [studio-validation-context.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/studio-validation-context.tsx), [studio-shell.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/studio-shell.tsx), [studio-shell.test.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/studio-shell.test.tsx), [studio-dashboard.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/studio-dashboard.tsx)

Hier sind drei konkrete Stellen auf Code-Ebene, an denen die Implementierung nach aktuellem Plan stoppen oder in stille Bugs laufen würde:

### 1. TypeScript & Runtime Crash in `SaveValidatePanel` bei aktivem Save (`saveInProgress`)
- **Warum später teuer:** Die Props von `SaveValidatePanel` erwarten zwingend ein Objekt vom Typ `SaveValidateFeedback`. Während `saveInProgress === true` wird im `StudioValidationProvider` das `saveFeedback` explizit auf `null` gesetzt. Übergibt die Shell nun `feedback={saveFeedback}`, führt dies zu einem TypeScript-Compilerfehler, da `null` nicht mit `SaveValidateFeedback` kompatibel ist. Sollte der Typ-Check umgangen werden, stürzt die App zur Laufzeit mit einem `TypeError` ab, da das Panel sofort versucht, auf `feedback.rolledBack` zuzugreifen.
- **Wann es beißt:** Sofort beim Klick auf "Speichern & Validieren" (sobald das Panel in den `running`-Zustand übergeht) sowie in Unit-Tests, die diesen Zustand abbilden.
- **Billige Gegenmaßnahme jetzt:** `SaveValidatePanelProps` so definieren, dass `feedback: SaveValidateFeedback | null` erlaubt ist. Im Panel-JSX den `running`-State als erste Bedingung prüfen und rendern (z. B. `if (running) return ...`), um Zugriffe auf `feedback` im Ladezustand sicher zu verhindern. In den verbleibenden Pfaden optional chaining (`feedback?.rolledBack`) nutzen.

### 2. Fehlendes `saveInProgress`-Feld im Test-Mock von `studio-shell.test.tsx`
- **Warum später teuer:** Die Shell `studio-shell.tsx` wird so angepasst, dass sie das neue `saveInProgress` Flag aus dem `useStudioValidation()`-Context destrukturiert. In `studio-shell.test.tsx` ist `useStudioValidation` jedoch mit einem statischen Mock überschrieben. Da dieses Mock-Objekt das neue Feld `saveInProgress` nicht bereitstellt, schlägt die Kompilierung der Testdatei fehl (da das Mock-Objekt nicht mehr dem Typ `StudioValidationContextValue` entspricht) oder der Ladezustand des Buttons und Panels kann in den Tests nicht korrekt überprüft werden.
- **Wann es beißt:** Beim Ausführen von `npm test` oder `npm run build` nach Einbau der Context-Änderung in der Shell.
- **Billige Gegenmaßnahme jetzt:** Im Mock in [studio-shell.test.tsx](file:///Users/felixlein/Projekte/App-Ideen/2_in-arbeit/schulnavigator/app/components/mpz-studio/studio-shell.test.tsx#L87-L100) das Feld `saveInProgress` ergänzen und mit dem lokalen `mocks`-Objekt verdrahten.

### 3. Layout-Flackern und Daten-Wipe auf dem Dashboard während Re-Validierungen
- **Warum später teuer:** Das Dashboard blendet derzeit KPI-Zahlen und die Problemliste komplett aus, wenn `loading` aktiv ist (`loading ? <p>Laden…</p> : ...` und `{report && !loading && ...}`). Der Plan sieht vor, einen Skeleton-Platzhalter zu zeigen, wenn `loading && !report`. Wenn wir jedoch die restlichen `{report && !loading && ...}` Bedingungen beibehalten, führt jede Re-Validierung (Klick auf "Erneut prüfen" oder Speichern) dazu, dass die existierenden validen Karten kurzzeitig verschwinden, was zu heftigem Layout-Flackern führt.
- **Wann es beißt:** Sobald der Nutzer auf dem Dashboard auf "Erneut prüfen" klickt oder Änderungen speichert, während bereits ein Report vorliegt.
- **Billige Gegenmaßnahme jetzt:** Die Rendering-Bedingungen auf dem Dashboard entkoppeln: Vorhandene Daten (`report`) sollen auch während `loading === true` gerendert werden, um Layout-Verschiebungen zu vermeiden. Die Skeletons greifen nur bei `!report && loading` (Initial-Load). Für laufende Aktualisierungen kann stattdessen eine leichte Opacity (`opacity-70`) oder ein kleiner Spinner am Refresh-Button verwendet werden.
