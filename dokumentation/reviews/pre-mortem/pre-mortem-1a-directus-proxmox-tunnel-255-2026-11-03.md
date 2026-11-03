---
ziel-artefakt: .cursor/plans/issue_255_directus-siliconsound_c4622b8a.plan.md
artefakt-typ: plan
issue: "#255"
modell: Sonnet 5.5 (claude-sonnet-5-5)
harness: Anthropic-Abo ◆ (Claude Code)
gegenstück: pre-mortem-1b-directus-siliconsound-255-2026-11-03.md
erstellt: 2026-11-03
prompt: 01a_pre-mortem-codepraxis
vorgänger: pre-mortem-1a-directus-siliconsound-255-2026-11-03.md
---

# Pre-Mortem 01a (Nachprüfung): #255 Tunnelpfad Proxmox-VM

Umfang laut Plan („Pre-Mortem-Stand nach dem Hostwechsel“): nur Todos `proxmox-vm`, `compose-directus-vm`, `tunnel-edge-route`, Exposition und Recovery. Die Funde F2 bis F4 und F7 des Vorgängers gelten unverändert und werden hier nicht wiederholt.

Blick: Ich setze den Plan morgen um, per `qm`, Compose, systemd und `curl`. Es gibt keinen App-Code. Zeilen unten als `plan:NN`.

Gelesen: Plan, Unknowns 0b, Triage (Zeile 01a: Sonnet 5.5 ◆ `high`), Vorgänger-1a, ScratchCraft `stack/vm/scratch-tunnel.service`, `stack/vps/scratch-edge.service`, `stack/vps/scratch-turbowarp.yaml`, `stack/vm/nginx-projekte.conf`, ScratchCraft-ADR-008 und ADR-010, Abschnitt HSTS in `anleitungen/fuer-entwickler.md`, ADR-031.

## Funde

### Das Edge-Skript fehlt im Muster, und ob es `X-Forwarded-For` durchreicht, weiß niemand
- **Warum später teuer:** `plan:21` und `plan:198` setzen „Edge-Muster dupliziert“ voraus. Im ScratchCraft-Repo liegt nur die Unit (`scratch-edge.service`), die auf `/usr/local/sbin/scratch-edge-proxy.py` zeigt. Das Skript ist weder in `stack/vps/` noch sonst im Repo (`find -name '*edge-proxy*'` ohne Treffer). Es existiert nur auf dem MPZ-VPS. Ob es Header unverändert durchreicht, ob es `Host` und `X-Forwarded-For` anfasst und ob der Port im Skript hartkodiert ist, steht nirgends.
- **Wann es beißt:** Beim Anlegen von `directus-edge.service`. Entweder fehlt die Vorlage, oder sie ist auf Port und Ziel von ScratchCraft festgenagelt. Schlimmer: Directus sieht hinter dem Edge-Proxy eine Quelladresse, aber nicht die des Besuchers (nächster Fund).
- **Billige Gegenmaßnahme jetzt:** Vor dem Anlegen `cat /usr/local/sbin/scratch-edge-proxy.py` auf dem VPS lesen (nur lesend) und als Platzhalter nach `infra/directus-demo/` kopieren. Danach entscheiden: Skript parametrisieren (Port per Argument) oder nginx/socat-freie Alternative. Ergebnis im Todo `tunnel-edge-route` festhalten.

