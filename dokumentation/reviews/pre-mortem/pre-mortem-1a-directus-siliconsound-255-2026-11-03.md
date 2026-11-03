---
ziel-artefakt: .cursor/plans/issue_255_directus-siliconsound_c4622b8a.plan.md
artefakt-typ: plan
issue: "#255"
modell: Sonnet 5.5 (claude-sonnet-5-5)
harness: Anthropic-Abo ◆ (Claude Code)
gegenstück: pre-mortem-1b-directus-siliconsound-255-2026-11-03.md
erstellt: 2026-11-03
prompt: 01a_pre-mortem-codepraxis
---

# Pre-Mortem 01a: #255 Directus-Deploy SiliconSound

Blick: Ich setze den Plan morgen um, per SSH, Coolify-UI und `curl`. Es gibt keinen App-Code. „Code-nah“ heißt hier Compose-Datei, Env-Variablen, Proxy-Labels und die Prüfbefehle aus dem Plan.

Gelesen: Plan (Zeilen unten als `plan:NN`), Unknowns-Befund (`unk:NN`), Triage, ADR-031, Auth-Konzept, Spike-Bericht, Abschnitt HSTS in `anleitungen/fuer-entwickler.md` (Zeile 310 bis 340).

## Funde

### Das RAM-Gate lässt sich mit Swap nicht erfüllen
- **Warum später teuer:** `plan:5-7` fordert nach „Swap anlegen und/oder Hochstufen“ den Wert `available ≥ 1 GiB` in `free -h`. Swap erhöht `available` nicht. Der Wert bleibt bei ~329 MiB (`unk:36-44`). Wer nur Swap anlegt, sieht das Gate rot und weiß nicht, ob er trotzdem deployen darf. Oder er deployt entgegen dem Gate.
- **Wann es beißt:** Am ersten Tag, direkt nach `swapon`. Zweiter Fall: Directus startet mit Migrationen (mehr als die ~237 MiB Leerlauf aus dem Spike), der Host swappt, und `coolify` oder die Bagles-Apps auf demselben Host werden langsam oder vom OOM-Killer getroffen.
- **Billige Gegenmaßnahme jetzt:** Todo zweiteilen. (a) Swap als Absicherung mit `/etc/fstab`-Eintrag, danach `swapon --show` und Neustart-fester Eintrag prüfen. (b) Gate-Entscheidung vor dem Deploy festschreiben: Hochstufen (Hetzner „nur CPU und RAM“, damit die Platte nicht wächst und ein Downgrade möglich bleibt) oder Container stoppen. Swap allein erfüllt das Gate nicht. Alternative Formulierung: Gate gilt nach dem Directus-Start, mit Rückfall „Hochstufen“, wenn `available < 1 GiB`. Dann steht der Rückfall vorab im Plan.

### `GET /items/directus_users` ohne Token prüft nichts
- **Warum später teuer:** `plan:39`, `plan:119` und der Erfolgsfall (`plan:141-143`) testen den anonymen Zugriff über `/items/directus_users`. Meines Wissens verweigert Directus `/items/directus_*` für alle, auch für Admins, weil System-Collections über eigene Endpunkte laufen (`/users`, `/files`, `/roles`). Der Test liefert dann immer 403 und beweist nichts über die Public-Policy. Gegen die gepinnte Version prüfen, einmal mit Admin-Token aufrufen.
- **Wann es beißt:** Beim Verifizieren: grüner Haken, obwohl `GET /users` oder `GET /server/info` anonym etwas liefert. Auch `/assets/<id>` bleibt ohne hochgeladene Datei ungetestet (siehe nächster Fund).
- **Billige Gegenmaßnahme jetzt:** Prüfliste ersetzen durch anonyme Aufrufe von `/users`, `/users/me`, `/files`, `/collections`, `/roles`, `/server/info`, `/graphql` (jeweils 401/403 oder bewusst offen dokumentiert). Dazu der Kontrolltest „derselbe Aufruf mit Admin-Token → 200“, sonst ist das 403 nicht aussagekräftig.

### Service-User „read ok“ ist bei leerer Instanz nicht prüfbar
- **Warum später teuer:** Der Plan verlangt „Service-User read ok, POST 403“ (`plan:39`, AC 4) und gleichzeitig eine leere Instanz ohne Collections (`plan:56`, E-7). Leserechte werden pro Collection vergeben. Es gibt nichts, worauf der Service-User lesen könnte. Der einzig reale Pfad aus ADR-031 ist `directus_files`.
- **Wann es beißt:** Bei Todo `verify-erfolg-deploy`. Entweder fällt „read ok“ stillschweigend weg, oder jemand legt im Deploy eine Test-Collection an, die #256 dann übernimmt oder löschen muss.
- **Billige Gegenmaßnahme jetzt:** Prüfpfad festlegen: eine synthetische Datei (Text, wenige KB) als Admin hochladen. Service-User: `GET /files/<id>` und `GET /assets/<id>` mit Token → 200, ohne Token → 403, `POST /files` und `DELETE /files/<id>` mit Token → 403. Datei danach löschen oder als „Testdatei“ markieren. Policy des Service-Users: `app_access=false`, `admin_access=false`, **`enforce_tfa=false`** (sonst blockt die 2FA-Pflicht aus `plan:27` je nach Version auch den Token-Zugriff; testen).

