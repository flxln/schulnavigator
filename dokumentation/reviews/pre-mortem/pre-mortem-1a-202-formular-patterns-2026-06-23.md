---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01a-code-praxis
issue: 202
erstellt: 2026-06-23
---
# Pre-Mortem 1a — Code-Praxis & Implementierbarkeit: Formular-Patterns #202

Spezialisiert auf Probleme, die erst beim Schreiben des Codes sichtbar
werden: kaputte Imports, nicht-testbare Abhängigkeiten, stille Datenbugs.
Gegenstück zu [[premortem_1b_logik_spec]], das Widersprüche zwischen
Dokumenten sucht.

---

Du bist Senior Engineer und liest diesen Plan so, als müsstest du ihn
*morgen* implementieren. Kein Architekt-Blick — Developer-Blick.

PLAN:
Siehe `schulnavigator/.cursor/plans/formular-patterns_#202_297c649f.plan.md`

RELEVANTER CODE:
- `app/components/mpz-studio/studio-validation-context.tsx`
- `app/components/mpz-studio/studio-shell.tsx`
- `app/components/mpz-studio/station-medium-edit-form.tsx`
- `app/components/mpz-studio/hub-panel.tsx`
- und 11 weitere Formular-Komponenten mit lokalem `fieldClassName`

---

Stell dir vor, du öffnest die erste Datei und fängst an zu tippen.
Finde die Stellen, an denen du **aufhörst und zurückgehen musst**:

### Problem 1: Fehlende Typdefinitionen für die neuen Primitives
- **Warum später teuer:** Ohne explizite TypeScript-Interfaces für `MpzFormAlert`, `MpzDraftNotice`, `MpzDataTable` und `MpzModal` wird die Wiederverwendung und korrekte Implementierung in den verschiedenen Komponenten fehleranfällig. Entwickler müssen sich die Props jedes Mal aus den Implementierungen zusammensuchen.
- **Wann es beißt:** Beim Migrieren der 13 Formular-Komponenten werden inkonsistente Props verwendet, was zu Runtime-Fehlern oder falschem UI-Verhalten führt. Unit-Tests können nicht einfach Mocks erstellen.
- **Billige Gegenmaßnahme jetzt:** Erstellt für jede neue Komponente ein eigenes `*.types.ts` oder definiert die Props direkt in der Komponente mit vollständigen JSDoc-Kommentaren und exportiert sie. Alternativ: Erstellt ein zentrales `mpz-studio.types.ts` für alle MPZ-spezifischen Typen.

### Problem 2: Inkonsistente Default-Werte in den Formular-Primitives
- **Warum später teuer:** Die `fieldClassName()` und `labelClassName()` in den einzelnen Formularen haben unterschiedliche Implementierungen (z.B. `px-2 py-1.5` vs `px-3 py-2`). Wenn diese zu einer gemeinsamen `mpz-form-primitives.ts` migriert werden, müssen die Default-Werte vereinheitlicht werden. Bestehende Formulare nutzen aber möglicherweise leicht abgewandelte Versionen.
- **Wann es beißt:** Beim Migrieren einer Komponente wird das ursprüngliche Layout durch die neue Primitive brechen, weil z.B. der Padding nicht mehr passt. Das erfordert nachträgliche Layout-Anpassungen an vielen Stellen.
- **Billige Gegenmaßnahme jetzt:** Analysiert alle 13 Formulare und extrahiert die exakten Klassen, die sie verwenden. Erstellt eine umfassende `mpz-form-primitives.ts` mit konfigurierbaren Optionen (z.B. `fieldPadding`, `labelMargin`), um alle Variationen abzudecken.