### Rate-Limit hinter Tunnel: Die Kette hat drei Hops, und niemand prüft, welche Adresse am Ende ankommt
- **Warum später teuer:** Der Plan sagt „`IP_TRUST_PROXY` nur auf Tunnel-Quelle“ (`plan:24`). In der VM gibt es kein nginx wie bei ScratchCraft (`nginx-projekte.conf` Zeile 22 bis 51 macht dort genau diese Arbeit mit `real_ip_header`). Der Weg ist Traefik → Edge-Skript → `ssh -R` → `127.0.0.1:8055` in der VM → Docker-Port-Mapping → Container. Directus sieht als Peer das Docker-Gateway (z. B. `172.x.0.1`), nicht Loopback. Ein „nur auf Tunnel-Quelle“ ist deshalb nicht als IP formulierbar, die sich merken ließe, und Express-`trust proxy` kennt in Directus je nach Version nur `true`, eine Hop-Zahl oder eine Liste. Steht `true` (Default), vertraut Directus jedem `X-Forwarded-For`. Traefik überschreibt den Header von außen zwar (ohne `trustedIPs` am Entrypoint), das Edge-Skript ist aber unbekannt (siehe oben).
- **Wann es beißt:** (a) Zu streng: Alle Anfragen haben dieselbe Peer-IP, nach 25 Fehlversuchen irgendwoher ist der einzige Admin für alle gesperrt (Unknowns P2, `unk:102`). (b) Zu locker: Ein Angreifer rotiert `X-Forwarded-For: 1.2.3.n`, falls ein Hop den Header durchlässt, und das Rate-Limit greift nie. Beides sieht in `curl /server/health` grün aus.
- **Billige Gegenmaßnahme jetzt:** Prüfen statt annehmen, in dieser Reihenfolge: (1) Hop-Zahl festschreiben und `IP_TRUST_PROXY` gegen die gepinnte Version nachschlagen (Zahl oder Subnetz der Docker-Bridge, nicht `true`). (2) Diagnose-Aufruf, der die gesehene Client-IP zeigt (Directus-Log mit `LOG_LEVEL=debug` oder ein `GET /auth/login` mit absichtlich falschem Passwort und Blick ins Log). (3) Abnahmetest in `verify-erfolg-deploy`: 30 falsche `POST /auth/login` von Mobilfunk-IP und danach ein korrekter Login von einer zweiten IP; dazu derselbe Lauf mit rotierendem `X-Forwarded-For`-Header. Erwartet: Sperre nur für die erste Quelle, Rotation hilft dem Angreifer nicht.

### `StartLimitBurst` in der Tunnel-Unit kann den Tunnel nach einem Heimnetz-Ausfall dauerhaft töten
- **Warum später teuer:** Die ScratchCraft-Unit (`scratch-tunnel.service`) trägt `StartLimitBurst=5` und `StartLimitIntervalSec=300` bei `Restart=always`, `RestartSec=5`. Schlägt `ssh` fünfmal innerhalb von 300 s fehl, setzt systemd die Unit auf `failed (start-limit-hit)` und startet nicht mehr. Fehlschläge sind nach Proxmox-Reboot oder Router-Neustart genau das, was passiert: Netzwerk noch nicht oben, DNS nicht aufgelöst. Dazu kommt `ExitOnForwardFailure=yes`: Hängt auf dem VPS noch die alte Sitzung am Port (sshd merkt den toten Client erst nach `ClientAlive`-Timeout), scheitert der neue Forward, `ssh` beendet sich, und der Zähler läuft hoch.
- **Wann es beißt:** Bei `verify-recovery-baseline` Schritt 2 („Proxmox-Reboot → … Tunnel ohne Handgriff zurück“) oder, schlimmer, nachts bei einer Router-Trennung. Der Plan übernimmt die Unit als Muster (`plan:21`), die Grenzwerte stehen nicht im Plan.
- **Billige Gegenmaßnahme jetzt:** In `directus-tunnel.service` `StartLimitIntervalSec=0` setzen (kein Limit) und `RestartSec=10`. Auf dem VPS in der sshd-Konfiguration für den Tunnel-User `ClientAliveInterval 30` und `ClientAliveCountMax 3` setzen, damit tote Sitzungen den Port freigeben. Recovery-Test um „Heimrouter 2 Minuten vom Netz, danach Tunnel ohne Eingriff wieder da“ ergänzen (billiger als der VPS-Ausfall, den Post-Mortem 7 offen lässt).

### Recovery-Reihenfolge widerspricht sich: `stop` vor Reboot lässt den Stack unten
- **Warum später teuer:** `plan:167` und `plan:39` ordnen an: Stack stoppen, danach VM stoppen, dann Proxmox-Reboot (Schritt 2) und erwarten, dass „Stack und Tunnel ohne Handgriff zurück“ sind. Ein Container, der mit `docker stop` oder `docker compose stop` angehalten wurde, startet bei `restart: unless-stopped` nach dem Daemon-Neustart **nicht** wieder. Der Test aus Schritt 2 schlägt dann fehl, obwohl die Konfiguration stimmt, oder jemand tippt `compose up -d` und verfälscht damit das Ergebnis.
- **Wann es beißt:** Beim ersten Durchlauf von `verify-recovery-baseline`.
- **Billige Gegenmaßnahme jetzt:** Reihenfolge im Plan umdrehen. Zuerst Reboot-Test ohne vorheriges Stoppen (Schritt 2), danach Ausfall-Test (Schritt 1) mit `compose down` ohne `-v`, danach `compose up -d`. Im Todo festschreiben: „kein `-v`, `docker volume ls` vorher und nachher vergleichen“.

