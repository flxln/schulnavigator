# Issue-Texte: Epic Directus #47

Index der Issue-Texte (GitHub #249–#262, Parent #47). Kanonische Bodies: [planung/issues/](../issues/). Übersicht: [epic-directus.md](./epic-directus.md).

---

## #47 (Update Epic-Parent) — Directus: Lehrkräfte-CMS (ADR-003), Adoption-First mit Spike

**Labels:** `tech` · **Milestone:** Phase 5

Zielbild aus ADR-003: Lehrkräfte pflegen Content über Directus (self-hosted auf Coolify), kein Custom-Admin. Die Planung folgt der bindenden Council-Empfehlung vom 2026-07-06: **Adoption-First mit technischem Spike** — erst Schul-Commitment und Spike, dann Aufbau, dann Pilot mit 1–2 Räumen. Kein Big-Bang für alle 11+ Stationen.

**Definition of Done (messbar):**
- [ ] ≥ 2 Lehrkräfte haben ohne MPZ-Hilfe eine Content-Änderung an ≥ 1 Raum in Produktion veröffentlicht
- [ ] Gates 1–8 des Auth-Konzepts erfüllt; kein Lehrkräfte-Login vorher
- [ ] MPZ-Studio-Rolle nach Go begrenzt (ADR-022-Nachtrag)

**Unterissues (Wellen):**
- Welle 0: #249 Adoption/Gate 9 · #250 Gates 4–6 abschließen
- Welle 1: #251 Spike · #252/#253/#254 ADRs (Runtime-Datenpfad, Migration/Freeze, Medien-Storage)
- Welle 2: #255 Deploy · #256 Collections/PII · #257 Next.js-Anbindung · #258 Backup
- Welle 3: #259 Migration Pilot · #260 Anleitung · #261 Pilot (DoD) · #262 MPZ-Studio-Abgrenzung

Planung: `dokumentation/planung/epics/epic-directus.md` · Gates: `dokumentation/spezifikationen/directus-auth-konzept.md` · Council: `dokumentation/reviews/council-directus-planung-2026-07-06.md`

---

## #249 (#249) — Adoption klären: Champion + Pflegefrequenz (aus #44), optional Gate 9

**Labels:** `org`, `blocker`, `extern` (Antwort liegt bei der Schule) · **Blockiert durch:** #44-Meeting · **Blockiert:** #261 (Pilot)

Das größte Risiko des Vorhabens ist Nicht-Nutzung, nicht die CMS-Wahl (Council-Konsens). Vor dem Pilot muss die Schule committen.

**Aufgaben:**
- [ ] Aus #44 beantworten: *Wer aus dem Kollegium würde pflegen, und wie viel Zeit ist realistisch?* (Leitfaden C.1, Frage 20)
- [ ] Mindestens **eine Lehrkraft als Champion** benennen (Name, Erreichbarkeit)
- [ ] Realistische Pflegefrequenz festhalten (z. B. „30 min/Monat“ reicht nicht für Redaktions-Routine — Practitioner-Warnung)
- [ ] Betriebsfrage klären: Trägt MPZ (Thomas?) den Directus-Betrieb dauerhaft mit?
- [ ] Ergebnis als **optionales Gate 9 „Schule committed“** im Auth-Konzept ergänzen

**Akzeptanzkriterium:** Dokumentierte Antwort im Epic. **Ohne Commitment wird das Epic pausiert** (Skeptic/Practitioner-Dissens im Council) — das ist ein gültiges Ergebnis, kein Scheitern.

---

## #250 (#250) — Gates 4–6 formal abschließen (Auth-Konzept beschließen, VVT/DSE finalisieren)

**Labels:** `org`, `blocker` · **Blockiert:** #261 (Pilot; erster Lehrkräfte-Login)

Verifizierter Stand 2026-07-06 (weicht vom Gate-Kopf des Auth-Konzepts ab, der „4–8 offen“ nennt):
- Gate 4: `dsgvo.md` ist **v1.0 (beschlossen)** inkl. VVT-Kurzfassung mit Eintrag „Lehrkräfte-Accounts (geplant)“ — Rest: Eintrag beim Deploy konkretisieren.
- Gate 5: Auth-Konzept trägt Status **„Entwurf“** — echte Restarbeit.
- Gate 6: DSE-Abschnitt `lehrkraefte-login` existiert auf `main` **und** Prod (`kunde/39-gs`), als „geplant“ formuliert.

**Aufgaben:**
- [ ] Gate 5: `directus-auth-konzept.md` von „Entwurf“ auf **beschlossen** heben (Rollenmodell Redaktion/Admin, 2FA-Pflicht Admin, Session 8 h, Löschfristen bestätigen)
- [ ] Gate-Stand im Kopf des Auth-Konzepts auf den verifizierten Stand korrigieren (inkl. Gate-8-Befund aus dem Epic)
- [ ] Gate 4-Rest: VVT-Eintrag „Lehrkräfte-Accounts“ konkretisieren, sobald Deploy-Parameter feststehen (Speicherort DB, Log-Retention)
- [ ] Gate 6-Rest: Trigger definieren — DSE-Abschnitt von „geplant“ auf final **vor dem ersten Login**, nicht früher
- [ ] Prüfen, ob der AVV-Anhang (ADR-027-Stand) die Directus-Verarbeitung abdeckt oder ein Nachtrag nötig ist

**Akzeptanzkriterium:** Auth-Konzept Status „beschlossen“; Gate-Tabelle im Kopf stimmt mit Repo-Befund überein; offene Reste tragen benannte Trigger.

---

## #251 (#251) — Technischer Spike: 1 Station end-to-end Directus → Next.js → Deploy (Zeitbox 2 Wochen)

**Labels:** `tech` · **Blockiert:** #252, #253, #254 · **Triage:** VOLL · Fable (A2 B1 C1 D2 = 6/8; D=2 → Unknowns-Exploration)

Chairman-Vorgabe: Spike vor jeder Vollmigration. Zweck ist **Erkenntnis, nicht Produktion** — der Spike-Code darf weggeworfen werden. Kein Lehrkräfte-Zugang, kein Schüler-PII, keine echten Schüler-Medien.

**Fragen, die der Spike beantworten muss:**
- [ ] Directus auf Coolify: Deploy-Aufwand, Update-Pfad, **VPS-Headroom** (RAM/CPU mit zweitem Container + Postgres — Analyst-Lücke im Council)
- [ ] Collections für **eine** Station aus `app/data/stations.schema.json` ableiten: Wie gut bilden Directus-Felder Hotspots/Coach/Dialog/`viewer`-Flag ab? Wo klemmt es?
- [ ] Lesepfad-Prototyp: mindestens Variante b (Runtime-Fetch) **oder** c (Export → JSON → Rebuild) einmal durchstechen; Webhook-Rebuild (a) konzeptionell prüfen
- [ ] Medienfrage explorieren: Wie referenziert Directus Medien, ohne das Entry-Cookie-Gate zu umgehen? (Input für #254)
- [ ] Entwicklungs-Branch für Directus festlegen (Audit nannte `feature/mpz-studio`; jüngste Arbeit läuft auf `main`) — Ergebnis dokumentieren

**Leitplanken:** Directus als eigener Coolify-Service (nie im `app/`-Image); Test-Instanz nicht öffentlich (Basic-Auth o. ä.); Demo-Content statt Schüler-Medien; Zeitbox **2 Wochen**, danach Bericht auch bei offenen Punkten.

**Akzeptanzkriterium:** Spike-Bericht (`dokumentation/reviews/` oder Issue-Kommentar) mit Antworten je Frage + Empfehlungsentwurf für #252–#254.

---

## #252 (#252) — ADR: Runtime-Datenpfad (Build-JSON vs. Runtime-Fetch vs. Webhook-Rebuild)

**Labels:** `tech` · **Blockiert durch:** #251 · **Blockiert:** #256, #257

**Ist:** `app/lib/stations.ts` importiert `data/stations.json` zur Build-Zeit (validiert beim Import). Ohne neuen Lesepfad ist Directus nur eine zweite Schreibquelle.

**Zu entscheiden (Optionen + Kriterien im Epic, Abschnitt E1):**
- Option a) Build-JSON + Webhook-Rebuild · b) Runtime-Fetch (SSR/ISR) · c) Hybrid Export → JSON → Rebuild
- Kriterien: Besucher-App übersteht Directus-Ausfall; `validate-stations` bleibt im Pfad; Preview für Lehrkräfte; Publish-Latenz; Build-Kontext nur `app/`

