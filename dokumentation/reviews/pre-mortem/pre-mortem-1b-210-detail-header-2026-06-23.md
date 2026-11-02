---
tags:
  - prompt
  - sparring
  - pre-mortem
  - 01b-logik-spec
erstellt: 2026-06-23
---
# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: #210 Detail-Header

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/#210_detail-header_1c8b4463.plan.md`
- Spec: `dokumentation/planung/epic-mpz-studio-v3-visual-polish.md` (Epic #205), `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/02-screens-v2.1-und-user-stories.md`, `dokumentation/archiv/design/mpz-studio-claude-design-cleanup/mockups/SCREEN-MATRIX.md`
- Mockups: `s6_station_detail_header_flat/code.html`, `s6_station_detail_header_360/code.html`, `s6_station_detail_header_issues/code.html`
- Code: `app/components/mpz-studio/station-detail-shell.tsx`, `app/components/mpz-studio/mpz-studio-health.ts`, `app/components/mpz-studio/station-grid.tsx`, `app/components/mpz-studio/studio-shell.tsx`
- Lib/API: `app/lib/mpz-studio-overview.ts`, `app/app/api/mpz/validate/route.ts`
- Vorgänger: #206 ✅, #207 ✅, #209 ✅
- Gegenstück: [pre-mortem-1a-210-2026-06-23.md](./pre-mortem-1a-210-2026-06-23.md) (Implementierungs-Blocker)

---

Positiv: Der im Plan dokumentierte API-Fehlervertrag fuer `GET /api/mpz/validate` passt zum Code: Guard-Fehler kommen als `{ error: 'UNAUTHORIZED' }`, IO-Fehler als `{ error: 'IO', message }`, sonstige Validierungsfehler als `{ error: 'VALIDATION_FAILED', message }`. Die Annahme zu #209 ist ebenfalls verifiziert: `mpz-studio-health.ts` existiert und `station-grid.tsx` nutzt `healthDotClass()`/`healthLabel()` bereits mit `sr-only`-Label.

### Issues-Zaehler nutzt gekappte Mischliste — Fehleranzahl ist nicht aus dem Vertrag ableitbar

- **Warum spaeter teuer:** Der Plan verlangt bei `health === 'error'` die sichtbare Zeile `{issues.length} Validierungsfehler`. Im Code ist `summary.issues` aber keine Fehlerliste, sondern in `mergeHealth()` eine auf drei Eintraege gekappte Mischliste aus Validator-Errors, Dialog-Errors, Warnings und Heuristiken. Damit kann die UI Warnungen oder Heuristiken als Validierungsfehler zaehlen und echte Fehler unterzaehlen.
- **Wann es beisst:** Spaetestens #211, wenn die ausgelassene Error-Notice-Card oder Tab-Deep-Links echte Fehler je Tab brauchen. Auch der Screenshot-Abgleich gegen `s6_station_detail_header_issues` bleibt zufaellig, weil der Mockup-Text `2 Validierungsfehler` aus dem aktuellen `MpzStationOverview`-Vertrag nicht stabil ableitbar ist.
- **Billige Gegenmassnahme jetzt:** Fuer #210 entweder neutral `{issues.length} Problem(e)` anzeigen oder den Report-Vertrag minimal erweitern, z. B. `errorCount`/`warningCount` oder severity-getypte Issues. Erst mit diesem Vertrag sollte das Label `Validierungsfehler` verwendet werden.

### Error-Health ohne Issue-Text ist unterspezifiziert

- **Warum spaeter teuer:** Der Plan setzt `health = summary?.health ?? (station ? 'ok' : 'error')`, zeigt Issues aber nur aus `summary?.issues ?? []`. Bei fehlendem Summary oder fehlender Station entsteht damit ein roter Status ohne sichtbare Begruendung. Gleichzeitig fordert der Plan bei `health === 'error'` eine sichtbare Fehlerzeile. Diese beiden Regeln widersprechen sich fuer genau den Fehlerpfad, in dem der Summary-Vertrag nicht verfuegbar ist.
- **Wann es beisst:** Bei IO- oder Provider-Teilzustanden in `StudioValidationProvider`, bei Detailrouten fuer nicht vorhandene Slugs und bei jedem Folge-Issue, das den Header als verlaessliche Statusquelle nutzt. Nutzer sehen dann `Fehler`, aber keine erklaerende Meldung oder Anzahl.
- **Billige Gegenmassnahme jetzt:** Einen expliziten Fallback-Vertrag festlegen: Wenn `health === 'error'` und `issues.length === 0`, zeigt der Header eine neutrale Meldung wie `Validierungsstatus nicht verfuegbar` oder `Station fehlt in stations.json`. Alternativ: Im Plan festhalten, dass die Fehler-Summary nur fuer `summary`-basierte Health-Zustaende gilt und der Missing-Summary-Pfad separat behandelt wird.

### S6-issues-Mockup und Plan-Scope definieren unterschiedliche Abnahmegrenzen

- **Warum spaeter teuer:** Das S6-issues-Mockup zeigt neben dem Header-Fehlertext auch einen roten Punkt am betroffenen Tab und eine Error-Notice-Card mit Tab-Hinweisen. Der Plan schliesst Tab-Fehlerpunkte und Notice-Card bewusst aus, verlangt aber gleichzeitig einen Screenshot-Abgleich gegen `s6_station_detail_header_issues`.
- **Wann es beisst:** Bei der Abnahme von #210 kann dieselbe Umsetzung je nach Referenz als korrekt oder unvollstaendig gelten. In #211 muss dann moeglicherweise ein neuer Issue-zu-Tab-Vertrag eingefuehrt werden, der die #210-Headerlogik wieder veraendert.
- **Billige Gegenmassnahme jetzt:** Den Plan praezisieren: S6-issues-Screenshot-Abgleich gilt in #210 nur fuer Header, Basis-Tabs und den sichtbaren Status; Tab-Fehlerpunkte und Notice-Card sind explizit Folgeumfang. Wenn sie doch in #210 erwartet werden, braucht der Report vorher einen Vertrag wie `tabIssueCounts` oder `issueTargets`.

### Hub-Format hat drei UI-Wahrheiten

- **Warum spaeter teuer:** Der Plan sagt erst `Chip wie Grid`, entscheidet dann aber `Hub {hubNr}` ohne fuehrende Null. Der aktuelle Grid-Code zeigt `#04`, das S6-Mockup zeigt `Hub 4`, und der Plan erwaehnt beide Muster. Ohne expliziten Formatvertrag bleibt unklar, ob `hubNr` eine kompakte ID oder ein lesbares Label ist.
- **Wann es beisst:** Folge-Issues zum Stationen-Grid, Detail-Header und spaeteren Doku-/Screenshot-Abgleichen erzeugen uneinheitliche Tests und Screenshots. Externe Anleitung kann nicht eindeutig sagen, ob Lehrkraefte `Hub 4`, `#04` oder `04` sehen sollen.
- **Billige Gegenmassnahme jetzt:** Einen kleinen UI-Vertrag festlegen: `Hub {n}` ist das menschenlesbare Detail-Label, `#{nn}` bleibt die kompakte Listen-/Roster-ID. Danach den Plantext `Chip wie Grid` streichen und Tests genau auf diese Trennung ausrichten.