### Tunnel-User auf dem MPZ-VPS ist ohne Einschränkung ein Shell-Zugang
- **Warum später teuer:** `plan:21` verlangt „eigener Tunnel-User + Schlüssel“. Das Tunnel-Muster aus ScratchCraft (`ssh -N -R …`) braucht auf dem VPS keine Shell. Ein Schlüssel ohne Einschränkungen in `authorized_keys` gibt dem Heim-Host, der kein MPZ-Gerät ist und nicht im Headscale hängt, auf dem Produktiv-VPS eine Login-Shell oder mindestens beliebige Forwards (`-L` auf `127.0.0.1:…` des VPS, also auf Coolify-Dienste, die nur lokal lauschen).
- **Wann es beißt:** Wenn die VM kompromittiert wird oder der Schlüssel abfließt. Kein Test im Plan fängt das ab.
- **Billige Gegenmaßnahme jetzt:** Zeile in `authorized_keys` des Tunnel-Users mit `restrict,port-forwarding,permitlisten="127.0.0.1:<port>"` (und `permitopen` entfällt), Login-Shell `/usr/sbin/nologin`, kein Home-Schreibzugriff. Abnahme: `ssh <tunnel-user>@vps` liefert keine Shell, `ssh -L …` auf einen anderen Port wird abgelehnt. Eine Zeile mehr im Todo, ein Test mehr in `verify-erfolg-deploy`.

### Compose-Datei: Startreihenfolge, Healthcheck und Initial-Passwort fehlen in der Todo-Liste
- **Warum später teuer:** `plan:18` nennt Images, Volumes, Ports und `.env`, aber nicht (a) `depends_on` mit `condition: service_healthy` und einen `pg_isready`-Healthcheck am Postgres, (b) einen Healthcheck am Directus-Container, den Unknowns P3 als Ersatz für das Coolify-Monitoring ausweist (`unk:104`), (c) `ADMIN_PASSWORD` in der `.env`: Directus liest `ADMIN_EMAIL`/`ADMIN_PASSWORD` nur beim ersten Start. Danach steht ein Passwort in der Datei, das nicht mehr stimmt, sobald der Admin es ändert oder 2FA einrichtet. Zusätzlich nach Pinning: `11.x.y` ist im Plan ein Platzhalter; das Directus-Image enthält kein `curl`, ein `wget`-Healthcheck muss gegen die gepinnte Version einmal laufen.
- **Wann es beißt:** (a) Beim Proxmox-Reboot: Directus startet vor Postgres, bricht ab, `restart: unless-stopped` fängt es nach Sekunden wieder, die Migrationen laufen aber unter Last doppelt an. (b) Das Epic-Item „Health-Check per Compose-Healthcheck“ bleibt unerfüllt. (c) Beim Recovery-Test: Man vermutet das Passwort aus der `.env`, es gilt aber nicht mehr.
- **Billige Gegenmaßnahme jetzt:** Todo ergänzen um Healthchecks beider Dienste und `depends_on: service_healthy`. `ADMIN_PASSWORD` nach dem ersten Login aus der `.env` löschen (Kommentar in `README.md`). Konkrete Directus-Version vor dem Anlegen festlegen und im Plan eintragen.

### Zeitabgleich der VM: TOTP bricht bei Uhrabweichung
- **Warum später teuer:** Der Proxmox war am 3. November zwei Tage aus (`unk:100`). Ein Host, der nach Stromverlust ohne Netz bootet, setzt VM-Uhren auf RTC-Stand. Directus-2FA (TOTP) toleriert nur Sekunden Abweichung. Der Plan prüft Uhrzeit nirgends.
- **Wann es beißt:** Beim ersten Login nach einem längeren Ausfall: Der Code vom Authenticator wird abgelehnt, es sieht aus wie ein verlorenes 2FA-Gerät.
- **Billige Gegenmaßnahme jetzt:** In `proxmox-vm` `timedatectl status` (NTP aktiv, synchronisiert) als Abnahme aufnehmen. Ins Recovery-Kapitel der Anleitung „Uhrzeit prüfen“ vor „2FA zurücksetzen“ schreiben.