### Account-Sperre und verlorenes 2FA-Gerät: der Recovery-Test deckt nur einen Fall ab
- **Warum später teuer:** `plan:27` setzt `AUTH_LOGIN_ATTEMPTS` (Spike-Befund `unk:155`, Default 25). Meines Wissens setzt Directus den User bei Überschreitung auf Status „suspended“ ohne automatische Entsperrung. Die Admin-Login-Seite ist öffentlich. Jeder kann den einzigen Admin mit ein paar Fehlversuchen sperren. Das ist ein DoS auf den Zugang, kein Schutz. Der Recovery-Fall (`plan:41-43`, `plan:149-153`) kennt nur „2FA-Gerät verloren: CLI-Weg“. Das Directus-CLI hat `users passwd`, aber meines Wissens keinen Befehl, der `tfa_secret` löscht oder einen suspendierten User entsperrt. Das heißt SQL im Postgres-Container.
- **Wann es beißt:** Beim ersten Bot-Scan auf `/auth/login`. Zweiter Fall: Felix verliert das Authenticator-Gerät, und `directus users passwd` hilft nicht, weil das TOTP-Secret bleibt.
- **Billige Gegenmaßnahme jetzt:** (1) Zweiten Admin als Break-Glass anlegen, mit eigener 2FA. (2) Recovery-Schritte als konkrete Befehle in `fuer-entwickler.md` ablegen und durchspielen: `UPDATE directus_users SET status='active' …` und `SET tfa_secret=NULL …` per `docker exec … psql`, plus Neu-Einrichtung bei aktivem `enforce_tfa`. (3) Entscheiden, ob `AUTH_LOGIN_ATTEMPTS` hoch bleibt und stattdessen der Rate-Limiter plus Traefik-`rateLimit` auf `/auth/login` schützt.

