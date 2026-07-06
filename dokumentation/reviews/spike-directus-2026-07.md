# Spike-Bericht: Directus → Next.js → Deploy (#251)

**Status:** in Arbeit (wird phasenweise befüllt, siehe Plan)
**Issue:** [#251](https://github.com/flxln/schulnavigator/issues/251) · Epic-Parent [#47](https://github.com/flxln/schulnavigator/issues/47)
**Plan:** `.cursor/plans/directus_spike_#251_3e5a9c41.plan.md`
**Branch:** `spike/directus-station` (von `main`, wird nicht gemergt)
**Zeitbox:** 2 Wochen (10 Arbeitstage), Checkpoint Tag 5

---

## Phase 0 — VPS-Baseline (vor Directus-Deploy)

**Datum:** 2026-07-06 · **Host:** IONOS-VPS `217.154.120.240` (SSH-Alias `coolify-server`)

### `free -h`

```
               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       4.2Gi       849Mi       301Mi       3.3Gi       3.5Gi
Swap:          2.0Gi       905Mi       1.1Gi
```

### `df -h` (relevant)

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1       232G   32G  200G  14% /
```

### Laufende Container (Auszug, vor Directus-Deploy)

| Container | Image | Status | RAM |
|---|---|---|---|
| `coolify` + `coolify-db` + `coolify-redis` + `coolify-realtime` + `coolify-proxy` + `coolify-sentinel` | — | healthy | ~375 MiB gesamt |
| `twenty-cw04...` + `worker-` + `postgres-` + `redis-` (Twenty CRM Instanz 1, v1.17) | — | healthy | ~1,0 GiB gesamt |
| `twenty-zcw8400...` + `worker-` + `postgres-` + `redis-` (Twenty CRM Instanz 2, v2.8) | — | healthy | ~1,75 GiB gesamt |
| `headscale-q14bv...` | ghcr.io/juanfont/headscale | Up 30h | 28,8 MiB |
| `q1a8t4zswynvgutbw9og5l7n-...` | Schulnavigator-App (vermutlich Prod/Staging) | healthy, Up 33h | 63 MiB |
| `jjgl5u105ucxjvbeuwflsjq4-...` | Schulnavigator-App (vermutlich Prod/Staging) | healthy, Up 33h | 73 MiB |
| `lrn4cph7fvc72zztpjbtbblr-...` | Schulnavigator-App (vermutlich Prod/Staging) | Up 5d | 2,6 MiB |

**Befund:** `free` zeigt nur 849 MiB als "free", aber 3,5 GiB als "available" (reklamierbarer Buff/Cache-Anteil unter Linux — die realistischere Kennzahl für neu startende Prozesse). Disk-Headroom ist unkritisch (200 GiB frei von 232 GiB). Zwei Twenty-CRM-Instanzen (v1.17 + v2.8, vermutlich Migrations-Parallelbetrieb) belegen zusammen ca. 2,75 GiB RAM — das ist der größte Einzelposten neben den Coolify-Kerndiensten.

**Bewertung ggü. Alarmschwelle (< ~1 GiB frei nach Deploy):** Baseline liegt bereits *vor* dem Directus-Deploy bei "free" 849 MiB. Nach Kriterium 6 des Plans ist die Schwelle auf "available" zu beziehen (3,5 GiB) — Directus (~250–400 MiB) + Postgres (~100–200 MiB) sollten daraus keinen kritischen Engpass erzeugen, aber der Spielraum ist knapper als ein grüner Befund vermuten ließe. Wird nach Phase 1 erneut gemessen (Kriterium 6).

**Offene Frage 3 des Plans (Ausweichplan bei zu wenig Headroom):** noch nicht ausgelöst — Baseline liegt im akzeptablen Bereich, keine Eskalation an den Operator nötig.

---

## Phase 1 — Directus-Deploy

**Datum:** 2026-07-06 · **Weg:** Coolify-API (`POST /api/v1/services`, custom `docker_compose_raw`, kein One-Click-Template — das Default-Template nutzt SQLite, Plan verlangt Postgres)

**Service:** `directus-spike-251` (Coolify-UUID `g13fe84h6fvq3yxi80mw2mfh`), Projekt „Schulprojekte", Environment `staging`, Server `localhost` (= der VPS selbst, Coolify läuft dort)

| Komponente | Image | Container | Status |
|---|---|---|---|
| Directus | `directus/directus:11` | `directus-g13fe84h6fvq3yxi80mw2mfh` | healthy |
| Postgres | `postgres:16-alpine` | `postgres-g13fe84h6fvq3yxi80mw2mfh` | healthy |

**Domain:** `https://directus-spike.mpz.schule` (Traefik-Routing verifiziert — Router-Rule zeigt korrekt auf den gewünschten Hostnamen, nicht auf den Coolify-Resource-UUID-Fallback)

**Konfiguration (Auszug):** `KEY`/`SECRET` und `ADMIN_PASSWORD`/`POSTGRES_PASSWORD` von Coolify generiert (`SERVICE_BASE64_64_*` / `SERVICE_PASSWORD_*`, keine Werte im Repo committed — liegen in Coolify unter Service → Environment Variables). `DB_CLIENT=pg` gegen den Postgres-Container im selben Compose-Netz. `ADMIN_EMAIL` ist der Directus-Default (`admin@example.com`) — für den Spike ausreichend, echte Admin-Mail ist Sache von #255 (Prod). Postgres hat **keinen öffentlichen Port** (nur intern im Compose-Netz erreichbar).

**Verifikation (Kriterium 1 + Fehlercodes-Tabelle):**

| Prüfung | Befund |
|---|---|
| `GET /server/health` | `200 {"status":"ok"}` |
| `GET /admin/login` | `200` |
| `GET /items/directus_users` ohne Token | `403 FORBIDDEN` — **keine öffentliche Read-Rolle**, Gate-Anforderung erfüllt |
| `POST /auth/login` mit generiertem Admin-Passwort | erfolgreich, Access-Token erhalten — **ein** Admin-Account funktionsfähig |

**VPS-Headroom nach Deploy (Kriterium 6, zweiter Messpunkt ggü. Phase-0-Baseline):**

```
               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       4.2Gi       276Mi       330Mi       3.8Gi       3.5Gi
```

Directus-Container: 189,8 MiB RSS · Postgres-Container: 47,5 MiB RSS (zusammen ~237 MiB — nahe an der Schätzung aus der Planung). „available" bleibt bei 3,5 GiB unverändert (der Rückgang bei „free" ist reklamierbarer Cache) — **kein Alarmschwellen-Treffer** (< ~1 GiB), Deploy hat keinen kritischen Effekt auf den geteilten VPS.

