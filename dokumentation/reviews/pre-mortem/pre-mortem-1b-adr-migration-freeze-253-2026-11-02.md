---
tags:
  - pre-mortem
  - 01b-logik-spec
  - adr-migration-freeze
  - issue-253
erstellt: 2026-11-02
ziel-artefakt: dokumentation/planung/checklists/checkliste-#253-adr-migration-freeze.md
artefakt-typ: checkliste
issue: "#253"
modell: glm-5.3
harness: cline (effort high)
gegenstück: entfällt — 01a bei LIGHT gestrichen (Triage, 2026-11-02)
typ: wissen
---

# Pre-Mortem 1b — ADR Migrationsstrategie + Content-Freeze #253 (Logik, Spec-Konsistenz & API-Vertrag)

**Geprüft:** Kurz-Checkliste `checkliste-#253-adr-migration-freeze.md` als System mit: Epic `epic-directus.md` (E2 Offen-Fragen Z. 106–110, Scope Z. 126–130, Risiko-Tabelle Z. 132–141), ADR-029 (Konsequenzen Z. 44–52: Build bleibt JSON-only, Runtime-Fallback, SoT-Satz Z. 47; Option-c-Absatz Z. 40 delegiert „Wer committet `app/data/stations.json` und wie das zum Content-Freeze passt" an #253), ADR-028 (`main` Stamm, `release/39-gs` Zeiger, Auto-Deploy aus), ADR-022 (Studio dev-only, nie Coolify; Befristung Z. 48), Council 2026-07-06 (Content-Freeze-Konsenslücke Z. 144, Chairman-Punkt 5), Issue-Datei `issue-253-d05-adr-migration.md`, Triage `triage-#253-adr-migrationsstrategie.md` (Aktiv-Tabelle Z. 106–111), Spike-Bericht (Slug-Mapping `station.slug` → `stations.slug`, Input+unique, Z. 95; Runtime-Merge ersetzte Pilot-Station im Build-JSON-Gesamtdokument, Z. 134–140), `content/verzeichnisstruktur.md` (kanonische Slug-Liste Z. 9–26), `app/data/stations.json` (Slugs gegen Liste verifiziert), `entscheidungen.md` (Index/Konventionen), ADR-Verzeichnis (`ls`: höchste Nummer 029), Vor-Pre-Mortem `pre-mortem-1b-adr-runtime-252-2026-11-02.md` (u. a. L5 Nummern-Race). Fokus: Sind die vier E2-Fragen mit den Rahmen-ADRs 022/028/029 und dem Epic-Scope als System vereinbar? Sind die Freeze-Regeln für #259 mechanisch anwendbar, oder bleiben Entscheidungen, die #256/#257/#259 selbst treffen müssten?

**Gesamturteil:** Die Checkliste ist als Fahrplan stimmig — die vier E2-Fragen sind vollständig abgedeckt, die Council-Lücke (Content-Freeze) ist korrekt als eigener Schritt-5-Auftrag verankert, die Nummern-L5-Lehre aus #252 ist umgesetzt („nächste freie Nummer beim Anlegen", #254-Rennen benannt), und „Nicht in Scope" schützt vor Pilot-/Big-Bang-Drift. Es gibt aber **vier vertragsbezogene Funde**, die alle in Schritt 02 (Härtung der Checkliste) bzw. als Formulierungs-Vorgaben für den ADR-Text billig zu schließen sind: (L1) die Freeze-Regel diskriminiert nicht zwischen **redaktionellen** und **technischen** JSON-Commits — Letztere braucht der Build-/Fallback-Vertrag aus ADR-029 dauerhaft, ein pauschales Commit-Verbot widerspricht ihm; (L2) die E2-Frage „SoT global vs. pro Raum" hat ohne definiertes **Übergangsregime** keinen widerspruchsfreien Antwortraum (global = Big-Bang, der laut Epic draußen ist), und die AC verlangt Folgen nur für #255/#259/#262 — nicht für #256/#257, bei denen allein der Merge-/Lesepfad-Vertrag landen kann; (L3) „optionaler Rück-Export" hat keinen Executor: Studio ist dev-only und befristet (ADR-022/#262), Studio-Code und Export-Jobs stehen explizit außerhalb des Scopes — eine Regel ohne ausführbaren Mechanismus; (L4) die Slug-Regel „unveränderlich" deckt Umbenennung, aber weder Neuanlage noch Löschung während des Piloten — beides ist technisch möglich (Directus-Feld ist freies Input, Erzwingung kommt erst in #256). Kein Fund verlangt neuen Scope, Messungen oder Studio-Code.

---

## Funde

### L1 — Freeze-Regel diskriminiert nicht zwischen redaktionellen und technischen JSON-Commits (Kollision mit dem Build-/Fallback-Vertrag aus ADR-029)

- **Was widersprüchlich ist:** Das AC verlangt Freeze-Regeln mit „wer committet noch JSON" (Z. 12) — als Eigenschaft des Freeze-Zeitfensters. ADR-029 macht `app/data/stations.json` aber **dauerhaft** zu einem technischen Artefakt: Der Build bleibt JSON-only (`generateStaticParams()` liest `stations.json`, ADR-029 Z. 45), und der Runtime-Fallback bei Directus-Ausfall ist das JSON im Image (Z. 44). Bis #257 den Build-Pfad ändert — und darüber hinaus für den Fallback — muss JSON also weiterhin committet werden dürfen, nur eben nicht mehr redaktionell. Die Checkliste kennt diese beiden Commit-Klassen nicht; „eine Wahrheit pro Slug/Zeitraum" (Schritt 5, Z. 23) regelt die Wahrheit, aber nicht den Sync-Mechanismus für Build/Fallback. Ein ADR, das „ab Freeze committet niemand mehr JSON" sagt, widerspricht ADR-029 Z. 40/45 — wo genau diese Frage an #253 delegiert wurde.
- **Warum später teuer:** #259 müsste die Regel beim ersten Anwendungsfall brechen (Fallback-Stand aktualisieren) oder der Fallback-Inhalt driftet unbemerkt und die ADR-Aussage ist beim ersten Directus-Ausfall falsch. Heilung nur per Folge-ADR unter Zeitdruck im Piloten.
- **Wann es beißt:** #259 (Pilot-Migration, B=2) beim ersten Publish nach Freeze; #257, sobald Build-Pfad und Fallback-Vertrag umgesetzt werden.
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 das AC „Freeze-Regeln … ohne Interpretation anwendbar" um zwei Sätze präzisieren: Freeze verbietet **redaktionelle** JSON-Änderungen (Pflege via Studio/Editor); **technische** JSON-Stände (Build-Params, Fallback-Snapshot) bleiben erlaubt, mit benanntem Owner (MPZ) und Aktualisierungstrigger. Der ADR-Text muss eine Variante explizit aussprechen: „Fallback-JSON veraltet bewusst bis #257" oder „technischer Sync-Stand wird per Prozess gepflegt".

### L2 — SoT-Frage „global vs. pro Raum" ohne Übergangsregime unlösbar; Folge-Issues #256/#257 fehlen in AC und Verifikation

- **Was widersprüchlich ist:** Das Epic schließt Big-Bang aus (Scope Z. 128/130: „Migration und Pilot für 1–2 Räume" drin, „Big-Bang-Migration aller 11+ Stationen" draußen), der Pilot ist #259 mit 1–2 Räumen. Eine Antwort „SoT wechselt **global** zu Directus" wäre zum Pilot-Zeitpunkt faktisch falsch — 10+ Stationen leben weiter in JSON; genau das ist die Zwei-Wahrheiten-Situation („Schema-Drift MPZ Studio (JSON) vs. Directus (DB)", Epic Z. 137), deren Gegenmaßnahme #253 sein soll. Eine Antwort „**pro Raum**" braucht ein definiertes Übergangsregime (JSON SoT für untermigrierte Stationen, Directus SoT für den Pilot-Raum, Merge-/Konsumstelle, Konfliktregel) — der zugehörige Vertrag liegt laut ADR-029 Z. 25 bei #256/#257. Die AC (Z. 14) und die Verifikation (Z. 33) verlangen Folgen aber nur für #255/#259/#262 — die beiden Issues fehlen, ohne die eine „pro Raum"-Entscheidung nicht umsetzbar ist.
- **Warum später teuer:** Ein ADR, das den Wechsel ohne Übergangssemantik ausspricht, zwingt #256 (Collections — für welche Stationen gelten sie?), #257 (Lesepfad-Merge zweier Quellen) und #259 (Migrations-Reihenfolge, Abgleich), den Übergang jeweils neu zu interpretieren — drei Auslegungen statt einem Vertrag; im schlimmsten Fall baut #257 einen Merge, den die ADR nicht deckt.
- **Wann es beißt:** Sofort nach ADR-Abschluss: #256/#257-Planung (Welle 2) und #259 (Welle 3, B=2, VOLL/Fable) bauen direkt auf der Antwort auf.
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 AC ergänzen: „ADR definiert das Übergangsregime explizit (SoT pro Raum bis zur vollständigen Migration — Reihenfolge, Merge-Konsumstelle, Konfliktregel bei Doppelbearbeitung — und ‚global' als Endzustand)" und „Folgen für #256/#257 benannt"; Verifikationszeile Z. 33 entsprechend erweitern.

### L3 — „Optionaler Rück-Export" ohne Executor: Studio ist dev-only und befristet, Export-Jobs und Studio-Code stehen außerhalb des Scopes

- **Was widersprüchlich ist:** Checkliste Z. 11/23: MPZ Studio mit „Dual-Write-Verbot, optional Rück-Export". ADR-022 Z. 43/48: Studio ist **dev-only**, wird „nie auf Coolify aktiviert" und nach Directus-Migration „eingefroren oder nur noch für Migration/Massenimport genutzt"; #262 begrenzt Studio nach Go auf Dev-/Notfall-Ingest (Epic Z. 27). Gleichzeitig: „Nicht in Scope: MPZ-Studio-Code, Export-Jobs" (Z. 46) und „Kein App-Code geändert" (Z. 15). Entschließt sich die ADR zu einem **regelmäßigen** Rück-Export (z. B. „Fallback-JSON wird per Rück-Export aktuell gehalten"), existiert dafür kein Executor: nicht Studio (dev-only, befristet), kein Export-Job (out of scope), kein App-Code (verboten). „Optional" ohne Regime ist keine Entscheidung, sondern ein Platzhalter, der die L1-Frage (Fallback-Drift) offen lässt.
- **Warum später teuer:** Die Regel wird entweder still ignoriert (Fallback driftet, die ADR beschreibt eine Wahrheit, die es so nicht gibt) oder sie erzeugt ein ungeplantes Folge-Issue während des Piloten — genau das Fenster, in dem #259/#261 (DoD „ohne Felix") keine Kapazität für Werkzeugbau haben.
- **Wann es beißt:** #259/#261 im Pilotbetrieb — spätestens beim ersten Directus-Ausfall, wenn der Fallback-Inhalt den Erwartungen aus der ADR widerspricht.
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 den Rück-Export auf ein benennbares Regime festlegen (eine von drei Varianten reicht): (a) einmalig/manuell beim Pilot-Milestone durch MPZ in dev (mit ADR-022/#262 vereinbar), (b) bewusst veraltender Fallback bis #257 (dann explizit als Konsequenz aussprechen), oder (c) Folge-Issue für einen Export-Job benennen — ohne Umsetzung in #253.

### L4 — Slug-Regel „unveränderlich" deckt Umbenennung, aber weder Neuanlage noch Löschung während des Piloten

- **Was widersprüchlich ist:** `verzeichnisstruktur.md` Z. 9–11 fixiert die 12 Slugs über gedruckte QR-Codes und regelt damit die **Umbenennung** („Keine Umbenennung ohne neue QR-Drucke"). Nicht geregelt: **Neuanlage** (neue Station ohne gedrucktes QR — erlaubt?) und **Löschung** (QR zeigt dauerhaft auf 404). Beides ist technisch möglich: Das Directus-Mapping macht `stations.slug` zum freien `Input, unique`-Feld (Spike Z. 95), Erzwingung „folgt technisch" erst in #256 (Checkliste Z. 23). Das Epic-Risiko „Scope-Creep Rollenmodell (‚neue Stationen anlegen')" ist mit „Erweiterungen erst nach Pilot" beantwortet (Epic Z. 139) — diese Antwort muss die ADR für die Slug-Liste aussprechen, sonst rät #256, ob Admin neue Stationen anlegen darf, und #259 hat keine mechanische Regel (das AC verlangt „betroffene Slugs", Z. 12).
- **Warum später teuer:** Eine während des Piloten still geöffnete Slug-Liste kollidiert mit dem Rollenmodell-Freeze und dem QR-Versprechen; eine Löschung bricht gedruckte QR-Codes dauerhaft. Nachträglich heißt das: Folge-ADR oder Notfall-Redirect-Diskussion.
- **Wann es beißt:** #256 (Collections: Rechte auf `stations`-Items, Slug-Constraint), #259 (Pilot-Regelwerk „betroffene Slugs"), #261 (DoD-Pilot).
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 das AC „kanonische Slugs (QR-fixiert)" zu drei Teilaussagen präzisieren: (1) bestehende 12 Slugs unveränderlich (Beleg: `verzeichnisstruktur.md` ≡ `stations.json`, 12/12, verifiziert 2026-11-02), (2) Neuanlage während des Piloten verboten, Öffnung erst nach Pilot-Review, (3) Löschung verboten (QR). Erzwingung an #256 delegiert; bis dahin gilt eine Prozessregel (wer prüft den Verstoß).

---

## E2-Fragen gegen die Rahmen-ADRs (Arbeitstabelle für Schritt 02)

Vorbereitung der in Schritt 2 vorgesehenen Entscheidungstabelle; „Beleg" = Datei/Zeile, die die Randbedingung setzt.

| E2-Frage (Epic Z. 110) | Antwortraum | Harte Randbedingung (Beleg) | zwingend zu nennende Folge-Issues |
|---|---|---|---|
| SoT-Wechsel global vs. pro Raum | pro Raum im Übergang + „global" als Endzustand | kein Big-Bang (Epic Z. 130); Runtime liest gemergtes Gesamtdokument, Merge-Strategie bei #256/#257 (ADR-029 Z. 25); SoT-Satz ADR-029 Z. 47 | #256, #257, #259 (→ L2) |
| Content-Freeze ja/nein/wann/Dauer | Fenster + Commit-Klassen + Owner | Build bleibt JSON-only bis #257 (ADR-029 Z. 45); Studio schreibt weiter dev-JSON während des Aufbaus (Epic Z. 108); Deploy-Hebel ist `release/39-gs` (ADR-028) | #259, #255 nur Deploy/Git (→ L1) |
| MPZ Studio: Dual-Write-Verbot, Rück-Export | Verbot pro Slug/Zeitraum + Rück-Export-Regime (a/b/c) | Studio dev-only, nie Coolify, befristet (ADR-022 Z. 43/48); #262 = Dev-/Notfall-Ingest (Epic Z. 27); Studio-Code/Export-Jobs out of scope (Checkliste Z. 46) | #262, ggf. benanntes Folge-Issue (→ L3) |
| Kanonische Slugs (QR-fixiert) | Liste geschlossen während Pilot | `verzeichnisstruktur.md` Z. 9–26 ≡ `stations.json` (12/12, verifiziert); `stations.slug` Input+unique (Spike Z. 95) → technisch offen; „Erweiterungen erst nach Pilot" (Epic Z. 139) | #256, #259 (→ L4) |

## Bestätigte Konsistenz (kein Fund, aber explizit geprüft)

- **Nummern-Logik:** `ls dokumentation/adr/` bestätigt 029 als höchste Nummer → 030 ist korrekt; die Checkliste formuliert **dynamisch** („nächste freie Nummer beim Anlegen", Z. 10) und benennt das #254-Rennen selbst — die L5-Lehre aus dem #252-Pre-Mortem ist umgesetzt. Die Verifikation „Nummer = höchste vorherige +1" (Z. 30) ist dazu passend dynamisch.
- **Slug-Annahme belegt:** `verzeichnisstruktur.md` (12 Slugs) und `app/data/stations.json` stimmen 12/12 überein (sortiert identisch) — der Verweis in Schritt 5 friert keine veraltete Liste ein.
- **Freeze-Auftrag ist echt und korrekt verankert:** Council Z. 144 („Alle ignorieren teilweise Content-Freeze … Konsenslücke") ↔ Epic-Risikotabelle „explizit in #253" (Z. 141) ↔ Checkliste Schritt 5 „Council-Lücke schließen" (Z. 23).
- **Konsistenz-Anker existieren und sind „entschieden":** ADR-029 (c-Re-Trigger/Git-Satz Z. 40, SoT-Satz Z. 47), ADR-028 (`main`/`release/39-gs`), ADR-022 (Studio-Befristung Z. 48) — alle drei von der AC (Z. 13) geforderten Anker sind zitierfähig vorhanden.
- **„Kein App-Code geändert" ↔ `npm run build` grün:** konsistent — reine Doku-Änderung, Build als Regressionsschutz (identisches Muster wie #252, dort durchgelaufen).
- **`rg`-Verifikation:** identisches Muster wie Checkliste #252 (Z. 69/82), deren rg-Checks im Abschluss nachweislich durchliefen — kein Umgebungsrisiko.
- **Epic-vs-Issue-Abhängigkeit:** Epic-Tabelle nennt für #253 nur #251 als Blocker, die Issue-Datei zusätzlich #252 — durch den ADR-029-Abschluss (2026-11-02) aufgelöst; keine Handlung nötig.

## Nebenbefunde (Repo-Zustand, kein 01b-Fund)

- **Schritt 3 ist vorab erfüllt:** Die Issue-Datei hat bereits Frontmatter (`depends_on` #251, #252), Ziel, Akzeptanzkriterien und Checklisten-Link (Schritt-0-Leistung laut Triage Z. 32). In Schritt 2 als erledigt markieren statt doppelt ausführen.
- **`dokumentation/planung/issues/Untitled`** (untracked, Obsidian-Leerdatei) würde die Verifikation `git diff --name-status main` → „nur `dokumentation/`" passieren lassen und im 5a-Sammelcommit landen. Vor Schritt 03 löschen oder aus dem Branch nehmen.
- **Schritt-0-Commit fehlte** zum Zeitpunkt dieses Berichts (Checkliste untracked, Issue-Datei modifiziert, Branch stand auf dem Triage-Commit); wird im selben Turn wie dieser Bericht nachgeholt (Schritt 0, dann Schritt 1).

---

**Empfehlung an Schritt 02 (Plan härten):** L1 und L2 zuerst — L1 ist eine zweizeilige AC-Präzisierung (Commit-Klassen + Fallback-Drift-Variante), L2 ergänzt das Übergangsregime als AC und #256/#257 in der Verifikationszeile Z. 33. L3 verlangt nur die Wahl eines der drei Rück-Export-Regime, L4 drei Teilaussagen zu Slugs. Die Arbeitstabelle oben kann direkt als Keim der in Schritt 2 vorgesehenen Entscheidungstabelle übernommen werden. Kein Fund erweitert den Scope — „Nicht in Scope" (Z. 45–47) bleibt unangetastet; keines verlangt Studio-Code, Messungen oder eine neue Exploration. Dringendste Vorlage für die Härtung: **L2**, weil Schritt 03 die E2-Antworten als Erstes in Text gießt und eine „global"-Antwort ohne Übergangsregime die falsche wäre.
