---
issue: "#255"
github_number: 255
erstellt: 2026-11-03
prompt: 00_minus1_unknowns-exploration
triage: ../../planung/triage/triage-#255-directus-deploy-ionos.md
modell: Opus 5.5 (claude-opus-5-5)
harness: Anthropic-Abo ◆ (Claude Code)
---

# Unknowns-Befund #255: Directus auf dem neuen IONOS-Server

## 1. Executive Summary

Der „neue IONOS-Server“ ist der IONOS Cloud Cube `mpz-anwendungen` (Memory Cube M, Frankfurt `de/fra/1`), festgelegt am 28. Oktober 2026 in `~/Projekte/MPZ-DevOps-Ideen/festlegung-rechner-bestand-und-cube.md`. Im Schulnavigator-Repo steht dazu nichts.

Die Ursache der Deploy-Probleme liegt bei IONOS, nicht bei uns: Laut [status.ionos.cloud](https://status.ionos.cloud/) (abgerufen 3. November 2026) haben Cloud Server, die seit 22. Oktober neu angelegt, neu gestartet oder migriert wurden, Netzwerkprobleme. Der Fix rollt „over the coming days“ aus, Stop/Start hilft nicht, Betroffene sollen den Support mit Server-ID kontaktieren. Frankfurt-Compute steht auf „degraded“. Felix bestätigt: „aktuell hat ionos noch probleme mit der verfügbarmachung“.

Drei Befunde ändern die Planung:

1. **Der Konsument kollidiert mit ADR-028.** Felix nennt `schulnavigator.mpz.schule` als Directus-Leser. Diese Application ist laut ADR-028 Legacy, „nicht neu deployen“, ohne Schüler-Medien-Volumes, und gedruckte URLs der 39. GS können noch darauf zeigen. **Nachtrag, Entscheidung Felix 3. November 2026:** `schulnavigator.mpz.schule` wird Demo-/Test-Instanz und Directus-Leser. Das löst ADR-028 Punkt 4 ab und braucht einen ADR (siehe E-4).
2. **Drei Dokumente nennen den falschen Host.** ADR-031 („lokales Storage-Volume auf dem MPZ-VPS“), Auth-Konzept („Directus auf MPZ-VPS, gleicher Betriebskontext“) und `dsgvo.md` beschreiben den Bestand-VPS. Directus landet auf einem anderen IONOS-Produkt mit eigener IP.
3. **Zwischen Bestand-Coolify und Cube gibt es kein erprobtes Muster.** Kein Remote-Server, eigener Proxy, Wildcard-DNS zeigt auf den Bestand, kein Headscale-Knoten. Der Cube-Teil gehört als Vorbedingung vor #255, nicht hinein.

Re-Triage: 8/8, Stufe VOLL bleibt. Schritt 0 kann jetzt schreiben, Schritt 3 erst nach Vorbedingung V0 (Cube erreichbar und in Coolify validiert).

## 2. Ist-Inventar

### Was existiert

| Was | Wo / Beleg |
|-----|------------|
| Ziel-Festlegung Bestand vs. Cube | `MPZ-DevOps-Ideen/festlegung-rechner-bestand-und-cube.md` (28. Oktober 2026). Schulnavigator inkl. `39-gs` und `schulnavigator` soll auf den Cube, ein Coolify (Bestand) als Leitstand, Cube als zweiter Server |
| Bestand-VPS | `217.154.120.240`, SSH-Alias `coolify-server`, Coolify 4.5, Tailnet `mpz-vps` `100.64.0.7`. Am 28. Oktober: 7,7 GB RAM, Swap 1,7 von 2 GB belegt |
| DNS | Wildcard `*.mpz.schule` → `217.154.120.240`. Geprüft 3. November: alle Dienste der Cube-Spalte und erfundene Namen lösen auf den Bestand auf. Kein Dienst ist umgezogen |
| Spike-Reste auf dem Bestand | `directus-spike.mpz.schule/server/health` → `503` mit gültigem Zertifikat, `app-spike.mpz.schule/api/health` → `503`. Router und Coolify-Ressourcen existieren noch, Container stehen. Laut Spike-Bericht hängen daran ein statischer Admin-Token, `admin@example.com` und Dev-Access-Tokens |
| Spike-Erkenntnisse | `reviews/spike-directus-2026-07.md`: Custom-Compose Directus `:11` + `postgres:16-alpine`, ~237 MiB RSS; Coolify-Template nutzt SQLite; Env-Duplikate bei Bulk-PATCH; private Submodule brechen Fresh-Clones; Service-User-Empfehlung |
| Entscheidungen | ADR-029 (Runtime-Fetch, Service-User-Nachtrag ist #255-Aufgabe), ADR-030 (Freeze, Prüfbefehl vor `release/39-gs`-Verschieben), ADR-031 (b-Proxy, keine Public-Policy auf `directus_files`, Upload-Limits, Volume) |
| Auth-Konzept | beschlossen: 2FA Pflicht für Admin, Session 8 h, Rollen Redaktion/Admin, kein Service-Account-Typ |
| Legacy-App | `schulnavigator.mpz.schule`, Coolify `q1a8t4zswynvgutbw9og5l7n`, antwortet `200`, `307 → /eintritt`, HSTS gesetzt. ADR-028 Punkt 4: nicht neu deployen, keine Medien-Volumes, Abschalten eigener Schritt wegen gedruckter URLs |
| Backup T5 | NAS `datengrab` zieht per Pull-rsync über Headscale vom Bestand |

### Was fehlt

| Was | Folge |
|-----|-------|
| Cube erreichbar und in Coolify eingetragen | Harte Vorbedingung, alle Punkte der Festlegung unter „Noch nicht erledigt“ sind offen |
| Issue-Datei mit Frontmatter, Ziel, Akzeptanzkriterien | `planung-abgleich` überspringt sie; Schritt 0 ergänzt sie |
| Eintrag zum Cube in Repo-Doku (`fuer-entwickler.md`, `architektur.md`, `dsgvo.md`) | Repo kennt nur den Bestand |
| ADR oder Nachtrag zum Host-Wechsel für Directus | ADR-031 und Auth-Konzept nennen „MPZ-VPS“ |
| Entscheidung über den Konsumenten im Lichte von ADR-028 | siehe Befund B1 |
| Ticket für den Umzug der Schulnavigator-Apps auf den Cube | Felix: eigenes Ticket, existiert noch nicht |
| Headscale-Knoten für den Cube | #258 kann ohne ihn die Directus-DB nicht sichern |
| Directus-Code im Repo | absichtlich keiner: Directus ist eigener Coolify-Service, nie im App-Image |

## 3. Blindspot-Befunde

Priorisiert nach Wirkung auf die Architektur.

### B1 · Konsument `schulnavigator.mpz.schule` widerspricht ADR-028 (hoch)

Felix hat `schulnavigator.mpz.schule` als Directus-Leser genannt. ADR-028 Punkt 4 und `.cursor/rules/release-39-gs.mdc` verbieten das Neudeployen dieser Application. Sie hat keine Bahn-B-Volumes, Form-1-Pfade (`/media/<slug>/…`) liefen dort ins Leere; nur Form 2 (`/api/medien/<uuid>`, ADR-031) ginge. Gedruckte QR-Codes oder Links der 39. GS können noch auf diese Domain zeigen. Wer so einen Code scannt, sieht dann Directus-Content, obwohl die 39. GS laut Halt kein Directus bekommt.

Zum Deploy selbst blockiert das #255 nicht, Directus braucht keinen Leser. Es betrifft #257 und die Frage, wessen Content in die Instanz kommt. Schritt 0 muss es trotzdem festhalten, weil davon `PUBLIC_URL`, CORS, Netzweg App → Directus und ein neuer ADR abhängen.

**Entschieden (Felix, 3. November 2026):** `schulnavigator.mpz.schule` ist ab jetzt Demo-/Test-Instanz und liest aus Directus. Damit gilt:

- In die Instanz kommen synthetische oder Demo-Daten, kein 39-GS-Content. Das hält AVV und #263 aus dem Testbetrieb heraus.
- Fehlende Bahn-B-Volumes sind kein Mangel mehr. Neue Medien kommen über Directus-Uploads (Form 2).
- Alte Links sind kein Thema: Die QR-Manifeste zeigen seit `1506b62` (24. Juni 2026, GS39-Projekttag) auf `39-gs.mpz.schule`, vorher wurde laut Felix (3. November 2026) nichts gedruckt oder verteilt. Die Klausel in ADR-028 („gedruckte URLs können noch darauf zeigen“) war Vorsicht, kein Befund. Keine Umleitung, keine eigene Demo-Domain nötig.
- Die Epic-DoD („2 Lehrkräfte, 1 Raum in Produktion“) erfüllt eine Demo-Instanz nicht. Welche Schule den Piloten #261 trägt, ist weiter offen.

### B2 · Host-Wechsel ist in keinem ADR gedeckt (hoch)

ADR-031 legt Uploads auf ein „lokales Storage-Volume auf dem MPZ-VPS“, das Auth-Konzept setzt „gleicher Betriebskontext wie Schulnavigator“, `dsgvo.md` nennt als Speicherort „MPZ-VPS bei IONOS“. Der Cube ist IONOS Cloud (Data Center Designer, eigener Vertragsteil, Frankfurt), also anderes Produkt, andere IP, anderer Proxy. Die Schutzlogik von ADR-031 bleibt gültig, der Ort nicht. Entschiedene ADRs dürfen nicht überschrieben werden (CLAUDE.md, ADR-Workflow). Der Gate-4-Rest (VVT-Eintrag beim Deploy konkretisieren) hängt direkt daran.

### B3 · App und Directus auf verschiedenen Hosts (hoch)

Solange `schulnavigator.mpz.schule` auf dem Bestand liegt und Directus auf dem Cube, geht jeder Stations-Fetch über das öffentliche Netz. Schlimmer bei ADR-031: Die Proxy-Route streamt Videos (bis 150 MB, Range/206) vom Cube zum Bestand und dann zum Besucher, Bandbreite doppelt. Der Spike hat das nie gemessen, Directus und App lagen auf demselben Host. Die Reihenfolge „App-Umzug (eigenes Ticket) vor #257“ ist damit eine echte Abhängigkeit, keine Kosmetik.

### B4 · IONOS-Störung trifft Neustarts, nicht nur das Anlegen (hoch, B=2)

Der IONOS-Vorfall betrifft Server, die seit 22. Oktober „created, restarted or migrated“ wurden. Ein Reboot des Cubes kann ihn also vom Netz nehmen, bis IONOS den Host gefixt hat. Das betrifft Kernel-Updates, `unattended-upgrades` mit Auto-Reboot und eine Docker-Installation durch Coolify, falls sie einen Neustart verlangt. Am 23. und 25. Oktober hat IONOS außerdem Compute-Hosts für CVE-2026-99999 gepatcht, nicht live migrierbare VMs wurden dabei neu gestartet. Bis der Fix bestätigt ist, gilt: kein Neustart ohne Plan, und der Plan braucht einen Recovery-Weg über den Support.

### B5 · Wildcard-DNS und Let's Encrypt (mittel)

Jeder Name unter `*.mpz.schule` landet auf dem Bestand, auch ein neuer Directus-Name. Der Proxy auf dem Cube bekommt erst ein Zertifikat, wenn ein expliziter A-Record auf die Cube-IP zeigt. Ohne ihn antwortet der Bestand-Traefik mit Default-Zertifikat (geprüft: unbekannter Name → `ssl_verify=20`). Die Festlegung sagt „DNS einer Adresse erst ändern, wenn der Dienst auf dem Cube antwortet“. Für einen neuen Namen heißt das: vorher per `curl --resolve … :80` prüfen, dann A-Record setzen, dann Zertifikat. Wo die Zone `mpz.schule` verwaltet wird, steht nicht im Repo.

### B6 · Remote-Server in Coolify hat eigenen Proxy und eigene Dynamic Config (mittel)

Der Bestand-Coolify hat bisher nur `localhost` verwaltet (Spike: „Server `localhost`“). Ein Remote-Server bekommt einen eigenen `coolify-proxy`. Die HSTS-Middleware `sn-hsts@file` liegt in `/data/coolify/proxy/dynamic/sn-hsts.yaml` auf dem Bestand und existiert auf dem Cube nicht. Das Auth-Konzept verlangt „TLS über Traefik; HSTS am Proxy (#143)“. Die Anleitung in `fuer-entwickler.md` (Abschnitt HSTS) muss für den Cube gedoppelt werden.

Ob Coolify 4.5 Ubuntu 26.04 als Remote-Server validiert, ist unbelegt. Die Festlegung empfiehlt 24.04, wenn angeboten, und behauptet nur, dass Coolify 4.5 auf 26.04 lief, nicht als Remote-Ziel.

### B7 · Admin-UI im offenen Netz ohne Lehrkräfte (mittel, B=2)

#255 legt keine Lehrkräfte-Accounts an. Trotzdem steht ab dem Deploy ein Admin-Login öffentlich. Laut Directus-Doku (gegen die gepinnte Version prüfen): `RATE_LIMITER_ENABLED` ist per Default aus, `AUTH_LOGIN_ATTEMPTS` sperrt erst nach 25 Versuchen, `SESSION_COOKIE_TTL` steht auf 1 Tag statt 8 h. 2FA lässt sich in Directus 11 pro Policy erzwingen. Eine Option für die Zeit bis #261: Admin-Pfad nur über Headscale erreichbar machen, API öffentlich nur für den Service-User. Das wäre eine Architekturentscheidung für Schritt 0.

### B8 · Spike-Reste auf dem Bestand (mittel)

`directus-spike` und `app-spike` sind gestoppt, aber nicht gelöscht (Router antworten `503` mit gültigem Zertifikat). In Coolify liegen dort ein statischer Admin-Token, generierte Passwörter und Dev-Access-Tokens, dazu Volumes mit Demo-Daten. Ohne SSH nicht geprüft. Risiko: Verwechslung beim Anlegen der neuen Instanz und Secrets ohne Zweck. Aufräumen ist nicht #255-Scope, aber eine Löschfreigabe von Felix gehört vor Schritt 3.

### B9 · Fresh-Clone auf dem Cube trifft die Submodule (mittel, Umzugsticket)

Spike Phase 4: Coolify klont neue Applications mit `--recurse-submodules`, die privaten Submodule (`.gitmodules`, HTTPS-URLs) brechen den Clone. Der Spike ließ offen, ob bestehende Apps nur verschont blieben, weil sie nie neu geklont wurden. Auf dem Cube ist jede App neu. Das trifft das Umzugsticket und jeden Directus-Leser dort, nicht den Directus-Service (Image, kein Repo).

### B10 · Backup-Kette endet am Bestand (mittel, für #258)

Das NAS zieht per Pull-rsync über Headscale. Der Cube hat keinen Knoten. Die Festlegung führt das als offen. #255 muss Volume-Namen und Pfade für Directus-DB und Uploads festlegen und dokumentieren, damit #258 sie aufnehmen kann.

### B11 · Kleinere Punkte

- **Version nicht gepinnt:** Der Spike nutzte `directus/directus:11` (gleitend). Bei B=2 mit DB-Migrationen pro Minor-Update auf eine konkrete Version pinnen, Postgres ebenso.
- **Lizenz:** Directus steht unter BSL 1.1 mit Freigabe für Organisationen unter 5 Mio. USD Gesamtfinanzen. Für das MPZ als öffentliche Einrichtung vermutlich unkritisch, aber ungeprüft.
- **Firewall Cube:** Port 22 steht laut Festlegung für alle offen. Einschränken auf Bestand-IP und Felix ist Cube-Härtung (MPZ-DevOps), nicht #255.
- **Projekt-Trennung:** Die Festlegung verlangt getrennte Coolify-Projekte für Schülerdaten und öffentliche KI auf demselben Cube. Directus gehört zum Schulnavigator-Projekt, nicht zu Vitz KI.

## 4. Kandidaten / Optionen

Kein Spike, keine Technologiewahl. Offen ist nur, wann und wo Directus läuft.

| Option | Skizze | Aufwand | Risiko |
|--------|--------|---------|--------|
| **O1 Warten auf Cube** | Schritt 0 bis 2 jetzt, Schritt 3 nach V0 | gering | Termin hängt an IONOS |
| O2 Directus vorerst auf dem Bestand | wie Spike, später Umzug | mittel | Widerspricht der Festlegung (Bestand bleibt klein, Swap schon voll); späterer Umzug von DB und Uploads ist selbst ein B=2-Schritt |
| O3 Anderer Cube-Standort/neuer Cube | bei IONOS neu anlegen, falls der Support den bestehenden nicht rettet | mittel | gleiche Störung möglich, solange der Fix nicht durch ist |

Empfehlung: O1. O3 nur, wenn der IONOS-Support das ausdrücklich empfiehlt.

## 5. Validierungsrahmen

Erhöhtes Profil laut Triage (B=2). Noch nicht ausgeführt.

**V0, Vorbedingung vor Schritt 3 (außerhalb #255):**

- `ssh` auf die Cube-IP mit Schlüssel, `ip a`, `curl -sI https://github.com` vom Cube aus
- Coolify „Validate Server“ grün, Docker läuft, `coolify-proxy` auf dem Cube läuft
- Ein Reboot-Test erst, nachdem IONOS den Fix für den Host bestätigt hat

**Erfolgsfall Deploy:**

- `curl --resolve <name>:80:<cube-ip> http://<name>/server/health` vor dem DNS-Wechsel
- nach A-Record: `GET /server/health` → `200`, gültiges Zertifikat, `strict-transport-security` gesetzt
- `GET /items/directus_users` ohne Token → `403`
- `GET /assets/<id>` ohne Token → `403` (ADR-031)
- Upload über Limit oder mit falschem MIME-Typ → abgelehnt
- Service-User-Token: `read` auf Stations-Collections ok, `POST`/`PATCH` → `403`, kein Login in die Admin-UI
- Admin-Login ohne 2FA nicht möglich; Session läuft nach 8 h ab
- Postgres ohne öffentlichen Port (`ss -tlnp` auf dem Cube)

**Recovery-Fall:**

- Directus-Container stoppen: `schulnavigator.mpz.schule` und `39-gs.mpz.schule` bleiben `200` (heute trivial, weil sie Directus noch nicht lesen; Messwert als Baseline für #257)
- Admin-Zugang verloren (2FA-Gerät weg): dokumentierter Weg per CLI im Container, getestet
- Directus-Container neu erstellen: Daten in DB und Uploads-Volume bleiben

**Dokumentiert:** `npm run test`, `lint`, `build` in `app/` unverändert grün (kein App-Code erwartet), Coolify-Logs des Erst-Deploys.

## 6. Entscheidungstabelle (vorläufig)

| Frage | Optionen | Empfehlung (vorläufig) | Begründung | Offen für Schritt 0 |
|-------|----------|------------------------|------------|---------------------|
| E-1 Wann startet die Umsetzung? | O1 / O2 / O3 | O1 | Störung ist extern; O2 erzeugt einen zweiten Umzug mit Daten | Zeitpunkt, Kriterium „IONOS-Fix bestätigt“ |
| E-2 Wohin gehört die Cube-Inbetriebnahme? | in #255 / Vorbedingung in MPZ-DevOps | Vorbedingung V0 | betrifft alle Cube-Dienste, nicht nur Directus | wer, wo dokumentiert |
| E-3 Host-Wechsel dokumentieren | ADR-031 überschreiben / neuer ADR / nur Doku-Nachtrag | neuer ADR (nächste freie Nummer, heute 032) für „Directus auf IONOS Cloud Cube“, alte ADRs verweisen | ADR-Regel verbietet Überschreiben; drei Dokumente nennen den Bestand | Wortlaut, ob ADR-001 mit erfasst wird |
| E-4 Konsument | **entschieden:** `schulnavigator.mpz.schule` als Demo-/Test-Instanz (Felix, 3. Nov 2026) | ADR-032 hält das fest und ersetzt ADR-028 Punkt 4; ADR-028 bekommt den Vermerk „Punkt 4 ersetzt durch ADR-032“ | ADR-028 verbietet bisher Redeploy; alte Links ausgeschlossen (Felix) | synthetische Daten als Regel |
| E-5 Admin-Erreichbarkeit bis #261 | öffentlich mit Härtung / nur über Headscale | nur über Headscale, API öffentlich | B=2, keine Lehrkräfte vor #261 | technisch über Traefik-Middleware oder getrennte Router |
| E-6 Domain-Name | z. B. `cms.mpz.schule`, `directus.mpz.schule` | neutraler Name ohne Schulbezug | Instanz gehört nicht der 39. GS | Name, A-Record, Zone |
| E-7 Inhalt bei Abschluss von #255 | leer / Demo / Pilot-Content | leer: nur Admin + Service-User, keine Collections | Collections sind #256, Content #259; kein Schul-Content vor geklärter Zuordnung | – |

## 7. G1: Neubewertung A/B/C/D

| Achse | Alt | Neu | Begründung |
|-------|-----|-----|------------|
| A Scope | 2 | 2 | Directus, Postgres, Volumes, Remote-Proxy, DNS, HSTS, Service-User, Auth-Konzept-Nachtrag, VVT. Der Cube-Teil fällt als Vorbedingung heraus, der Rest bleibt breit |
| B Fehlerkosten | 2 | 2 | Admin-Login im offenen Netz, Datenhaltung, Neustart-Risiko durch IONOS-Störung |
| C Ambiguität | 1 | **2** | Konsument widerspricht ADR-028, Host weicht von ADR-031 und Auth-Konzept ab, Akzeptanzkriterien fehlen, Admin-Erreichbarkeit offen |
| D Terrain | 2 | 2 | Ursache der Störung ist jetzt bekannt (extern), aber Remote-Server in Coolify, eigener Proxy und Cube-Netz sind unerprobt |

**Score:** 8/8 (vorher 7/8).

- **Stufe:** VOLL, unverändert.
- **Schritt −1 für Folge-Issues:** #256 und #257 brauchen kein eigenes −1, wenn Schritt 0 von #255 E-3 und E-4 festlegt. #258 braucht −1 nur, falls der Cube bis dahin nicht im Headscale-Netz ist.
- **Aktiv-Tabelle:** −1 lief auf Opus 5.5 ◆ (klassische Variante), nicht auf Fable. Der Fable-Slot ist damit nicht verbraucht. Schritt 0 auf Composer war mit „Fable-Slot auf −1 verbraucht“ begründet; bei C=2 und B=2 empfehle ich für Schritt 0 Opus 5.5 ◆ `high` (oder Fable, falls Credits da sind). Umsetzung (3) bleibt Composer.

## 8. Offene Fragen für Schritt 0

Nur echte Blocker:

1. ~~Alte 39-GS-Links auf `schulnavigator.mpz.schule`~~ erledigt: keine gedruckten oder verteilten Links auf diese Domain (Felix, 3. November 2026).
2. **E-6 Domain und DNS-Zone:** Welcher Name, und wer setzt den A-Record (IONOS-DNS-Zugang)?
3. **Pilot-Schule für #261:** Die Demo-Instanz arbeitet mit synthetischen Daten. ADR-030 migriert Pilot-Slugs aus `main` (39-GS-Content), das passt nicht mehr zur Demo. Für #255 nicht blockierend, wenn E-7 („leer“) gilt; #259 und #261 brauchen eine neue Antwort.
4. **Löschfreigabe Spike-Reste** (`directus-spike`, `app-spike`) vor Schritt 3.

## Quellen

- `dokumentation/planung/triage/triage-#255-directus-deploy-ionos.md`
- `dokumentation/planung/issues/issue-255-d07-deploy.md`, `gh issue view 255`
- `dokumentation/planung/epics/epic-directus.md`
- `dokumentation/spezifikationen/directus-auth-konzept.md`
- ADR-001, ADR-028, ADR-029, ADR-030, ADR-031
- `dokumentation/reviews/spike-directus-2026-07.md` (Phasen 1, 4, Service-User, Branch-Entscheidung)
- `anleitungen/fuer-entwickler.md` (DNS, HSTS, Volumes), `.cursor/rules/release-39-gs.mdc`, `.gitmodules`
- `~/Projekte/MPZ-DevOps-Ideen/festlegung-rechner-bestand-und-cube.md`
- [status.ionos.cloud](https://status.ionos.cloud/), abgerufen 3. November 2026
- Eigene Prüfungen 3. November 2026: `dig +short` für 15 Namen, `curl` auf `39-gs`, `schulnavigator`, `directus-spike`, `app-spike`, unbekannten Namen
- Felix, Antworten im Lauf: IONOS-Verfügbarmachung gestört; Konsument `schulnavigator.mpz.schule`; 39-GS-Umzug eigenes Ticket; `schulnavigator.mpz.schule` wird Demo-/Test-Instanz; vor dem 24. Juni nichts aus alten QR-Manifesten gedruckt oder verteilt
