# ADR-030 — Migrationsstrategie JSON ↔ Directus und Content-Freeze

**Datum:** 2026-11-02  
**Status:** ersetzt durch [ADR-032](./032-mpz-studio-produktions-admin.md), soweit Directus betroffen ist (2026-11-03)  
**Issue:** [#253](https://github.com/flxln/schulnavigator/issues/253) · Epic E2 · Follow-up [ADR-029](./029-runtime-datenpfad-directus.md) (#252), Spike [#251](https://github.com/flxln/schulnavigator/issues/251)

## Kontext

[ADR-029](./029-runtime-datenpfad-directus.md) legt den Runtime-Lesepfad fest (Directus per Fetch, Fallback auf `stations.json` im Image, Build bleibt JSON-only). Der SoT-Satz dort (Z. 47) und die Delegation „Wer committet `app/data/stations.json` und wie das zum Content-Freeze passt“ (Z. 40) verweisen auf dieses ADR.

**Ist-Stand (#264):** Prod-Content liegt auf `main`. Die Schule deployt von `release/39-gs` ([ADR-028](./028-main-und-release-39-gs.md)). MPZ Studio ([ADR-022](./022-mpz-studio-internes-ingest-tool.md)) schreibt weiterhin lokale JSON-Dateien in der Entwicklung.

Der Directus-Pilot umfasst höchstens **1–2 Räume**; Big-Bang aller Stationen ist außerhalb des Epics. Ohne explizites Übergangsregime entstehen zwei Wahrheiten (JSON vs. Directus) ohne Merge- und Konfliktregeln — das schließt die Council-Konsenslücke zum Content-Freeze.

## Entscheidung

Die vier E2-Fragen aus [epic-directus.md](../planung/epics/epic-directus.md#e2--migrationsstrategie-json--directus-content-freeze--253) werden in vier Blöcken beantwortet. Rahmen-ADRs 022, 028 und 029 werden nicht geändert; dieses ADR präzisiert Migrations- und Freeze-Regeln für den Piloten.

### 1. SoT-Übergangsregime (E2: global vs. pro Raum)

**Pro Slug im Übergang, nicht global.** Directus ist Source of Truth **nur** für die Slugs der **Pilot-Liste** (max. 2 Slugs aus der kanonischen Liste; [#259](https://github.com/flxln/schulnavigator/issues/259) legt sie vor Freeze-Beginn fest). Alle anderen Slugs bleiben JSON-SoT in Git.

**„Global“** (Directus-SoT für alle Stationen) ist ein **Endzustand** und erfordert eine eigene Entscheidung nach dem Pilot-Review ([#261](https://github.com/flxln/schulnavigator/issues/261)); Big-Bang-Migration aller Stationen ist aus dem Epic-Scope ausgeschlossen.

Die Pilot-Liste ist **explizit und versioniert im Repo unter `app/`** (Datei und Format legt [#257](https://github.com/flxln/schulnavigator/issues/257) fest), nicht implizit „was in Directus steht“ und nicht nur als Umgebungsvariable — damit Freeze-Prüfung und Fallback aus Git nachvollziehbar sind. [#259](https://github.com/flxln/schulnavigator/issues/259) vermerkt jeden Pilot-Slug zusätzlich in [verzeichnisstruktur.md](../content/verzeichnisstruktur.md): „SoT Directus seit \<Datum\>, Freeze-Basis \<Commit\>“.

**Merge-Vertrag (Konsumstelle [#257](https://github.com/flxln/schulnavigator/issues/257)):** Konsumstelle ist `stations.ts`. Das gemergte Gesamtdokument entspricht `stations.json` aus dem Image; für jeden Slug der Pilot-Liste ersetzt der Directus-Eintrag den JSON-Eintrag. Directus-Einträge mit Slugs **außerhalb** der Pilot-Liste werden ignoriert. Fehlt ein Pilot-Slug in Directus oder ist Directus nicht erreichbar, gilt der eingefrorene JSON-Eintrag (wie ADR-029-Fallback), nie 404. `validateStationsFile` läuft auf dem gemergten Gesamtdokument (ADR-029 Z. 25).

**Konflikt bei Doppelbearbeitung:** Für Pilot-Slugs gewinnt **immer Directus**. Eine JSON-Änderung an einem Pilot-Slug nach Freeze-Beginn wird per Revert zurückgenommen, nicht nach Directus übertragen. Erkennung: Prüfbefehl aus Abschnitt 2 vor jedem Verschieben von `release/39-gs`.

**Rückabwicklung (Pilot-No-Go):** Entscheidet der Pilot-Review ([#261](https://github.com/flxln/schulnavigator/issues/261)) No-Go, fällt der Slug an JSON zurück: MPZ überträgt den Directus-Stand einmalig von Hand in `stations.json` (ausdrücklich erlaubter redaktioneller Commit), streicht den Slug aus der Pilot-Liste und entfernt den Vermerk in `verzeichnisstruktur.md`. Damit endet der Freeze für diesen Slug.

### 2. Content-Freeze (E2: ja/nein, wann, wie lang)

**Kein globaler Freeze.** Freeze gilt **pro Pilot-Slug**.

- **Beginn:** Migrationsstart in [#259](https://github.com/flxln/schulnavigator/issues/259), festgehalten als **Freeze-Basis** = Commit auf `main`, aus dem #259 den Slug exportiert (Quelle **`main`**, nicht `kunde/39-gs`; [#264](https://github.com/flxln/schulnavigator/issues/264), ADR-028).
- **Dauer:** unbefristet, weil der SoT-Wechsel einseitig ist. Endet nur bei Rückabwicklung (Abschnitt 1) oder späterer Big-Bang-Entscheidung außerhalb dieses Regimes.
- **Nicht-Pilot-Slugs:** keine Einschränkung; Pflege wie heute.

**Wer committet `app/data/stations.json`?** Nur **MPZ (Felix)**, auf `main` über Branches; Lehrkräfte nie; `release/39-gs` wird bewusst verschoben (ADR-028). Zwei Commit-Klassen:

| Klasse | Definition | Pilot-Slugs ab Freeze-Beginn |
|---|---|---|
| **redaktionell** | Änderung an Inhaltsfeldern eines Eintrags: `titel`, `beschreibung`, `bild`, `medien`, `hotspots360`, `panorama360`, `dialog`, `viewer` | **verboten** (Pflege in Directus) |
| **technisch** | inhaltsneutrale Änderung, die alle Einträge gleich trifft (Schema-Migration aus [#256](https://github.com/flxln/schulnavigator/issues/256), Formatierung) | **erlaubt**; Trigger ist eine Schemaänderung; im selben PR wird die Freeze-Basis in `verzeichnisstruktur.md` auf diesen Commit nachgezogen |

Redaktionelle Änderungen an Pilot-Slugs in Git sind verboten; technische Commits bleiben für Build und Fallback nötig (ADR-029 Z. 44/45). Es gilt **nicht** „ab Freeze committet niemand mehr JSON“.

**Prüfbefehl** pro Pilot-Slug (Ausgaben für Freeze-Basis und Ziel-Commit müssen identisch sein; `<ref>` = Freeze-Basis bzw. Ziel-Commit, z. B. vor Verschieben von `release/39-gs`):

```bash
git show <ref>:app/data/stations.json | jq -S --arg s <slug> '.stations[] | select(.slug==$s)'
```

**Fallback-Stand (Konsequenz, kein Rück-Export im Piloten):** Der JSON-Eintrag eines Pilot-Slugs bleibt auf dem Stand der **Freeze-Basis** bis zum Pilot-Review (#261). Im Piloten gibt es **keinen** Rück-Export Directus → JSON und damit keinen automatischen Executor. Bei Directus-Ausfall sehen Besucher für Pilot-Räume den **Freeze-Stand** im Fallback, nicht den zuletzt in Directus publizierten Stand. Ob es später einen Rück-Export gibt, entscheidet der Pilot-Review zusammen mit der Big-Bang-Frage; ein Mechanismus kommt nur per Folge-ADR (naheliegender Kandidat: ADR-029 Option c).

### 3. MPZ Studio (E2: Dual-Write, Rück-Export)

**Dual-Write-Verbot:** Studio schreibt ab Freeze-Beginn **keine** Pilot-Slugs. Bis [#262](https://github.com/flxln/schulnavigator/issues/262) ist das eine Prozessregel für MPZ; ein Verstoß ist ein redaktioneller Commit und fällt unter die Konfliktregel (Revert). Für Nicht-Pilot-Slugs bleibt Studio unverändert nach ADR-022 (dev-only).

Studio ist **kein** Rück-Export-Werkzeug. Technische Sperre oder Warnung für Pilot-Slugs ist Auftrag an #262.

### 4. Kanonische Slugs (E2: QR-fixiert)

Die kanonische Slug-Liste steht in [verzeichnisstruktur.md](../content/verzeichnisstruktur.md) (deckungsgleich mit `stations.json`, 12/12, Stand 2026-11-02). Im ADR wird die Liste nicht dupliziert.

1. **Unveränderlich:** Die bestehenden 12 Slugs dürfen während des Piloten nicht umbenannt werden (gedruckte QR-Codes).
2. **Neuanlage verboten** bis zum Pilot-Review; Öffnung nur per Folge-Entscheidung danach (Epic: „Erweiterungen erst nach Pilot“).
3. **Löschung verboten** (QR zeigt dauerhaft auf den Slug).

Erzwingung technisch in [#256](https://github.com/flxln/schulnavigator/issues/256) (Redaktion ohne create/delete auf Stations-Items, Slug nach Anlage nicht editierbar). Bis dahin Prozessregel: Nur Felix als Directus-Admin legt Pilot-Items an und prüft Admin-Änderungen. Der Merge-Vertrag ignoriert fremde Directus-Slugs ohnehin.

## Begründung

- Big-Bang und globaler Freeze würden 10+ JSON-Stationen ohne Grund blockieren oder widersprechen dem Pilot-Scope.
- ADR-029 verlangt dauerhaft committbares JSON für Build und Fallback; Freeze muss redaktionell vs. technisch trennen.
- Ohne festes Rück-Export-Regime (Studio dev-only, Export-Jobs out of scope) bleibt nur ein benanntes Fallback-Regime — bewusst veraltender Snapshot — statt einer nicht ausführbaren „optionalen“ Sync-Regel.
- Explizite Pilot-Liste im Repo verbindet Freeze-Prüfung, Merge (#257) und #259-Export aus `main`.

## Verworfene Alternativen

- **Globaler SoT-Wechsel (Big-Bang):** Widerspricht Epic-Scope; „global“ bleibt Endzustand nach Pilot-Review.
- **Globaler Freeze aller Slugs:** Blockiert Pflege der nicht migrierten Stationen ohne Nutzen.
- **Pauschales JSON-Commit-Verbot ab Freeze:** Widerspricht ADR-029 Z. 44/45 (Build JSON-only, Runtime-Fallback).
- **Implizite Pilot-Liste „was in Directus steht“:** Ermöglicht SoT-Wechsel ohne nachvollziehbaren Freeze und ohne Git-Prüfung.
- **Regelmäßiger Rück-Export im Piloten:** Kein Executor (Studio dev-only, Export-Jobs außerhalb #253); würde L3-Platzhalter ohne Umsetzung hinterlassen.

## Konsequenzen

- **Fallback-Drift:** Pilot-Räume können im Fallback älteren Inhalt zeigen als Directus live — bewusste Konsequenz bis #261 / Folge-ADR.
- **[#255](https://github.com/flxln/schulnavigator/issues/255):** Vor Verschieben von `release/39-gs` Prüfbefehl (Abschnitt 2) für jeden Pilot-Slug; sonst nur Deploy/Git nach ADR-028.
- **[#256](https://github.com/flxln/schulnavigator/issues/256):** Directus-Rechte und Slug-Constraint (Abschnitt 4); Schema-Migration als technische Commit-Klasse (Abschnitt 2).
- **[#257](https://github.com/flxln/schulnavigator/issues/257):** Merge-Vertrag (Abschnitt 1), Pilot-Liste versioniert unter `app/`.
- **[#259](https://github.com/flxln/schulnavigator/issues/259):** Pilot-Liste festlegen, Freeze-Basis setzen, Vermerk in `verzeichnisstruktur.md`, Export aus `main`.
- **[#261](https://github.com/flxln/schulnavigator/issues/261):** Pilot-Review entscheidet Rück-Export, Neuanlage, Big-Bang, ggf. Rückabwicklung (Abschnitt 1).
- **[#262](https://github.com/flxln/schulnavigator/issues/262):** Studio-Sperre oder Warnung für Pilot-Slugs (Abschnitt 3).
- **Kein App-Code** in #253; Umsetzung der Merge- und Studio-Regeln in den genannten Issues.
