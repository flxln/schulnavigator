---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #209 Stationen-Grid

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#209_stationen-grid_744818b2.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md` (Epic #205), `dokumentation/archiv/design/.../02-screens-v2.1-und-user-stories.md` (Mockup-Referenz S5)
- Code: `app/components/mpz-studio/station-grid.tsx`, `app/components/mpz-studio/studio-validation-context.tsx`, `app/components/mpz-studio/studio-shell.tsx`, `app/components/mpz-studio/studio-dashboard.tsx`, `app/components/mpz-studio/mpz-card.tsx`, `app/components/mpz-studio/mpz-form-primitives.ts`, `app/components/mpz-studio/studio-dashboard.test.tsx`
- Lib: `app/lib/mpz-studio-overview.ts`, `app/lib/mpz-studio-calib.ts`
- API: `app/app/api/mpz/validate/route.ts`
- Vorgänger: #206 ✅, #207 ✅ (implementiert & post-mortemiert)
- Gegenstück: [pre-mortem-1a-209-stationen-grid-2026-06-23.md](./pre-mortem-1a-209-stationen-grid-2026-06-23.md) (Implementierungs-Blocker)

---

### [`healthDotClass`/`healthLabel` nicht exportiert — Drei-Wahrheiten-Problem bei Health-Farb-Mapping]

- **Was widersprüchlich/undefiniert ist:** Der Plan referenziert `healthDotClass` (Z. 63–67 in `studio-shell.tsx`) und `healthLabel` (Z. 69–72) als wiederverwendbare Quelle für die Ampel-Logik im Grid (Plan Z. 71 + Z. 182). Beide Funktionen sind jedoch **module-private** — nicht exportiert aus `studio-shell.tsx`. Ein Import in `station-grid.tsx` ist ohne Refactor nicht möglich. Gleichzeitig existiert in `station-grid.tsx` bereits eine **eigene** lokale `healthDotClass` (Z. 8–12), die **andere Farben** liefert (`bg-brand-green`/`bg-brand-sun`/`bg-brand-red`) als die Shell-Variante (`bg-accent`/`bg-warn`/`bg-error`). Der Plan sagt (Z. 36), die Ampel soll auf semantische Tokens (`bg-accent`/`bg-warn`/`bg-error`) umgestellt werden — fordert also implizit entweder (a) eine dritte lokale Kopie dieser Logik im Grid, (b) ein Refactor mit Extraktion in ein Shared-Modul oder (c) einen Import, der technisch nicht funktioniert. Keine der drei Optionen ist spezifiziert.
- **Warum später teuer:** Bei jeder künftigen Health-State-Erweiterung (z. B. ein `info`-Zustand) oder Token-Umbenennung müssen drei voneinander unabhängige Kopien gepatcht werden (Shell, bestehendes Grid, künftiges Grid). Die Drift zwischen `brand-*`-Farben und semantischen Tokens ist bereits real — das Dashboard (`studio-dashboard.tsx` Z. 238–247) nutzt wiederum `text-brand-green`/`text-brand-sun`/`text-brand-red` für die KPI-Zahlen, ein viertes Mapping. Wer gewinnt? Die Shell-Variante mit semantischen Tokens oder die Dashboard-Variante mit Brand-Farben? Der Plan entscheidet nicht verbindlich.
- **Wann es beißt:** Sofort bei der manuellen S5-Abnahme: Ampel-Farben im Grid weichen von der Shell-Sidebar ab, wenn der Implementierer die lokale Kopie mit `brand-*`-Klassen behält (naheliegend, da sie schon da ist). Spätestens bei #210 (Station-Detail-Header), wenn ein fünfter Consumer die Health-Ampel braucht und wieder eine eigene Kopie anlegt.
- **Billige Gegenmaßnahme jetzt:** Eine von zwei Optionen in den Plan schreiben:
  1. **(Empfehlung)** `healthDotClass` und `healthLabel` aus `studio-shell.tsx` in ein Shared-Modul extrahieren (z. B. `mpz-studio-health.ts`) und von Shell + Grid + Dashboard importieren. ~10 Zeilen Refactor, einmaliger Aufwand, Drift dauerhaft eliminiert.
  2. Alternativ: Lokale Kopie im Grid explizit im Plan dokumentieren mit Note „bewusst dupliziert, Refactor bei drittem Consumer" — dann ist zumindest klar, dass `brand-*` durch `accent`/`warn`/`error` zu ersetzen ist.

---

### [Ampel Accessibility-Vertrag: `aria-label` vs `aria-hidden` + sr-only — unvollständige Diskriminierung]

