# ADR-029 — Runtime-Datenpfad: Directus per Fetch + Data-Cache (Option b)

**Datum:** 2026-11-02  
**Status:** entschieden  
**Issue:** [#252](https://github.com/flxln/schulnavigator/issues/252) · Spike [#251](https://github.com/flxln/schulnavigator/issues/251)  
**Hinweis:** präzisiert das Zielbild aus [ADR-003](./003-content-mvp-json-directus.md) (Directus als Content-Quelle); ADR-003 bleibt unverändert, der Lesepfad wird hier festgelegt.

## Kontext

Stationen liegen heute in `app/data/stations.json`. `app/lib/stations.ts` importiert die Datei auf Modulebene und ruft `validateStationsFile` beim Import auf ([Spike Phase 3/4](../../reviews/spike-directus-2026-07.md)). Der Docker-Build-Kontext bleibt nur `app/` ([build-kontext-submodule-regeln.md](../build-kontext-submodule-regeln.md)).

Für Welle 2 (Directus-Pilot) muss feststehen, **wie** die Next.js-App Stationen zur Laufzeit bezieht, wenn Directus die Redaktionsquelle ist. Issue [#251](https://github.com/flxln/schulnavigator/issues/251) hat drei Varianten end-to-end oder per Konstruktion gegen die E1-Kriterien aus [epic-directus.md](../planung/epics/epic-directus.md) geprüft ([Spike-Bericht](../../reviews/spike-directus-2026-07.md)).

## Entscheidung

**Option b — Runtime-Fetch aus Directus mit Next.js Data Cache (SWR) und Fallback auf `stations.json` im Image.**

Directus läuft als eigener Coolify-Service; die App liest Stationen per HTTPS-API zur Request-Zeit, nicht per Build-Import aus Directus.

### E1-Kriterien (nur Option b)

| E1-Kriterium | Antwort b | Beleg |
|---|---|---|
| Besucher-App bricht bei Directus-Ausfall nicht | Ja | Spike Phase 5, Fallback-Tabelle: durchgehend `200` (0–60 s alter Cache, danach Code-Fallback auf `stations.json`) |
| `validate-stations` bleibt im Pfad | Ja | Spike Phase 3/4, belegt für eine Station; **Vertrag:** `validateStationsFile` gegen das **gemergte Gesamtdokument** aller Stationen (heute 12), nicht pro Station. Merge-Strategie klären [#256](https://github.com/flxln/schulnavigator/issues/256) / [#257](https://github.com/flxln/schulnavigator/issues/257); der Ein-Stations-Workaround des Spikes ist kein Vorbild |
| Preview für Lehrkräfte | **Abweichung** | **nicht gemessen**; keine Preview-Route im MVP. Lehrkräfte sehen Änderungen live über SWR. Anforderung an [#257](https://github.com/flxln/schulnavigator/issues/257): On-Demand-Revalidation nach Publish (Directus-Webhook → Revalidate). Echte Draft-Preview-Route ist Follow-up ohne Issue-Nummer, nicht Teil von #252 |
| Aktualität nach Publish | Ja, mit Unschärfe | b: 5,5 s bis ~2 min, abhängig vom Traffic (SWR); Roh-Fetch 0,1–0,2 s · a: 19 s Redeploy, nur cache-warm gemessen, Cold-Build unbelegt. Im Worst Case ist a schneller als b; a wird trotzdem verworfen, weil jede Content-Änderung einen Coolify-Deploy auslöst und es keine Live-Sicht gibt |
| Build-Kontext `app/` | Ja | Directus als eigener Coolify-Service; App liest per HTTPS-API; Build bleibt JSON-only |

## Begründung

- Option b ist im Spike end-to-end verifiziert: Fallback, Latenz und Validator-Pfad sind belegt ([Phase 5](../../reviews/spike-directus-2026-07.md#phase-5--e1-messungen-latenz-rebuild-dauer-fallback)).
- Besucher erhalten bei Directus-Ausfall weiterhin HTTP 200 über Cache und eingebautes JSON-Fallback.
- Redaktion kann ohne Git/Deploy-Zyklus publizieren; die SWR-Unschärfe bei wenig Traffic ist ein bekannter Trade-off (Hebel: On-Demand-Revalidation in #257). Im Pilot [#261](https://github.com/flxln/schulnavigator/issues/261) mit wenig Traffic ist genau dieses Szenario zu erwarten: wirkt Publish langsam, liegt der Hebel bei Revalidation, nicht an der Option-b-Entscheidung.
- Der Build bleibt unabhängig von Directus-Verfügbarkeit (JSON-only für `generateStaticParams()` und statische Pfade).

## Verworfene Alternativen

- **Option a — Webhook → Coolify-Rebuild:** Jede Content-Änderung löst einen Deploy aus; Lehrkräfte haben keine Live-Sicht ohne Rebuild. Latenz ist zwar bei cache-warmem Redeploy oft niedriger als b im SWR-Worst-Case (~19 s vs. bis ~2 min), das rechtfertigt a nicht: Betriebs- und UX-Kosten (Deploy pro Publish, kein Live-Feedback) überwiegen. Cold-Build-Dauer ist unbelegt.
- **Option c — Hybrid-Export (Directus → validiertes `stations.json` in Git/`app/data/`):** Nicht gebaut, nicht gemessen. Spike empfiehlt c als robustere Wahl, falls Directus instabiler läuft — das ist **keine** parallele Entscheidung, sondern Ausstiegsoption. **Verworfen** für den MVP; Re-Trigger: gemessene Directus-Instabilität im Betrieb (Ausfälle, die über den Fallback hinaus sichtbar werden) oder Betriebsentscheid, Directus nicht dauerhaft laufen zu lassen; Wechsel nur per Folge-ADR. Wer committet `app/data/stations.json` und wie das zum Content-Freeze passt, klärt [#253](https://github.com/flxln/schulnavigator/issues/253).

## Konsequenzen

- **Directus-Ausfall:** Fallback auf `stations.json` im Image; Besucherpfad bleibt `200`.
- **Umgebungsvariablen:** `SN_STATIONS_SOURCE` und `SN_DIRECTUS_TOKEN` sind **Runtime-only**. `generateStaticParams()` und der Build lesen weiter aus `app/data/stations.json`, damit der Build bei gestopptem Directus nicht bricht → Umsetzung [#257](https://github.com/flxln/schulnavigator/issues/257).
- **Service-User:** b braucht einen API-Only-Service-User (eigene Rolle, nur `read`, kein `app_access`, keine 2FA). Das beschlossene Auth-Konzept ([directus-auth-konzept.md](../spezifikationen/directus-auth-konzept.md)) kennt keinen Service-Account-Typ; Nachtrag ist Bedingung vor Produktivbetrieb, Zuständigkeit [#255](https://github.com/flxln/schulnavigator/issues/255). #252 ändert das Auth-Konzept nicht.
- **Content-Source-of-Truth:** Mit b wird Directus die Content-Wahrheit statt Git (`release/39-gs` / historisch `kunde/39-gs`, Gate 8). Freeze- und Migrationsfolgen klären [#253](https://github.com/flxln/schulnavigator/issues/253) und [#259](https://github.com/flxln/schulnavigator/issues/259).
- **Spike-Code:** Branch `spike/directus-station` wird **nicht übernommen**; [#257](https://github.com/flxln/schulnavigator/issues/257) implementiert b **frisch von `main`** (Spike Z. 296).
- **SWR:** Unschärfe bei wenig Traffic; Hebel On-Demand-Revalidation → [#257](https://github.com/flxln/schulnavigator/issues/257) (siehe Preview-Abweichung oben).
- **[#256](https://github.com/flxln/schulnavigator/issues/256):** Validator-Vertrag Gesamtdokument, Schema für mehrere Stationen, Collections.
- **[#257](https://github.com/flxln/schulnavigator/issues/257):** Env (Runtime-only), Fetch/Merge in `stations.ts`, Cache/Revalidate, Fallback.
- **Build-Kontext** bleibt `app/` (Build-Regeln unverändert).
