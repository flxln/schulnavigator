# Epic: Directus #47 — Lehrkräfte-CMS (ADR-003), Adoption-First mit Spike

**Milestone:** Phase 5 (31.10.2026 — weicher Anker, siehe Risiken)
**Status:** aktiv (2026-07-06) — Unterissues #249–#262 auf GitHub; Bodies: [planung/issues/](../issues/) · Index: [epic-directus-issues.md](./epic-directus-issues.md)
**Grundlage (bindend):** [Council-Chairman 2026-07-06](../../reviews/council-directus-planung-2026-07-06.md) — Umstellung von „Technik-First“ auf **Adoption-First mit technischem Spike**; kein Big-Bang für alle 11+ Stationen.

## Übersicht

Labels nur aus [labels.md](../labels.md). Triage nach Runbook `03b_issue-triage` (Vault `wissen-ki-und-mehr`, nicht in diesem Repo) — nur für Implementierungs-Issues; Org-/Content-/ADR-Issues laufen ohne Feature-Pipeline.

| Rolle | Nr. | Titel | Labels | Blockiert durch | Triage (03b) |
|-------|-----|-------|--------|-----------------|--------------|
| **Epic (Parent)** | [#47](https://github.com/flxln/schulnavigator/issues/47) | Directus — Lehrkräfte-CMS (ADR-003), Adoption-First mit Spike | `tech` | — | — |
| Welle 0 | [#249](https://github.com/flxln/schulnavigator/issues/249) | Adoption klären: Champion + Pflegefrequenz (aus #44), optional Gate 9 | `org`, `blocker`, `extern` | #44 | — |
| Welle 0 | [#250](https://github.com/flxln/schulnavigator/issues/250) | Gates 4–6 formal abschließen (Auth-Konzept beschließen, VVT/DSE finalisieren) | `org`, `blocker` | — | — |
| Welle 1 | [#251](https://github.com/flxln/schulnavigator/issues/251) | Technischer Spike: 1 Station end-to-end Directus → Next.js → Deploy (Zeitbox 2 Wochen) | `tech` | — | VOLL · Fable |
| Welle 1 | [#252](https://github.com/flxln/schulnavigator/issues/252) | ADR: Runtime-Datenpfad (Build-JSON vs. Runtime-Fetch vs. Webhook-Rebuild) | `tech` | [#251](https://github.com/flxln/schulnavigator/issues/251) | — |
| Welle 1 | [#253](https://github.com/flxln/schulnavigator/issues/253) | ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze | `tech`, `content` | [#251](https://github.com/flxln/schulnavigator/issues/251) | — |
| Welle 1 | [#254](https://github.com/flxln/schulnavigator/issues/254) | ADR: Medien-Storage (`public/`-Volumes vs. Directus-Assets vs. Object Storage) — Gate-kompatibel | `tech` | [#251](https://github.com/flxln/schulnavigator/issues/251) | — |
| Welle 2 | [#255](https://github.com/flxln/schulnavigator/issues/255) | Directus-Prod-Deploy auf Coolify (eigener Service; noch kein Lehrkräfte-Login) | `tech` | [#251](https://github.com/flxln/schulnavigator/issues/251)–[#254](https://github.com/flxln/schulnavigator/issues/254) | VOLL · Fable |
| Welle 2 | [#256](https://github.com/flxln/schulnavigator/issues/256) | Collections aus `stations.schema.json` + Kein-Schüler-PII technisch erzwingen | `tech` | [#252](https://github.com/flxln/schulnavigator/issues/252), [#255](https://github.com/flxln/schulnavigator/issues/255) | VOLL · Fable |
| Welle 2 | [#257](https://github.com/flxln/schulnavigator/issues/257) | Next.js-Anbindung: Runtime-Datenpfad produktiv umsetzen | `tech` | [#252](https://github.com/flxln/schulnavigator/issues/252), [#255](https://github.com/flxln/schulnavigator/issues/255) | VOLL · klassisch |
| Welle 2 | [#258](https://github.com/flxln/schulnavigator/issues/258) | Gate-7-Rest: Directus-DB in Backup T5 aufnehmen + Restore-Test | `tech` | [#255](https://github.com/flxln/schulnavigator/issues/255) | LIGHT · klassisch (Härtung, B=2) |
| Welle 3 | [#259](https://github.com/flxln/schulnavigator/issues/259) | Migration Pilot-Content (Quelle `kunde/39-gs`) nach Directus | `content`, `tech` | [#253](https://github.com/flxln/schulnavigator/issues/253), [#256](https://github.com/flxln/schulnavigator/issues/256), [#257](https://github.com/flxln/schulnavigator/issues/257) | VOLL · Fable (B=2) |
| Welle 3 | [#260](https://github.com/flxln/schulnavigator/issues/260) | `anleitungen/fuer-lehrkraefte.md`: Directus-Anleitung (Platzhalter ersetzen) | `content` | [#255](https://github.com/flxln/schulnavigator/issues/255), [#256](https://github.com/flxln/schulnavigator/issues/256) | — |
| Welle 3 | [#261](https://github.com/flxln/schulnavigator/issues/261) | Pilot: 2 Lehrkräfte pflegen 1 Raum ohne Felix (DoD-Träger) | `org`, `content` | [#249](https://github.com/flxln/schulnavigator/issues/249), [#250](https://github.com/flxln/schulnavigator/issues/250), [#258](https://github.com/flxln/schulnavigator/issues/258), [#259](https://github.com/flxln/schulnavigator/issues/259), [#260](https://github.com/flxln/schulnavigator/issues/260), [#263](https://github.com/flxln/schulnavigator/issues/263) | — |
| Welle 3 | [#262](https://github.com/flxln/schulnavigator/issues/262) | MPZ Studio nach Directus-Go auf Dev-/Notfall-Ingest begrenzen (ADR-022-Nachtrag) | `org` | [#261](https://github.com/flxln/schulnavigator/issues/261) | — |

## GitHub-Links

| Issue | URL |
|-------|-----|
| #249 | https://github.com/flxln/schulnavigator/issues/249 |
| #250 | https://github.com/flxln/schulnavigator/issues/250 |
| #251 | https://github.com/flxln/schulnavigator/issues/251 |
| #252 | https://github.com/flxln/schulnavigator/issues/252 |
| #253 | https://github.com/flxln/schulnavigator/issues/253 |
| #254 | https://github.com/flxln/schulnavigator/issues/254 |
| #255 | https://github.com/flxln/schulnavigator/issues/255 |
| #256 | https://github.com/flxln/schulnavigator/issues/256 |
| #257 | https://github.com/flxln/schulnavigator/issues/257 |
| #258 | https://github.com/flxln/schulnavigator/issues/258 |
| #259 | https://github.com/flxln/schulnavigator/issues/259 |
| #260 | https://github.com/flxln/schulnavigator/issues/260 |
| #261 | https://github.com/flxln/schulnavigator/issues/261 |
| #262 | https://github.com/flxln/schulnavigator/issues/262 |
| #263 | https://github.com/flxln/schulnavigator/issues/263 |
| #47 | https://github.com/flxln/schulnavigator/issues/47 |

## Ziel & Definition of Done

*Nicht-Techniker müssen strukturierte Raumdaten ändern können, ohne die App zu deployen* (Council, First-Principles). Directus ist per ADR-003 gesetzt; ein Custom-Admin für Lehrkräfte bleibt verboten.

**DoD des Epics (messbar, Chairman-Formel):**

- [ ] **≥ 2 Lehrkräfte haben ohne Felix' Hilfe eine Content-Änderung an ≥ 1 Raum in Produktion veröffentlicht** („2 Lehrkräfte, 1 Raum, ohne Felix“)
- [ ] Gates 1–8 des [Auth-Konzepts](../../spezifikationen/directus-auth-konzept.md) belegt erfüllt; kein Lehrkräfte-Login vorher
- [ ] Optional Gate 9: benannter Champion + realistische Pflegefrequenz dokumentiert (#249)
- [ ] MPZ-Studio-Rolle nach Go explizit begrenzt (#262)

„Directus live“ allein ist **kein** DoD (Council-Konsenslücke Erfolgsmetrik).

## Gate-Status (aktualisiert 2026-07-06, nach #250)

**Aufgelöst:** Der Kopf des [Auth-Konzepts](../../spezifikationen/directus-auth-konzept.md) nannte bis 2026-07-06 pauschal „4–8 offen“ und widersprach dem Repo-/Git-Befund. Mit #250 ist der Konzept-Kopf auf den verifizierten Stand gehoben; beide Spalten unten stimmen jetzt überein.

| Gate | Laut Auth-Konzept | Verifizierter Befund (2026-07-06) |
|------|-------------------|------------------------------------|
| 1 AVV #43 | ✅ | ✅ unterschrieben 25.06.2026 inkl. ADR-027-Anhang — **Directus-Verarbeitung (Lehrkräfte-Accounts) separat geprüft: negativ, Nachtrag als Blocker vor #261 → [#263](https://github.com/flxln/schulnavigator/issues/263)** |
| 2 DSB | ✅ | ✅ LaSuB-DSB in App (`dsb-contact.ts`) |
| 3 Media-Gate | ✅ | ✅ `app/app/media/[...path]/route.ts` prüft Entry-Cookie (403 + `no-store`, Cache `private`) — auf `main` **und** Prod (`kunde/39-gs`, zusätzlich Middleware `21a1dc2`) |
| 4 dsgvo.md v1.0 + VVT | weitgehend erfüllt | **weitgehend erfüllt:** `dokumentation/dsgvo.md` auf `main` ist „v1.0 (beschlossen)“ inkl. VVT-Kurzfassung (Art. 30) mit Eintrag „Lehrkräfte-Accounts (geplant)“ und benanntem Trigger (Deploy → #255). Rest: Eintrag beim Deploy konkretisieren |
| 5 Auth-Konzept beschlossen | ✅ | ✅ **beschlossen (2026-07-06, #250)** — Status im Dokument gehoben, Rollenmodell/2FA/Session/Löschfristen bestätigt |
| 6 DSE-Abschnitt Lehrkräfte-Login live | teilerfüllt | **teilerfüllt:** Abschnitt `lehrkraefte-login` existiert in `datenschutz.ts` auf `main` und Prod (`kunde/39-gs`), als „geplant“ formuliert; Trigger benannt — Finalisierung als erste, blockierende Teilaufgabe von #261, **vor** erstem Login |
| 7 Backup T5 inkl. Directus-DB | teilerfüllt | **teilerfüllt:** T5 läuft (#243, Follow-ups #246–#248 erledigt 2026-07-06); Directus-DB kann erst nach Deploy aufgenommen werden (#258) |
| 8 Branch-Konsolidierung | im Kern erledigt | **im Kern erledigt (Git-verifiziert):** Legal-Content (`app/content/legal/*`), `dsgvo.md` und ADR-027 liegen auf allen drei Branches — `kunde/39-gs` (PR #241, `f6b1d84`), `feature/mpz-studio` (PR #240, `2eee1e4`), `main` (Merge `port/runtime-compliance-to-main`, Stand 04.–06.07.2026). **Rest-Drift:** `kunde/39-gs` führt ~90 Commits Content/Fixes vor `main` (`stations.json` +697/−84 Zeilen); `main` führt 17 Doku-Commits vor `kunde`. Keine Compliance-Blockade mehr — aber: für die Migration ist **`kunde/39-gs` die Content-Source-of-Truth**. **Entwicklungs-Branch-Entscheidung (2026-07-07, #251):** #255 startet **frisch von `main`**, nicht von `spike/directus-station` (Wegwerf-Branch, nicht mergen — Begründung im [Spike-Bericht](../../reviews/spike-directus-2026-07.md#branch-entscheidung-für-die-directus-entwicklung-gate-8-rest)) und nicht von `feature/mpz-studio` (dort läuft Dev-only-Ingest, ADR-022, keine Directus-Produktivarbeit). |

## Leitplanken

- **Chairman-Empfehlung ist bindend:** Adoption-First, technischer Spike vor Vollausbau, Pilot mit 1–2 Räumen statt Big-Bang.
- **Kein Lehrkräfte-Login vor erfüllten Gates 1–8** (Auth-Konzept).
- **Docker-Build-Kontext bleibt `app/`** ([Regeln](../../build-kontext-submodule-regeln.md)): Directus läuft als **eigener Coolify-Service** (eigenes Image, eigene DB), nie im App-Image; keine Build-/Laufzeit-Referenzen auf `../auftraggeber` oder `../protokolle`.
- **Medien bleiben hinter dem Entry-Cookie-Gate** (Audit S1): Jede Auslieferungs-URL für Schüler-Medien muss durch die Cookie-Prüfung laufen — Directus-Asset-URLs (`/assets/*`) dürfen das Gate nicht umgehen (#254).
- **MPZ Studio bleibt Dev-only (ADR-022)** — kein Ersatz für Directus, keine parallele Pflege-Wahrheit (#262).
- **Kein Custom-Admin** (ADR-003); das JSON-Schema (`app/data/stations.schema.json`) ist die Vorlage für Collections, nicht wegwerfen.
- **Kein Schüler-PII in Directus** — technisch durch Schema und Validatoren erzwingen (Auth-Konzept, #256).

## Programm-Entscheidungen (offen — nicht in diesem Epic entscheiden)

Drei Entscheidungen sind vor Welle 2 per ADR zu treffen (nächste freie Nummer Stand heute: ADR-028; bei Anlage prüfen). Der Spike (#251) liefert die Datenbasis. **Hier werden nur Optionen und Kriterien festgehalten, keine Festlegung.**

### E1 — Runtime-Datenpfad (→ #252)

**Ist (verifiziert):** `app/lib/stations.ts` importiert `data/stations.json` auf Modulebene und validiert beim Import — Content ist zur **Build-Zeit** eingefroren; jede Änderung erfordert Rebuild/Deploy. Ohne neuen Lesepfad wäre Directus nur eine zweite Schreibquelle (Council, Engineer).

| Option | Skizze | Zu prüfende Kosten |
|--------|--------|--------------------|
| a) Build-JSON + Webhook-Rebuild | Directus-Publish triggert Coolify-Rebuild; App bleibt statisch | Rebuild-Dauer/Frequenz, Feedback-Latenz für Lehrkräfte |
| b) Runtime-Fetch (SSR/ISR) | App liest zur Laufzeit aus Directus-API, Cache/Revalidate | Verfügbarkeits-Kopplung (Directus down ≠ App down?), Latenz |
| c) Hybrid: Directus → JSON-Export → Rebuild | Export-Job schreibt validiertes `stations.json`, dann Deploy wie heute | Zusätzlicher Sync-Schritt, aber Validatoren + Fallback bleiben |

**Kriterien:** Besucher-App darf bei Directus-Ausfall nicht brechen; `validate-stations` muss im Pfad bleiben; Preview für Lehrkräfte; Aktualität nach Publish; Build-Kontext `app/`.

**Spike-Ergebnis (#251, 2026-07-07):** Option b end-to-end gebaut und verifiziert — Fallback bei Directus-Ausfall bestätigt `200` (App bricht nicht), Publish→Live-Latenz 5,5 s–~2 min (SWR-abhängig vom Traffic), Rohlatenz Directus-Fetch ~0,1–0,2 s. Option a (Webhook-Rebuild) gemessen: 19 s Redeploy (Cache-warm, kein Cold-Build). Empfehlung: **b für den MVP**. Details: [Spike-Bericht Phase 5](../../reviews/spike-directus-2026-07.md#phase-5--e1-messungen-latenz-rebuild-dauer-fallback).

### E2 — Migrationsstrategie JSON ↔ Directus, Content-Freeze (→ #253)

**Ist (verifiziert):** Prod-Content lebt auf `kunde/39-gs` (`stations.json` dort +697/−84 Zeilen ggü. `main`) — **Migrationsquelle ist `kunde/39-gs`, nicht `main`.** MPZ Studio schreibt weiterhin lokale JSON-Dateien (dev); Content-Pflege läuft während des Directus-Aufbaus weiter.

**Offen:** Content-Freeze ja/nein/wann und wie lang (Council-Konsenslücke); pro Pilot-Raum oder global; Verhalten von MPZ Studio während/nach Migration (Dual-Write-Verbot? Rück-Export Directus → JSON als Fallback/Backup?); Umgang mit der kanonischen Slug-Liste (unveränderlich, QR-fixiert — [verzeichnisstruktur.md](../../content/verzeichnisstruktur.md)).

### E3 — Medien-Storage (→ #254)

**Ist (verifiziert):** Medien liegen unter `public/media/` (Schüler-Medien per ADR-027 nicht in Git, sondern Volumes/„Bahn B“), ausgeliefert über den Cookie-gated Route-Handler; Dialog-Audio separat über `/api/dialog/*` (ebenfalls gated).

| Option | Skizze | Gate-Kompatibilität (S1) |
|--------|--------|--------------------------|
| a) Status quo: `public/`-Volumes, Directus referenziert nur Pfade | Kein Directus-Upload; Medien-Ingest bleibt beim MPZ | ✅ unverändert — aber Lehrkräfte können keine Medien hochladen (Scope-Frage!) |
| b) Directus-Assets | Upload + Medienbibliothek in Directus | ⚠️ `/assets/*` kennt das Entry-Cookie nicht — bräuchte App-seitigen Proxy/Signierung, sonst S1-Regression |
| c) Object Storage (S3-kompatibel) + gated Proxy | Directus schreibt in Bucket; App liefert über Cookie-gated Route aus | Machbar, neuer Infrastruktur-Baustein + Backup-/AVV-Folgen |

**Kriterien:** Keine Auslieferung von Schüler-Medien ohne Entry-Cookie-Prüfung; ADR-027 (kein Schüler-Content in Git) einhalten; Backup T5 abdecken; AVV-/Speicherort-Anhang ggf. aktualisieren; Upload-Regeln (Größe, Typen — vgl. `lib/mpz-upload-rules.ts`).

**Spike-Ergebnis (#251, 2026-07-07):** Option a bestätigt Gate-intakt (`403` ohne Cookie). Option b praktisch getestet: Directus liefert `/assets/*` standardmäßig **`403`** (kein automatischer Bypass) — aber sobald Public-Read auf `directus_files` gesetzt wird (technisch nötig, damit Option b im Client überhaupt nutzbar ist), liefert `/assets/*` **`200` ohne jeden Cookie/Auth** → S1-Regression bestätigt, sobald Option b produktiv genutzt wird. Empfehlung: **a** (wie im Spike) oder ein serverseitiger Directus-Proxy; reines Option b nur mit DSB-Sign-off + zusätzlicher Schutzschicht. Details: [Spike-Bericht Phase 6](../../reviews/spike-directus-2026-07.md#phase-6--e3-medien-gate-befund).

## Scope-Abgrenzung

**Drin:** Spike, drei ADRs, Deploy, Collections + PII-Enforcement, produktiver Lesepfad, Backup-Erweiterung, Migration und Pilot für **1–2 Räume**, Lehrkräfte-Anleitung, MPZ-Studio-Abgrenzung.

**Draußen (Follow-up nach Pilot-Review):** Big-Bang-Migration aller 11+ Stationen; Mandantenfähigkeit/Zweitschule (eigenes ADR bei Bedarf, ADR-003); i18n/Englisch (#48); YouTube-Freigabe (ADR-004); MPZ Studio v3 Polish (#205, eingefroren); jegliches Custom-Admin-UI.

## Risiken (aus Council 2026-07-06)

| Risiko | Quelle | Gegenmaßnahme im Epic |
|--------|--------|------------------------|
| **Nicht-Nutzung:** Directus live, aber niemand pflegt | Skeptic/Chairman (größtes Risiko) | #249 als Blocker vor Pilot; DoD misst Nutzung, nicht „live“ |
| Schema-Drift: MPZ Studio (JSON) vs. Directus (DB) = zwei Wahrheiten | Engineer | #253 (Strategie) + #262 (Studio begrenzen) |
| Aufwand unterschätzt: 4–8, nach Peer-Review eher 6–10 Wochen; VPS-Sizing unbekannt | Analyst | Spike misst VPS-Headroom; Pilot statt Big-Bang; Milestone als weicher Anker behandeln |
| Scope-Creep Rollenmodell („neue Stationen anlegen“) | Skeptic | Rollen Redaktion/Admin aus Auth-Konzept; Erweiterungen erst nach Pilot |
| Felix als Single Point of Failure (Admin + Dev + Support) | Practitioner | #260 definiert Support-Pfad; Betriebsfrage MPZ/Thomas in #249 mitklären |
| Content-Freeze fehlt in Planung | Peer-Review-Konsenslücke | explizit in #253 |

## Triage-Details (03b, Achsen A Scope / B Fehlerkosten / C Ambiguität / D Terrain)

| Issue | A | B | C | D | Score | Stufe · Variante | Begründung Kurzform |
|-------|---|---|---|---|-------|------------------|---------------------|
| #251 Spike | 2 | 1 | 1 | 2 | 6/8 | VOLL · Fable | D=2 erzwingt Unknowns-Exploration — genau der Zweck des Spikes; wegwerfbar → B=1 |
| #255 Deploy | 2 | 2 | 1 | 1 | 6/8 | VOLL · Fable | B=2 (Admin-Zugang im Internet, Auth); Terrain nach Spike teilvertraut |
| #256 Collections/PII | 2 | 2 | 1 | 1 | 6/8 | VOLL · Fable | B=2 (PII-Schutz technisch erzwingen); Schema-Komplexität (Hotspots/Coach/Dialog) |
| #257 Next.js-Anbindung | 2 | 1 | 0 | 1 | 4/8 | VOLL · klassisch | ADR liegt dann vor (C=0); Produktion mit echten Nutzern → nicht abrunden |
| #258 Backup-Erweiterung | 1 | 2 | 0 | 0 | 3/8 | LIGHT · klassisch + Härtung | B=2 (Datenverlust) erzwingt Härtung; T5-Pattern existiert (#243/#246) |
| #259 Migration Pilot | 1 | 2 | 1 | 1 | 5/8 | VOLL · Fable | B=2 (Migration) und Score ≥ 4 → Fable-Regel |

## Checkliste (Epic)

- [ ] #249 Adoption geklärt (Champion, Pflegefrequenz, Betriebsfrage MPZ) — **Abbruch-/Pausenkriterium:** ohne Commitment Epic pausieren
- [x] #250 Gates 4–6 formal abgeschlossen, Gate-Stand im Auth-Konzept aktualisiert (2026-07-06; Nachtrag #263 vor #261)
- [x] #251 Spike-Bericht liegt vor (inkl. VPS-Headroom, Branch-Entscheidung) — [Bericht](../../reviews/spike-directus-2026-07.md), 2026-07-06/07
- [ ] #252–#254 drei ADRs entschieden und in `entscheidungen.md` eingetragen
- [ ] #255 Directus prod-deployed (ohne Lehrkräfte-Accounts)
- [ ] #256 Collections + PII-Validatoren
- [ ] #257 produktiver Lesepfad live, Besucher-App fallback-sicher
- [ ] #258 Backup inkl. Directus-DB, Restore getestet (Gate 7 vollständig)
- [ ] #259 Pilot-Content migriert, Ist=Soll verifiziert
- [ ] #260 Lehrkräfte-Anleitung ersetzt Platzhalter
- [ ] #261 **DoD: 2 Lehrkräfte, 1 Raum, ohne Felix** — dokumentiert
- [ ] #262 MPZ-Studio-Rolle begrenzt (ADR-022-Nachtrag)

## Referenzen

- [ADR-003](../../adr/003-content-mvp-json-directus.md) · [ADR-022](../../adr/022-mpz-studio-internes-ingest-tool.md) · [ADR-027](../../adr/027-schuelermedien-nicht-in-git.md)
- [Auth-Konzept (Gates)](../../spezifikationen/directus-auth-konzept.md) · [Council-Planung](../../reviews/council-directus-planung-2026-07-06.md) · [Audit Phase 5](../../reviews/pre-mortem/audit-phase-5-2026-07-04.md) (Abschnitt „Abhängigkeiten vor Directus“)
- [Content-Verzeichnisstruktur](../../content/verzeichnisstruktur.md) · [Build-Kontext-Regeln](../../build-kontext-submodule-regeln.md)
- Format-Vorlage: [epic-mpz-studio.md](../archiv/epics/epic-mpz-studio.md)
