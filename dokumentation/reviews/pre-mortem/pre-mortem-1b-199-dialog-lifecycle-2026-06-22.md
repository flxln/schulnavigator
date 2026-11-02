---
tags:
  - review
  - pre-mortem
  - 1b-logik-spec
  - issue-199
erstellt: 2026-06-22
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: Dialog-Lifecycle (#199)

**Plan:** `.cursor/plans/dialog-lifecycle_#199_50aa1c6b.plan.md`
**Gegenstück:** [[pre-mortem-199-2026-06-22]] (1a — Code-Praxis)

Stell dir vor, Frontend und Backend werden unabhängig implementiert und
integriert. Hier sind die vertraglichen Bruchstellen, die dann beißen.

---

### [`VALIDATION` vs. `VALIDATION_FAILED`] — API-Vertrag widerspricht Projekt-Konvention

- **Was widersprüchlich ist:** Der Plan (Z. 192) übernimmt den bestehenden Code-Zustand und dokumentiert `VALIDATION` als Fehlercode für `MpzContentIoError`. Tatsächlich steht in [`route.ts`](app/app/api/mpz/stations/[slug]/dialog/route.ts) Z. 105–106:
  ```ts
  const status = err.code === 'VALIDATION' ? 422 : 500
  return NextResponse.json({ error: err.code, message: err.message }, { status })
  ```
  Und `MpzContentIoErrorCode` in [`mpz-content-io.ts`](app/lib/mpz-content-io.ts) Z. 41 ist `'VALIDATION' | 'IO'`. Die projektweite Konvention ([`.cursor/rules/error-conventions.mdc`](.cursor/rules/error-conventions.mdc) Z. 32) verlangt jedoch `VALIDATION_FAILED` und listet das Mapping `validation_failed → VALIDATION_FAILED`.
- **Warum später teuer:** Wenn #199 neue Route-Tests für POST/DELETE schreibt und `{ error: 'VALIDATION' }` assertet, verfestigt sich der abweichende Code. Ein späteres Refactoring zur Konformität wird zum Breaking Change über alle Test-Assertions und Frontend-Error-Switches hinweg. Frontend-Entwickler, die sich auf die Konvention verlassen, werden einen `case 'VALIDATION_FAILED'` schreiben, der nie matched — der Dialog-Create wirft stillschweigend ins Catch.
- **Wann es beißt:** Spätestens bei der Integration mit einem Frontend-Error-Handler, der sich an die `.cursor/rules`-Konvention hält; oder wenn ein Tech-Debt-Issue die Codebase normalisiert und plötzlich alle Dialog-Route-Tests rot werden.
- **Billige Gegenmaßnahme jetzt:** In #199 den Code in `MpzContentIoErrorCode` und allen Konsumstellen (mind. `route.ts` Z. 105 und Test-Assertions) auf `VALIDATION_FAILED` normalisieren — oder, falls das zu groß für diesen Scope ist, im Plan explizit als bekannte Tech-Depot markieren und einen `FIXME`-Kommentar hinterlegen. Nicht den bestehenden Code stillschweigend perpetuieren.

---

### [`gruppen` im Create-Default`] — Schema optional, Plan/Spec always-present

- **Was widersprüchlich ist:** Das JSON-Schema ([`stations.schema.json`](app/data/stations.schema.json) Z. 176–211) definiert `dialog` mit `required: ["figuren", "segmente"]` — `gruppen` ist **nicht** required (Z. 190). Der Plan (Z. 82, 149) und die Spec ([`15-dialog-segment-zeilenmodell.md`](dokumentation/archiv/design/mpz-studio-claude-design-cleanup/15-dialog-segment-zeilenmodell.md) Z. 57–62) schreiben den Create-Default jedoch als `{ figuren: [...], segmente: [], gruppen: [] }` — also mit immer vorhandenem `gruppen`. Zwei Wahrheiten: Schema sagt optional, Create-Default sagt always-present.
- **Warum später teuer:** Der TypeScript-Typ `Dialog` muss entscheiden: Ist `gruppen` optional (`gruppen?: DialogGruppe[]`) oder nicht? Wenn der Typ es als required deklariert (weil der Create-Default es immer schreibt), kompiliert Code, der manuell gepflegte Stations-JSONs ohne `gruppen` verarbeitet, nicht — oder schlimmer, läuft zur Laufzeit gegen `undefined`. Wenn der Typ es optional deklariert, müssen alle Konsumstellen `dialog.gruppen ?? []` schreiben. Ein Mitbenutzen des bestehenden Typs für die neue Create-Logik verführt dazu, die Optionalität zu ignorieren.
- **Wann es beißt:** Bei jedem Code-Pfad, der `dialog.gruppen` als garantiert vorhandenes Array behandelt. Die bestehende [`dialog-player.tsx`](app/components/dialog/dialog-player.tsx) Z. 17 ist noch safe (`segment.gruppe && dialog.gruppen`), aber zukünftiger Studio-Code (Gruppen-Editor, Delete-Guard für Gruppen) könnte das vergessen. Spätestens beim ersten manuell angelegten Dialog ohne `gruppen`-Feld.
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten: (a) TypeScript-Typ `Dialog.gruppen` muss `gruppen?: DialogGruppe[]` sein (optional), weil das Schema es nicht verlangt; (b) `createDialog` schreibt `gruppen: []` als Default (konform mit Spec), aber konsumierender Code nutzt `dialog.gruppen ?? []`. Alternativ: `gruppen` im Schema als `required` aufnehmen — dann ist der Create-Default verbindlich und alle bestehenden JSONs müssen geprüft werden.

---

### [`hasDialog` vs. `station.dialog`] — Zwei Wahrheiten über den Dialog-Zustand

- **Was widersprüchlich ist:** Nach dem Plan nutzt die Shell künftig `station.dialog` (existiert Block?), während `hasDialog` in [`mpz-studio-overview.ts`](app/lib/mpz-studio-overview.ts) Z. 146 weiterhin `!!station?.dialog?.segmente?.length` bedeutet (hat fertigen Dialog?). Das sind zwei semantisch unterschiedliche Definitionen desselben Konzepts "hat Dialog":
  - `station.dialog !== undefined` → "Dialog-Block existiert (kann Entwurf mit `segmente: []` sein)"
  - `hasDialog === true` → "besucherfertiger Dialog mit mind. 1 Segment"
  Nach Create (segmente: []) ist `station.dialog` truthy, aber `hasDialog` bleibt `false`. Overview-Badges, Health-Checks und Navigationsindikatoren, die `hasDialog` konsumieren, zeigen "kein Dialog", während der Studio-Tab einen Block anzeigt.
- **Warum später teuer:** Redakteure sehen in der Overview-Karte "kein Dialog", klicken aber in den Tab und finden einen leeren Entwurf. Das ist verwirrend und führt zu Support-Tickets ("Wieso steht da kein Dialog, ich hab doch einen angelegt?"). Wenn später ein Badge "Dialog-Entwurf" hinzukommen soll (YAGNI jetzt, aber requested in Plan Z. 248), ist unklar, welches Feld ihn steuert.
- **Wann es beißt:** Sobald die Overview oder Health-Check-UI `hasDialog` als einzigen Indikator nutzt und ein Redakteur einen Dialog angelegt, aber noch keine Segmente erstellt hat. Auch beim Abnahme-Test AK #1 ("4 Tabs sichtbar") vs. Overview-Darstellung.
- **Billige Gegenmaßnahme jetzt:** Entweder `hasDialog` in `mpz-studio-overview.ts` auf `!!station?.dialog` umstellen (dann bedeutet es "Block existiert") und ein eventuelles `hasDialogSegments` für die Besucher-Logik ergänzen — oder im Plan explizit dokumentieren: "`hasDialog` bedeutet bewusst 'besucherfertiger Dialog' und ist **nicht** gleichbedeutend mit `station.dialog`-Existenz; Studio-UI nutzt `station.dialog`, Besucher-/Health-Logik nutzt `hasDialog`." Die Trennung muss als Entscheidung mit Begründung im Plan stehen, nicht nur als "nicht nötig" abgetan werden.

---

## Was stabil ist

Die **Hotspot-Diskriminierung** für den Delete-Guard ist vollständig und konsistent spezifiziert: Der Validator prüft in [`validate-stations.ts`](app/lib/validate-stations.ts) sowohl `hotspots` (flat, Z. 836) als auch `hotspots360` (sphere, Z. 873) auf `action === 'dialog'`, und das Schema ([`stations.schema.json`](app/data/stations.schema.json) Z. 51–54) definiert `hotspotAction` als `enum: ["medium", "dialog"]` — es gibt keine dritte, unbeschriebene Action. Der `DIALOG_IN_USE`-Guard deckt beide Viewer-Modi ab, und die Validator-Regel "`dialog-Hotspot erfordert station.dialog`" erzwingt konsistent, dass ein Delete ohne vorheriges Hotspot-Entfernen fehlschlägt. Hier stimmen Plan, Spec und Code überein.