**Aufgaben:** ADR nach `dokumentation/adr/000-template.md` (nächste freie Nummer), Eintrag in `entscheidungen.md`, Spike-Messwerte als Begründung zitieren.

---

## #253 (#253) — ADR: Migrationsstrategie JSON ↔ Directus + Content-Freeze

**Labels:** `tech`, `content` · **Blockiert durch:** #251 · **Blockiert:** #259

**Ist (Git-verifiziert):** Prod-Content lebt auf `kunde/39-gs` — `stations.json` dort +697/−84 Zeilen ggü. `main`. **Migrationsquelle ist `kunde/39-gs`.** MPZ Studio schreibt weiter JSON; Pflege läuft während des Aufbaus weiter.

**Zu entscheiden:**
- Source-of-Truth-Wechsel: wann kippt die Wahrheit von `stations.json` nach Directus — global oder pro Raum?
- Content-Freeze: ja/nein/wann/wie lang (Council-Konsenslücke); Minimalvariante: Freeze nur für Pilot-Räume während #259
- MPZ Studio während/nach Migration: Dual-Write-Verbot? Rück-Export Directus → JSON als Fallback/Backup?
- Kanonische Slug-Liste bleibt unveränderlich (QR-fixiert) — wie wird das in Directus erzwungen?

**Aufgaben:** ADR + `entscheidungen.md`; Freeze-Regeln so formulieren, dass #259 sie mechanisch befolgen kann.

