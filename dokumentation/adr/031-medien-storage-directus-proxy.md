# ADR-031 — Medien-Storage: Directus-Uploads hinter Cookie-gated App-Proxy (b-Proxy)

**Datum:** 2026-11-03  
**Status:** ersetzt durch [ADR-032](./032-mpz-studio-produktions-admin.md), soweit Directus betroffen ist (2026-11-03)  
**Issue:** [#254](https://github.com/flxln/schulnavigator/issues/254) · Epic E3 · Spike [#251](https://github.com/flxln/schulnavigator/issues/251) Phase 6 ([Spike-Bericht](../../reviews/spike-directus-2026-07.md#phase-6--e3-medien-gate-befund))  
**Bezug:** präzisiert Medien-Auslieferung neben [ADR-027](./027-schuelermedien-nicht-in-git.md) (Bahn B), [ADR-029](./029-runtime-datenpfad-directus.md) (Lesepfad) und [ADR-030](./030-migrationsstrategie-content-freeze.md) (Freeze/D-7).

## Kontext

Schüler-Medien (Audio, Video, Fotos, Texte, Hotspot-Icons) dürfen nicht in Git ([ADR-027](./027-schuelermedien-nicht-in-git.md)). Heute liegen sie in **Bahn B**: rsync auf IONOS-VPS-Volumes; die App liefert sie cookie-gated über `/media/*` (`app/app/media/[...path]/route.ts`: ohne Entry-Cookie `403` + `no-store`, mit Cookie `200`/`206` und `private, max-age=3600`).

Für den Directus-Pilot ([ADR-029](./029-runtime-datenpfad-directus.md), [ADR-030](./030-migrationsstrategie-content-freeze.md)) muss feststehen, **wo** neue Binärdateien liegen und **wie** der Browser sie ohne S1-Regression (Auslieferung ohne Entry-Cookie-Prüfung) erhält. Issue [#251](https://github.com/flxln/schulnavigator/issues/251) hat die E3-Optionen gegen Gate, ADR-027, Backup T5, AVV-Anhang und `UPLOAD_RULES` geprüft ([Phase 6](../../reviews/spike-directus-2026-07.md#phase-6--e3-medien-gate-befund)).

**Scope-Entscheid (Produktfrage, nicht Folge der Technikwahl):** Entscheider Felix, 2026-11-03. **Lehrkräfte laden im Directus-Pilot Medien hoch.** Damit scheidet Option a (MPZ-only als alleinige Lösung) aus: a kennt keinen Lehrkräfte-Upload. Bestand und MPZ-Ingest bleiben über Bahn B und a als Rückfall (siehe Re-Trigger).

## Entscheidung

**b-Proxy:** Neue Uploads der Lehrkräfte liegen in Directus (`directus_files`, lokales Storage-Volume auf dem MPZ-VPS). Der Browser lädt sie **nie** von der Directus-Domain, sondern über eine Cookie-gated App-Route; die App holt die Datei serverseitig mit Token. Directus vergibt **keine** Public-Read-Berechtigung auf `directus_files`. Bestehende Medien bleiben in Bahn B ([ADR-027](./027-schuelermedien-nicht-in-git.md)) und werden weiter über `/media/*` ausgeliefert.

Im ADR-031 bedeutet **Schutzschicht** ausschließlich **Cookie-gated App-Proxy** (nicht signierte Asset-URLs, nicht Public-Read). **DSB-Sign-off** meint die **Freigabe im Zuge von [#263](https://github.com/flxln/schulnavigator/issues/263)** (AVV-Nachtrag), nicht eine separate informelle Freigabe.

### E3-Kriterien (nur b-Proxy)

| E3-Kriterium | Antwort b-Proxy | Beleg | Folge-Issue |
|---|---|---|---|
| Keine Auslieferung ohne Entry-Cookie-Prüfung | **Ja** per Konstruktion | Spike Phase 6: `/assets/*` ohne Public-Read `403`; Gate-Muster `app/app/media/[...path]/route.ts` (403 + `no-store`, `private, max-age=3600`); ADR-027 Konsequenzen | [#255](https://github.com/flxln/schulnavigator/issues/255) (keine Public-Policy auf `directus_files`), [#257](https://github.com/flxln/schulnavigator/issues/257) (Proxy-Route) |
| ADR-027 (kein Schüler-Content in Git) | **Ja** | Uploads liegen im Directus-Volume auf dem VPS, nicht in Git; neuer Speicherort neben den drei Bahn-B-Volumes | [#255](https://github.com/flxln/schulnavigator/issues/255) |
| Backup T5 abdecken | **Abweichung** | [dsgvo.md](../dsgvo.md) T5 sichert nur `media`, `dialog-audio`, `coach-audio`; das Directus-Uploads-Volume kommt hinzu | [#258](https://github.com/flxln/schulnavigator/issues/258) (DB **und** Uploads-Volume) |
| AVV-/Speicherort-Anhang | **Abweichung** | Speicherort bleibt IONOS-VPS (DE), aber neuer Zugriffsweg: Lehrkräfte laden Schüler-Medien selbst hoch | [#263](https://github.com/flxln/schulnavigator/issues/263) (AVV-Nachtrag + DSB-Sign-off, Blocker vor [#261](https://github.com/flxln/schulnavigator/issues/261)) |
| Upload-Regeln (`mpz-upload-rules.ts`) | **Abweichung** | Directus-Uploads laufen nicht durch `validateUpload`; Soll = dieselben Typen/Größen wie `UPLOAD_RULES` (mp3/wav/m4a 25 MB, mp4 150 MB, jpg/jpeg/webp 8 MB, md/txt 512 KB) | [#255](https://github.com/flxln/schulnavigator/issues/255) (globales Größen-/MIME-Limit in Directus), [#256](https://github.com/flxln/schulnavigator/issues/256) (Regel je Typ) |

## Begründung

- Die Scope-Antwort (Lehrkräfte-Upload) erfordert Directus als Speicher für neue Binärdateien; reine Pfad-Referenz auf Bahn B (Option a allein) reicht nicht.
- Der Spike zeigt: Directus-Assets sind standardmäßig **nicht** öffentlich (`403` ohne Token/Public-Read). Client-Nutzung über `<img>`/`<video>` gegen die Directus-Domain würde Public-Read erzwingen und damit `200` ohne Entry-Cookie (HttpOnly-`sn_access` gilt nur für die App-Domäne). b-Proxy nutzt dasselbe Gate-Muster wie `/media/*` und Dialog/Coach-APIs.
- Lokales Directus-Volume auf dem bestehenden VPS vermeidet im Pilot einen zusätzlichen Object-Storage-Baustein (Option c) bei gleichem Schutzziel.
- Bestand und MPZ-gestützter Medien-Sync bleiben in Bahn B; Pilot-Migration kopiert Medien 1:1 als Form-1-Pfade ([#259](https://github.com/flxln/schulnavigator/issues/259)), ohne Datei-Migration nach Directus.

### Pfad-Vertrag für `quelle`

Für binäre Medientypen in Directus/JSON gelten **zwei** zulässige Formen:

1. **Form 1, Bahn B:** `/media/<slug>/<ordner>/<datei>` mit `ordner ∈ {audio, video, fotos, texte, icons}` (Belege: `getUploadFolder` in `app/lib/mpz-upload-rules.ts`, `/media/<slug>/icons/` in `app/scripts/mpz-hotspot-icon-ingest.ts`, Beispiele in `app/data/stations.json`).
2. **Form 2, Directus-Upload:** `/api/medien/<directus-file-uuid>` (Proxy-Route; Muster `/api/dialog/*`, `/api/coach/*`).

Externe URLs für `typ: link` / `typ: embed` bleiben unberührt ([ADR-017](./017-externe-medien-hotspot-marker.md)). Validierung beider Formen: [#256](https://github.com/flxln/schulnavigator/issues/256) (Directus-Seite), [#257](https://github.com/flxln/schulnavigator/issues/257) (App-Seite). Der Bezeichner-Unterschied `medien.key` (Spike) vs. `medien[].id` (App/JSON) wird **nicht** in ADR-031 entschieden, sondern an [#256](https://github.com/flxln/schulnavigator/issues/256) delegiert.

### Bezug ADR-030 (D-7)

Das Dual-Write-Verbot (D-7) betrifft die `stations.json`-Redaktion. Für Pilot-Slugs werden `medien`-Metadaten in Directus gepflegt; Dateien kommen entweder per Directus-Upload (Form 2) oder per Bahn-B-Sync `deploy-content.sh --media-only` (Form 1, MPZ). Der Bahn-B-Sync bleibt für Pilot-Slugs zulässig. Folge: [#262](https://github.com/flxln/schulnavigator/issues/262) sperrt nur JSON-Schreibzugriffe auf Pilot-Slugs, nicht den Medien-Sync.

## Verworfene Alternativen

- **a allein (MPZ-only):** scheidet durch die Scope-Antwort (Lehrkräfte-Upload) als alleinige Lösung aus. Bleibt als Bahn B für Bestand und als Rückfall laut Re-Trigger unten.
- **b-direkt (Asset-URLs im Client gegen Directus):** erzwingt Public-Read und damit `200` ohne Cookie = S1-Regression (Herleitung in der Begründung). Die Schutzschicht (Cookie-gated App-Proxy) ist bei produktivem b **Pflicht**, nicht optional. Signierte oder zeitbegrenzte Asset-Token werden verworfen, weil sie einen zweiten Zugangsmechanismus neben dem Entry-Cookie einführen; gewählt ist die vom Spike gleichrangig empfohlene Proxy-Variante (Directus als Speicher-Backend hinter dem bestehenden Gate).
- **c (Object Storage + Proxy):** Pilotbezogen verworfen: neuer Infrastruktur-Baustein, Backup-Zweitkopie und ggf. Unterauftragnehmer im AVV für ein bis zwei Pilot-Räume ohne aktuellen Bedarf; b-Proxy erreicht dasselbe Gate mit dem Speicher, den [#255](https://github.com/flxln/schulnavigator/issues/255) ohnehin aufsetzt. (Nicht mit dem MVP-„Overengineering“-Argument aus ADR-027 begründet; dort ist Object Storage „zunächst“ verworfen, hier geht es um Pilot-Scope.)

## Re-Trigger

- Erweist sich die Proxy-Route in [#257](https://github.com/flxln/schulnavigator/issues/257) als nicht tragfähig (Range/206, Last, Gate-Test), fällt der Pilot auf MPZ-only (Option a) zurück; **Folge-ADR**.
- Speicherbedarf übersteigt das VPS-Volume oder Big-Bang/Zweitschule → **Folge-ADR** über Option c.

## Konsequenzen

- **[#255](https://github.com/flxln/schulnavigator/issues/255):** Directus-Storage lokal auf VPS-Volume; keine Public-Policy auf `directus_files`, Prüfung `GET /assets/<id>` ohne Token → `403`; globales Upload-Limit/MIME-Allowlist konfigurieren; Token-Rolle der App um Lesen von `directus_files` erweitern (`SN_DIRECTUS_TOKEN`, Runtime-only nach ADR-029).
- **[#256](https://github.com/flxln/schulnavigator/issues/256):** `quelle`-Validierung für Form 1 und 2; Upload-Regel je Typ nach `UPLOAD_RULES`; Lehrkräfte-Rolle darf Dateien anlegen; Bezeichner `key`/`id` zusammenführen.
- **[#257](https://github.com/flxln/schulnavigator/issues/257):** Proxy-Route `/api/medien/<uuid>`: Cookie-Prüfung identisch zu `/media/*` (403 leer + `no-store`), `private, max-age=3600`, Range/206 für Video. Scope-Erweiterung von #257 und B=2 (Auslieferungs-Gate); die #257-Triage muss sie einpreisen.
- **[#258](https://github.com/flxln/schulnavigator/issues/258):** T5 um Directus-DB **und** Uploads-Volume erweitern, Restore-Test für beide.
- **[#259](https://github.com/flxln/schulnavigator/issues/259):** Pilot-Medien 1:1 als Form-1-Pfade übernehmen; **keine** Datei-Migration nach Directus im Piloten.
- **[#260](https://github.com/flxln/schulnavigator/issues/260):** Anleitung nennt erlaubte Typen und Größen für den Upload.
- **[#262](https://github.com/flxln/schulnavigator/issues/262):** Studio-Sperre nur auf JSON (D-7-Klarstellung oben).
- **[#263](https://github.com/flxln/schulnavigator/issues/263):** AVV-Nachtrag und DSB-Freigabe decken Lehrkräfte-Uploads von Schüler-Medien nach Directus ab; bleibt Blocker vor [#261](https://github.com/flxln/schulnavigator/issues/261).

**Kein App-Code in #254;** Umsetzung der Proxy-Route, Directus-Konfiguration und Migration in den Folge-Issues.
