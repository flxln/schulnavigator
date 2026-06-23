---
tags:
  - review
  - pre-mortem
  - 01b-logik-spec
issue: 202
erstellt: 2026-06-23
---
# Pre-Mortem 1b: Formular-Patterns & Dirty-State (#202)

**Prüfgegenstand:** `.cursor/plans/formular-patterns_#202_297c649f.plan.md`

### Widersprüchlicher Dirty-State bei Panel-Entwürfen (Hub / Embeds)
- **Warum später teuer:** Der Plan behauptet, nach dem erfolgreichen Speichern von Hub- oder Embed-Panels erscheine der globale Dirty-Punkt, da `markMpzStudioDirty()` gefolgt von `validateNow()` aufgerufen werde. Die Implementierung von `validateNow()` (und `applyReport` in `studio-validation-context.tsx`) setzt den State jedoch hardcodiert auf `setDirty(false)`. Frontend und Spec widersprechen sich fundamental: Der globale Dirty-Punkt würde im besten Fall kurz aufflackern und sofort wieder verschwinden. Zudem speichern diese Panels eigene Dateien, nicht `stations.json`, weshalb ein globaler "Speichern & Validieren"-Zwang irreführend wäre.
- **Wann es beißt:** Bei der Abnahme von #202 wird der Entwickler feststellen, dass der versprochene "globale Dirty-Punkt erscheint" (Schritt B5) nicht eintritt und die UX inkonsistent ist.
- **Billige Gegenmaßnahme jetzt:** Im Plan (Abschnitt B4/B5) klarstellen: `markMpzStudioDirty()` wird bei Hub/Embed-Erfolg **entfernt**. Es wird nur `validateNow()` aufgerufen, um den Validierungs-Report zu aktualisieren. Der globale Dirty-Punkt darf hier nicht erscheinen.

### Unvollständige Diskriminierung im optionalen Hotspot-Schema
- **Warum später teuer:** Der Plan schlägt eine `if/then`-Logik in `04-stations-schema.json` vor, bei der `action: "dialog"` bestimmte Medien-Felder und `action: "medium"` Dialog-Felder verbietet. Allerdings ist das Feld `action` in `04-stations-schema.json` nicht als `required` definiert (in `mpz-station-hotspots.ts` ist es optional mit Default `"medium"`). Ein JSON-Objekt ohne `action`-Key würde keines der beiden `if` triggern. Somit greifen die Einschränkungen (z. B. Verbot von `mascot` bei Standard-Medien) bei fehlendem Key ins Leere.
- **Wann es beißt:** Wenn Redakteure oder Automatisierungsscripte die `stations.json` pflegen und `action` weglassen (was aktuell formell erlaubt ist). Der Validator würde ungültige Kombinationen wie einen Hotspot ohne `action`, aber mit `mascot` und `mediumId` gleichzeitig, nicht mehr als Fehler markieren.
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten, dass die Schema-Regel für Medien-Hotspots robuster formuliert werden muss: `not: { properties: { action: { const: "dialog" } } }` (dies deckt explizites `"medium"` sowie das Fehlen des Keys ab). Alternativ muss `action` zwingend ins `required`-Array von `hotspotFlat` und `hotspot360` aufgenommen werden.

### Konsistent: API-Fehler-Mapping
- Plan und bestehender Code (`studio-validation-context.tsx`, `hub-panel.tsx`) stimmen exakt darin überein, dass Formulare weiterhin ausschließlich `json.message` statt strukturierter API-Fehlercodes (`error`) zur Anzeige verwenden (Abschnitt "Context-Client-Fehler"). Diese bewusste Entscheidung verhindert Breaking Changes am bestehenden API-Vertrag der Panel-Routen und erfordert keine Refaktorierungen im Backend.