---

## #254 (#254) — ADR: Medien-Storage (`public/`-Volumes vs. Directus-Assets vs. Object Storage) — Gate-kompatibel

**Labels:** `tech` · **Blockiert durch:** #251 · **Blockiert:** #255 (Konfiguration), #259

**Hartes Kriterium (Audit S1):** Jede Auslieferungs-URL für Schüler-Medien läuft durch die Entry-Cookie-Prüfung. Directus-`/assets/*` kennt das Cookie nicht — Option b ohne App-seitigen Proxy wäre eine S1-Regression.

**Optionen (Details Epic E3):** a) Status quo `public/`-Volumes, Directus referenziert Pfade (aber: kein Lehrkräfte-Upload — Scope-Frage!) · b) Directus-Assets + gated Proxy · c) Object Storage + gated Proxy.

**Weitere Kriterien:** ADR-027 (kein Schüler-Content in Git); Backup T5-Abdeckung; AVV-/Speicherort-Anhang; Upload-Regeln (vgl. `lib/mpz-upload-rules.ts`).

**Aufgaben:** ADR + `entscheidungen.md`; explizit festhalten, ob Lehrkräfte-Medien-Upload im Pilot drin oder draußen ist.

---

## #255 (#255) — Directus-Prod-Deploy auf Coolify (eigener Service; noch kein Lehrkräfte-Login)

**Labels:** `tech` · **Blockiert durch:** #251–#254 · **Triage:** VOLL · Fable (A2 B2 C1 D1 = 6/8; B=2 Admin-Zugang im Internet)

