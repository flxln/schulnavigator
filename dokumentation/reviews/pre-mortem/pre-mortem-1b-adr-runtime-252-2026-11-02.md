---
tags:
  - pre-mortem
  - 01b-logik-spec
  - adr-runtime
  - issue-252
erstellt: 2026-11-02
ziel-artefakt: dokumentation/planung/checklists/checkliste-#252-adr-runtime-datenpfad.md
artefakt-typ: checkliste
issue: "#252"
modell: glm-5.3
harness: cline (effort high)
gegenstück: entfällt — 01a bei LIGHT gestrichen (Triage, 2026-11-02)
typ: wissen
---

# Pre-Mortem 1b — ADR Runtime-Datenpfad #252 (Logik, Spec-Konsistenz & API-Vertrag)

**Geprüft:** Kurz-Checkliste `checkliste-#252-adr-runtime-datenpfad.md` als System mit: Epic `epic-directus.md` (E1 Optionen/Kriterien/Spike-Ergebnis Z. 92–104, Leitplanken Z. 78–86, Gate-Tabelle Z. 63–76), Spike-Bericht `spike-directus-2026-07.md` (Phase 4 Lesepfad, Phase 5 Messungen inkl. Fallback-Tabelle und Variante-c-Abschätzung, Phase 6, Service-User-Empfehlung, Branch-Entscheidung), Ist-Code `app/lib/stations.ts` (Module-Level-Import + `validateStationsFile`), `build-kontext-submodule-regeln.md`, ADR-Vorlage `000-template.md` (Status-Werteliste), `entscheidungen.md`, Auth-Konzept `directus-auth-konzept.md` (Rollenmodell), Vor-Pre-Mortem `pre-mortem-1b-directus-spike-251-2026-07-06.md` (offene Verträge L1–L4). Fokus: Widerspricht die Checkliste Epic/Spike/Auth-Konzept? Sind die E1-Kriterien-Antworten belegbar? Welche Verträge muss ADR-029 schließen, damit #256/#257 (und indirekt #253/#255) nicht auf Lücken bauen?

**Gesamturteil:** Die Checkliste ist als Fahrplan stimmig — Scope-Abgrenzung, Beleg-Anker (Phase-5-Sektion) und Verifikation sind korrekt gesetzt, die Entscheidung ist durch den Spike gut vorbereitet (b end-to-end verifiziert, Fallback belegt, c nicht gebaut). Es gibt aber **fünf vertragsbezogene Funde**, die allesamt in Härting (Schritt 02) bzw. ADR-Text billig zu schließen sind: (L1) AC1 „eine festgelegte Variante" widerspricht Schritt 4 „b MVP, c optional später" — der ADR-Status wird mehrdeutig, „c später" ist ohne Git-/Content-Wahrheits-Mechanik unterbestimmt; (L2) zwei der fünf E1-Kriterien-Antworten sind unter der Beleg-Pflicht „Spike-Messwerte" nicht einlösbar (Preview für b: nie gemessen; c: nie gebaut), und `validate-stations` braucht eine Granulum-Definition; (L3) die naheliegende Belegführung „b 5,5 s vs. a 19 s" ist schief — im SWR-Worst Case ist a schneller als b; (L4) die Konsequenzen-Liste nennt nur #256/#257, b erzwingt aber auch einen Service-User (Auth-Konzept-Lücke), Runtime-only-ENV, Verschiebung der Content-Source-of-Truth (#253/#259) und Neubau statt Spike-Code-Übernahme; (L5) AC/Verifikation hard-coden die ADR-Nummer 029 und kippen bei parallelen Geschwister-ADRs #253/#254 als false negative. Kein Fund verlangt neuen Scope, einen neuen Spike oder eine c-Messung.

---

## E1-Optionen gegen die Epic-Kriterien (Auftrag aus Checkliste Z. 17)

Legende: **Ja/Nein/Abweichung** = die drei zulässigen Antwortwerte aus AC2 (Checkliste Z. 10); „belegt" = Spike-Messwert zitierfähig.