### Rate-Limiter und Session-Cookie hängen an Proxy-Env, die der Plan nicht nennt
- **Warum später teuer:** `plan:27` listet `RATE_LIMITER_ENABLED`, `AUTH_LOGIN_ATTEMPTS`, `SESSION_COOKIE_TTL`. Es fehlen `SESSION_COOKIE_SECURE=true` (Default `false`), `SESSION_COOKIE_SAME_SITE`, `PUBLIC_URL` mit `https://` und die Frage, welche IP der Limiter sieht. Hinter Traefik ist die Client-IP nur über Forwarded-Header erkennbar. Falsch konfiguriert zählen alle Clients als eine IP (Limiter sperrt jeden, auch Felix) oder der Limiter ist über gefälschte Header umgehbar. Dazu: Der Test „Session max. 8 h“ (`plan:144`) ist in der Praxis nicht durchführbar, außer man wartet acht Stunden.
- **Wann es beißt:** Beim ersten Admin-Login ohne `Secure`-Cookie, oder beim Rate-Limit-Test von außen: entweder keine Sperre, oder sofort Sperre für alle.
- **Billige Gegenmaßnahme jetzt:** Env-Liste im Plan vervollständigen und gegen die gepinnte Version abgleichen (`PUBLIC_URL`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAME_SITE`, `RATE_LIMITER_*`, `IP_TRUST_PROXY` o. Ä.). Cookie-TTL einmal mit `SESSION_COOKIE_TTL=2m` testen, dann auf `8h` setzen. Rate-Limit-Test: 30 falsche `POST /auth/login` von außen per Schleife, dabei prüfen, dass ein Login aus einer zweiten IP (Mobilfunk) weiter geht.

### Traefik: Vorcheck über Port 80 und Labels, die Coolify neu schreibt
- **Warum später teuer:** (a) Der Vorcheck `curl --resolve <domain>:80:… http://…/server/health` (`plan:12`, `plan:137`) bekommt bei Coolify-Traefik in der Regel einen Redirect auf HTTPS, kein 200. Ohne DNS und Zertifikat scheitert auch `https` mit Default-Zertifikat. (b) `plan:23` hängt `sn-hsts@file` an Labels. In einem Coolify-Service mit `SERVICE_FQDN_*` erzeugt Coolify die Router-Labels selbst. Werden Labels nur in der UI ergänzt, überschreibt der nächste Redeploy sie. Das gilt auch für `plan:153` (Neudeploy). (c) HSTS vor gültigem Zertifikat setzt Browser auf „nur HTTPS“, mit totem Zertifikat. (d) Wildcard-TTL: Let’s Encrypt kann nach dem A-Record noch die alte Wildcard-IP auflösen.
- **Wann es beißt:** Beim ersten Zertifikatsversuch: ACME schlägt fehl, Traefik liefert das Default-Zertifikat, HSTS ist schon gesetzt, der Browser lässt Felix nicht mehr durch.
- **Billige Gegenmaßnahme jetzt:** Vorcheck umschreiben: `curl -sI --resolve …:80:195.201.93.22 http://<domain>/server/health` erwartet `301/308` auf `https` (beweist Routing), und `curl -skI --resolve …:443:… https://<domain>/server/health` erwartet 200 mit `-k`. Labels im Compose-File ablegen (nicht in der UI), Router-Namen aus der Coolify-Vorschau übernehmen. Reihenfolge: A-Record, `dig @ns … +short` prüfen, Zertifikat erst gültig, dann `sn-hsts` anhängen, zuerst mit kurzem `stsSeconds` wie in `fuer-entwickler.md` Zeile 320 bis 331.

### Zwei Dinge, die der Neubau-Test zerstören kann: Secrets und Upload-MIME
- **Warum später teuer:** (a) Recovery-Schritt 3 (`plan:153`) „Service neu deployen ohne Volume-Löschung“. Postgres ignoriert `POSTGRES_PASSWORD`, wenn das Datenverzeichnis schon existiert. Erzeugt Coolify bei Neuanlage per `SERVICE_PASSWORD_*` oder `SERVICE_BASE64_64_*` neue Werte, passt das Passwort nicht mehr zur DB, oder `KEY`/`SECRET` wechseln, und bestehende Tokens und 2FA-Secrets sind ungültig. Der Spike hat außerdem Env-Duplikate bei Bulk-PATCH erzeugt (`spike:164`). (b) `plan:34` nähert Upload-Limit und MIME-Allowlist an `UPLOAD_RULES` an. Browser melden `.md`, `.m4a`, `.wav` uneinheitlich (`text/markdown` oder `application/octet-stream`; `audio/mp4`, `audio/x-m4a`; `audio/wav`, `audio/x-wav`). Directus prüft den Typ per Glob-Liste. Ein zu enges Muster lehnt echte Lehrkräfte-Uploads ab, ein zu weites lässt `.html` durch.
- **Wann es beißt:** (a) Beim Recovery-Test: Directus startet nicht, „password authentication failed“, oder Admin-Login geht nicht mehr. (b) Bei #260/#261, wenn die erste `.md` oder `.m4a` mit 400 abgewiesen wird, und niemand weiß, ob das Limit oder der Typ schuld ist.
- **Billige Gegenmaßnahme jetzt:** (a) `KEY`, `SECRET`, DB-Passwort einmal setzen und als feste Werte in Coolify ablegen (nicht magisch regenerieren). Kopie im Passwortmanager, nicht im Repo. Recovery-Test erst nach dem Setzen. Nach jeder Env-Änderung die Variablenliste der UI auf Duplikate prüfen. (b) Je ein echter Upload pro Typ (mp3, wav, m4a, mp4, jpg, webp, md, txt) aus Safari und Chrome gegen die Allowlist, Ergebnis als Tabelle in `fuer-entwickler.md`. Globales `FILES_MAX_UPLOAD_SIZE` bleibt 150 MB. Das heißt, bis #256 darf auch ein Foto 150 MB groß sein, das gehört ausdrücklich in den Plan.

## Klassen ohne Fund

- **IO-Abgrenzung / App-Repo:** `app/**` bleibt unberührt (`plan:88`). `npm run test`, `lint`, `build` (`plan:157-159`) sind ohne Änderung grün zu erwarten, ein Satz im Post-Mortem reicht.
- **Spike-Löschung:** Reihenfolge und UUIDs sind im Plan genannt (`plan:18`), `unk:58` hat die Ordner. Billig dazu: nach dem Löschen `docker volume ls | grep g13fe84` auf dem MPZ-VPS, damit die vier Volumes wirklich weg sind, und den Haken „Volumes löschen“ in der UI setzen.
- **Postgres nicht öffentlich:** Das Muster aus dem Spike (kein `ports:` am Postgres-Service) reicht, `ss -tlnp` im Plan ist ausreichend. Zusätzlich `ufw status` bzw. Hetzner-Firewall auf SiliconSound notieren, weil dort 15 andere Container laufen.
- **Baseline Besucher-Apps:** Directus stoppen und `/api/health` prüfen (`plan:151`) ist heute trivial grün. Der Plan sagt das, nichts zu ergänzen.

## Reihenfolge der Gegenmaßnahmen

Wenn nur wenig Zeit bleibt: (1) `/items/directus_*`-Test ersetzen, (2) Break-Glass-Admin plus SQL-Recovery, (3) Secrets fest setzen. Alle drei sind eine Zeile im Plan und verhindern, dass ein grüner Test falsch beruhigt.