### Problem 3: Keine klare Trennung zwischen globalem Dirty und Panel-Entwürfen
- **Warum später teuer:** Der Plan erwähnt, dass Panel-Entwürfe (Hub/Embeds) **nicht** global `dirty` setzen sollen, aber die aktuelle Implementierung in `hub-panel.tsx` und `embeds-panel.tsx` verwendet `markMpzStudioDirty()` beim Speichern. Das könnte zu doppelten Dirty-Events führen oder den globalen Zustand inkonsistent machen.
- **Wann es beißt:** Wenn ein Nutzer einen Panel-Entwurf speichert, wird `markMpzStudioDirty()` aufgerufen, was den globalen Dirty-Zustand setzt. Das könnte dazu führen, dass der Save-Button unnötig aktiviert bleibt oder der Nutzer fälschlich gewarnt wird, dass Änderungen ausstehen.
- **Billige Gegenmaßnahme jetzt:** In der `mpz-draft-notice.tsx` oder in den Panel-Komponenten selbst sicherstellen, dass `markMpzStudioDirty()` **nicht** direkt nach dem Panel-Save aufgerufen wird. Stattdessen sollte der Panel-Save eine separate API-Aufruf sein, der erst beim globalen Save/Validate die Validation auslöst.

### Problem 4: Fehlende Fehlerbehandlung in den neuen Komponenten
- **Warum später teuer:** Die neuen Komponenten `MpzFormAlert`, `MpzDataTable`, `MpzModal` haben keine definierte Fehlerbehandlung für Randfälle (z.B. Netzwerkausfall beim Öffnen eines Modals, leere Daten in der Tabelle, fehlende ARIA-Rollen).
- **Wann es beißt:** In der `media-ingest-modal.tsx` könnte das native `<dialog>`-Element ohne Fallback fehlschlagen, wenn das Browser-Support limitiert ist. `MpzDataTable` könnte bei leerer Liste ohne Platzhaltertext abstürzen.
- **Billige Gegenmaßnahme jetzt:** Definiert in den neuen Komponenten Standard-Fallbacks: Für `MpzModal` einen Polyfill oder einen `onClose`-Callback mit Error-Handling; für `MpzDataTable` einen `emptyState`-Prop; für `MpzFormAlert` eine `onError`-Callback.

### Problem 5: Unklare Initialisierung des Dirty-State
- **Warum später teuer:** In `studio-validation-context.tsx` startet `dirty` mit `true` (Zeile 48), wird aber sofort in `useEffect` auf `false` gesetzt, nachdem `validateNow()` aufgerufen wird. Das könnte zu einem kurzen Flackern des Save-Buttons kommen, bevor die Initialisierung abgeschlossen ist.
- **Wann es beißt:** Beim ersten Laden des MPZ Studios sieht der Nutzer den Save-Button aktiv, obwohl noch keine Validierung gelaufen ist. Das ist verwirrend und entspricht nicht dem Ziel, initial kein Save-Feedback anzuzeigen.
- **Billige Gegenmaßnahme jetzt:** Ändert den initialen Zustand auf `dirty: false` und fügt einen separaten `initialized`-Flag hinzu, der erst auf `true` gesetzt wird, wenn die erste Validierung abgeschlossen ist. Der Save-Button sollte nur bei `dirty && initialized` aktiv sein.

### Problem 6: Seiteneffekte in den Formular-Komponenten
- **Warum später teuer:** Die Formular-Komponenten wie `station-medium-edit-form.tsx` rufen `markMpzStudioDirty()` direkt nach einem erfolgreichen Speichern auf (Zeile 227). Das ist ein Seiteneffekt innerhalb der Domain-Logik, der die Komponente schwer testbar macht und zu unerwarteten Dirty-Events führen kann.
- **Wann es beißt:** Wenn ein Nutzer ein Medium bearbeitet und speichert, wird `markMpzStudioDirty()` ausgelöst. Das könnte den globalen Dirty-Zustand setzen, auch wenn die Änderung nur lokal war und nicht in den globalen Validation-Context passt.
- **Billige Gegenmaßnahme jetzt:** Extrahiert das Dirty-Marking in einen eigenen Hook oder eine Utility-Funktion, die von allen Formularen verwendet wird. Dadurch kann das Verhalten zentral gesteuert und getestet werden.

### Problem 7: Fehlende Unit-Tests für die neuen Primitives
- **Warum später teuer:** Die neuen Dateien `mpz-form-primitives.ts`, `mpz-form-alert.tsx`, etc. haben keine Unit-Tests. Ohne Tests wird die korrekte Darstellung der verschiedenen Alert-Varianten (error, success, info) und die Barrierefreiheit (ARIA-Rollen) nicht verifiziert.
- **Wann es beißt:** Ein PR wird zurückgewiesen, weil der Accessibility-Scanner fehlende `role`-Attribute oder falsche Farbkontraste bemängelt. Die Entwickler müssen dann im Nachhinein die Tests schreiben und das UI anpassen.
- **Billige Gegenmaßnahme jetzt:** Erstellt für jede neue Komponente einen dedizierten Test-Ordner mit Tests für alle Varianten, Props und Barrierefreiheitsmerkmale. Nutzt `@testing-library/react` für die Komponenten-Tests.

