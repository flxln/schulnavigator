# Pre-Mortem 1b: Logik, Spec-Konsistenz & API-Vertrag

**Ziel-Plan:** `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/` (Roadmap, Cleanup-Brief, Screens, Typendefinitionen, Schema, Dialog-Zeilenmodell, Sphere-Calib-Screen)

**Modus:** Tech-Lead / Architekt — Stimmen Plan, Spec und Code als System überein?

---

## Bestätigt: Fehler-Mapping ist konsistent

Das API-Fehlerformat ist über alle MPZ-Routen einheitlich als `{ error: SCREAMING_SNAKE_CASE, message: string }` implementiert (z. B. `app/app/api/mpz/stations/[slug]/hotspots/route.ts:48`, `:57`, `:70`, `:77`). Domain-Fehler (`MpzStationHotspotsError`) reichen ihren `code` unverändert durch, Transport-Fehler (`INVALID_BODY`, `INTERNAL_ERROR`) folgen derselben Konvention. Das entspricht exakt der `.cursor/rules/error-conventions.mdc`. Hier besteht kein Vertragsrisiko zwischen Frontend und Backend.

---

## Fund 1 — `videoSource`: Spec deklariert Pflicht-Unterscheidung, Code ignoriert das Feld komplett

> **Status 2026-06-23 (#202):** Entschieden — `videoSource` **optional**, Default `upload` in UI/Renderer (`?? 'upload'`). [`mpz-studio.md`](../../spezifikationen/mpz-studio.md) und [`01-spezifikation-auszug.md`](../../archiv/design/mpz-studio-claude-design-cleanup/01-spezifikation-auszug.md) korrigiert. Kein Schema-`required`, keine Migration. Pre-Mortem-1b-Annahme „0 Treffer“ war zum Prüfzeitpunkt veraltet (Code nutzt das Feld seit v2.1).

**Was widersprüchlich ist:**
- `05-typendefinitionen.md:14` deklariert `VideoSource = 'upload' | 'youtube'` als eigenes Enum.
- `01-spezifikation-auszug.md:49` listet für `video` das Pflichtfeld `videoSource`.
- `04-stations-schema.json:96-100` enthält nur ein `if typ=video then { videoSource: { type: 'string' } }` — **ohne** `required`. Das Feld ist im JSON-Schema faktisch optional.
- `grep videoSource` über `app/`: **0 Treffer**. Weder TypeScript-Typen, UI-Formulare, Medien-Validierung noch Renderer referenzieren das Feld.

**Warum später teuer:** Ein Medium mit `typ: 'video'` und fehlendem `videoSource` ist schema-konform. Wenn der UI-Cleanup das Medien-Formular überarbeitet und sich an die Spec hält (`videoSource` als Pflichtfeld für Video), wird der Validator plötzlich bestehende, bisher akzeptierte Einträge in `stations.json` ablehnen — oder der Renderer muss raten (Upload vs. YouTube), was je nach URL-Format zu falschem Embed-Verhalten führt. Nach zwei weiteren Features ist ein nachträgliches `required` ein Daten-Migration über alle Stationen.

**Wann es beißt:** In Phase 4.5 der Roadmap (Formular-Patterns vereinheitlichen), sobald das neue Medien-Formular `videoSource` als Pflicht-Select rendert und der Save-Validate-Schritt die vorhandenen Videos ohne Feld rot markiert. Betroffen: `station-medien-table.tsx`, `station-medium-edit-form.tsx`, `app/lib/mpz-station-medien.ts`.

**Billige Gegenmaßnahme jetzt:** Eine verbindliche Entscheidung treffen und an **einer** Stelle festschreiben: Entweder (a) `videoSource` aus Spec + Schema streichen, weil der Renderer die Quelle aus dem `quelle`-Wert ableitet, oder (b) `required: ['videoSource']` in den `then`-Block von `04-stations-schema.json:99` aufnehmen und ein Migrationsskript für bestehende Einträge schreiben. Vor dem UI-Refactor klären, nicht danach.

---

## Fund 2 — Hotspot-Diskriminierung: JSON-Schema erlaubt, was die API mit `FORBIDDEN_FIELD` ablehnt

**Was widersprüchlich ist:**
- `04-stations-schema.json:119-156` definiert `hotspotFlat` / `hotspot360` mit **allen Feldern gleichzeitig** erlaubt (`mediumId`, `mascot`, `icon`, `action`). Es gibt kein `if action=dialog then mediumId forbidden`.
- Die Domain-Logik in `app/lib/mpz-station-hotspots.ts:210-230` (`assertNoMediumFieldsOnDialogInput`) und `:253-278` (`assertPatchForbiddenForMedium`) wirft `FORBIDDEN_FIELD`, wenn ein Dialog-Hotspot `mediumId`/`icon`/`iconSize` enthält oder ein Medium-Hotspot `mascot`/`mascotSize`/`bubblePitchOffset`.

**Warum später teuer:** Der Studio-Workflow ist so gebaut, dass JSON-Direkt-Edit (Plan A) ein gleichberechtigter Fallback bleibt (`00-cleanup-brief.md:24`, `01-spezifikation-auszug.md:14`). Ein MPZ, der im JSON-Editor einen Hotspot mit `action: 'dialog'` und versehentlich stehen gelassenem `mediumId` speichert, passiert `npm run validate:stations` (Schema grün), scheitert aber beim nächsten Studio-Save mit `FORBIDDEN_FIELD` — und im schlimmsten Fall beim API-Save einer *anderen* Station, weil `save-validate` die gesamte Datei neu schreibt. Das "Single Source of Truth"-Versprechen aus der Spec bricht.

**Wann es beißt:** Sobald der UI-Refactor den Hotspot-Editor (Phase 4.5) anfasst und das Studio den Fallback-Weg stärker bewirbt (Plan-A-Banner). Betroffen: jeder API-Client, der `stations.json` direkt schreibt — CLI, zukünftige Skripte, manuelle JSON-Edits. Der `save-validate`-Step in `app/app/api/mpz/save-validate/route.ts` vertraut auf `strict: true` + Schema, nicht auf die Domain-Regeln.

**Billige Gegenmaßnahme jetzt:** Die Diskriminierungsregeln aus dem Code (`assertNoMediumFieldsOnDialogInput`, `assertPatchForbiddenForMedium`) als `if/then`-Constraints in `04-stations-schema.json` unter `$defs/hotspotFlat` und `$defs/hotspot360` abbilden — analog zum bereits vorhandenen `medium.allOf`-Block (Zeile 96-117). So wird der Widerspruch am selben Ort aufgelöst, an dem er entsteht: im Schema.

---

## Fund 3 — Dialog-Tab-Gating: Plan verspricht "immer sichtbar", Code blendet aus — es ist ein Feature, kein Refactor

**Was widersprüchlich ist:**
- `00-cleanup-brief.md:79`: "Tabs: … Dialog (**immer sichtbar** — mit oder ohne `dialog` in JSON)".
- `15-dialog-segment-zeilenmodell.md:72`: "Ist: Tab ist ausgeblendet, wenn `hasDialog === false` — **Soll:** Tab immer sichtbar."
- `02-screens-v2.1-und-user-stories.md:151`: "Tab Dialog ist bei jeder Station sichtbar — auch ohne bestehenden `dialog`-Block."
- Code in `app/components/mpz-studio/station-detail-shell.tsx:70`: `hidden: !hasDialog` — der Tab wird **nur** gerendert, wenn bereits ein Dialog existiert. Guard in `:173`: `{activeTab === 'dialog' && hasDialog && (...)}`.

**Warum später teuer:** Die Plandokumente verkaufen das als UI-Cleanup ("aufräumen"), aber die Ist-Implementierung hat **keinen** Code-Pfad, um einen leeren Dialog-Block neu anzulegen. Der Empty-State mit "Dialog hinzufügen" (`15-dialog-segment-zeilenmodell.md:54-63`) und der minimale `{ figuren: ['frieda','otto'], segmente: [], gruppen: [] }`-Block sind Spec, nicht Code. Wenn die Roadmap Phase 4.3 (`station-detail-shell.tsx`) das `hidden`-Flag entfernt, ohne dass der CTA-Handler und der Create-Endpunkt existieren, führt der Button ins Leere oder erzeugt eine Station, die `save-validate` ablehnt (Dialog ohne Segmente kann gültig sein, aber der Hotspot-Code `assertDialogExists` in `mpz-station-hotspots.ts:185-192` verlangt den Block *vor* einem Dialog-Hotspot — Reihenfolge-Falle).

**Wann es beißt:** In Phase 4.3 der Roadmap, sobald `station-detail-shell.tsx` das Gating entfernt. Der Dialog-Hotspot-Workflow (User legt Dialog an → will Dialog-Hotspot setzen) bricht, wenn der Dialog-Block zwar existiert, aber `figuren` leer ist — `assertMascotInFiguren` (`:194-208`) schlägt zu. Betroffen: `station-dialog-panel.tsx`, die API `POST /api/mpz/stations/[slug]/hotspots` mit `action: 'dialog'`.

**Billige Gegenmaßnahme jetzt:** In der Roadmap Phase 4.3 explizit als **Feature-Phase** markieren (nicht "Refactor"): (a) Guard entfernen, (b) Empty-State-Komponente + CTA, (c) API-Endpunkt oder Client-Logik zum Anlegen eines minimalen Dialog-Blocks, (d) Testcase "Dialog anlegen → Dialog-Hotspot setzen → Save" als Abnahme-Kriterium in Phase 5 aufnehmen. Sonst ist das "immer sichtbar" ein totes UI-Element.

---

## Anhang: `startYaw` / `startPitch` / `startPanX` — Schema-Felder ohne Code-Referenz

Kürzer festgehalten, da nicht direkt vertragstragend: `04-stations-schema.json:242-258` definiert `startYaw`, `startPitch`, `startPanX` als optionale Felder der Station. `grep` über `app/`: **0 Treffer**. Dennoch deklariert `16-sphere-calib-screen.md:42-44` den "Startblick"-Tab mit `POST /api/mpz/view/sphere` als *bestehende* API. Vermutung: Die Felder werden visitor-seitig (nicht-mpz) genutzt. Vor dem Sphere-Cleanup (Phase 4.8) sollte verifiziert werden, ob die `POST /api/mpz/view/sphere`-Route diese Felder tatsächlich schreibt — sonst baut der neue S14-Screen auf eine API, die nicht existiert oder andere Feldnamen erwartet.