**Abweichung vom Plan:** Coolifys One-Click-Directus-Template (`type: directus`) nutzt standardmäßig SQLite; da der Plan explizit Postgres verlangt (Prod-Nähe der Messwerte für #255), wurde stattdessen ein **custom `docker_compose_raw`** mit Directus + Postgres 16 gebaut (gleiche Coolify-Magic-Env-Konventionen wie im Template: `SERVICE_FQDN_*`, `SERVICE_PASSWORD_*`, `SERVICE_BASE64_64_*`). Kein Scope-Einfluss, nur Umsetzungsdetail.

---

## Phase 2 — Collections & Demo-Daten (`klassenzimmer`)

**Datum:** 2026-07-06 · **Weg:** Directus REST-Schema-API (`/collections`, `/fields`, `/relations`), nicht die Admin-UI — für Reproduzierbarkeit als Skript

### Mapping-Tabelle Feld ↔ Collection/Interface

| JSON-Feld | Directus-Collection.Feld | Interface | Bemerkung |
|---|---|---|---|
| `station.slug` | `stations.slug` | Input, unique | Konsumstelle filtert `?filter[slug]=` |
| `station.titel` | `stations.titel` | Input | — |
| `station.beschreibung` | `stations.beschreibung` | Input (multiline) | — |
| `station.viewer` | `stations.viewer` | Select-Dropdown | Choices `flat`/`equirectangular` |
| `station.bild` | `stations.bild` | Input | Pfad-String, kein Directus-Asset (E3 Option a) |
| `station.panorama360` | `stations.panorama360` | Input | dito |
| `station.startYaw/startPitch/startPanX` | `stations.startYaw/startPitch/startPanX` | Input (float) | optional, bei `klassenzimmer` leer |
| `station.dialog.figuren` | `stations.dialog_figuren` | **Tags (JSON-Feld)** | **Editor-UX-Befund:** Directus hat keinen nativen String-Enum-Array-Typ ohne M2M-Overhead; JSON-Feld ist der pragmatische Spike-Kompromiss, aber für Nicht-Techniker weniger selbsterklärend als ein Multi-Select mit festen Optionen (`frieda`/`otto`) — für #256 zu klären |
| `station.dialog.gruppen` | **nicht modelliert** | — | `klassenzimmer` nutzt keine Gruppen; Datenmodell wäre analog `dialog_segmente` eine eigene O2M-Collection `dialog_gruppen` (key, text, station) — aus Zeitbox-Gründen nicht gebaut, kein Blocker für E1–E3 |
| `station.dialog.bubble` | **nicht modelliert** | — | `klassenzimmer`-Daten nutzen kein Bubble-Layout-Override; wäre ein JSON-Feld auf `stations` analog `dialog_figuren` |
| `medien[]` | Collection `medien` (O2M) | List-O2M | `id`→`key` (Text), Directus-Auto-PK (`id`, integer) bleibt intern |
| `medien[].typ` | `medien.typ` | Select-Dropdown | Choices exakt aus `MediumTyp` |
| `medien[].videoSource`/`openIn` | `medien.videoSource`/`openIn` | Select-Dropdown | typgebundene Felder **nicht** technisch erzwungen (keine Directus-Conditions gebaut) — jede Zeile zeigt alle Felder unabhängig vom `typ`; Härtung wäre #256-Aufgabe |
| `medien[].embedAllow` | `medien.embedAllow` | Tags (JSON) | analog `dialog_figuren` |
| `hotspots360[]` | Collection `hotspots360` (O2M) | List-O2M | `id`→`key`; `yaw`/`pitch` Pflichtfelder |
| `hotspots360[].mediumId` | `hotspots360.mediumId` | Input (Text) | **kein hartes FK** auf `medien.key` — freier Text, referenzielle Integrität nicht erzwungen (Modellierungsfrage für #256, s. u.) |
| `dialog.segmente[]` | Collection `dialog_segmente` (O2M) | List-O2M | `id`→`key`; `sort` zusätzlich für Array-Reihenfolge (Directus-O2M hat kein natives Array-Sort außerhalb `sort_field`, hier nicht konfiguriert — `sort` als expliziter Integer statt) |
| `dialog.segmente[].quelle` | `dialog_segmente.quelle` | Input | fehlt bei `klassenzimmer` (text-only, ADR-026) — im Schema vorgesehen für spätere Audio-Ingest-Stationen |

**Nicht abbildbare Felder:** keine harten Blocker gefunden — alle `klassenzimmer`-Felder sind in Directus abbildbar. Zwei **weiche** Lücken (typgebundene Feld-Sichtbarkeit, referenzielle Integrität `mediumId`) sind bewusste Spike-Vereinfachungen, keine Directus-Grenzen — Directus Conditions und "hartes" M2O auf `key` wären technisch möglich, aber Zeitbox-Overhead für einen Wegwerf-Spike.

### API-Vertrags-Funde (wichtig für Phase 3)

1. **`fields=*.*` löst O2M-Alias-Felder NUR auf, wenn das Alias-Feld explizit auf der Eltern-Collection existiert.** Beim Anlegen der Relation über `POST /relations` (statt über die Admin-UI-Weboberfläche) wird das O2M-Alias-Feld (`medien`, `hotspots360`, `dialog_segmente` auf `stations`) **nicht automatisch** in `directus_fields` angelegt — die Admin-UI macht beide Schritte atomar über ihren Feld-Wizard, die reine Relations-API nicht. Ohne den fehlenden `POST /fields`-Nachtrag lieferte `fields=*.*` die Relationen gar nicht zurück (`404`-artiger Permission-Fehler „...or they do not exist"). **Für Phase 3 relevant:** `fields=*.*` genügt danach tatsächlich für alle drei O2M-Relationen inkl. `dialog_segmente` — die im Plan als offen markierte Frage zur Query-Tiefe ist damit **positiv** beantwortet, kein `fields=*,medien.*,...` nötig.
2. **Response-Envelope bestätigt:** `{ "data": [...] }` bei Liste, keine `meta` im Default (nur bei `?meta=` Parameter) — vereinfacht den Envelope-Unwrap in Phase 3 gegenüber der Planannahme leicht.
3. **Fehlerformat bestätigt:** `{ "errors": [{ "message": ..., "extensions": { "code": "FORBIDDEN" } }] }` — kein flaches `error`-Feld wie im Rest der Schulnavigator-API-Konvention (`SCREAMING_SNAKE_CASE` `error`-Feld); der Prototyp-Transform muss das Directus-Format selbst parsen, nicht auf App-Konventionen mappen.

### Checkpoint Tag 5 (vorgezogen, da Phase 2 an Tag 1 abgeschlossen)

**Ergebnis: bestanden, kein Abbruch.** Alle Felder von `klassenzimmer` sind modellierbar; Demo-Daten (4 Medien, 6 Hotspots inkl. 2 Dialog-Hotspots, 4 Dialog-Segmente) sind erfasst und per API verifiziert identisch zur JSON-Referenz. Fortsetzung mit Phase 3–6 wie geplant.

**Editor-UX-Beobachtung (Kriterium 8, Teil 1 von 2):** Diese Phase wurde per API-Skript durchgeführt, nicht über die Directus-Admin-UI von Hand — die **formale Beobachtung „unbeteiligte Person ändert einen Medientext über die UI"** (Offene Frage 2 des Plans) steht noch aus und erfordert eine echte Testperson (Felix oder MPZ-Kollege) an der UI unter `https://directus-spike.mpz.schule/admin`. Aus der Schema-Arbeit selbst ist aber bereits ein Struktur-Befund ableitbar: Das Tags-Interface für `dialog_figuren` (JSON-Array) und die fehlende Feld-Sichtbarkeits-Steuerung bei `medien.typ` (alle typgebundenen Felder immer sichtbar, nicht nur die passenden) sind beides Stellen, an denen eine Lehrkraft ohne Anleitung vermutlich stolpert.

**Statischer API-Token:** an den Admin-Account gebunden (`PATCH /users/me { token }`, nicht separater Service-User) — wie in der Planung entschieden (L3). Funktionsnachweis erfolgreich; Auth-Einordnung für #255 bleibt Berichts-Deliverable (Kriterium 8, Teil 2, siehe unten unter „Offene Punkte für #255").

---

## Phase 3 — Prototyp-Lesepfad (Next.js)

**Datum:** 2026-07-06 · **Neue Datei:** `app/lib/stations-directus.ts` · **Geändert:** `app/app/raum/[slug]/page.tsx` (Quellen-Weiche NUR an dieser Konsumstelle, `app/lib/stations.ts` bleibt unverändert sync/JSON-only — Pre-Mortem-1a-Entscheidung F2)

**Funktionsweise:** `getStationsForRequest()` holt `GET /items/stations?filter[slug][_eq]=klassenzimmer&fields=*.*` (statischer Token, 3s Timeout, `next: { revalidate: 60 }`), transformiert die Directus-Row per explizitem Field-Picking zurück in die JSON-`Station`-Form und ersetzt damit den `klassenzimmer`-Eintrag im importierten Build-JSON-Gesamtdokument (12 Stationen). Das Merge-Dokument läuft anschließend durch `validateStationsFile` — erst danach wird gerendert. `page.tsx` schaltet nur bei `SN_STATIONS_SOURCE=directus` (Runtime-Env, kein Build-Flag) auf diesen Pfad um; Default bleibt `getAllStations()` (reines Build-JSON, unverändertes Verhalten).

**Fallback-Verhalten (Kriterium 4) — 3 Stufen, alle auf denselben Pfad `getAllStations()`:**
1. Fetch schlägt fehl (Netzwerk/Timeout) → `DIRECTUS_UNREACHABLE`
2. Directus antwortet mit Fehlerstatus oder leerem `data[]` → `DIRECTUS_ERROR_<status>` / `DIRECTUS_SLUG_NOT_FOUND`
3. Merge-Dokument besteht `validateStationsFile` nicht → Fehler geloggt, Fallback

**Gefundener Bug während der lokalen Verifikation (dokumentiert, weil lehrreich für #256):** Die erste Implementierung übernahm `mascotFlipX` aus der Directus-Zeile unabhängig von `action`. Directus liefert für die Boolean-Spalte mit Schema-Default `false` — nicht `null` — auch bei **medium**-Hotspots, wodurch der Validator `medium-Hotspot360 darf kein mascotFlipX haben` warf und der Prototyp augenblicklich (und unbemerkt, weil optisch identisch zum JSON-Fallback!) auf den Fallback-Pfad auswich. **Konsequenz für die Bewertung:** Ein einfacher visueller Vergleich reicht nicht, um „Directus-Pfad aktiv" zu verifizieren — dazu wurde die Directus-`beschreibung` testweise auf einen eindeutigen Marker-Text gesetzt und im RSC-Payload nachgewiesen, dass er ankommt (Live-Verifikation, siehe Log-Auszug unten). Fix: Field-Picking-Transform jetzt strikt pro `action` (`medium` vs. `dialog`) statt nur nach `null`/`undefined`.

**Live-Verifikation (lokaler Dev-Server, `SN_STATIONS_SOURCE=directus` gegen die echte Spike-Directus-Instanz):**
- `beschreibung` testweise auf `"SPIKE-VERIFIKATION: Dieser Text kommt garantiert aus Directus, nicht aus stations.json."` gesetzt → erscheint im gerenderten HTML (Meta-Tags) **und** im RSC-Serialisierungs-Payload (vollständiges transformiertes `Station`-Objekt: 4 Medien, 6 Hotspots360 mit korrektem Field-Picking, 4 Dialog-Segmente) → danach zurückgesetzt.
- Keine Fallback-Fehlermeldung im Server-Log nach dem Bugfix — Merge-Dokument validiert fehlerfrei.

**`npm run build` (Default-Quelle, unverändert):** erfolgreich, keine neuen Typfehler/Lints durch `stations-directus.ts` oder `page.tsx` (`tsc --noEmit` zeigt nur vorbestehende, unabhängige Fehler in Test-Dateien). Turbopack-Warnung zu `next.config.ts`/`mpz-station-raumbild-ingest.ts` ist vorbestehend (auch auf unverändertem Branch-Stand reproduziert), nicht durch den Spike verursacht.

**Bekannter Seiteneffekt (kein Blocker):** 7 bestehende Vitest-Tests (`lib/mpz-station-dialog.test.ts`, `lib/mpz-station-hotspots.test.ts`, `app/api/mpz/dialog-audio/status/route.test.ts`) nutzten `klassenzimmer` bislang als „leere Leinwand ohne Dialog" für MPZ-Studio-CRUD-Fixtures. Seit Phase 2 (`stations.json`-Dialog-Ergänzung auf diesem Branch) schlagen diese 7 Tests fehl, weil ihre Annahme („kein Dialog vorhanden") nicht mehr zutrifft. **Kein Build-Blocker:** `npm run build` führt keine Vitest-Tests aus (nur die `validate:*:structure`-Skripte). Da der Branch `spike/directus-station` nie nach `main` gemergt wird, wandert dieser Seiteneffekt nicht in den Hauptzweig — bewusst nicht "repariert", um den Scope nicht tangential zu erweitern.

---