### Problem 8: Komplexität der Migration der 13 Formulare
- **Warum später teuer:** Die Migration der 13 Formular-Komponenten zu den neuen Primitives ist ein manueller, fehleranfälliger Prozess. Jede Komponente hat ihre eigene Struktur und verwendet die lokalen `fieldClassName()`/`labelClassName()` unterschiedlich.
- **Wann es beißt:** Beim Migrieren einer Komponente werden nicht alle Vorkommen der alten Klassen gefunden, was zu inkonsistentem UI führt. Oder die Props der neuen `MpzFormAlert`-Komponente werden nicht korrekt verwendet, sodass Fehler nicht richtig angezeigt werden.
- **Billige Gegenmaßnahme jetzt:** Erstellt ein Migrationsskript oder eine Checkliste für jede Komponente, die genau dokumentiert, welche Zeilen geändert werden müssen. Führt die Migration in kleinen Schritten durch und committet jede Komponente separat, um einfacher rollbacks durchzuführen.

### Problem 9: Unklare Verantwortlichkeit für das Save-Feedback im Error-Case
- **Warum später teuer:** Der Plan erwähnt, dass die Top-Bar bei Context-`error` (z.B. Unlock-Hinweis) ein kompaktes `MpzFormAlert` anzeigen soll (Zeile 44 im Plan). Es ist aber unklar, ob dieses Alert von `studio-validation-context.tsx` oder von `studio-shell.tsx` gerendert werden soll.
- **Wann es beißt:** Wenn `studio-validation-context.tsx` das Alert rendert, könnte das die Logik der Shell verletzen. Wenn `studio-shell.tsx` es rendert, muss sie den `error`-Zustand aus dem Context ziehen, was zu prop-drilling oder redundantem State führt.
- **Billige Gegenmaßnahme jetzt:** Entscheidet, ob das Alert Teil des Validation-Contexts sein soll (als eigenes Kind-Element) oder ob die Shell es selbst anzeigen soll. Dokumentiert die Entscheidung in der Code-Struktur.

### Problem 10: Fehlende Typ-Sicherheit bei den neuen Dateien
- **Warum später teuer:** Die neuen Dateien werden als `*.tsx` oder `*.ts` erstellt, aber es gibt keine Typ-Definitionen für die Props, die sie erhalten. Das führt zu impliziten any-Types und Linter-Warnungen.
- **Wann es beißt:** Beim Kompilieren werden Fehler geworfen, weil Props falsch verwendet werden. Die Entwickler müssen dann im Nachhinein Typ-Definitionen hinzufügen, was Refactoring erfordert.
- **Billige Gegenmaßnahme jetzt:** Erstellt für jede neue Datei ein TypeScript-Interface für die Props und exportiert es. Nutzt `React.FC` oder die generischere `React.ComponentType` für die Komponenten selbst.

### Problem 11: Ineffiziente Suche nach den 13 Formularen
- **Warum später teuer:** Die 13 Formulare sind über verschiedene Ordner verteilt. Wenn ein neuer Entwickler eine Migration durchführen muss, muss er jede Komponente einzeln finden und verstehen.
- **Wann es beißt:** Beim Onboarding eines neuen Teammitglieds oder bei einer späteren Wartung werden Formulare übersehen, was zu inkonsistenter UI führt.
- **Billige Gegenmaßnahme jetzt:** Erstellt eine zentrale Dokumentation (z.B. in `fuer-entwickler.md`) mit einer Liste aller Formular-Komponenten, die migriert werden müssen, inklusive Pfade und kurzer Beschreibung.

