---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #208 Save Dashboard

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#208_save_dashboard_6181c036.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md` (Epic #205), `dokumentation/archiv/design/.../studio_precision/DESIGN.md` (Mockup-Referenz S3/S4)
- Code: `app/components/mpz-studio/save-validate-panel.tsx`, `app/components/mpz-studio/studio-validation-context.tsx`, `app/components/mpz-studio/studio-shell.tsx`, `app/components/mpz-studio/studio-dashboard.tsx`, `app/components/mpz-studio/mpz-card.tsx`, `app/components/mpz-studio/mpz-form-alert.tsx`, `app/components/mpz-studio/mpz-form-primitives.ts`
- API: `app/app/api/mpz/save-validate/route.ts`, `app/app/api/mpz/validate/route.ts`
- Vorgänger: #206 ✅, #207 ✅ (implementiert & post-mortemiert)
- Gegenstück: [pre-mortem-1a-208-save-dashboard-2026-06-23.md](./pre-mortem-1a-208-save-dashboard-2026-06-23.md) (Implementierungs-Blocker)

---

### [MpzCard `validation`-Variante ist semantisch falsch benannt und für Error-Tints ein Typsystem-Fallen]

- **Was widersprüchlich/undefiniert ist:** Der Plan ordnet die `validation`-Variante **ausschließlich** dem Success-Fall zu (Z. 90: „Validierungs-Hero-Card (ok): `MpzCard variant="validation"`") und schließt sie für Error explizit aus (Z. 96: „Error-State … **nicht** `validation`-Variante"). Die Begründung (Z. 240): „Kein `success`/`error`-Prop in #208 — YAGNI; Tints im Dashboard-JSX". Die implementierte `MpzCard` ([`mpz-card.tsx`](app/components/mpz-studio/mpz-card.tsx) Z. 27) liefert bei `variant === 'validation'` aber **statisch** `border-l-4 border-l-accent` (grün). Es gibt keinen Severity-Prop. Für den Error-Fall müsste der Consumer via `className` eine eigene Tint setzen — doch `border-l-accent` aus der Variante konkurriert mit jedem manuellen `border-l-error` um dieselbe CSS-Eigenschaft (`border-left-color`). Ohne `tailwind-merge` (nicht im Projekt) entscheidet die Tailwind-v4-Stylesheet-Reihenfolge, nicht die className-Reihenfolge im String, welcher Farb-Stripe gewinnt. Das Typsignal `variant="validation"` sagt „Validierung" — semantisch weder „success" noch „error". Wenn in #209+ (Stationen-Grid) oder künftigen Features eine „Validation mit Warnungen" dazukommt, ist unklar, ob `validation` oder `default` zu verwenden ist. Der Typ verführt zu falschen Annahmen.
- **Warum später teuer:** Ein Rename `validation` → `success` nach zwei weiteren Consumern ist ein Breaking Change über alle Imports. Vorher wird die Error-Tint im Dashboard vermutlich als „funktioniert nicht"-Bug gemeldet — der Implementierende wird versuchen, `!important` oder arbitrary-`[border-left-color:…]`-Workarounds einzubauen, statt die Variante zu erweitern.
- **Wann es beißt:** Bei der manuellen S4-Abnahme des Error-States (`/mpz/studio` mit absichtlich defekter `stations.json`): Die Hero-Card zeigt entweder grün statt rot, oder der Stripe flackert je nach Tailwind-Build. Spätestens in #209 (Stationen-Grid), wenn weitere `MpzCard`-Verwender die Variante übernehmen.
- **Billige Gegenmaßnahme jetzt:** Benenne die Variante semantisch korrekt oder dokumentiere den Vertrag scharf. Drei Optionen:
  1. **(Empfehlung)** Variante umbenennen zu `accented` (streifen-betont, farbneutral) — dann ist `className="border-l-error bg-error/5"` sauber ergänzbar, weil die Variante nur `border-l-4` (ohne Farbe) liefert.
  2. Alternativ: `validation`-Variante **nur** `border-l-4` setzen lassen (ohne `border-l-accent`), Farbe immer via `className`. Dann ist Success `variant="validation" className="border-l-accent bg-accent/5"` und Error `variant="validation" className="border-l-error bg-error/5"`.
  3. Falls YAGNI bleibt: Explizite Note im Plan, dass die Error-Hero **nicht** `MpzCard` nutzt, sondern rohe `<section>` mit eigenen Klassen — dann ist der Vertrag eindeutig (widerspricht aber dem Akzeptanzkriterium „Alle Card-Sektionen nutzen MpzCard", Z. 88).

---

### [SaveValidatePanel-Prop-Vertrag kann Sun/Red-Diskriminierung nicht ausdrücken]

- **Was widersprüchlich/undefiniert ist:** Plan S3 (Z. 80) fordert für den „problems"-Zustand: „!feedback.ok && !feedback.rolledBack — Warn-/Fehler-Tint (**Sun/Red je nach `report`**)". Der aktuelle Prop-Vertrag des Panels ([`save-validate-panel.tsx`](app/components/mpz-studio/save-validate-panel.tsx) Z. 6–9) liefert nur `feedback: SaveValidateFeedback` und `onDismiss`. `SaveValidateFeedback` ([`studio-validation-context.tsx`](app/components/mpz-studio/studio-validation-context.tsx) Z. 16–20) hat genau `{ ok: boolean, rolledBack: boolean, saved: boolean }` — **kein** Severity-Feld, **keine** Fehler-/Warnanzahl. Der Plan-Z. 113 sagt „Props um `running?: boolean`" — mehr nicht. Gleichzeitig verbietet Plan-Z. 122 (Abnahme-Checkliste) eine Änderung des `SaveValidateFeedback`-Typs. Das Panel hat also keinen Zugriff auf `report.stationSummaries` (die einzige Quelle für Fehler-/Warnzählung, vgl. [`studio-dashboard.tsx`](app/components/mpz-studio/studio-dashboard.tsx) Z. 20–21) und kann Sun vs. Red **nicht** unterscheiden. Die Akzeptanzkriteriums-Zeile Z. 80 ist mit dem Prop-Vertrag aus Z. 113+122 unerfüllbar.
- **Warum später teuer:** Der Implementierende steht vor einer Entscheidungsgabel: (a) Panel zeigt bei jedem `!ok` pauschal Rot → verletzt Akzeptanzkriterium für reinen Warnungs-Zustand (Studio hat 0 Fehler, aber 3 Warnungen — User sieht rotes „Probleme"-Banner, obwohl nichts kaputt ist). (b) Panel bekommt `report` als neuer Prop → bricht „Typ unverändert" und bläht das Panel mit Domänenlogik auf, für die es nicht gedacht ist (Separation of Concerns). (c) `SaveValidateFeedback` wird um `severity: 'warn' | 'error'` erweitert → bricht „Typ unverändert" und erfordert Mapping im Context. Jede Option erzeugt Folge-Diskussionen im Review.
- **Wann es beißt:** Bei der S3-Abnahme mit einer Station, die nur Warnungen (nicht Errors) hat. Frontend- und Backend-Integrationstests werden den„Warnungs-Zustand" unterschiedlich interpretieren, je nachdem, welche Option gewählt wird.
- **Billige Gegenmaßnahme jetzt:** Eine der drei Optionen **in den Plan schreiben**, nicht dem Implementierer überlassen:
  - **Empfehlung:** Option (c) — `SaveValidateFeedback` um `hasErrors: boolean` und `hasWarnings: boolean` erweitern (berechnet im Context aus `report.stationSummaries`, vgl. Dashboard-Logik Z. 20–21). Das ist ein 4-Zeilen-Mapping im Context, kein API-Bruch (die POST-Response bleibt identisch), und das Panel erhält einen sauberen Prop-Vertrag für die Tint-Wahl. Alternativ das Akzeptanzkriterium Z. 80 streichen („problems = pauschal Rot") und nur das Dashboard für die Sun/Red-Differenzierung verantwortlich machen — dann ist der Save-Panel-Vertrag schlank, aber das visuelle Ziel („vier unterscheidbare Zustände") wird zu „drei + Rot".

---

### [Race Condition: `validateNow` setzt `saveInProgress=false` und beendet den Save-Running-Indikator vorzeitig]

- **Was widersprüchlich/undefiniert ist:** Plan-Z. 156: „`validateNow`: `setSaveInProgress(false)` zu Beginn (bleibt false)". Plan-Z. 278 (Abnahme-Checkliste): „`saveInProgress` nur während `POST /api/mpz/save-validate`, nicht bei `validateNow`". Beide Aussagen sind logisch kompatibel für den **Sequential-Fall**. Aber der Plan spezifiziert nicht das **parallele** Szenario: Der Nutzer klickt im Dashboard (S4, Z. 92) auf „Erneut prüfen" (`validateNow`), während ein Save läuft (`saveAndValidate`, der via S3-Button Z. 83 getriggert wurde und `saveInProgress=true` gesetzt hat). Da `saveAndValidate` ([`studio-validation-context.tsx`](app/components/mpz-studio/studio-validation-context.tsx) Z. 93–128) und `validateNow` (Z. 65–86) **dieselben** State-Slots (`loading`, `saveInProgress`, `saveFeedback`) teilen und nicht gegenseitig blockieren, setzt der `validateNow`-Aufruf `saveInProgress=false` — der Running-Indikator verschwindet, obwohl der Save-Request noch läuft. Der `loading`-State toggelt dann wild zwischen den beiden Promises (beide haben `setLoading(true/false)` im finally). Die SaveControl-Labels (Z. 83: „Speichert…" vs „Prüft…") flippen während des Saves.
- **Warum später teuer:** Das ist ein klassischer Heisenbug: In Unit-Tests (sequenziell) nicht reproduzierbar, in Produktion bei schneller Klickfolge sichtbar. Der Nutzer sieht „Speichert…" → „Prüft…" → „Speichert…" im Sekundenrhythmus und verliert Vertrauen in den Status. Das `saveFeedback` wird außerdem von `validateNow` nicht angerührt — das alte `saveFeedback` bleibt sichtbar, während `loading` vom neuen `validateNow` getrieben wird. Der State ist inkonsistent („loading vom Prüfen, Feedback vom alten Save").
- **Wann es beißt:** Sofort, wenn ein Nutzer nach Klick auf „Speichern & Validieren" (Save läuft ~1–3s wegen Datei-Write + Validation) innerhalb dieser Zeit auf „Erneut prüfen" im Dashboard klickt. Wahrscheinlich in der manuellen Abnahme, wenn der Tester beide Buttons ausprobiert.
- **Billige Gegenmaßnahme jetzt:** Eine von drei Optionen in den Plan aufnehmen:
  1. **(Empfehlung, minimal)** Den „Erneut prüfen"-Button im Dashboard während `loading || saveInProgress` **disablen** (aktuell disabled er nur bei `loading`, [`studio-dashboard.tsx`](app/components/mpz-studio/studio-dashboard.tsx) Z. 154 — aber `saveInProgress` fehlt im Dashboard-Context-Konsum, Z. 16). Das verhindert die Race konditional. Plan-Z. 93 (Problemliste) und Z. 116 (studio-dashboard.test.tsx) müssten den `saveInProgress`-Konsum ergänzen.
  2. `saveInProgress` in `validateNow` **nicht** anfassen (Plan-Z. 156 streichen). Dann bleibt der Race für `loading`, aber der Save-Indikator bleibt korrekt. Allerdings flippt dann das Button-Label „Speichert…" → „Prüft…" → „Speichert…", weil `loading` von beiden gesetzt wird.
  3. **(sauberstes, größerer Scope)** Einen einfachen Lock im Context: `if (saveInProgress) return` am Anfang von `validateNow`. Das blockiert Re-Validierung während des Saves semantisch korrekt. Erfordert aber UI-Feedback („Save läuft — bitte warten"), was neuen Spec-Bedarf erzeugt.

---

### Positiver Befund: API-Fehlercode-Vertrag konsistent und Spec-konform

Plan, API-Code und Projekt-Konvention (`.cursor/rules/error-conventions.mdc`) stimmen an der kritischsten Stelle überein: Die POST-`/api/mpz/save-validate`-Route ([`route.ts`](app/app/api/mpz/save-validate/route.ts) Z. 57–72) liefert `error: 'IO'` und `error: 'SAVE_VALIDATE_FAILED'` — beides **SCREAMING_SNAKE_CASE**, wie die Projektregel fordert. Der Plan spiegelt das korrekt wider (Z. 202–205: „IO", „SAVE_VALIDATE_FAILED"). Ein Rollback (VALIDATION-Fehler beim Schreiben) liefert **HTTP 200** mit `rolledBack: true` (route.ts Z. 57–59) — kein Fehler-JSON. Der Plan beschreibt das korrekt (Z. 216: „`saveFeedback.rolledBack` → MpzContentIoError VALIDATION gefangen → rollback-error"). Das `report` wird immer abschließend erzeugt (route.ts Z. 76), sodass das Dashboard nach jedem Save (auch Rollback) konsistente Daten hat. Kein `error`-vs-`code`-Widerspruch, keine Legacy-Kleinschreibung, ADR-022 (keine API-Änderung) eingehalten.