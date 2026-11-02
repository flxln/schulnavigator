# Kurz-Checkliste: Issue #252 — ADR Runtime-Datenpfad

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike-Bericht)  
**Triage:** [triage-#252-adr-runtime-datenpfad.md](../triage/triage-%23252-adr-runtime-datenpfad.md) · 2026-11-02  
**Gehärtet:** nach Pre-Mortem 1b ([pre-mortem-1b-adr-runtime-252-2026-11-02.md](../../reviews/pre-mortem/pre-mortem-1b-adr-runtime-252-2026-11-02.md)), 2026-11-02 · Verifikationsprofil Standard (B=1)

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` mit der **nächsten freien Nummer** (beim Anlegen per `ls dokumentation/adr/` verifiziert; Stand 2026-11-02: **029**, kann durch #253/#254 auf 030+ rutschen)⁵. Im Folgenden „ADR-NNN“.
- ADR-NNN entscheidet **Option b (Runtime-Fetch + Data-Cache)**, Status **„entschieden“**. Option **a** und **c** stehen unter „Verworfene Alternativen“; c mit Re-Trigger-Bedingung, kein „b mit c-Option“ als Entscheidungsstatus¹.
- Jedes der fünf E1-Kriterien ([epic-directus.md](../epics/epic-directus.md#e1--runtime-datenpfad--252)) ist **für Option b** mit Ja/Nein/Abweichung beantwortet. Beleg ist entweder ein Spike-Messwert ([spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md#phase-5--e1-messungen-latenz-rebuild-dauer-fallback)) oder die Antwort ist ausdrücklich als „nicht gemessen“ markiert. Für a und c werden keine Kriterien-Antworten behauptet, nur der Verwerfungsgrund².
- Zeile in [`dokumentation/entscheidungen.md`](../../entscheidungen.md) mit der **tatsächlich vergebenen** Nummer (Status „entschieden“, Datum)⁵.
- ADR nennt Folgen für #256 und #257 sowie die b-bedingten Folgen für #255, #253 und #259 (siehe Schritt 4c), ohne deren Umsetzung⁴.
- Kein App-Code geändert (nur Doku).

## Entscheidungen aus der Härtung

| # | Frage | Entscheidung | Quelle |
|---|---|---|---|
| E-1 | Status bei „b MVP, c optional später“? | b, Status „entschieden“. c verworfen mit Re-Trigger: „gemessene Directus-Instabilität im Betrieb (Ausfälle, die über den Fallback hinaus sichtbar werden) oder Betriebsentscheid, Directus nicht dauerhaft laufen zu lassen; Wechsel nur per Folge-ADR“. Offene c-Mechanik (wer committet `app/data/stations.json`, Verhältnis zum Freeze aus #253) als ein Satz, Verweis #253 | 1b L1 |
| E-2 | Kriterium „Preview für Lehrkräfte“ unter b? | **Abweichung, benannt:** keine Preview-Route im MVP; Lehrkräfte sehen Änderungen live über SWR. Anforderung an #257: On-Demand-Revalidation nach Publish (Directus-Webhook → Revalidate) vorsehen. Draft-Preview-Route ist Follow-up ohne Issue-Nummer, nicht Teil von #252 | 1b L2, Spike Z. 176 |
| E-3 | Validator-Granulum unter b? | `validateStationsFile` läuft gegen das **gemergte Gesamtdokument** aller Stationen (heute 12), nicht pro Station. Merge-Strategie für mehrere Stationen klärt #256/#257; der Ein-Stations-Workaround des Spikes ist kein Vorbild | 1b L2, Spike Z. 298, 314 |
| E-4 | Wie wird Option a verworfen? | Über Deploy-Zyklen pro Content-Änderung und fehlende Live-Sicht, **nicht** über „5,5 s vs. 19 s“. Latenz wird als Spanne zitiert (Belegformel unter Implementierungsnotizen) | 1b L3 |
| E-5 | Wo steht der Service-User-Nachtrag? | Kanonisches Auth-Konzept ist [`spezifikationen/directus-auth-konzept.md`](../../spezifikationen/directus-auth-konzept.md) (beschlossen, Gate 5). ADR-NNN benennt den Nachtrag als Bedingung, Zuständigkeit #255; #252 ändert das Auth-Konzept nicht | 1b L4 |

## Ausführungs-Checkliste

1. ~~**01b Pre-Mortem**~~ erledigt (GLM/Cline, 2026-11-02): fünf Funde L1–L5, kein Blocker gegen b.
2. ~~**02 Plan härten**~~ erledigt (Opus, diese Revision).
3. **Vorlage:** `ls dokumentation/adr/` ausführen, höchste Nummer +1 = NNN. `dokumentation/adr/000-template.md` kopieren → `NNN-runtime-datenpfad-directus.md`⁵.
4. **ADR-Inhalt:**
   - a) **Kontext:** Build-Import in `app/lib/stations.ts` (Modulebene, Validierung beim Import), Spike #251 als Datenbasis.
   - b) **Entscheidung:** Option b, Status „entschieden“ (E-1). Optionen a/c als „Verworfene Alternativen“ mit Kurzgrund; c mit Re-Trigger-Satz und Git-/Freeze-Satz (Verweis #253)¹.
   - c) **Kriterien-Tabelle (nur b):**²

     | E1-Kriterium | Antwort b | Beleg |
     |---|---|---|
     | Besucher-App bricht bei Directus-Ausfall nicht | Ja | Spike Phase 5, Fallback-Tabelle: durchgehend `200` (0–60 s alter Cache, danach Code-Fallback) |
     | `validate-stations` bleibt im Pfad | Ja | Spike Phase 3/4, belegt für eine Station; Vertrag: gegen gemergtes Gesamtdokument (E-3) |
     | Preview für Lehrkräfte | Abweichung | nicht gemessen; kein Preview im MVP, Anforderung an #257 (E-2) |
     | Aktualität nach Publish | Ja, mit Unschärfe | Belegformel L3 (Implementierungsnotizen) |
     | Build-Kontext `app/` | Ja | Directus als eigener Coolify-Service, App liest per HTTPS-API; Build bleibt JSON-only (4d) |

   - d) **Konsequenzen** (Text, keine Umsetzung):⁴
     - Directus-Ausfall: Fallback auf `stations.json` im Image, Besucherpfad bleibt `200`.
     - `SN_STATIONS_SOURCE` und `SN_DIRECTUS_TOKEN` sind **Runtime-only**; `generateStaticParams()` und der Build lesen weiter aus `app/data/stations.json`, damit der Build bei gestopptem Directus nicht bricht (→ #257).
     - b braucht einen API-Only-Service-User (eigene Rolle, nur `read`, kein `app_access`, keine 2FA). Das beschlossene Auth-Konzept hat keinen Service-Account-Typ; Nachtrag ist Bedingung vor Produktivbetrieb, zuständig #255 (E-5).
     - Mit b wird Directus die Content-Source-of-Truth statt Git (`kunde/39-gs`, Gate 8); Freeze- und Migrationsfolgen klären #253 und #259.
     - `spike/directus-station` wird nicht übernommen; #257 baut b neu von `main` (Spike Z. 296).
     - SWR-Unschärfe bei wenig Traffic; Hebel On-Demand-Revalidation (→ #257, E-2).
     - Folgen für #256: Validator-Vertrag Gesamtdokument (E-3), Schema für mehrere Stationen.
     - Folgen für #257: Env (Runtime-only), Fetch/Merge in `stations.ts`, Cache/Revalidate, Fallback.
     - Build-Kontext bleibt `app/` (Build-Regeln).
5. **`entscheidungen.md`:** Tabellenzeile mit tatsächlicher Nummer NNN, Status „entschieden“, Datum. Kein Eingriff in ADR-003; Bezug zu ADR-003 nur als Verweis im ADR-Text.
6. **03 Implementieren** (Composer): Text finalisieren, keine `.cursor/plans/`, PR/Issue-Verweis optional im ADR-Footer.

## Implementierungsnotizen

- **Belegformel „Aktualität nach Publish“ (L3)**³, wörtlich so oder sinngleich in ADR-NNN: „b: 5,5 s bis ~2 min, abhängig vom Traffic (SWR); Roh-Fetch 0,1–0,2 s · a: 19 s Redeploy, nur cache-warm gemessen, Cold-Build unbelegt.“ Dazu ein Satz: Im Worst Case ist a schneller als b; a wird trotzdem verworfen, weil jede Content-Änderung einen Coolify-Deploy auslöst und es keine Live-Sicht gibt (E-4).
- Spike-Empfehlungszeile (Spike Z. 310) begründet c als „robustere Wahl, falls Directus instabiler läuft“. Das ist die Quelle des Re-Trigger-Satzes, nicht eine zweite Entscheidung.
- Pilot #261 hat wenig Traffic, also genau das SWR-Szenario. Im ADR die Konsequenz so formulieren, dass ein Pilot-Befund „Publish wirkt langsam“ auf den Hebel (Revalidation) zeigt und nicht auf die Entscheidung.

## Verifikation

- `ls dokumentation/adr/` zeigt genau eine neue ADR-Datei zum Runtime-Datenpfad; ihre Nummer ist höchste vorherige Nummer +1⁵.
- `rg "Runtime-Datenpfad" dokumentation/entscheidungen.md` trifft den Eintrag; die dort genannte Nummer und der Link stimmen mit dem Dateinamen überein⁵.
- ADR-NNN: Status „entschieden“, Entscheidung b; a und c unter „Verworfene Alternativen“, c mit Re-Trigger¹.
- ADR-NNN: Kriterien-Tabelle hat fünf Zeilen nur für b; „Preview“ = Abweichung, „nicht gemessen“ markiert².
- Stichprobe Text: „Fallback“, „validate-stations“/`validateStationsFile` + „Gesamtdokument“, „Build-Kontext `app/`“, „Runtime-only“, „Service-User“, „Source-of-Truth“, „frisch von `main`“ bzw. „nicht übernommen“⁴.
- Latenz erscheint als Spanne (5,5 s bis ~2 min), nicht als Einzelwert gegen 19 s³.
- `git diff --name-status main` zeigt nur Dateien unter `dokumentation/`.
- `cd app && npm run build` unverändert grün (kein Code-Diff erwartet).

## Referenzen

- Issue: [#252](https://github.com/flxln/schulnavigator/issues/252) · [issue-252-d04-adr-runtime.md](../issues/issue-252-d04-adr-runtime.md)
- Epic E1, Council: [council-directus-planung-2026-07-06.md](../../reviews/council-directus-planung-2026-07-06.md)
- Spike: [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md) (Phase 4 Lesepfad, Phase 5 Messungen, Service-User-Empfehlung, Branch-Entscheidung)
- Pre-Mortem 1b: [pre-mortem-1b-adr-runtime-252-2026-11-02.md](../../reviews/pre-mortem/pre-mortem-1b-adr-runtime-252-2026-11-02.md)
- Vor-Pre-Mortem Spike (ENV-Scope L4): [pre-mortem-1b-directus-spike-251-2026-07-06.md](../../reviews/pre-mortem/pre-mortem-1b-directus-spike-251-2026-07-06.md)
- Auth-Konzept (kanonisch): [spezifikationen/directus-auth-konzept.md](../../spezifikationen/directus-auth-konzept.md)
- Build-Regel: [build-kontext-submodule-regeln.md](../../build-kontext-submodule-regeln.md)

## Nicht in Scope

- Produktive Umsetzung (#257), Collections (#256), Deploy (#255), Migration/Freeze (#253), Medien-ADR (#254).
- Webhook/Coolify-Konfiguration, neuer Spike oder Messung Option **c**.
- Lehrkräfte-Preview als Feature bauen (nur im ADR als Abweichung/Anforderung benennen).
- Auth-Konzept-Nachtrag Service-User (nur als Bedingung im ADR benennen, Umsetzung #255).

## Offene Punkte

- Keine. Preview-Route und On-Demand-Revalidation sind über E-2 geschlossen (Anforderung an #257, Draft-Preview als Follow-up); Validator-Granulum über E-3; c-Status über E-1.

---

## Änderungslog

- ¹ 1b L1: Entscheidung auf b mit Status „entschieden“ festgezogen, c als verworfene Alternative mit Re-Trigger und Git-/Freeze-Satz (E-1, AC, Schritt 4b, Verifikation).
- ² 1b L2: Kriterien-Antworten nur für b, Preview als benannte Abweichung „nicht gemessen“, Validator-Granulum Gesamtdokument (E-2, E-3, Schritt 4c, AC, Verifikation).
- ³ 1b L3: Latenz-Belegformel als Spanne statt Spitzenwert, Verwerfungsgrund für a umgestellt (E-4, Implementierungsnotizen, Verifikation).
- ⁴ 1b L4: Konsequenzliste um Runtime-only-ENV, Service-User/Auth-Konzept (#255), Content-Source-of-Truth (#253/#259) und Neubau von `main` erweitert; kanonisches Auth-Konzept festgelegt (E-5, AC, Schritt 4d, Verifikation, Nicht in Scope).
- ⁵ 1b L5: ADR-Nummer dynamisch (nächste freie, beim Anlegen geprüft); Verifikation prüft tatsächlich vergebene Nummer statt `029*` (AC, Schritt 3, Schritt 5, Verifikation).
- Schritte 1 und 2 als erledigt markiert; „Offene Punkte“ geschlossen.