| E1-Kriterium (Epic Z. 102) | a) Webhook-Rebuild | b) Runtime-Fetch | c) Hybrid-Export |
|---|---|---|---|
| Besucher-App bricht bei Directus-Ausfall nicht | **Ja** per Konstruktion (App bleibt statisch, Epic Z. 98) — nicht separat gemessen | **Ja, belegt** (Phase 5, Fallback-Tabelle Spike Z. 223–227: durchgehend `200`; 0–60 s aus altem Cache, danach Code-Fallback) | **Ja** per Konstruktion (Directus nur zur Build-Zeit, Spike Z. 231) — **Annahme, nicht gemessen** |
| `validate-stations` bleibt im Pfad | Ja (Status quo: `stations.ts:5–9`, Import-Validierung) | Ja, belegt für **eine** Station (Phase 3/4: Transform + `validateStationsFile`, Spike Z. 207) — Granulum für 12 Stationen offen (→ L2) | Ja per Konstruktion (Export validiert vor Deploy, Spike Z. 231) — nicht gebaut |
| Preview für Lehrkräfte | Abweichung (sichtbar erst nach Rebuild; keine Draft-Preview) | **Unbelegt** — Spike hat keine Preview gemessen oder gebaut (→ L2) | Abweichung (wie a) — nicht gebaut |
| Aktualität nach Publish | 19 s Redeploy — **nur cache-warm, kein Cold-Build** (Epic Z. 104, Spike Z. 209–215) | 5,5 s–~2 min, traffic-abhängig (SWR, Spike Z. 186–195); Roh-Fetch 0,1–0,2 s (Z. 207) | ≈ a (Rebuild-Dauer, geschätzt — Spike Z. 231) |
| Build-Kontext `app/` | Ja (Status quo) | Ja — Directus als eigener Coolify-Service (Leitplanke Epic Z. 82); App liest per HTTPS-API, keine Submodule-Referenz | Ja — Export schreibt nach `app/data/stations.json` (Build-Regeln Z. 74) — Git-Commit-/Content-Wahrheits-Mechanik offen (→ L1) |

