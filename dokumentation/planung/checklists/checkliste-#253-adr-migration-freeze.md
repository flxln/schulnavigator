# Kurz-Checkliste: Issue #253 – ADR Migrationsstrategie JSON ↔ Directus + Content-Freeze

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike), #252 (ADR-029 Runtime-Datenpfad)  
**Triage:** [triage-#253-adr-migrationsstrategie.md](../triage/triage-%23253-adr-migrationsstrategie.md) · 2026-11-02  
**Verifikationsprofil:** Standard (B=1)  
**Gehärtet:** nach Pre-Mortem 1b ([pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md](../../reviews/pre-mortem/pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md)), 2026-11-02, Opus 5.5 / ◆. 01a entfällt (LIGHT).

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` mit **nächster freier Nummer** (beim Anlegen `ls dokumentation/adr/`; Stand 2026-11-02: **030**, #254 kann auf 031+ rutschen).
- ADR beantwortet die vier E2-Fragen aus [epic-directus.md](../epics/epic-directus.md#e2--migrationsstrategie-json--directus-content-freeze--253) mit den Entscheidungen D-1 bis D-9 unten. Kein eigenes Abwägen im ADR-Text, keine neuen Varianten.
- **SoT-Wechsel** ist als Übergangsregime formuliert: SoT pro Slug während des Piloten, „global“ nur als Endzustand nach einer Big-Bang-Entscheidung außerhalb dieses Epics. Merge-Konsumstelle und Konfliktregel stehen im ADR (D-1 bis D-3)².
- **Freeze-Regeln** sind für #259 mechanisch anwendbar: Beginn (Freeze-Basis-Commit), betroffene Slugs (Pilot-Liste), Dauer, Commit-Klassen „redaktionell“ und „technisch“ mit Owner, Prüfbefehl (D-4, D-5)¹.
- **Fallback-Drift** ist als bewusste Konsequenz ausgesprochen: Fallback-JSON eines Pilot-Slugs bleibt auf dem Freeze-Stand bis zum Pilot-Review, kein Rück-Export im Piloten (D-6)¹³.
- **MPZ Studio:** Dual-Write-Verbot pro Pilot-Slug; Studio ist kein Rück-Export-Werkzeug (D-7)³.
- **Kanonische Slugs:** drei Teilaussagen (unveränderlich, keine Neuanlage, keine Löschung) plus Erzwingung bis #256 per Prozess (D-9)⁴.
- Konsistenz mit [ADR-029](../../adr/029-runtime-datenpfad-directus.md) (Directus als SoT, c-Re-Trigger/Git-Satz Z. 40, Build JSON-only Z. 45), [ADR-028](../../adr/028-main-und-release-39-gs.md) (`main` / `release/39-gs`), [ADR-022](../../adr/022-mpz-studio-internes-ingest-tool.md) (Studio dev-only, befristet). Diese drei ADRs werden **nicht** geändert.
- Eintrag in [`dokumentation/entscheidungen.md`](../../entscheidungen.md); Folgen für **#255, #256, #257, #259, #261, #262** benannt, ohne deren Umsetzung².
- Kein App-Code geändert.

## Entscheidungen aus der Härtung

Vorgaben für den ADR-Text (Schritt 03). Spalte „Fund“ verweist auf das Pre-Mortem 1b.

| # | Frage | Entscheidung | Fund |
|---|---|---|---|
| D-1 | SoT global oder pro Raum? | **Pro Slug im Übergang.** Directus ist SoT genau für die Slugs der **Pilot-Liste** (max. 2 Slugs aus der kanonischen Liste, #259 legt sie vor Freeze-Beginn fest). Alle anderen Slugs bleiben JSON-SoT. „Global“ ist Endzustand und braucht eine eigene Entscheidung nach dem Pilot-Review (#261); Big-Bang ist laut Epic draußen. Die Pilot-Liste ist **explizit und versioniert im Repo unter `app/`** (Datei und Format legt #257 fest), nicht implizit „was in Directus steht“ und nicht nur als Env-Variable, damit Freeze-Prüfung und Fallback aus Git nachvollziehbar sind. #259 vermerkt jeden Pilot-Slug zusätzlich in [verzeichnisstruktur.md](../../content/verzeichnisstruktur.md): „SoT Directus seit <Datum>, Freeze-Basis <Commit>“. | L2 |
| D-2 | Merge-Vertrag (Konsumstelle für #257) | Konsumstelle ist `stations.ts` (#257). Gesamtdokument = `stations.json` aus dem Image; für jeden Slug der Pilot-Liste ersetzt der Directus-Eintrag den JSON-Eintrag. Directus-Einträge mit Slugs **außerhalb** der Pilot-Liste werden ignoriert. Fehlt ein Pilot-Slug in Directus oder ist Directus nicht erreichbar, gilt der eingefrorene JSON-Eintrag (wie ADR-029-Fallback), nie 404. Validator läuft auf dem gemergten Gesamtdokument (ADR-029 Z. 25). | L2, L4 |
| D-3 | Konfliktregel bei Doppelbearbeitung | Für Pilot-Slugs gewinnt **immer Directus**. Eine JSON-Änderung an einem Pilot-Slug nach Freeze-Beginn wird per Revert zurückgenommen, nicht nach Directus übertragen. Erkennung: Prüfbefehl aus D-5 vor jedem Verschieben von `release/39-gs`. | L2 |
| D-4 | Freeze ja/nein, wann, wie lang | **Kein globaler Freeze.** Freeze gilt pro Pilot-Slug. **Beginn:** Migrationsstart in #259, festgehalten als **Freeze-Basis** = Commit auf `main`, aus dem #259 den Slug exportiert (Quelle `main`, nicht `kunde/39-gs`; Epic-Ist-Stand #264, ADR-028). **Dauer:** unbefristet, weil der SoT-Wechsel einseitig ist. Endet nur bei Rückabwicklung (D-8). Nicht-Pilot-Slugs: keine Einschränkung, Pflege wie heute. | L1 |
| D-5 | Wer committet noch `app/data/stations.json`? (Delegation aus ADR-029 Z. 40) | Nur **MPZ (Felix)**, auf `main` über Branches; Lehrkräfte nie; `release/39-gs` wird bewusst verschoben (ADR-028). Zwei Commit-Klassen: **redaktionell** = Änderung an Inhaltsfeldern eines Eintrags (`titel`, `beschreibung`, `bild`, `medien`, `hotspots360`, `panorama360`, `dialog`, `viewer`): für Pilot-Slugs ab Freeze-Beginn verboten, für alle anderen Slugs erlaubt. **Technisch** = inhaltsneutrale Änderung, die alle Einträge gleich trifft (Schema-Migration aus #256, Formatierung): auch für Pilot-Slugs erlaubt; Trigger ist eine Schemaänderung; im selben PR wird die Freeze-Basis in `verzeichnisstruktur.md` auf diesen Commit nachgezogen. **Prüfbefehl** pro Pilot-Slug: siehe Implementierungsnotizen, Ausgaben für Freeze-Basis und Ziel-Commit müssen identisch sein. | L1 |
| D-6 | Fallback-Stand und Rück-Export | Regime **(b) bewusst veraltender Fallback:** Der JSON-Eintrag eines Pilot-Slugs bleibt auf dem Stand der Freeze-Basis bis zum Pilot-Review (#261). Im Piloten **kein Rück-Export** Directus → JSON, also kein Executor nötig. Als Konsequenz im ADR: Bei Directus-Ausfall sehen Besucher für Pilot-Räume den Freeze-Stand. Ob es einen Rück-Export gibt, entscheidet der Pilot-Review zusammen mit der Big-Bang-Frage; ein Mechanismus kommt nur per Folge-ADR (naheliegender Kandidat: ADR-029 Option c). | L1, L3 |
| D-7 | MPZ Studio: Dual-Write, Rück-Export | **Dual-Write-Verbot:** Studio schreibt ab Freeze-Beginn keine Pilot-Slugs. Bis #262 ist das eine Prozessregel für MPZ; ein Verstoß ist ein redaktioneller Commit und fällt unter D-3 (Revert). Für Nicht-Pilot-Slugs bleibt Studio unverändert nach ADR-022 (dev-only). Studio ist **kein** Rück-Export-Werkzeug. Technische Sperre oder Warnung für Pilot-Slugs ist Auftrag an #262. | L3 |
| D-8 | Rückabwicklung bei Pilot-No-Go | Entscheidet der Pilot-Review (#261) No-Go, fällt der Slug an JSON zurück: MPZ überträgt den Directus-Stand einmalig von Hand in `stations.json` (ausdrücklich erlaubter redaktioneller Commit), streicht den Slug aus der Pilot-Liste und entfernt den Vermerk in `verzeichnisstruktur.md`. Damit endet der Freeze für diesen Slug. | L2 |
| D-9 | Kanonische Slugs (QR-fixiert) | (1) Die 12 Slugs aus `verzeichnisstruktur.md` sind unveränderlich (deckungsgleich mit `stations.json`, 12/12, verifiziert 2026-11-02). (2) **Neuanlage verboten** bis zum Pilot-Review; Öffnung nur per Folge-Entscheidung danach (Epic: „Erweiterungen erst nach Pilot“). (3) **Löschung verboten** (gedruckte QR-Codes). Erzwingung technisch in #256 (Redaktion ohne create/delete auf Stations-Items, Slug nach Anlage nicht editierbar). Bis dahin Prozessregel: Nur Felix als Directus-Admin legt Pilot-Items an und prüft Admin-Änderungen. D-2 ignoriert fremde Slugs ohnehin. | L4 |

## Ausführungs-Checkliste

1. ~~**01b Pre-Mortem**~~ erledigt (GLM 5.3 / ‡ Cline, 2026-11-02): [pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md](../../reviews/pre-mortem/pre-mortem-1b-adr-migration-freeze-253-2026-11-02.md), vier Funde L1 bis L4.
2. ~~**02 Plan härten**~~ erledigt (Opus 5.5 / ◆, 2026-11-02): Entscheidungstabelle D-1 bis D-9, AC und Verifikation angepasst; kein `.cursor/plans/`.
3. ~~**Issue-Datei:** Frontmatter, Ziel, Akzeptanzkriterien, Checklisten-Link~~ in Schritt 0 erledigt⁵. ~~In 03 nachziehen: AC-Zeile „Folgen für #255, #259, #262“ um **#256, #257, #261** ergänzen²~~ erledigt (2026-11-02, 03).
4. ~~**Vor 03 aufräumen:** `dokumentation/planung/issues/Untitled` (untracked, Inhalt nur `/clear`) löschen, damit es nicht in den 5a-Sammelcommit gerät⁵~~ erledigt (2026-11-02, 03).
5. ~~**ADR anlegen:**~~ `030-migrationsstrategie-content-freeze.md` (2026-11-02, 03).
6. ~~**ADR-Inhalt:**~~ D-1 bis D-9 in vier Blöcken, verworfene Alternativen, Konsequenzen 6c (2026-11-02, 03).
7. ~~**`entscheidungen.md`:**~~ Zeile ADR-030 (2026-11-02, 03).
8. ~~**03 Implementieren**~~ erledigt (Composer, 2026-11-02); Verifikation unten.
9. ~~**04 Post-Mortem** kompakt~~ erledigt (2026-11-02, [post-mortem-253-2026-11-02.md](../../reviews/post-mortem/post-mortem-253-2026-11-02.md), Go für 05a) · ~~**05a Abschließen**~~ erledigt (2026-11-02, 5a).

## Implementierungsnotizen

- Prüfbefehl D-5 (so in den ADR übernehmen, `<ref>` = Freeze-Basis bzw. Ziel-Commit, z. B. `release/39-gs`)¹:

  ```bash
  git show <ref>:app/data/stations.json | jq -S --arg s <slug> '.stations[] | select(.slug==$s)'
  ```

- Im ADR keine Formulierung „ab Freeze committet niemand mehr JSON“. Richtig ist: redaktionelle Änderungen an Pilot-Slugs sind verboten, technische bleiben erlaubt (D-5)¹.
- „Optional Rück-Export“ nicht als offene Option stehen lassen. D-6 ist die Entscheidung, die Frage nach einem Mechanismus wandert an den Pilot-Review³.
- Die Epic-Tabelle nennt für #259 noch „Quelle `kunde/39-gs`“. Der ADR legt die Quelle über D-4 auf `main` fest; die Epic-Zeile korrigiert 5a, nicht 03.

## Verifikation

- `ls dokumentation/adr/` → genau eine neue Migrations-/Freeze-ADR; Nummer = höchste vorherige +1.
- `rg -i "freeze|migration|slug|studio" dokumentation/adr/NNN-*.md` trifft alle vier E2-Themen; Verweis auf ADR-029 SoT-Satz.
- `rg -i "Pilot-Liste|Freeze-Basis|redaktionell|technisch" dokumentation/adr/NNN-*.md` trifft D-1, D-4, D-5¹².
- `rg -i "jq -S" dokumentation/adr/NNN-*.md` → Prüfbefehl aus D-5 steht im ADR¹.
- ADR enthält den Fallback-Satz aus D-6 („Freeze-Stand“ bei Directus-Ausfall) und keinen offenen Rück-Export³.
- ADR enthält die drei Slug-Teilaussagen (unveränderlich, Neuanlage, Löschung) und die Prozessregel bis #256⁴.
- `rg "Migrationsstrategie\|Content-Freeze" dokumentation/entscheidungen.md` → Link stimmt mit Dateiname.
- ADR nennt **#255, #256, #257, #259, #261, #262** mit je einer Folge aus 6c; #255 nur Deploy/Git².
- `git diff --name-status main -- dokumentation/adr/022-* dokumentation/adr/028-* dokumentation/adr/029-*` → leer (Rahmen-ADRs unverändert).
- `git diff --name-status main` → nur `dokumentation/` (Pipeline-Artefakte ausgenommen prüfen); `issues/Untitled` taucht nicht auf⁵.
- `cd app && npm run build` grün (kein Code-Diff erwartet).

## Verifikationsergebnisse (03 Implementieren, 2026-11-02)

| Prüfung | Ergebnis |
|---|---|
| `ls dokumentation/adr/` → genau `030-migrationsstrategie-content-freeze.md` neu (029 + 1) | OK |
| `rg -i "freeze\|migration\|slug\|studio" dokumentation/adr/030-*.md` (vier E2-Themen; SoT-Verweis ADR-029 im Kontext) | OK |
| `rg -i "Pilot-Liste\|Freeze-Basis\|redaktionell\|technisch" dokumentation/adr/030-*.md` | OK |
| `rg -i "jq -S" dokumentation/adr/030-*.md` → Prüfbefehl D-5 | OK |
| D-6: „Freeze-Stand“ bei Directus-Ausfall; kein offener Rück-Export im Piloten | OK (Abschnitt 2 Fallback-Stand) |
| D-9: drei Teilaussagen + Prozessregel bis #256 | OK (Abschnitt 4) |
| `rg "Migrationsstrategie\|Content-Freeze" dokumentation/entscheidungen.md` → Link `030-migrationsstrategie-content-freeze.md` | OK |
| ADR Konsequenzen: #255, #256, #257, #259, #261, #262 je eine Folge; #255 nur Deploy/Prüfbefehl | OK |
| `git diff --name-status main -- dokumentation/adr/022-* dokumentation/adr/028-* dokumentation/adr/029-*` | OK (leer) |
| `git diff --name-status main` → nur `dokumentation/` (+ untracked ADR-030); kein `app/`; `issues/Untitled` fehlt | OK |
| `cd app && npm run build` | OK (Exit 0) |

## Referenzen

- Issue [#253](https://github.com/flxln/schulnavigator/issues/253) · Epic E2 · Council [2026-07-06](../../reviews/council-directus-planung-2026-07-06.md) (Content-Freeze-Lücke)
- ADR-029 [#252](../checklists/checkliste-%23252-adr-runtime-datenpfad.md) · Spike [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md)
- #259 Pilot · #262 MPZ Studio Read-only/Warnung

## Nicht in Scope

- Pilot-Migration (#259), Collections (#256), Lesepfad (#257), Prod-Deploy (#255), Medien-ADR (#254).
- MPZ-Studio-Code, Export-Jobs, Directus-Schema-Umsetzung.
- Big-Bang aller Stationen; Mandantenfähigkeit.

## Offene Punkte

- Keine. Die vier Spec-Lücken aus 01b sind in D-1 bis D-9 entschieden. G1 bleibt entfallen: Der Freeze ist nach der Härtung nicht strittig, keine Hochstufung auf VOLL. G2: kein ungelöster Blocker, keine Fable-Eskalation.

## Änderungslog

- 2026-11-02, Schritt 02 (Opus 5.5):
  - ¹ 1b L1: Commit-Klassen redaktionell/technisch mit Owner, Trigger und `jq`-Prüfbefehl (D-5); Freeze pro Slug mit Freeze-Basis auf `main` (D-4); Fallback-Drift als Konsequenz (D-6).
  - ² 1b L2: Übergangsregime SoT pro Slug mit expliziter Pilot-Liste (D-1), Merge-Vertrag für #257 (D-2), Konfliktregel Directus gewinnt (D-3), Rückabwicklung (D-8); #256, #257, #261 in AC, Schritt 3, 6c und Verifikation ergänzt.
  - ³ 1b L3: Rück-Export auf Regime (b) festgelegt, kein Executor im Piloten, Mechanismus nur per Folge-ADR nach Pilot-Review (D-6); Studio ist kein Rück-Export-Werkzeug (D-7).
  - ⁴ 1b L4: Slug-Regel in drei Teilaussagen (unveränderlich, keine Neuanlage, keine Löschung) mit Prozessregel bis #256 (D-9).
  - ⁵ 1b Nebenbefunde: Schritt 3 als in Schritt 0 erledigt markiert; neuer Schritt 4 entfernt `issues/Untitled` vor 03.
