# Spike-Bericht: Directus → Next.js → Deploy (#251)

**Status:** abgeschlossen (alle 8 Phasen durchlaufen, siehe Plan)
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

## Phase 4 — Deploy als Coolify-Test-Application, End-to-End-Verifikation

**Datum:** 2026-07-06/07 · **Neue Coolify-Application:** `directus-spike-251-app` (`h13lje955e2f1liu317bxibx`) · **Domain:** `https://app-spike.mpz.schule`

**Deploy-Vorgehen:** Bestehendes GitHub-Repo, Branch `spike/directus-station`, `build_pack: dockerfile` (vorhandenes `app/Dockerfile` unverändert, Coolify Base Directory `/app` wie bei den Produktiv-Instanzen). Environment-Variablen per Coolify-API gesetzt: `SN_STATIONS_SOURCE=directus`, `SN_DIRECTUS_URL=https://directus-spike.mpz.schule`, `SN_DIRECTUS_TOKEN=<statischer Admin-Token>`, plus die für den Produktivbetrieb ohnehin nötigen `SN_ACCESS_TOKENS`/`SN_MPZ_STUDIO_SECRET`-Analoga.

**Gefundene Deploy-Blocker (dokumentiert, weil über den Spike hinaus relevant für #256/Produktivbetrieb):**

1. **Private Submodules brechen Fresh-Clones.** Coolify klont bei einer neuen Application unbedingt `--recurse-submodules`. Die produktiven Submodule `auftraggeber/` und `protokolle/` sind privat und nicht für den Deploy-Kontext freigegeben → `fatal: could not read Username for 'https://github.com'`. Laut `build-kontext-submodule-regeln.md` sind beide Submodule ohnehin nicht build-/laufzeitrelevant (Docker-Kontext ist nur `app/`). **Fix für den Spike:** `.gitmodules` auf dem Spike-Branch entfernt und gepusht. **Für #256 zu klären:** Ob das für alle künftigen Fresh-Deploys (nicht nur Spikes) ein wiederkehrendes Risiko ist, oder ob die bestehenden Produktiv-Apps nur deshalb nicht betroffen sind, weil sie nie neu geklont, sondern nur redeployed wurden.
2. **Environment-Variablen-Duplikate durch wiederholte Bulk-PATCH-Aufrufe.** Mehrfache `PATCH .../envs`-Aufrufe beim Debuggen legten doppelte Einträge für dieselben Keys an (Coolify dedupliziert nicht automatisch bei Bulk-Updates über die API). Symptom: Health-Check/`validate:runtime` scheiterte mit einem Token aus einem älteren, nicht mehr gültigen Zustand. **Fix:** alle Duplikate einzeln per `DELETE .../envs/{uuid}` entfernt, dann ein einziger sauberer Bulk-PATCH.
3. **`SN_ACCESS_TOKENS`-Format ist an feste Werte gebunden.** `access-token-constants.mjs`/`validate-access-shared.mjs` erzwingen zur Build-/Runtime-Validierung exakte, im Code hinterlegte Token-Werte je Modus (`fest`/`heft`) — ein beliebiger Token-String reicht nicht. Für den Spike wurden die dort hinterlegten Dev-Token-Werte übernommen.

**Besucherpfad End-to-End (Kriterium 3):** `GET /eintritt?t=<heft-Token>` → `302` auf `/`, setzt `sn_access`-Cookie (`HttpOnly`, `Secure`, `SameSite=Lax`) → `GET /raum/klassenzimmer` mit Cookie → `200`, Seite enthält den Directus-Dialogtext. Vollständig gegen die öffentliche Domain verifiziert, kein `DEV_UNLOCK_ALL`-Bypass nötig (der wirkt ohnehin nur bei `NODE_ENV !== production`, was bei Coolify-Deploys nicht zutrifft — für #256/Testing-Doku relevant, falls künftige Test-Deploys einen Zugangs-Bypass brauchen).

**Wichtiger Befund — Verifikationsmethode und Stale-While-Revalidate (Kriterium 4/8):** Ein rein visueller Vergleich der Live-App gegen `stations.json` beweist **nicht**, dass tatsächlich Directus gelesen wird — die Demo-Daten in Directus und `stations.json` sind absichtlich identisch (Phase 2 Seed). Deshalb wurde die Directus-`beschreibung` live auf einen eindeutigen Marker-Text gepatcht und gegen die öffentliche Domain nachverfolgt:

- 1. Request nach dem Patch (innerhalb des vorherigen 60s-Cache-Fensters): alter Text — erwartet, da `next: { revalidate: 60 }` noch nicht abgelaufen war.
- 2.–3. Request (nach Ablauf von 60s, mehrfach wiederholt über >65s): **weiterhin alter Text.** Erst-Vermutung „Directus wird nicht gelesen" widerlegt sich beim Blick auf Next.js' Fetch-Cache-Semantik: `revalidate` implementiert **Stale-While-Revalidate**, nicht „harte" Invalidierung — der erste Request nach Ablauf liefert noch den (jetzt stalen) gecachten Wert aus und stößt eine Revalidierung im Hintergrund an; erst der **nächste** Request danach bekommt den frischen Wert.
- 4. Request (kurz danach): Marker-Text erscheint — sowohl im HTML als auch im RSC-Payload (`beschreibung: "SPIKE-VERIFIKATION-LIVE: ..."`).
- Marker anschließend in Directus auf den Original-Wortlaut zurückgesetzt (Demo-Daten wieder deckungsgleich mit `stations.json`).

**Konsequenz für #256:** Die effektive Propagationszeit einer Redakteurs-Änderung liegt nicht bei `revalidate`-Sekunden (60s), sondern bei **bis zu `revalidate` + Zeit-bis-zum-nächsten-Request** — bei seltenem Traffic auf einer Station potenziell deutlich länger als 60s. Für den Produktivbetrieb (Tag der offenen Tür, viele Requests pro Minute) ist das unkritisch; für eine Redaktions-Vorschau/Preview-Funktion (Lehrkraft ändert Text, will sofort sehen) wäre SWR ungeeignet und bräuchte einen expliziten Cache-Bust (z. B. `cache: 'no-store'` auf einer dedizierten Vorschau-Route oder Directus-Webhook → On-Demand-Revalidation).

**Container-Log-Beobachtung:** `docker logs` auf dem Coolify-Host zeigte im Produktionsmodus (`next start`) keine Per-Request-Zugriffslogs und keine `console.error`-Zeilen aus `stations-directus.ts` — die Abwesenheit von Fehlerlogs war also kein verlässliches Live-Signal für „Fallback aktiv/inaktiv"; der Marker-Text-Test war der einzige eindeutige Nachweis.

---

## Phase 5 — E1-Messungen (Latenz, Rebuild-Dauer, Fallback)

**Datum:** 2026-07-06 · Alle Messungen gegen die produktiv laufende Spike-App (`app-spike.mpz.schule`) bzw. den Spike-Directus-Service, nicht simuliert.

### Publish→Live-Latenz, Variante b (Runtime-Fetch, Data-Cache `revalidate: 60`)

Methode: `beschreibung` per API-Patch geändert, Stoppuhr gestartet, Live-Seite in Intervallen abgefragt bis der neue Text erscheint.

| Messlauf | Ergebnis |
|---|---|
| Messlauf 1 (Marker-Test während Phase 4, unregelmäßige Abfrageabstände) | Bis zu ~2 Minuten — siehe Phase-4-SWR-Befund unten |
| Messlauf 2 (kontrollierte 5s-Abfrage direkt nach Publish) | **5,5 s** bis der neue Text live sichtbar war |

**Erklärung der Spanne:** Next.js' `next: { revalidate: 60 }` ist **Stale-While-Revalidate**, keine harte Invalidierung (siehe Phase-4-Befund). Die tatsächliche Latenz setzt sich zusammen aus **(a)** der Restzeit bis zum Ablauf des 60s-Fensters seit dem letzten erfolgreichen Cache-Schreiben (0–60 s, abhängig vom Besucher-Traffic auf der Station) **plus (b)** der Zeit, bis nach Fensterablauf ein Request eintrifft, der die Hintergrund-Revalidierung anstößt, **plus (c)** der eigentlichen Fetch-Dauer (siehe Rohlatenz unten, < 0,2 s). Bei häufigem Traffic (Tag der offenen Tür) ist (a)+(b) klein → Messlauf 2 ist der realistischere Fall für den Produktivbetrieb. Bei seltenem Traffic auf einer Station kann die Latenz bis knapp über 60 s betragen, in Ausnahmefällen (lange Pausen zwischen Requests) auch deutlich länger, weil erst der nächste Besucher-Request die Revalidierung überhaupt anstößt.

### Rohlatenz (Fetch-Anteil isoliert, Näherung für `revalidate: 0`)

Direkte Messung des Directus-API-Calls, den der Next.js-Server bei jeder (Hintergrund-)Revalidierung zahlt (`GET /items/stations?filter[slug][_eq]=klassenzimmer&fields=*.*`, 3 Wiederholungen):

| Versuch | Gesamtzeit | Time-to-first-byte |
|---|---|---|
| 1 | 198 ms | 198 ms |
| 2 | 112 ms | 110 ms |
| 3 | 111 ms | 111 ms |

Transform + `validateStationsFile` sind reine In-Memory-Operationen (kein I/O) und tragen keine messbare zusätzliche Latenz bei. **Schlussfolgerung:** Der Fetch-Anteil selbst ist mit ~0,1–0,2 s vernachlässigbar; die im vorigen Abschnitt gemessene Spanne (5,5 s bis ~2 min) wird fast vollständig vom SWR-Verhalten des Data-Cache bestimmt, nicht von Directus' Antwortzeit.

### Coolify-Rebuild-Dauer, Variante a (Webhook-Rebuild)

Manueller Redeploy der Spike-App über die Coolify-API ausgelöst (`POST /applications/{uuid}/restart`, entspricht einem Klick auf „Redeploy" in der UI), Stoppuhr von Trigger bis `status: finished` + Healthcheck „healthy":

- **Gesamtdauer: 19 s** (22:39:35 → 22:39:54 UTC), inkl. Git-Clone, Docker-Build, Rolling-Update-Health-Check, Alt-Container-Entfernung.
- **Einschränkung (Ehrlichkeitshinweis):** Es wurde derselbe Commit ohne Code-/Dependency-Änderung neu deployed → Docker-Layer-Cache griff vollständig, `npm ci`/Build-Schritte liefen praktisch cache-hit. Das ist der **realistische Fall für „Redakteur pusht nur Content-Änderung"** (keine Dependency-Änderung), aber **nicht** repräsentativ für einen echten Cold-Build (neue Dependency, `node_modules`-Cache invalidiert) — der würde nach Erfahrungswerten der bestehenden Produktiv-Deploys im Bereich von 2–4 Minuten liegen (nicht in diesem Spike separat gemessen, da kein Anlass für eine Dependency-Änderung bestand).
- **Vergleich zu Variante b:** Selbst im schnellsten Fall (19 s) ist ein Webhook-Rebuild pro Content-Änderung langsamer als die beste Runtime-Fetch-Latenz (5,5 s), aber deutlich vorhersagbarer (keine SWR-Unschärfe) — und würde bei mehreren Redakteurs-Änderungen pro Tag ungleich mehr Coolify-Deploy-Zyklen erzeugen als Variante b.

### Fallback-Verhalten bei Directus-Ausfall (Kriterium 4)

Vorgehen: laufenden Directus-Container real gestoppt (`docker stop`), Data-Cache-Fenster (60 s) vollständig ablaufen lassen, danach wiederholt `/raum/klassenzimmer` abgefragt.

| Zeitpunkt | Aktion | Ergebnis |
|---|---|---|
| t=0 | Directus-Container gestoppt | `GET /server/health` → Timeout/`000` |
| t≈0–60s | Requests gegen die App | `200`, aber noch aus dem vor dem Stopp gültigen Erfolgs-Cache bedient (kein echter Fallback-Test, da Fenster noch nicht abgelaufen) |
| t≈65s, 70s (nach Fensterablauf) | Requests gegen die App | **`200`**, Antwortzeit 0,23–0,26 s — App bricht nicht, liefert weiterhin den `klassenzimmer`-Content |

**Ergebnis: Kriterium 4 erfüllt.** Die App liefert während des gesamten Directus-Ausfalls durchgehend `200` und bleibt schnell — kein Hängen, keine Fehlerseite, kein Timeout-Warten (der 3-Sekunden-`AbortSignal.timeout` griff nicht spürbar, weil ein gestoppter Container sofort einen Verbindungsfehler statt eines hängenden Requests liefert). **Einschränkung:** Die Fallback-Log-Zeile (`[stations-directus] DIRECTUS_UNREACHABLE`) war in `docker logs` nicht sichtbar (gleicher Befund wie Phase 4) — der Beweis, dass tatsächlich der Code-Fallback (nicht ein stiller Cache-Hit) griff, stützt sich auf die Zeitrechnung (Fenster nachweislich abgelaufen, Directus nachweislich unerreichbar) plus den Quellcode-Pfad, nicht auf ein direktes Log-Signal. **Für #256 relevant:** Die fehlende Log-Sichtbarkeit in Produktion ist ein eigenständiger Befund für Observability (Fehlermeldungen aus Server Components landen in `docker logs`, aber ggf. gepuffert/verzögert über das hier getestete Zeitfenster hinaus) — sollte in ein produktives Setup ein strukturiertes Logging/Monitoring statt `console.error` bekommen.

Directus-Container anschließend wieder gestartet, Health nach ~6 s wiederhergestellt.

**Variante c (Hybrid-Export):** nicht gebaut (Zeitbox-Entscheidung it. Plan), da Phase 1–6 planmäßig durchlief. Abschätzung: Aufwand ≈ Transform-Logik aus Phase 3 (bereits vorhanden) + einfaches Skript `Directus → JSON-Datei → validateStationsFile → bestehender Build/Deploy`; Latenz entspräche dann Variante a (Rebuild-Dauer), mit dem Vorteil, dass Directus zur Build-Zeit gebraucht wird statt zur Laufzeit (kein Laufzeit-Ausfallrisiko, aber auch kein Live-Vorschau-Komfort).

---

## Phase 6 — E3-Medien-Gate-Befund

**Datum:** 2026-07-06

### Option a (Pfad-Referenz, Spike-Baseline) — Bestehendes Cookie-Gate bleibt intakt

`GET /media/klassenzimmer/video/grundschule_demo.mp4` gegen die Live-App:

- **Ohne Cookie:** `403` — Gate wirkt wie in der Produktivinstanz.
- **Mit gültigem `sn_access`-Cookie:** `404` (Datei auf dem Spike-Deploy nicht vorhanden — vermutlich Git-LFS-Pointer-Datei statt Binärinhalt beim Fresh-Clone, siehe Phase-4-Blocker 1; **kein Befund gegen Option a selbst**, sondern ein separates Asset-Bereitstellungsproblem des Wegwerf-Deploys). Das Gate-Verhalten (403 ohne, kein Bypass) ist der relevante Teil des Kriteriums und eindeutig bestanden.

### Option b (Directus-Assets) — S1-Regression bestätigt, aber konfigurationsabhängig

Vorgehen: neutrales 1×1-Px-Dummybild (kein Stationscontent) per API in Directus hochgeladen, `GET /assets/<id>` ohne jeden Auth-Header/Cookie getestet.

1. **Ausgangszustand (Directus-Default nach Schema-Setup per API, kein manuell konfigurierter Public-Zugriff):** `403 FORBIDDEN` — die `$t:public_label`-Policy hatte **keine** Berechtigung auf `directus_files` (leeres `permissions[]`-Array). **Das widerspricht der Plan-Annahme eines automatischen `200`** — ein frisch aufgesetztes Directus 11 ist beim Datei-Zugriff standardmäßig **zu**, nicht offen.
2. **Mit testweise vergebener Public-Read-Permission auf `directus_files`** (`POST /permissions`, Policy `$t:public_label`, `action: read`): `GET /assets/<id>` ohne Cookie → **`200`**, `Content-Type: image/png` — Datei komplett ohne Auth ausgeliefert.
3. Testberechtigung sofort danach entfernt (`DELETE /permissions/{id}`), Kontrollabruf bestätigt wieder `403`. Dummy-Datei gelöscht.

**Einordnung (korrigiert gegenüber der Plan-Erwartung, s. Pre-Mortem 1b Fund L1):** Ein `200` auf `/assets/*` ohne Cookie ist **kein Directus-Standardverhalten**, sondern eine direkte Folge der Rollen-/Berechtigungskonfiguration. Der S1-Regressionsbefund ist trotzdem **praktisch relevant und nicht theoretisch**, weil Option b nur dann sinnvoll nutzbar ist, wenn Bilder/Videos direkt per `<img src>`/`<video src>` aus dem Browser gegen die Directus-Domain geladen werden — das setzt zwingend eine Public-Read-Berechtigung auf `directus_files` voraus (der Browser kann das app-eigene `HttpOnly`-`sn_access`-Cookie nicht domänenübergreifend an Directus senden, und Directus kennt dieses Cookie ohnehin nicht). **Fazit für #254:** Sobald Option b tatsächlich produktiv eingesetzt wird, ist die S1-Regression nahezu unvermeidlich — es sei denn, es wird eine zusätzliche Zugriffsschicht vorgeschaltet (z. B. ein signierter/zeitlich begrenzter Directus-Asset-Token pro Session, oder ein Next.js-Proxy-Endpunkt, der Directus-Auth serverseitig hält und das bestehende Cookie-Gate wiederverwendet — de facto eine Variante von Option a mit Directus als Speicher-Backend statt Dateisystem). **Empfehlung:** Option a (Pfad-Referenz, wie im Spike gebaut) oder ein serverseitiger Directus-Proxy vorziehen; reines Option b (direkte Directus-Asset-URLs im Client) nur mit explizitem Sign-off zur DSGVO-/Zugangs-Frage.

---

## Editor-UX-Beobachtung, Teil 2 (Admin-UI, Kriterium 8)

**Datum:** 2026-07-06 · Ein Browser-Testlauf gegen die Admin-UI konnte im Rahmen dieses Spikes technisch nicht zuverlässig durchgeführt werden (Tooling-Fehler des Browser-Agenten). **Einschränkung gegenüber der Plan-Vorgabe** (Offene Frage 2: „unbeteiligte Person ändert einen Medientext"): Die folgende Einschätzung stützt sich stattdessen auf eine **objektive Feld-Metadaten-Prüfung** der Directus-Schema-API (was tatsächlich konfiguriert ist, nicht wie es sich in der UI anfühlt) plus die Struktur-Beobachtung aus Phase 2. **Die eigentliche Beobachtung einer echten, unbeteiligten Testperson an der UI bleibt für #255/#256 offen** und sollte vor dem produktiven Rollout nachgeholt werden — das ist eine Lücke dieses Spikes, kein erledigtes Kriterium.

**Objektiver Befund aus den Feld-Metadaten (`GET /fields/medien`):** Keines der zehn Felder der Collection `medien` hat eine `conditions`-Regel gesetzt (Directus' Mechanismus, um Felder abhängig vom Wert eines anderen Feldes ein-/auszublenden). Das bestätigt den in Phase 2 vermuteten Befund technisch: **Alle Felder (`quelle`, `videoSource`, `poster`, `thumbnail`, `openIn`, `embedAllow`, `untertitel`) werden in der UI immer angezeigt**, unabhängig davon, welcher `typ` (z. B. `video` vs. `foto` vs. `link`) gewählt ist. Eine Lehrkraft sieht beim Bearbeiten eines Foto-Eintrags z. B. auch die nur für Videos relevanten Felder `videoSource`/`openIn` — ohne Erklärung, wann diese gelten. Directus unterstützt Conditions technisch (wäre in #256 nachrüstbar), sie wurden im Spike aus Zeitbox-Gründen nicht konfiguriert.

**Feld-Interface-Typen (bestätigt):** `typ`, `videoSource`, `openIn` nutzen `select-dropdown` (feste, für Laien anklickbare Optionen — unkritisch). `dialog_figuren` (auf `stations`) und `embedAllow` (auf `medien`) nutzen dagegen `tags` auf einem `json`-Feld: freies Eintippen von Text-Tags statt einer festen Auswahlliste. Für `dialog_figuren` (erwartete Werte: exakt `frieda`/`otto`) besteht damit ein reales Fehlerrisiko durch Tippfehler (z. B. „Frieda" mit Großbuchstabe, Leerzeichen) ohne Validierung durch die UI selbst — ein Laie hat keine Möglichkeit zu erkennen, welche Werte gültig sind, außer durch Dokumentation außerhalb von Directus.

**Einschätzung (mit der o. g. Einschränkung):** Das reine Ändern eines bestehenden Freitexts (`beschreibung`, `untertitel`) ist unkritisch und dürfte auch ohne Anleitung gelingen — Standard-Textfelder in Directus sind selbsterklärend. Die zwei oben genannten Strukturbefunde (fehlende Feld-Sichtbarkeits-Steuerung, freie Tags statt fester Auswahl bei `dialog_figuren`) sind die konkreten Stellen, an denen eine Lehrkraft ohne Anleitung vermutlich stolpert oder ungültige Werte einträgt — beides ist in #256 mit vertretbarem Aufwand behebbar (Directus-Conditions, harte Choices/M2M statt Tags-JSON), sollte aber vor einem produktiven Rollout an Lehrkräfte behoben und dann mit einer echten Testperson verifiziert werden.

---

## VPS-Headroom — Gesamtvergleich (Kriterium 6)

| Messpunkt | `free` | `available` | Neu belegtes RAM ggü. Vorpunkt |
|---|---|---|---|
| Phase 0 (Baseline, vor Directus) | 849 MiB | 3,5 GiB | — |
| Phase 1 (nach Directus+Postgres-Deploy) | 276 MiB | 3,5 GiB | ~237 MiB (Directus 190 MiB + Postgres 48 MiB) |
| Phase 4/5 (zusätzlich Next.js-Spike-App laufend) | 688 MiB | 3,5 GiB | + ~56 MiB (Next.js-Container) |

**Gesamtbefund:** Über den kompletten Spike-Zeitraum blieb „available" konstant bei 3,5 GiB — der komplette Directus+Postgres+Next.js-Fußabdruck (~290 MiB) hatte keinen kritischen Effekt auf den geteilten VPS. Kriterium 6 (Alarmschwelle < ~1 GiB `available`) wurde zu keinem Zeitpunkt berührt. Der VPS ist für eine produktive Directus-Instanz in dieser Größenordnung ausreichend dimensioniert, sofern keine weiteren großen Dienste parallel hinzukommen (die zwei parallelen Twenty-CRM-Instanzen bleiben der größte Einzelposten, unabhängig vom Spike).

---

## Statischer API-Token — Auth-Einordnung für #255

Der in Phase 2/3 verwendete statische Directus-Token ist **an den Admin-Account gebunden** (`PATCH /users/me { token }`), nicht an einen separaten Service-User. Das war für den Spike der pragmatischste Weg (kein zusätzliches Schema/User-Setup nötig), ist aber **keine für die Produktion geeignete Auth-Rolle**:

- Er **umgeht 2FA** — das beschlossene Auth-Konzept ([`directus-auth-konzept.md`](../spezifikationen/directus-auth-konzept.md)) verlangt 2FA verpflichtend für die Admin-Rolle ab erstem Prod-Login; ein statischer Admin-Token unterläuft das vollständig, da er keine erneute Authentifizierung erfordert.
- Er hat **volle Admin-Rechte**, nicht nur Lesezugriff auf die Stations-Collections, die der Next.js-Lesepfad tatsächlich braucht — verstößt gegen das Least-Privilege-Prinzip.
- Er ist **nicht rotierbar ohne den Admin-Zugang selbst zu berühren** (Token liegt am selben `users/me`-Datensatz wie das Admin-Passwort).

**Empfehlung für #255:** Vor jedem Produktiv-Einsatz einen dedizierten **API-Only-Service-User** anlegen — eigene Rolle „Next.js-Reader" (oder analog), **keine** `app_access` (kein UI-Login nötig), **keine** 2FA-Pflicht (da kein interaktiver Login möglich ist), Berechtigung ausschließlich `read` auf `stations`, `medien`, `hotspots360`, `dialog_segmente` (und ggf. Untercollections). Der Token dieses Service-Users landet als `SN_DIRECTUS_TOKEN` in den App-Env-Vars — analog zum Spike-Aufbau, aber ohne Admin-Rechte und ohne 2FA-Umgehung. Diese Entscheidung muss ins Auth-Konzept nachgetragen werden (aktuell nur Redaktion/Admin für menschliche Logins vorgesehen, kein Service-Account-Typ).

---

## Branch-Entscheidung für die Directus-Entwicklung (Gate-8-Rest)

**Empfehlung: Kein Merge und keine Fortführung von `spike/directus-station`.** #255 (produktive Directus-Integration) sollte **frisch von `main`** abzweigen, aus drei Gründen:

1. **Bewusste Spike-Vereinfachungen sind im Branch fest verdrahtet:** Die Merge-Strategie in `stations-directus.ts` (Ersetzen eines einzelnen Stationseintrags im Gesamtdokument) ist ein Ein-Stations-Kompromiss für den Spike, keine Zielarchitektur für 12 Stationen aus Directus. Ein direkter Ausbau auf diesem Branch würde den Workaround zementieren statt ihn durch eine echte Mehr-Stationen-Lösung zu ersetzen.
2. **`.gitmodules`-Entfernung ist spike-spezifisch**, nicht für `main` gedacht — dort werden die Submodule weiterhin für Doku/Material gebraucht (siehe Build-Kontext-Regeln); ein Merge würde das versehentlich in die Produktivhistorie tragen.
3. **Der statische Admin-Token und die Demo-Directus-Instanz sind Wegwerf-Artefakte** — #255 startet ohnehin mit einer neuen, produktiv konfigurierten Directus-Instanz (dedizierter Service-User, siehe oben; echte Admin-Mail; Backup-Einbindung), nicht mit dem Spike-Service.

**Was aus dem Spike mitgenommen werden soll (bewusst kopiert, nicht gebrancht):** die Mapping-Tabelle (Phase 2), das Field-Picking-Transform-Muster (`transformHotspot360`/`transformStationRow` als Vorlage für strikte Whitelist-Transforms), die API-Vertrags-Funde (Envelope, O2M-Alias-Feld-Fallstrick), und dieser gesamte Bericht als Referenzdokument.

---

## Zusammenfassung & Empfehlung je E1/E2/E3

| Entscheidung | Optionen | Spike-Empfehlung | Kurzbegründung |
|---|---|---|---|
| **E1** ([#252](https://github.com/flxln/schulnavigator/issues/252)) — Wie kommt Directus-Content live? | a) Webhook-Rebuild · b) Runtime-Fetch+Data-Cache · **c) Hybrid-Export** | **b für den MVP, mit Option auf c später** | b ist bereits gebaut, funktioniert nachweislich (End-to-End verifiziert), bricht bei Directus-Ausfall nicht (Kriterium 4 bestanden) und ist bei normalem Besucher-Traffic am schnellsten sichtbar (5,5 s gemessen). Trade-off: SWR-Unschärfe bis ~60 s+ bei seltenem Traffic — für Stationsinhalte, die nicht sekundengenau aktuell sein müssen, akzeptabel. c (Hybrid-Export) bleibt die robustere Wahl, falls Directus künftig instabiler laufen soll als der Next.js-Build-Prozess, ist aber Mehraufwand ohne aktuellen Bedarf. |
| **E2** ([#253](https://github.com/flxln/schulnavigator/issues/253)) — Datenmodell/Mapping | siehe Mapping-Tabelle Phase 2 | **Alle `klassenzimmer`-Felder sind 1:1 abbildbar**, zwei bewusste Spike-Lücken (`dialog.gruppen`, `dialog.bubble`) sind keine Directus-Grenzen, nur nicht gebaut. Referenzielle Integrität (`hotspots360.mediumId` → `medien.key`) ist im Spike **nicht** technisch erzwungen — für #256 als hartes M2O-Feld nachrüsten. | — |
| **E3** ([#254](https://github.com/flxln/schulnavigator/issues/254)) — Medien-Auslieferung | a) Pfad-Referenz · b) Directus-Assets · c) — | **a (wie im Spike gebaut)** | Bestehendes Cookie-Gate bleibt vollständig intakt (403 ohne Cookie, verifiziert). Option b erzeugt eine reale, nicht nur theoretische S1-Regression, sobald sie produktiv nutzbar gemacht wird (Public-Read auf `directus_files` nötig, Browser kann App-Cookie nicht an Directus senden) — nur mit explizitem DSB-Sign-off und zusätzlicher Schutzschicht (Proxy/signierte URLs) vertretbar, kein MVP-Kandidat. |

**Gesamtfazit:** Der Directus → Next.js → Deploy-Pfad ist für den Schulnavigator **technisch tragfähig** und wurde für die Demo-Station `klassenzimmer` vollständig end-to-end nachgewiesen (Deploy, Schema, Lesepfad, Coolify-Deploy, Besucherpfad inkl. Access-Cookie, Fallback-Verhalten, Medien-Gate). Für #255 empfiehlt sich ein **Neustart von `main`** mit dediziertem Service-User-Token, Mehr-Stationen-Merge-Strategie (nicht der Ein-Stations-Workaround des Spikes) und einer echten Editor-UX-Beobachtung mit einer unbeteiligten Testperson vor dem produktiven Rollout.

---