**Gate-Intaktheit der Optionen:** Gates 1–3 unberührt (kein Login, keine PII, Medien-Auslieferung ist E3/#254 und sauber abgegrenzt). Gate 5 (Auth-Konzept beschlossen) wird von **b** mittelbar berührt: der zwingend nötige API-Only-Service-User existiert im beschlossenen Rollenmodell nicht (Spike Z. 290) — für #252 nur als ADR-Konsequenz zu benennen (→ L4). Gate 7 (Backup): die erhöhte Directus-Abhängigkeit von b ist durch #258 abgedeckt (Epic sieht es vor). Gate 8: Spike-Branch wird **nicht** übernommen (Spike Z. 296) — Konsequenz für #257 (→ L4).

**Blocker b vs. c (Auftrag aus Checkliste Z. 17):** Es existiert **kein harter Blocker gegen b** — Fallback, Latenz und Validator-Pfad sind belegt. Gegen eine Festlegung von **c jetzt** sprechen drei Blocker: (1) c wurde weder gebaut noch gemessen (Spike Z. 231), AC2 wäre für c systematisch unbelegbar; (2) die Git-Mechanik (wer committet `app/data/stations.json`; Kollision mit dem Content-Regime aus ADR-027/#253-Freeze) ist ungelöst; (3) c bietet bei „Aktualität nach Publish" keinen messbaren Gewinn gegenüber b (≈ Rebuild-Dauer wie a). Die verbleibenden Risiken von b (SWR-Unschärfe, Service-User-Lücke) sind im ADR als Bedingungen bzw. Re-Trigger zu dokumentieren — nicht als Blocker.

---

## Funde

### L1 — AC „eine festgelegte Variante" vs. Schritt 4 „b MVP, c optional später": Entscheidungsstatus wird mehrdeutig

- **Was widersprüchlich ist:** AC1 (Checkliste Z. 9) fordert „**einer** festgelegten Variante (a/b/c)". Schritt 4 (Z. 20) gibt als Entscheidungsinhalt aber vor: „Spike empfiehlt **b** MVP, **c** optional später" (Spike-Empfehlung: „b für den MVP, mit Option auf c später"). Die ADR-Vorlage kennt nur die Statuswerte „offen / entschieden / verworfen / ersetzt durch ADR-YYY" — es gibt keinen Status für „entschieden mit reservierter Ausstiegsoption". Ohne Präzisierung entsteht ein ADR mit unklarem Geltungsbereich: Wann wird c aktiv? Wer entscheidet den Wechsel? Per Folge-ADR oder stiller Umbau in #257? Zusätzlich ist „c später" inhaltlich unterbestimmt: Der Export-Job müsste ein validiertes `stations.json` nach `app/data/` schreiben (Build-Regeln Z. 74) — ein Git-Commit ins Hauptrepo durch einen Automatismus, kollidierend mit der Content-Source-of-Truth (Gate 8: `kunde/39-gs`) und dem Content-Freeze-Thema aus #253. Die Checkliste beantwortet keine dieser Fragen; ein „b+Option-c"-Text verfehlt AC1 formal.
- **Warum später teuer:** #257 (blockiert durch #252) muss wissen, ob es gegen b baut oder eine b/c-Umschaltarchitektur (`SN_STATIONS_SOURCE`-Weiche dauerhaft, Export-Pipeline mitpflegen) einplant — ein Unterschied von Wochen. Und `entscheidungen.md` verlangt Status „entschieden" (AC3): Für „b mit c-Option" ist unklar, was dort steht; ein späterer stiller Wechsel zu c wäre eine Abweichung ohne Folge-ADR.
- **Wann es beißt:** Schritt 03 (Composer gießt den mehrdeutigen Status in Text) → #257-Planung (Umschalt-Overhead oder fehlender Weckruf bei Directus-Instabilität) → spätestens bei realer Directus-Instabilität, wenn niemand für den b→c-Entscheid zuständig ist.
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 festziehen: ADR-029 entscheidet **b** mit Status „entschieden"; **c** unter „Verworfene Alternativen" mit **Re-Trigger-Bedingung** (z. B. „gemessene Directus-Instabilität im Betrieb; Wechsel nur per Folge-ADR") und einem Satz zur offenen Git-/Freeze-Mechanik (Verweis #253). Damit ist AC1 erfüllt und der c-Pfad vertraglich eindeutig.

### L2 — AC2 „jedes Kriterium mit Ja/Nein/Abweichung, Spike-Messwerte als Beleg" ist für zwei Zellen nicht einlösbar; `validate-stations` ohne Granulum-Definition

- **Was widersprüchlich ist:** AC2 (Z. 10) macht Spike-Messwerte zur Belegpflicht für **jede** Kriterien-Antwort. Aber: (a) Das Kriterium „Preview für Lehrkräfte" (Epic Z. 102) wurde im Spike **nicht** gemessen — keine Preview-Route, kein Draft-Mechanismus, keine Messung; die Checkliste selbst führt „Preview-Route, On-Demand-Revalidation" als offene Feinheit (Z. 45). Eine Antwort „Ja" mit SWR-Aktualität (5,5 s–~2 min) als Surrogat wäre eine nie verifizierte Annahme, keine Messung. (b) Für Option c existieren überhaupt keine Messwerte (nicht gebaut, Spike Z. 231) — jedes Ja/Nein zu c wäre unbelegt, solange c als „optional später" mitgeführt wird (→ L1). (c) Das Kriterium „`validate-stations` muss im Pfad bleiben" ist unter b mehrdeutig: `validateStationsFile` ist ein **Gesamtdokument-Vertrag** (prüft u. a. `stations.length === expectedStationCount` und Cross-Station-Hub-Mapping), der Spike validierte das **gemergte Gesamtdokument** mit Ein-Stationen-Workaround, und das Spike-Fazit verlangt für Produktion ausdrücklich eine „Mehr-Stationen-Merge-Strategie (nicht der Ein-Stations-Workaround)". Ob künftig pro Station oder gegen das gemergte Gesamtdokument validiert wird, ist ein Vertrag, den #256 (Validatoren) und #257 (Fetch/Merge) brauchen — die Checkliste streift ihn nur als Stichwort „validate-stations" (Z. 20).
- **Warum später teuer:** #256/#257 bauen direkt auf den Kriterien-Antworten des ADR auf. Eine unbelegte „Ja"-Antwort zur Preview wird zur Anforderungsbild in #257 — dort dann übererfüllt (echte Draft-Route) oder untererfüllt (nichts), beides ohne Backlink zur Entscheidung. Ein undefiniertes Validator-Granulum erzwingt in #256 Improvisieren im Datenmodell (per-Station-Validierung vs. Merge-Validierung im App-Layer).
- **Wann es beißt:** #257-Planung (Env/Fetch/Cache/Fallback-Vertrag) und #256 (Collections + Validatoren); bei Preview zusätzlich #261 (Pilot: Lehrkraft veröffentlicht, sieht die Änderung erst nach bis ~2 min bzw. nie als Vorschau — Adoption-Risiko laut Epic-Risikotabelle „Nicht-Nutzung").
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 die Antwortform pro Kriterium festschreiben (Vorschlag: Matrix oben): Kriterium 3 = „**Abweichung, benannt**: keine Preview-Route im MVP; Lehrkräfte sehen Änderungen live via SWR (≤ ~60 s + Traffic); echte Preview (On-Demand-Revalidation/Draft) als Anforderung an #257 gelistet" — die Checkliste hat „Anforderung vs. MVP-Abgrenzung" schon angelegt (Z. 20, 42), es muss nur in die Kriterien-Antwortzeile des ADR spiegeln. Kriterium 2 = „Ja — `validateStationsFile` gegen das **gemergte Gesamtdokument** (12 Stationen); Merge-Strategie-Details in #256/#257". Für c-Zellen: keine Kriterien-Antwort behaupten, auf den L1-Re-Trigger verweisen.

### L3 — Belegschieflage „Aktualität nach Publish": „b 5,5 s vs. a 19 s" kehrt im Worst Case die Rangfolge um

- **Was widersprüchlich ist:** Der naheliegendste Grund, Option a im ADR zu verwerfen, ist die Latenz „b 5,5 s vs. a 19 s". Beide Zahlen sind so zitierunfähig: b ist eine **Spanne von 5,5 s bis ~2 min**, fast vollständig bestimmt vom SWR-Verhalten des Data-Cache (Spike Z. 186–195: bei seltenem Traffic bis knapp über 60 s, in Ausnahmefällen deutlich länger, weil erst der nächste Request die Revalidierung anstößt); a sind **19 s nur cache-warm, kein Cold-Build** (Epic Z. 104, Spike Z. 209–215) — und der Spike nennt für a zugleich „deutlich vorhersagbarer (keine SWR-Unschärfe)" als **Vorteil**. Im Worst Case ist a (19 s fix) also **schneller** als b (~2 min). Ein ADR, das nur Spitzenwerte zitiert, verwirft a mit einer Zahl, gegen die b im Worst Case verliert.
- **Warum später teuer:** Diese Begründung trägt die Entscheidung b für die gesamte Welle 2. Ist sie schief dokumentiert, wird bei jedem Pilot-Befund „Publish wirkt langsam" die Entscheidung selbst attackiert statt der gezielte Hebel (On-Demand-Revalidation, `revalidate`-Fenster) gezogen — und der Weg zu c (L1) ohne saubere Trigger-Definition diskutiert.
- **Wann es beißt:** #261 (Pilot mit 2 Lehrkräften — wenig Traffic, also genau das SWR-Szenario, in dem b am langsamsten ist) und jede spätere Bezugnahme auf ADR-029 (#257-Begründung, Folge-ADRs).
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 als Belegformel für „Aktualität nach Publish" festschreiben: „b: 5,5 s–~2 min (SWR, traffic-abhängig; Roh-Fetch 0,1–0,2 s) · a: 19 s cache-warm (Cold-Build unbelegt)" — und als Konsequenz von b den Trade-off „SWR-Unschärfe bei Traffic-Armut; Hebel On-Demand-Revalidation (→ #257)" nennen. Drei Zeilen ADR-Text.

### L4 — Konsequenzen-Lücke: b erzwingt Verträge über #256/#257 hinaus (Service-User, Runtime-only-ENV, Content-Source-of-Truth, Neubau statt Spike-Code)

- **Was widersprüchlich ist:** AC4 (Z. 12) beschränkt die Folge-Nennung auf #256 und #257. Die belegten Konsequenzen von b reichen weiter: (a) **Service-User:** b benötigt zwingend einen API-Only-Service-User (eigene Rolle, kein Admin, keine 2FA, `SN_DIRECTUS_TOKEN` als Runtime-ENV) — die Spike-Empfehlung (Z. 290) stellt fest, dies „muss ins Auth-Konzept nachgetragen werden (aktuell nur Redaktion/Admin für menschliche Logins vorgesehen, kein Service-Account-Typ)". Das beschlossene Auth-Konzept (Gate 5) enthält diese Rolle nicht — benennt ADR-029 sie nicht als Bedingung, implementiert #255/#257 später einen Account, den das Rollenmodell nicht hergibt (Spec-Code-Widerspruch). (b) **ENV-Scoping:** Der Vor-Pre-Mortem #251 (Fund L4) hat den Vertrag `SN_STATIONS_SOURCE` = **Runtime-only** offengelegt (`generateStaticParams()` bleibt JSON-only, sonst Build-Bruch bei gestopptem Directus — genau das in Phase 5 getestete Szenario). Die Checkliste streift „Env" für #257 (Z. 12), benennt den Vertrag aber nicht. (c) **Content-Source-of-Truth:** Mit b wandert die Content-Wahrheit von Git (`kunde/39-gs`, Gate 8) nach Directus — das ändert Prämissen von #253 (Migration/Freeze) und #259 (Migration Pilot-Content), die laut Checkliste „nicht in Scope" sind; ohne Konsequenz-Satz planen sie gegen die alte Wahrheit. (d) **Spike-Code ist Wegwerf:** Der Beleg „b funktioniert" stammt aus `spike/directus-station`, der ausdrücklich **nicht** gemerged wird (Spike Z. 296: „#255 frisch von `main`") — #257 muss b neu bauen; ohne Konsequenz-Satz entsteht dort die Annahme wiederverwendbaren Codes.
- **Warum später teuer:** Jeder Punkt ist einzeln ein Blocker/Nachzug im Folge-Issue: fehlender Service-Account-Typ blockiert #255; falsches ENV-Scoping bricht Builds bei Directus-Stopp; die Content-Wahrheits-Frage entscheidet, was #259 migriert; ein #257-Plan auf Spike-Code-Basis kollidiert mit der Gate-8-Branch-Entscheidung.
- **Wann es beißt:** #255 (Service-User/Auth-Konzept-Nachtrag), #257 (ENV-Scoping, Neubau von `main`), #253/#259 (Content-Quelle der Migration) — jeweils direkt nach ADR-Abschluss.
- **Billige Gegenmaßnahme jetzt:** Schritt-4-Konsequenzliste um vier Sätze erweitern (Textonly, keine Umsetzung in #252): „b erfordert API-Only-Service-User — Auth-Konzept-Nachtrag als Folge, Zuständigkeit #255" · „`SN_STATIONS_SOURCE`/`SN_DIRECTUS_TOKEN` sind Runtime-only; Build bleibt JSON-only (`generateStaticParams` aus `stations.json`)" · „Mit b wird Directus die Content-Source-of-Truth; Freeze-/Migrationsfolgen klären #253/#259" · „Spike-Branch wird nicht übernommen; #257 implementiert b neu von `main`".

### L5 — AC1/Verifikation hard-coden „029": bei parallelen Geschwister-ADRs (#253/#254) kippt die Verifikation als false negative

- **Was widersprüchlich ist:** AC1 notiert „Stand Repo: 029", die Verifikation prüft `ls dokumentation/adr/029*.md` (Z. 26–27). #253 und #254 sind Geschwister-ADRs derselben Welle, beide seit Spike-Abschluss (2026-07-07) unblockiert und „vor Welle 2" fällig (Epic Z. 90). Belegt eines parallel eine ADR-Nummer, wird die nächste freie Nummer 030 — das ADR von #252 ist korrekt, aber AC1 und beide Verifikationszeilen schlagen fehl. Schritt 3 der Checkliste verlangt die `ls`-Prüfung vor Anlage bereits korrekt (Z. 19); AC und Verifikation sind statisch dagegen.
- **Warum später teuer:** Gering — aber ein false negative erzeugt im Abschlussschritt (5a) Nachbesserungsrunden oder eine stille Nummern-Umbenennung, die bereits geschriebene Querverweise (z. B. aus #253/#254) bricht.
- **Wann es beißt:** Schritt 03/5a, sobald #253 oder #254 vor dem Schreibmoment von #252 eine Nummer belegen.
- **Billige Gegenmaßnahme jetzt:** In Schritt 02 AC1/Verifikation dynamisch formulieren: „nächste freie Nummer (per `ls dokumentation/adr/` beim Schreiben verifiziert; aktuell 029)" und die Verifikation prüfen lassen, dass der neue `entscheidungen.md`-Eintrag die **tatsächlich vergebene** Nummer referenziert.

---

## Bestätigte Konsistenz (kein Fund, aber explizit geprüft)

- **Beleg-Anker:** Die Checkliste verlinkt die richtigen Spike-Sektionen (Phase 5 für E1-Messungen, Phase 4 Lesepfad); das Kriterium-Set ist deckungsgleich mit Epic Z. 102 — keine Kriteriums-Drift.
- **Gate 3 / S1 sauber getrennt:** E1 ist der Daten-Lesepfad; Medien-Auslieferung und `/assets/*`-S1-Regression gehören zu E3/#254 und stehen korrekt unter „Nicht in Scope" (Z. 40, 42). Keine Vermischung.
- **Build-Kontext `app/`:** Option b verletzt die Leitplanke nicht (Directus als eigener Coolify-Service, keine Submodule-Referenz); die Checkliste bindet die Build-Regeln als Referenz ein (Z. 36).
- **ADR-003-Schutz:** „kein ADR-003-Überschreiben" (Z. 21) ist konsistent mit dem Index-Status von ADR-003 („entschieden") und dem Muster „Ersetzung/Nachtrag nur per neuem ADR".
- **„Kein App-Code geändert" ↔ `npm run build` grün:** konsistent — der Schritt ändert nur Doku; die Build-Verifikation ist Regressionsschutz, kein Widerspruch.
- **Nummern-Stand:** `ls dokumentation/adr/` bestätigt 028 als höchste Nummer → 029 ist Stand heute korrekt (Caveat s. L5).

---

**Empfehlung an Schritt 02 (Plan härten):** L1–L3 sind Formulierungs-Festlegungen für den ADR-Text (Status-Formel + Re-Trigger für c; Antwortform pro E1-Kriterium inkl. Preview-Abweichung und Validator-Granulum; Latenz-Spannen statt Spitzenwerte). L4 sind vier Konsequenz-Sätze, L5 eine dynamische Umformulierung von AC1/Verifikation. Kein Fund erfordert Scope-Änderung, einen neuen Spike oder eine c-Messung — „Nicht in Scope" (Z. 41) bleibt unangetastet. Dringendste Vorlage für die Härting: **L1** (Entscheidungsstatus), weil Schritt 03 den Status als Erstes in Text gießt.