### Repo-Platzhalter: Versehentlich eingecheckte Secrets und Ports
- **Warum später teuer:** `plan:95` legt `infra/directus-demo/` mit gelaufenen Dateien an. Ohne `.env.example` weiß ein Leser nicht, welche Variablen existieren; ohne `.gitignore`-Eintrag landet beim Kopieren aus der VM schnell die echte `.env` im Stage. Die Pipeline fängt nur Dateinamen mit Secret-Muster ab (Exit 3), `.env` ist dabei, `compose.override.yml` oder ein Dump nicht.
- **Wann es beißt:** Beim Commit von Schritt 3.
- **Billige Gegenmaßnahme jetzt:** `infra/directus-demo/.env.example` mit Variablennamen und leeren Werten, `infra/directus-demo/.gitignore` mit `.env`, `*.sql`, `*.key`. `README.md` nennt, dass Port und Ziel in der gelaufenen Datei stehen, nicht im Repo (wie ScratchCraft).

## Nachtrag: Edge-Skript gelesen (3. November 2026, lesend per SSH)

`/usr/local/sbin/scratch-edge-proxy.py` auf dem MPZ-VPS ist ein reiner TCP-Pipe (`select`, ein Thread je Verbindung), kein HTTP-Parser. Folgen für den ersten Fund:

- **`X-Forwarded-For` bleibt unverändert**, was Traefik setzt, kommt in der VM an. Das Edge-Skript ist als Fehlerquelle für die Client-IP ausgeschlossen. Der Abnahmetest aus dem zweiten Fund bleibt nötig, aber der Hop dazwischen ist transparent.
- **Ports sind hartkodiert:** `LISTEN = ("10.0.0.1", 49161)`, `TARGET = ("127.0.0.1", 49160)`. Die Docker-Bridge hat hier also `10.0.0.1`, nicht das Docker-Default `172.17.0.1`. Für Directus: Kopie `directus-edge-proxy.py` mit eigenem `LISTEN`-Port und eigenem `TARGET`-Port (Tunnel). Die Ports 49160 und 49161 sind belegt und dürfen nicht wiederverwendet werden.
- **Unit** `scratch-edge.service` ist wie das Repo-Platzhalter (`Restart=always`, `RestartSec=2`, kein `StartLimit`-Eintrag, also gilt der systemd-Default von 5 Starts in 10 s). Für `directus-edge.service` `StartLimitIntervalSec=0` ergänzen.
- **Ablauf bei totem Tunnel:** `create_connection` schlägt fehl, die Verbindung wird sofort geschlossen, Traefik meldet 502. Das deckt die Erwartung aus dem Plan.
- Offen bleibt die Skript-Kopie im Repo: Sie fehlt auch in ScratchCraft. Beim Anlegen von `infra/directus-demo/` beide Skripte als Platzhalter (ohne Ports) ablegen.

## Klassen ohne Fund

- **Postgres/Directus nicht von außen erreichbar:** Kein `ports:` am Postgres, Directus nur `127.0.0.1:8055`, Tunnel nur `127.0.0.1`: Das Muster ist tragfähig. `ss -tlnp` in der VM zeigt den Docker-Proxy-Listener, das ist erwartbar. Zusätzlich lohnt `iptables -t nat -S DOCKER`, weil Docker UFW umgeht. Kein eigener Fund.
- **Traefik-Route und HSTS:** Die Dynamic-Datei hat in `scratch-turbowarp.yaml` ein belegtes Muster (`redirect-to-https@file`, `certResolver: letsencrypt`, `host.docker.internal`). `sn-hsts@file` existiert (`fuer-entwickler.md` Zeile 318 bis 331). Ein Hinweis aus dem Vorgänger-1a bleibt: HSTS erst nach gültigem Zertifikat, zuerst mit kurzem `stsSeconds`.
- **Baseline Besucher-Apps:** `39-gs` und `schulnavigator` lesen Directus noch nicht (`plan:53`). Der Check in Recovery Schritt 1 ist heute trivial grün, der Plan sagt das.
- **Spike-Reste:** Der Dump `spike-directus-artefakte/directus-postgres-dump-2026-07-06.sql` enthält Admin-Hash und Token. Der README dazu erklärt, dass beides nach dem Löschen der Instanz ungültig ist. Reihenfolge deshalb: Spike-Services zuerst löschen (`spike-reste-loeschen`), dann den Dump belassen. Kein Fund.
- **App-Repo:** `app/**` unberührt (`plan:102`), `test`/`lint`/`build` ohne Änderung grün erwartet.

## Reihenfolge der Gegenmaßnahmen

Wenn nur wenig Zeit bleibt: (1) Edge-Skript vom VPS lesen und `X-Forwarded-For`-Kette mit dem Spoofing-Test belegen, (2) `StartLimitIntervalSec=0` und `ClientAlive` setzen, (3) `authorized_keys` des Tunnel-Users beschränken. Die Recovery-Reihenfolge ist eine Zeile Planänderung.