### Problem 12: Keine klare Migration für die Kalib-Panels
- **Warum später teuer:** Die Kalib-Panels (`flat-*-calib`, `sphere-*-calib`) sollen nur das Fehler-Chrome vereinheitlichen, aber nicht den Save/Validate-Flow ändern. Es ist aber unklar, wie die Fehler aktuell dargestellt werden und ob sie bereits `MpzFormAlert` verwenden.
- **Wann es beißt:** Beim Migrieren der Kalib-Panels werden Fehler nicht korrekt angezeigt, weil die alte Fehlerbehandlung erhalten bleibt. Oder es kommt zu Konflikten mit dem bestehenden Validation-Flow.
- **Billige Gegenmaßnahme jetzt:** Untersucht die aktuellen Kalib-Panel-Komponenten (z.B. `flat-calibration-panel.tsx`) und dokumentiert, wie Fehler dort aktuell behandelt werden. Erstellt dann einen spezifischen Migrationsplan für diese Panels.

### Problem 13: Fehlende Dokumentation der Dirty-Semantik
- **Warum später teuer:** Die Dirty-Semantik ist nur im Plan und in Kommentaren dokumentiert. Neue Entwickler verstehen möglicherweise nicht, wann `dirty` gesetzt werden sollte und wann nicht, besonders im Unterschied zwischen globalem Dirty und Panel-Entwürfen.
- **Wann es beißt:** Ein Entwickler fügt eine neue Formular-Komponente hinzu und setzt `markMpzStudioDirty()` an der falschen Stelle, was zu falschen Warnungen oder deaktivierten Buttons führt.
- **Billige Gegenmaßnahme jetzt:** Schreibt einen umfassenden Abschnitt in `fuer-entwickler.md` (wie im Plan erwähnt) und fügt zusätzliche JSDoc-Kommentare in `studio-validation-context.tsx` hinzu, die die Dirty-Logik erklären.

### Problem 14: Unklare Verantwortlichkeit für das `beforeunload`-Event
- **Warum später teuer:** Der Plan erwähnt, dass `beforeunload` nicht in Scope ist, aber es ist unklar, ob und wie die Browser-Warnung beim Verlassen der Seite implementiert werden soll. Wenn ein Nutzer Änderungen hat, sollte er gewarnt werden.
- **Wann es beißt:** Ein Nutzer bearbeitet ein Formular, vergisst zu speichern und schließt das Browser-Tab. Die Änderungen gehen verloren, ohne dass eine Warnung erscheint. Das führt zu Frust und Datenverlust.
- **Billige Gegenmaßnahme jetzt:** Entscheidet, ob eine `beforeunload`-Warnung implementiert werden soll (z.B. wenn `dirty === true`). Falls ja, implementiert sie in `studio-shell.tsx` oder im Validation-Context mit einem Event-Listener.

### Problem 15: Fehlende Tests für den initialen Ladezustand
- **Warum später teuer:** Der initialen Ladezustand (`loading: true`) blockiert den Save-Button, aber es gibt keine Tests, die sicherstellen, dass der Button während des Ladens deaktiviert bleibt und erst nach der ersten Validierung aktiv wird.
- **Wann es beißt:** Beim ersten Öffnen des MPZ Studios könnte der Save-Button fälschlicherweise aktiv sein, bevor die Validierung abgeschlossen ist, was zu einem vorzeitigen Speicherversuch führt.
- **Billige Gegenmaßnahme jetzt:** Schreibt Unit-Tests für `studio-validation-context.tsx`, die den initialen Zustand und den Übergang von `loading` zu `dirty` testen.

### Problem 16: Inkonsistente Verwendung von `markMpzStudioDirty()`
- **Warum später teuer:** In der aktuellen Implementierung wird `markMpzStudioDirty()` an vielen Stellen aufgerufen (z.B. in `station-medium-edit-form.tsx` Zeile 227, in `hub-panel.tsx` beim Speichern). Es ist aber unklar, ob alle diese Aufrufe notwendig sind und ob sie den globalen Zustand korrekt setzen.
- **Wann es beißt:** Doppelte Aufrufe führen zu redundanten Events, was die Performance beeinträchtigen kann. Oder an einigen Stellen wird `markMpzStudioDirty()` vergessen, was dazu führt, dass der Nutzer nicht sieht, dass Änderungen ausstehen.
- **Billige Gegenmaßnahme jetzt:** Erstellt eine zentrale Checkliste, wann `markMpzStudioDirty()` aufgerufen werden soll (z.B. nach jedem API-Write, der `stations.json` betrifft) und wann nicht (z.B. bei Panel-Entwürfen). Codiert diese Regeln in einem Kommentar in der Utility-Funktion.