- **Was widersprüchlich/undefiniert ist:** Der Plan fordert (Z. 71): „Ampel (`ok`/`warn`/`error` mit `title` + `aria-label` aus `healthLabel`)". Das Shell-Pattern ([`studio-shell.tsx`](app/components/mpz-studio/studio-shell.tsx) Z. 499–504) implementiert dies jedoch als `aria-hidden` auf dem Dot-Element **plus** einem separaten `<span className="sr-only">— {healthLabel(health)}</span>` — nicht als `aria-label` auf dem Dot. Das bestehende Grid (Z. 72–76) hat nur `aria-hidden` ohne sr-only-Text, also eine Accessibility-Lücke im Ist-Zustand. Der Plan spezifiziert nicht, welches der drei Patterns gilt: (a) `aria-label` auf dem Dot-`<span>` (Plan-Wortlaut), (b) `aria-hidden` + sr-only (Shell-Pattern), (c) `title`-only (Ist-Grid). Die semantische Diskriminierung für Screenreader ist undefiniert.
- **Warum später teuer:** Der Implementierer steht vor einer Entscheidungsgabel. Wählt er `aria-label` auf dem Dot (Plan-Wortlaut), widerspricht das dem Shell-Pattern — Inkonsistenz über die Studio-Oberfläche. Wählt er das Shell-Pattern (sr-only), muss er zusätzliche JSX-Struktur einführen, die der Plan nicht beschreibt. Wählt er `title`-only, bleibt die Screenreader-Lücke bestehen. Die manuelle S5-Abnahme wird je nach Interpretation unterschiedlich ausfallen.
- **Wann es beißt:** Bei der Accessibility-Abnahme (NVDA/VoiceOver-Test) oder in #210, wenn der Detail-Header ebenfalls eine Health-Ampel zeigt und das Pattern vereinheitlicht werden muss.
- **Billige Gegenmaßnahme jetzt:** Plan Z. 71 präzisieren auf ein eindeutiges Pattern. Empfehlung: Shell-Pattern übernehmen (es ist bereits getestet und in Produktion): `aria-hidden` auf Dot + `<span className="sr-only">— {healthLabel(health)}</span>` separat. Dann ist der Vertrag scharf und das Grid wird automatisch accessibility-konform.

---

### [Issues-Liste auf Kacheln: Akzeptanzkriterium vs. Offene Frage — intra-Plan-Widerspruch]

- **Was widersprüchlich/undefiniert ist:** Das Akzeptanzkriterium Z. 72 (verbindlich) fordert: „Bei `health !== 'ok'`: bestehende `issues`-Liste (max. 3 Einträge aus `buildStationOverviews` Z. 91–97) unter Badge — kompakt, `text-xs text-fg-3`". Die offene Frage Z. 195 stellt genau dieses Verhalten in Frage: „Sollen Issues bei `warn`/`error` sichtbar bleiben (Ist-Verhalten, hilfreich) oder nur Ampel (näher am Mockup)?". Ein verbindliches Akzeptanzkriterium und eine offene Frage zum selben Feature im selben Dokument sind ein logischer Widerspruch. Der Mockup-S5-Abgleich (Z. 81) zeigt keine Text-Issues — nur Ampel —, was das Akzeptanzkriterium konterkariert. Die Empfehlung in Z. 195 lautet „behalten", was mit Z. 72 übereinstimmt, aber die Frage als solche nicht auflöstbar ist, solange sie als „offen" markiert bleibt.
- **Warum später teuer:** Der Implementierer hat zwei Wahrheiten im selben Dokument. Entscheidet er sich für „Issues entfernen" (mockup-näher), verletzt er das Akzeptanzkriterium Z. 72 — der Test wird fehlschlagen. Entscheidet er sich für „Issues behalten" (AK-konform), weicht er vom Mockup ab — der Screenshot-Abgleich Z. 81 wird Diskussionen auslösen. Das Review wird zur Verhandlung über eine Entscheidung, die vorab getroffen werden sollte.
- **Wann es beißt:** Bei der Abnahme-Konferenz zwischen Entwickler und Designer. Spätestens beim Schreiben von `station-grid.test.tsx` (Plan Z. 12), wo assertions entweder Issues prüfen (AK) oder nicht (Mockup) — der Test-Code zwingt eine Entscheidung, die der Plan offen lässt.
- **Billige Gegenmaßnahme jetzt:** Offene Frage Z. 195 auflösen und das Akzeptanzkriterium Z. 72 anpassen. Empfehlung: AK Z. 72 bleibt verbindlich (Issues behalten), Z. 195 wird zu „Entschieden: Issues bleiben (AK Z. 72) — einziger Inline-Hinweis ohne Dashboard-Besuch." und als geschlossen markiert. Mockup-Z. 81 ergänzen: „S5-Mockup zeigt Happy-Path ohne Issues; Issues-Liste nur bei `warn`/`error` sichtbar (deklarativ, nicht im Mockup dargestellt)."

---

### Positiver Befund: API-Fehlercode-Vertrag konsistent und Spec-konform

Plan, API-Code und Projekt-Konvention (`.cursor/rules/error-conventions.mdc`) stimmen an der kritischsten Stelle überein: Die `GET /api/mpz/validate`-Route ([`route.ts`](app/app/api/mpz/validate/route.ts) Z. 8–26) liefert `error: 'IO'` (500), `error: 'VALIDATION_FAILED'` (500) und `error: 'UNAUTHORIZED'` (401 via Guard) — alles **SCREAMING_SNAKE_CASE**, wie die Projektregel fordert. Der Plan spiegelt das korrekt wider (Z. 149–157). Das Client-Mapping im Context ([`studio-validation-context.tsx`](app/components/mpz-studio/studio-validation-context.tsx) Z. 73–85) übersetzt HTTP-Status in deutschsprachige User-Hinweise (kein Error-JSON nach außen) — konsistent mit dem Dashboard-Pattern. Die Domain-Health-Logik (`mergeHealth` in [`mpz-studio-overview.ts`](app/lib/mpz-studio-overview.ts) Z. 85–110) ist dreistufig (`ok`/`warn`/`error`) vollständig diskriminiert — kein unbeschriebener Pfad. Der Datenfluss über `useStudioValidation()` eliminiert den Doppel-Fetch zuverlässig, da der Provider ([`studio-validation-context.tsx`](app/components/mpz-studio/studio-validation-context.tsx) Z. 139–141) `validateNow` beim Mount triggert. Kein `error`-vs-`code`-Widerspruch, keine Legacy-Kleinschreibung, Epic-Leitplanke (keine API-Änderung) eingehalten.