**Aufgaben:**
- [ ] Directus + Postgres als eigener Coolify-Service (MPZ-VPS, DE); TLS via Traefik, HSTS analog #242
- [ ] Secrets über ENV (kein Secret im Repo); Admin-Account mit **2FA** ab erstem Prod-Login
- [ ] Rollen **Redaktion** (Content) und **Admin** (Schema, User) anlegen — noch **keine** Lehrkräfte-Accounts (Gates!)
- [ ] Session-Dauer ≤ 8 h, HttpOnly-Cookies, starke Passwort-Policy (Auth-Konzept)
- [ ] Login-Log-Retention ≤ 14 Tage konfigurieren/dokumentieren (analog Besucher-Logs)
- [ ] Health-Check + Coolify-Monitoring; Update-Strategie (Directus-Releases) notieren
- [ ] VVT-Eintrag „Lehrkräfte-Accounts" in `dsgvo.md` von „geplant" auf final heben (Speicherort-DB, Log-/IP-Retention — Gate-4-Trigger aus #250)

**Leitplanken:** Nicht im `app/`-Docker-Image; keine Submodule-Referenzen. **Akzeptanzkriterium:** Instanz läuft in Prod, nur MPZ-Admin-Zugang, Konfiguration in `anleitungen/fuer-entwickler.md` dokumentiert.

---

## #256 (#256) — Collections aus `stations.schema.json` + Kein-Schüler-PII technisch erzwingen

**Labels:** `tech` · **Blockiert durch:** #252, #255 · **Triage:** VOLL · Fable (A2 B2 C1 D1 = 6/8; B=2 PII-Enforcement)

Das JSON-Schema ist per ADR-003 die Vorlage — nicht wegwerfen. Achtung Komplexität (Council, Skeptic): Das Datenmodell umfasst längst Hotspots, Coach, Dialog, Embed-Allowlist und Sphere-`viewer`-Flag, nicht das Minimal-JSON der frühen Spezifikation.

**Aufgaben:**
- [ ] Collections/Felder für das volle Stations-Schema der Pilot-Räume modellieren (Slug read-only nach Anlage — QR-fixiert)
- [ ] **Kein Schüler-PII:** keine Freitext-Felder für Personenlisten; Feld-Hilfetexte mit PII-Warnung; Validatoren analog `validate-stations` nach Save (Auth-Konzept: „technisch durch Schema und Validatoren erzwingen“)
- [ ] Rollen-Rechte: Redaktion darf Content ändern, nicht Schema/User; „neue Station anlegen“ vorerst Admin-only (Scope-Creep-Bremse)
- [ ] Mapping-Tabelle JSON-Feld ↔ Directus-Feld dokumentieren (Basis für #259)

**Akzeptanzkriterium:** Pilot-Raum lässt sich vollständig in Directus abbilden; PII-Leitplanken sind konfiguriert und beschrieben, nicht nur vereinbart.

---

## #257 (#257) — Next.js-Anbindung: Runtime-Datenpfad produktiv umsetzen

**Labels:** `tech` · **Blockiert durch:** #252, #255 · **Triage:** VOLL · klassisch (A2 B1 C0 D1 = 4/8; Produktion → nicht abrunden)

Umsetzung der in #252 entschiedenen Variante.

**Aufgaben:**
- [ ] Lesepfad implementieren (je nach ADR: Fetch-Layer, Export-Job oder Webhook-Rebuild-Hook) — `lib/stations.ts`-Aufrufer vorher per grep prüfen (Konvention)
- [ ] **Fallback:** Besucher-App liefert bei Directus-Ausfall den letzten validierten Stand aus (kein 500 im Raum-Viewer)
- [ ] `validate-stations`-Vertrag im neuen Pfad erhalten (ungültiger Content erreicht nie die Besucher)
- [ ] Tests: Lesepfad, Fallback, Validierungsfehlerfall; `npm run build` grün
- [ ] Doku in `dokumentation/architektur.md` (Datenmodell-Abschnitt) nachziehen

**Akzeptanzkriterium:** Pilot-Raum rendert aus Directus-Daten; Ausfalltest bestanden; kein Verhaltensunterschied für JSON-Stationen.

---

## #258 (#258) — Gate-7-Rest: Directus-DB in Backup T5 aufnehmen + Restore-Test

**Labels:** `tech` · **Blockiert durch:** #255 · **Blockiert:** #261 · **Triage:** LIGHT · klassisch mit Härtung (A1 B2 C0 D0 = 3/8; B=2 Datenverlust)

T5 läuft (#243, #246–#248, Btrfs-Snapshots täglich 03:30, 30 Tage). Gate 7 verlangt die Directus-DB darin.

**Aufgaben:**
- [ ] Postgres-Dump (oder Volume-Snapshot-Strategie) in den T5-Ablauf integrieren (`anleitungen/backup-t5/`)
- [ ] **Restore-Test durchführen und protokollieren** — ein Backup ohne Restore-Beweis erfüllt Gate 7 nicht
- [ ] Directus-Uploads (falls #254 = Assets/Object Storage) in die Backup-Abdeckung aufnehmen
- [ ] `dsgvo.md`/VVT-Eintrag um Speicherort/Backup ergänzen (Zulieferung zu #250)

**Akzeptanzkriterium:** Gate 7 vollständig; Restore-Protokoll verlinkt.

---

## #259 (#259) — Migration Pilot-Content (Quelle `kunde/39-gs`) nach Directus

**Labels:** `content`, `tech` · **Blockiert durch:** #253, #256, #257 · **Triage:** VOLL · Fable (A1 B2 C1 D1 = 5/8; B=2 Migration)

**Nur Pilot-Räume (1–2), kein Big-Bang.** Quelle ist der Prod-Stand `kunde/39-gs` (nicht `main` — dort fehlen ~700 Zeilen Content).

**Aufgaben:**
- [ ] Freeze-Fenster nach #253-Regeln ankündigen und einhalten
- [ ] Content der Pilot-Räume nach Mapping-Tabelle (#256) übertragen (Skript bevorzugt, manuell dokumentiert)
- [ ] **Ist=Soll-Verifikation:** Rendering Pilot-Raum aus Directus == Rendering aus JSON (Screenshots/Diff), `validate`-Läufe grün
- [ ] Rollback-Plan: Umschalten zurück auf JSON-Stand muss in Minuten möglich sein
- [ ] Medien gemäß #254-Entscheidung behandeln; Entry-Cookie-Gate mit 1-Byte-Range-Request gegenprüfen (Audit-Methode)

**Akzeptanzkriterium:** Pilot-Räume laufen in Prod aus Directus; Verifikation + Rollback-Plan dokumentiert.

---

## #260 (#260) — `anleitungen/fuer-lehrkraefte.md`: Directus-Anleitung (Platzhalter ersetzen)

**Labels:** `content` · **Blockiert durch:** #255, #256 · **Blockiert:** #261

Die Datei ist bewusst Platzhalter — „das ist kein Detail, sondern der eigentliche Rollout“ (Council, Outsider).

**Aufgaben:**
- [ ] Schritt-für-Schritt mit Screenshots: Login, Raum finden, Text/Medium ändern, Vorschau, Veröffentlichen
- [ ] Die Angst-Fragen zuerst: „Was passiert, wenn ich etwas lösche?“, Passwort vergessen, wen rufe ich an (Support-Pfad ≠ nur Felix)
- [ ] PII-Regeln in Lehrkräfte-Sprache: keine Schülernamen in Beschreibungsfeldern, Foto-Regeln (Outsider-Risiko)
- [ ] Rollenverständnis: was Redaktion darf und was nicht
- [ ] Gegenlesen durch den Champion aus #249 vor dem Pilot

**Akzeptanzkriterium:** Champion kann anhand der Anleitung ohne Zuruf eine Teständerung durchführen.

---

## #261 (#261) — Pilot: 2 Lehrkräfte pflegen 1 Raum ohne Felix (DoD-Träger)

**Labels:** `org`, `content` · **Blockiert durch:** #249, #250, #258, #259, #260, #263 (implizit alle Gates 1–8)

**Erst hier entstehen Lehrkräfte-Accounts** — Voraussetzung: alle Gates erfüllt (#250, #258, #263) und Schul-Commitment (#249).

**Aufgaben:**
- [ ] **Erste, blockierende Teilaufgabe (Gate 6, kein Zirkelbezug):** DSE-Finalisierung (#250-Trigger, Abschnitt `lehrkraefte-login`) auf Production deployen — **bevor** irgendein Lehrkräfte-Account angelegt wird
- [ ] Accounts für Champion + 1 weitere Lehrkraft anlegen (Rolle Redaktion) — erst nach der DSE-Finalisierung
- [ ] Schulungstermin (kurz, am echten Pilot-Raum, mit #260-Anleitung)
- [ ] Beobachtungszeitraum (z. B. 4 Wochen): jede Lehrkraft veröffentlicht ≥ 1 echte Änderung **ohne MPZ-Hilfe**
- [ ] Support-Anfragen protokollieren (Was kam? Wie oft? → Practitioner-Risiko messen)
- [ ] Pilot-Review: DoD erfüllt? → Entscheidung Vollmigration (Follow-up-Epic) oder Nachsteuern

**Akzeptanzkriterium (= Epic-DoD):** ≥ 2 Lehrkräfte, ≥ 1 Raum, ≥ 1 Veröffentlichung pro Person ohne Felix — dokumentiert im Pilot-Review.

---

## #262 (#262) — MPZ Studio nach Directus-Go auf Dev-/Notfall-Ingest begrenzen (ADR-022-Nachtrag)

**Labels:** `org` · **Blockiert durch:** #261

Chairman: Studio-Rolle nach Directus-Go **explizit** begrenzen, damit kein stiller Ersatz-Pflegepfad entsteht (Schema-Drift, „Felix pflegt schnell ein“).

**Aufgaben:**
- [ ] ADR-022-Nachtrag oder neues ADR: Studio = Dev-/Notfall-Ingest für Directus-geführte Inhalte; Directus ist die Wahrheit
- [ ] Prüfen: Studio-Warnhinweis/Read-only für Bereiche, deren Source of Truth Directus ist (abhängig von #253)
- [ ] `CLAUDE.md` und `fuer-entwickler.md` entsprechend aktualisieren

**Akzeptanzkriterium:** Es ist schriftlich eindeutig, welcher Pfad für welchen Content-Typ gilt; kein Dual-Write möglich oder zumindest kein undokumentierter.
