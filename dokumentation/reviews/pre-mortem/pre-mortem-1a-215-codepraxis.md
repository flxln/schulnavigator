# Pre-Mortem 1a — Code-Praxis: #215 Medien S10

Basierend auf dem Implementierungsplan `/.cursor/plans/#215_medien_s10_f0de95f7.plan.md`.

### 1. `onSuccess` schließt das Panel entgegen der Plan-Annahme
- **Warum später teuer:** Der Plan behauptet unter "Datei ersetzen": „Panel bleibt offen (bestehendes Verhalten)“. Das ist im Code faktisch falsch. `station-medien-table.tsx` ruft bei jedem `onSuccess` hart `setEditingId(null)` auf, was das gesamte Formular unmountet.
- **Wann es beißt:** Ein Nutzer lädt eine neue Datei oder ein Thumbnail hoch und erwartet, dass das Panel offen bleibt, um noch den Untertitel anzupassen. Stattdessen klappt die Zeile sofort zu und er muss "Bearbeiten" neu klicken.
- **Billige Gegenmaßnahme jetzt:** Klären, ob das Panel bei Teil-Speicherungen (Asset/Replace) wirklich offen bleiben soll. 
  - *Wenn ja:* Eine neue Prop (z.B. `onPartialSuccess`) in `station-medium-edit-form.tsx` nutzen, die in der Table nur die Success-Message setzt, aber `editingId` nicht löscht. In diesem Fall muss nach dem Upload auch zwingend `setSelectedFile(null)` aufgerufen werden, um das Formular zurückzusetzen.
  - *Wenn nein:* Die Annahme im Plan korrigieren (Panel schließt sich wie bei Metadaten).

### 2. Layout-Shift durch `border-l-4` an der Tabellenzeile (`<tr>`)
- **Warum später teuer:** Wenn die aktive Zeile in `station-medien-table.tsx` per `border-l-4` hervorgehoben wird, inaktive Zeilen aber keinen Rand haben, verschiebt sich der gesamte Inhalt der aktiven Zeile um 4 Pixel nach rechts. Zudem verhalten sich Rahmen an `<tr>`-Elementen bei `border-collapse` in Tailwind oft inkonsistent zwischen verschiedenen Browsern.
- **Wann es beißt:** Bei jedem Klick auf "Bearbeiten" oder beim Schließen des Edit-Modus "zuckt" die Tabelle unschön hin und her.
- **Billige Gegenmaßnahme jetzt:** Den Rahmen nicht auf das `<tr>`, sondern auf das erste `<td>` der aktiven Zeile anwenden (`<td className="... border-l-4 border-l-accent">`) oder allen inaktiven Zeilen präventiv ein `border-l-4 border-transparent` geben.

### 3. Fehlende `preventDefault()` Handler beim Kopieren der Drop-Zone
- **Warum später teuer:** Der Plan besagt: „Gestrichelte Drop-Zone analog media-ingest-form.tsx“. Wenn man hierbei nur das visuelle Markup (`<div role="button" ...>`) kopiert, fehlt die Kernlogik des Drag & Drop.
- **Wann es beißt:** Zieht der Nutzer eine Videodatei auf den neuen Replace-Block, wird ohne die blockierenden Event-Handler (`e.preventDefault()` auf `onDragOver` und `onDrop`) das Standardverhalten des Browsers ausgelöst: Die Datei öffnet sich im gleichen Tab, die Web-App wird verlassen und alle ungespeicherten Eingaben im Formular sind verloren.
- **Billige Gegenmaßnahme jetzt:** Explizit sicherstellen, dass beim Kopieren des Musters aus `media-ingest-form.tsx` die Handler `handleDragOver` und `handleDrop` inklusive `e.preventDefault()` in `station-medium-edit-form.tsx` implementiert und gebunden werden.

### 4. Compiler-Fehler durch fehlenden Import von `mpzButtonClassName`
- **Warum später teuer:** Der Plan fordert den Einsatz von `mpzButtonClassName('primary')` und `('secondary')` in `station-medium-edit-form.tsx`. Dieser Helper wird in dieser Komponente bisher aber nicht importiert.
- **Wann es beißt:** Direkt beim ersten Speichern der Datei nach der Anpassung wird der Build/Compiler fehlschlagen.
- **Billige Gegenmaßnahme jetzt:** In `station-medium-edit-form.tsx` den Import in Zeile 4 anpassen: `import { mpzFieldClassName, mpzLabelClassName, mpzButtonClassName } from '@/components/mpz-studio/mpz-form-primitives'`.
