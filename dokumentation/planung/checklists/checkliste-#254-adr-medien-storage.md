# Kurz-Checkliste: Issue #254 — ADR Medien-Storage (Gate-kompatibel)

**Stufe:** LIGHT · **Prompt-Variante:** klassisch  
**Follow-up zu:** #251 (Spike Phase 6) · **Triage:** [triage-#254-adr-medien-storage.md](../triage/triage-%23254-adr-medien-storage.md) · 2026-11-03  
**Gehärtet nach Pre-Mortem 1b (2026-11-03):** [pre-mortem-1b-adr-medien-storage-254-2026-11-03.md](../../reviews/pre-mortem/pre-mortem-1b-adr-medien-storage-254-2026-11-03.md), Funde L1–L5 eingearbeitet

## Ziel & Akzeptanzkriterien

- Neue ADR unter `dokumentation/adr/` mit **031** (`ls dokumentation/adr/`, höchste Nummer +1; Stand Triage: 030 auf `main`).
- ADR-031 entscheidet **Variante b-Proxy** (Directus-Assets hinter Cookie-gated App-Route, koexistierend mit Bahn B), Status **„entschieden“**; verworfen: a als alleinige Lösung, b-direkt, c, je mit Kurzgrund nach Vorgabe V3.¹ ⁵
- **Fünf E3-Kriterien** ([Epic E3](../epics/epic-directus.md#e3--medien-storage--254)) für b-Proxy: Ja/Nein/Abweichung + Beleg + zuständiges Folge-Issue (Vorgabe V2).⁴
- **Scope-Frage Lehrkräfte-Upload** beantwortet (Felix, 2026-11-03: **Lehrkräfte laden im Pilot Medien hoch**). Die Antwort ist die Eingabe der Optionswahl, nicht ihr Anhang; im ADR mit Re-Trigger formuliert (Vorgabe V1).¹
- **Pfad-Vertrag** für `quelle` (zwei zulässige Formen) und **D-7-Klarstellung** zu ADR-030 stehen im ADR (Vorgaben V4, V5).² ³
- Zeile in [`dokumentation/entscheidungen.md`](../../entscheidungen.md); Konsequenzen je Folge-Issue benannt: **#255, #256, #257, #258, #259, #260, #262, #263**, ohne deren Umsetzung.⁴
- Kein App-Code geändert.

## Ausführungs-Checkliste

1. ~~**01b Pre-Mortem** (GLM/Cline)~~ erledigt 2026-11-03.
2. ~~**02 Plan härten** (Opus)~~ erledigt 2026-11-03 (diese Revision).
3. **Vorlage:** `dokumentation/adr/000-template.md` → `031-medien-storage-directus-proxy.md`.
4. **ADR-Inhalt** nach den Vorgaben V1–V6 unten: Kontext (Ist: Bahn-B-Volumes + gated `/media/*`, Spike #251 Phase 6, Scope-Antwort); Entscheidung; verworfene Alternativen; E3-Kriterien-Tabelle; Pfad-Vertrag; Bezug ADR-030 D-7; Konsequenzen je Folge-Issue; Re-Trigger.
5. **`entscheidungen.md`:** Tabellenzeile ADR-031, Status „entschieden“, Datum.
6. **03 Implementieren** (Composer): nur Doku; Verifikation unten.
7. **04 Post-Mortem** kompakt · **05a Abschließen:** Issue-Datei (AC an diese Revision angleichen), `offen.md`, GitHub-Body-Sync, GitHub-Beziehung `#259 blocked by #254` nachtragen.

### Vorgaben für ADR-031 (aus Härtung, verbindlich für Schritt 3)

**V1 Scope und Kopplung¹**
- Entscheider der Produktfrage: Felix, 2026-11-03. Antwort: Lehrkräfte laden im Directus-Pilot Medien hoch.
- Kopplungsrichtung im ADR ausdrücklich: Scope-Antwort → Option. Option a scheidet als alleinige Lösung aus, weil sie keinen Lehrkräfte-Upload kennt.
- Re-Trigger (Muster ADR-029): „Erweist sich die Proxy-Route in #257 als nicht tragfähig (Range/206, Last, Gate-Test), fällt der Pilot auf MPZ-only (Option a) zurück; Folge-ADR.“ Zweiter Re-Trigger: „Speicherbedarf übersteigt das VPS-Volume oder Big-Bang/Zweitschule → Folge-ADR über c.“

**V2 Entscheidung und E3-Kriterien⁴**

Entscheidung: **b-Proxy.** Neue Uploads der Lehrkräfte liegen in Directus (`directus_files`, lokales Storage-Volume auf dem MPZ-VPS). Der Browser lädt sie **nie** von der Directus-Domain, sondern über eine Cookie-gated App-Route; die App holt die Datei serverseitig mit Token. Directus vergibt **keine** Public-Read-Berechtigung auf `directus_files`. Bestehende Medien bleiben in Bahn B (ADR-027) und werden weiter über `/media/*` ausgeliefert.

| E3-Kriterium | Antwort b-Proxy | Beleg | Folge-Issue |
|---|---|---|---|
| Keine Auslieferung ohne Entry-Cookie-Prüfung | **Ja** per Konstruktion | Spike Phase 6: `/assets/*` ohne Public-Read `403`; Gate-Muster `app/app/media/[...path]/route.ts` (403 + `no-store`, `private, max-age=3600`); ADR-027 Konsequenzen | #255 (keine Public-Policy auf `directus_files`), #257 (Proxy-Route) |
| ADR-027 (kein Schüler-Content in Git) | **Ja** | Uploads liegen im Directus-Volume auf dem VPS, nicht in Git; neuer Speicherort neben den drei Bahn-B-Volumes | #255 |
| Backup T5 abdecken | **Abweichung** | dsgvo.md T5 sichert nur `media`, `dialog-audio`, `coach-audio`; das Directus-Uploads-Volume kommt hinzu | #258 (DB **und** Uploads-Volume) |
| AVV-/Speicherort-Anhang | **Abweichung** | Speicherort bleibt IONOS-VPS (DE), aber neuer Zugriffsweg: Lehrkräfte laden Schüler-Medien selbst hoch | #263 (AVV-Nachtrag + DSB-Sign-off, Blocker vor #261) |
| Upload-Regeln (`mpz-upload-rules.ts`) | **Abweichung** | Directus-Uploads laufen nicht durch `validateUpload`; Soll = dieselben Typen/Größen wie `UPLOAD_RULES` (mp3/wav/m4a 25 MB, mp4 150 MB, jpg/jpeg/webp 8 MB, md/txt 512 KB) | #255 (globales Größen-/MIME-Limit in der Directus-Konfiguration), #256 (Regel je Typ) |

**V3 Verworfene Alternativen⁵**
- **a allein (MPZ-only):** scheidet durch die Scope-Antwort aus. Bleibt als Bahn B für Bestand und als Rückfall laut Re-Trigger.
- **b-direkt (Asset-URLs im Client):** 2–3 Sätze mit der Kette aus Spike Phase 6: Directus-Default ist `403`, nicht `200`; Client-Nutzung über `<img>`/`<video>` erzwingt Public-Read, weil der Browser das HttpOnly-`sn_access` nicht an die Directus-Domain sendet und Directus es nicht kennt; Ergebnis `200` ohne Cookie = S1-Regression. Eine Schutzschicht ist bei b also Pflicht. Signierte/zeitbegrenzte Asset-Token verworfen, weil sie einen zweiten Zugangsmechanismus neben dem Entry-Cookie einführen; gewählt ist die vom Spike gleichrangig empfohlene Proxy-Variante.
- **c (Object Storage + Proxy):** pilotbezogen begründen, nicht mit dem MVP-Argument aus ADR-027: neuer Infrastruktur-Baustein, Backup-Zweitkopie und ggf. Unterauftragnehmer im AVV für 1–2 Pilot-Räume ohne Bedarf; b-Proxy erreicht dasselbe Gate mit dem Speicher, den #255 ohnehin aufsetzt.
- Begriffe: „Schutzschicht“ heißt im ADR ausschließlich „Cookie-gated App-Proxy“; „DSB-Sign-off“ heißt „Freigabe im Zuge von #263“.

**V4 Pfad-Vertrag `quelle`²**
- Form 1, Bahn B: `/media/<slug>/<ordner>/<datei>` mit `ordner ∈ {audio, video, fotos, texte, icons}` (Belege: `getUploadFolder` in `mpz-upload-rules.ts`, `/media/<slug>/icons/` in `mpz-hotspot-icon-ingest.ts`, Beispiel `stations.json`).
- Form 2, Directus-Upload: `/api/medien/<directus-file-uuid>` (Proxy-Route, Muster `/api/dialog/*`, `/api/coach/*`).
- Externe URLs für `typ: link`/`embed` bleiben unberührt (ADR-017).
- Validierung beider Formen: #256 (Directus-Seite), #257 (App-Seite). Der Bezeichner-Unterschied `medien.key` (Spike) vs. `medien[].id` (App/JSON) wird **nicht** in ADR-031 entschieden, sondern ausdrücklich an #256 delegiert.

**V5 Bezug ADR-030 D-7³**

Klarstellungssatz, kein Widerspruch zu ADR-030: „Das Dual-Write-Verbot (D-7) betrifft die `stations.json`-Redaktion. Für Pilot-Slugs werden `medien`-Metadaten in Directus gepflegt; Dateien kommen entweder per Directus-Upload (Form 2) oder per Bahn-B-Sync `deploy-content.sh --media-only` (Form 1, MPZ). Der Bahn-B-Sync bleibt für Pilot-Slugs zulässig.“ Folge: #262 sperrt nur JSON-Schreibzugriffe auf Pilot-Slugs, nicht den Medien-Sync.

**V6 Konsequenzen je Folge-Issue⁴** (nur benennen, nicht umsetzen)
- **#255:** Directus-Storage lokal auf VPS-Volume; keine Public-Policy auf `directus_files`, Prüfung `GET /assets/<id>` ohne Token → `403`; globales Upload-Limit/MIME-Allowlist konfigurieren; Token-Rolle der App um Lesen von `directus_files` erweitern (`SN_DIRECTUS_TOKEN`, Runtime-only nach ADR-029).
- **#256:** `quelle`-Validierung für Form 1 und 2; Upload-Regel je Typ nach `UPLOAD_RULES`; Lehrkräfte-Rolle darf Dateien anlegen; Bezeichner `key`/`id` zusammenführen.
- **#257:** Proxy-Route `/api/medien/<uuid>`: Cookie-Prüfung identisch zu `/media/*` (403 leer + `no-store`), `private, max-age=3600`, Range/206 für Video. Das ist eine Scope-Erweiterung von #257 und B=2 (Auslieferungs-Gate); die #257-Triage muss sie einpreisen.
- **#258:** T5 um Directus-DB **und** Uploads-Volume erweitern, Restore-Test für beide.
- **#259:** Pilot-Medien 1:1 als Form-1-Pfade übernehmen; **keine** Datei-Migration nach Directus im Piloten.
- **#260:** Anleitung nennt erlaubte Typen und Größen für den Upload.
- **#262:** Studio-Sperre nur auf JSON (V5).
- **#263:** AVV-Nachtrag und DSB-Freigabe decken Lehrkräfte-Uploads von Schüler-Medien nach Directus ab; bleibt Blocker vor #261.

## Verifikation

- Genau eine neue ADR `031-*.md`; Nummer = höchste vorherige +1.
- `rg "Medien-Storage|031-" dokumentation/entscheidungen.md` → Link stimmt mit Dateiname.
- ADR: Status „entschieden“; Entscheidung „b-Proxy“ mit Satz „keine Public-Read-Berechtigung auf `directus_files`“; Kriterien-Tabelle fünf Zeilen, jede mit Folge-Issue-Spalte.
- ADR enthält: Scope-Antwort mit Datum und Entscheider, beide Re-Trigger (V1); b-direkt-Kette `403` → Public-Read → `200` (V3); beide `quelle`-Formen inkl. `icons` (V4); D-7-Klarstellungssatz (V5).
- `rg -o "#25[5-9]|#26[0-3]" dokumentation/adr/031-*.md | sort -u` liefert mindestens #255, #256, #257, #258, #259, #260, #262, #263.
- `git diff --name-status main` nur unter `dokumentation/`; `cd app && npm run build` grün.

## Referenzen

- [#254](https://github.com/flxln/schulnavigator/issues/254) · Epic E3 · [spike-directus-2026-07.md](../../reviews/spike-directus-2026-07.md#phase-6--e3-medien-gate-befund)
- [ADR-027](../../adr/027-schuelermedien-nicht-in-git.md) · [ADR-029](../../adr/029-runtime-datenpfad-directus.md) · [ADR-030](../../adr/030-migrationsstrategie-content-freeze.md)
- Vorlage Issue/Checkliste: [#252](../issues/issue-252-d04-adr-runtime.md)

## Nicht in Scope

- Directus-Deploy (#255), Pilot (#259), Proxy/Signierung implementieren, Object-Storage-Anbindung, neuer Spike, Auth-Konzept ändern.

## Offene Punkte

- ~~Scope Lehrkräfte-Upload~~ geschlossen: Felix, 2026-11-03, Lehrkräfte laden hoch → b-Proxy (V1).¹
- G1-Prüfung nach der Antwort: nicht ausgelöst. Die Scope-Frage ist beantwortet, die AC stehen fest, der ADR verlangt weder Messung noch Spike noch Änderung am Medien-Handler in #254. Das Sicherheitsargument stützt sich auf den gemessenen `403`-Default (Spike Phase 6) und das bestehende Gate-Muster. Das neue Umsetzungsrisiko (Proxy-Route) liegt in #257, nicht hier.

## Änderungslog

- 2026-11-03 Härtung (Opus 5.5):
  - ¹ 1b L1: Scope-Frage vor Schritt 3 durch Felix beantwortet (Lehrkräfte-Upload), Kopplungsrichtung Scope → Option und zwei Re-Trigger festgelegt; Offener Punkt geschlossen, G1-Prüfung dokumentiert.
  - ² 1b L2: Pfad-Vertrag mit zwei `quelle`-Formen ergänzt; Ordnerliste um `icons` erweitert (Beleg `mpz-hotspot-icon-ingest.ts`); `key`/`id` an #256 delegiert.
  - ³ 1b L3: D-7-Klarstellung als Pflichtsatz für den ADR; #262-Sperre auf JSON begrenzt.
  - ⁴ 1b L4: Folgen-AC von #255/#259 auf acht Folge-Issues erweitert; Kriterien-Tabelle mit Folge-Issue-Spalte; Verifikation per `rg` ergänzt.
  - ⁵ 1b L5: Entscheidungsraster um b-Proxy erweitert, Begriffe „Schutzschicht“ und „DSB-Sign-off“ festgelegt, Kurzgründe für b-direkt und c vorgegeben.
  - Ausführungs-Checkliste: Schritte 1–2 abgehakt, ADR-Dateiname an Entscheidung angepasst, 5a um `#259 blocked by #254` ergänzt (1b Nebenbefund).