### Problem 17: Fehlende Fallbacks für die `MpzDataTable`
- **Warum später teuer:** Die `MpzDataTable` wird als Wrapper für Tabellen verwendet, aber es gibt keine Fallbacks für leere Daten oder Ladezustände. Wenn eine Tabelle keine Daten anzeigt, bleibt sie leer ohne Erklärung.
- **Wann es beißt:** In der `hub-panel.tsx` könnte die Tabelle leer sein, wenn keine Stationen zugewiesen sind. Der Nutzer sieht nur eine leere Tabelle ohne Hinweis, was verwirrend ist.
- **Billige Gegenmaßnahme jetzt:** Fügt in `mpz-data-table.tsx` einen `emptyText`-Prop hinzu, der anzeigt, wenn die Tabelle keine Zeilen hat. Alternativ: Rendert eine Standard-Meldung wie "Keine Daten verfügbar".

### Problem 18: Unklare Verantwortlichkeit für das `MpzDraftNotice` in `station-medium-edit-form`
- **Warum später teuer:** Das `MpzDraftNotice` soll in `station-medium-edit-form.tsx` angezeigt werden, wenn `isDirty` ist (Plan Zeile 50). Aber die Komponente hat bereits ein eigenes `isDirty`-Flag (Zeile 161). Es ist unklar, ob dieses Flag mit dem globalen Dirty synchronisiert werden soll.
- **Wann es beißt:** Wenn das Panel `isDirty` setzt, aber der globale Dirty nicht gesetzt wird, könnte das `MpzDraftNotice` angezeigt werden, ohne dass der Nutzer gewarnt wird, dass er speichern muss. Oder umgekehrt.
- **Billige Gegenmaßnahme jetzt:** Klärt, ob das `isDirty` in `station-medium-edit-form` ein lokales Panel-Dirty oder ein globales Dirty sein soll. Falls es global sein soll, muss es mit dem Validation-Context synchronisiert werden.

### Problem 19: Fehlende Typ-Validierung für die neuen Primitives
- **Warum später teuer:** Die neuen Primitives haben keine Prop-Types oder TypeScript-Interfaces, die die erwarteten Props validieren. Das führt zu Laufzeitfehlern, wenn z.B. ein falsches `variant` für `MpzFormAlert` verwendet wird.
- **Wann es beißt:** Ein Entwickler verwendet `MpzFormAlert` mit `variant="warning"` anstelle von `variant="error"` und erhält eine Warnung oder falsche Darstellung.
- **Billige Gegenmaßnahme jetzt:** Definiert ein TypeScript-Enum für die Varianten (`MpzAlertVariant = 'error' | 'success' | 'info'`) und verwendet es in den Props.

### Problem 20: Unklare Migration der Tabellen-Header
- **Warum später teuer:** Die Tabellen sollen `MpzDataTable` verwenden, das einen einheitlichen Header (`bg-bg-2 uppercase text-xs font-semibold text-fg-3`) hat. Aber einige Tabellen (z.B. `hub-panel.tsx`) haben bereits eigene Header-Klassen. Es ist unklar, ob diese vollständig ersetzt werden oder ob der Header angepasst werden kann.
- **Wann es beißt:** Beim Migrieren einer Tabelle wird der Header nicht korrekt dargestellt, weil die alte CSS-Klassen mit den neuen kollidieren.
- **Billige Gegenmaßnahme jetzt:** Erstellt ein Style-Guide für die Tabellen-Header, der genau definiert, wie der Header auszusehen hat und welche Klassen verwendet werden dürfen.

## Gesamtbewertung

Die größten Risiken liegen in der Migration der 13 Formular-Komponenten und der 6 Tabellen, da diese manuell und fehleranfällig sind. Zudem ist die Dirty-Semantik komplex und erfordert klare Dokumentation und Tests. Die neuen Primitives müssen von Anfang an mit vollständigen Typen und Tests ausgestattet werden, um spätere Refactorings zu vermeiden.

Die billigen Gegenmaßnahmen (Dokumentation, Typen, Tests, Migrations-Checkliste, Style-Guides) sollten jetzt umgesetzt werden, bevor mit dem Coden begonnen wird.