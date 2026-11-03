# ADR-032: MPZ Studio als schmales Produktions-Admin statt Directus

**Datum:** 2026-11-03
**Status:** entschieden
**Issue:** [#271](https://github.com/flxln/schulnavigator/issues/271)
**Entscheider:** Felix, 3. November 2026
**Ersetzt:** in [ADR-003](./003-content-mvp-json-directus.md) das Directus-Zielbild und das Verbot eines eigenen Admins; [ADR-029](./029-runtime-datenpfad-directus.md), [ADR-030](./030-migrationsstrategie-content-freeze.md) und [ADR-031](./031-medien-storage-directus-proxy.md), soweit sie Directus voraussetzen
**Ergänzt:** [ADR-022](./022-mpz-studio-internes-ingest-tool.md) um einen Produktionsmodus; der Dev-Modus bleibt unverändert
**Quelle:** [CMS-Alternativen, Bericht vom 3. November 2026](../reviews/cms-alternativen-2026-11-03.md)

## Kontext

ADR-003 hat Directus als CMS für Lehrkräfte gewählt und ein eigenes Admin verworfen. Seit Directus v12.0.0 (10. Juni 2026, Monospace Sustainable Core License) gilt:

- Der Lizenztext erlaubt den eigenen Betrieb für eine Schule.
- Ohne Lizenzschlüssel läuft die Instanz auf der Core-Stufe: drei Studio-Sitze als harte Grenze, kein SSO, eigene Regeln auf Access Policies werden ignoriert. Jede Lehrkraft im Studio belegt einen Sitz.
- Der Open Innovation Grant hebt die Grenzen auf. Sein Vertrag ist öffentlich nicht einsehbar, die Schwelle schwankt im Wortlaut zwischen Jahresumsatz und wiederkehrendem Umsatz. Ein Grant- oder Bezahlschlüssel prüft mindestens alle 12 Stunden gegen `licensing.directus.com`. Scheitert die Prüfung, fällt die Instanz auf Core zurück und kann über den Core-Limits gesperrt werden.

Die Alternativen verfehlen jeweils eine harte Grenze des Auftrags (zwölf feste Stationen, keine neuen Inhaltstypen, Medien nur hinter dem Entry-Cookie, kleiner VPS): Payload und Strapi sind ein zweiter Dienst mit eigener Datenbank, PocketBase hat nur ein Superuser-Dashboard, NocoDB ist seit 9. Januar 2026 nicht mehr OSI, bei Baserow sitzt die Rolle „nur Datensätze“ in der Enterprise-Lizenz, Git-CMS machen jeden Speichervorgang zum Commit. Einzelheiten im Bericht.

MPZ Studio (ADR-022) hat die Stationspflege schon: Tabs für Stammdaten, Medien, Hotspots und Dialog, Kalibrierung für Fläche und Kugel. `writeStations` validiert das Gesamtdokument mit `validateStationsFile`, legt `.bak` an und benennt atomar um. Uploads prüfen Magic-Bytes und Größen nach `UPLOAD_RULES`. Es läuft nur bei `NODE_ENV=development`, Zugang ist ein gemeinsames Secret (`SN_MPZ_STUDIO_SECRET`), und es schreibt in Repo-Dateien. Jede Änderung braucht danach Commit, `deploy:content` und ggf. Redeploy.

Die Besucher-App liest `app/data/stations.json` heute per Import beim Build (`app/lib/stations.ts`). Schüler-Medien liegen nach ADR-027 auf Persistent Volumes (`/app/public/media`, `/app/content/dialog-audio`, `/app/content/coach-audio`) und werden cookie-gated über `/media/*` und `/api/dialog/*` ausgeliefert. `/stations/` (Raumbilder) ist absichtlich öffentlich.

Der Bericht empfiehlt, das Admin erst zu bauen, wenn benannte Lehrkräfte pflegen wollen. Felix entscheidet, es jetzt zu bauen, weil das MPZ selbst ohne Commit- und Deploy-Zyklus live pflegen soll.

## Entscheidung

### 1. Kein Directus, kein fremdes CMS

Directus ist nicht mehr das Zielbild. Der Open Innovation Grant wird nicht beantragt. Payload, Strapi, PocketBase, NocoDB, Baserow, Directus v9.26.0 und der Fork d9 entfallen.

### 2. MPZ Studio bekommt einen Produktionsmodus

MPZ Studio läuft künftig in zwei Modi:

| | Dev-Modus (ADR-022, unverändert) | Produktionsmodus (neu) |
| --- | --- | --- |
| Aktiv bei | `NODE_ENV=development` | eigene Runtime-Variable auf der Coolify-Application, nicht über `NODE_ENV` |
| Zugang | gemeinsames Secret, Header oder Cookie | Konto pro Person |
| Schreibt in | Repo-Dateien unter `app/` | Content-Volume und die Bahn-B-Volumes |
| Umfang | alle Studio-Bereiche | nur der Schnitt aus Abschnitt 3 |

`NODE_ENV` wird nicht umgeschaltet. Der Produktionsmodus ist aus, solange die Variable fehlt; dann antworten alle Studio-Routen weiter mit 404.

### 3. Umfang im Produktionsmodus

**Drin:** die vier Stations-Tabs (Stammdaten, Medien, Hotspots, Dialog) und die Hotspot-Kalibrierung für Fläche und Kugel. Uploads von Medien und Dialog-Audio mit denselben Regeln wie heute (`validateUpload`, `UPLOAD_RULES`).

**Bleibt Dev-only:** Deploy-Tab, Raumbild-Upload (schreibt in das öffentliche `/stations/`), Hub-Konfiguration, Stations-Akzente und -Icons, Embed-Allowlist, Coach-Nachrichten und -Audio, Brand-Ingest, QR-Erzeugung.

**Ausgeschlossen, Aufnahme nur per Folge-ADR:** Rückgängig mit Diff-Ansicht, Entwürfe und Vorschau, Rollen über die zwei aus Abschnitt 5 hinaus, Freigabe-Workflows, feldgenaues Änderungsprotokoll, Mehrsprachigkeit der Inhalte, neue Stationen oder Inhaltstypen, SSO, Self-Signup. Wer eines davon braucht, schreibt einen Folge-ADR und stellt dort die CMS-Frage neu. Ab dieser Liste wird aus dem Admin ein CMS, und diese Grenze soll dieses ADR halten.

### 4. Speicher und Lesepfad

- **Content-Volume:** Eine neue Persistent-Volume-Mount auf der Application nimmt die Live-Fassung von `stations.json`, deren Sicherungen und die Kontodatei auf. Name und Pfad legt die Umsetzung fest. Das Image bleibt für den Laufzeit-User schreibgeschützt in `data/` und `public/` (ADR-022, Defense-in-Depth); beschreibbar sind nur die Volumes.
- **Schreiben:** derselbe Pfad wie heute, nur mit anderem Ziel: Gesamtdokument validieren, temporäre Datei, Sicherung, atomares Umbenennen. Die letzten Sicherungen bleiben auf dem Volume liegen (Anzahl legt die Umsetzung fest).
- **Lesen:** `stations.ts` liest zur Request-Zeit die Volume-Fassung, wenn sie existiert und `validateStationsFile` besteht. Sonst gilt `stations.json` aus dem Image. Eine ungültige Volume-Datei führt nie zu einem Fehler für Besucher, sondern zum Fallback und zu einer Log-Zeile. Build und `generateStaticParams()` lesen weiter die Datei im Image; das reicht, weil die zwölf Slugs fest sind.
- **Medien:** Uploads landen in den bestehenden Bahn-B-Volumes und werden nur über `/media/*` und `/api/dialog/*` ausgeliefert. Kein Upload aus dem Produktionsmodus landet unter `/stations/` oder einem anderen öffentlichen Pfad.

Das ist der Lesepfad aus ADR-029 Option b ohne Netzwerk: Datei statt HTTP-Fetch, Fallback auf das Image wie dort.

### 5. Konten und Anmeldung

- Zwei Rollen: **admin** (MPZ, alle Stationen) und **redaktion** (Lehrkräfte, auf eine Liste von Slugs beschränkt). Stufe 1 legt nur admin-Konten an.
- Konten liegen auf dem Content-Volume, Passwörter nur als Hash mit einem langsamen Verfahren (scrypt oder argon2). Angelegt, gesperrt und zurückgesetzt werden sie per Skript im Container, nicht über eine Oberfläche.
- Session-Cookie `httpOnly`, `Secure`, `SameSite=Strict`, Laufzeit 8 Stunden wie heute. Schreibende Routen prüfen zusätzlich `Origin`. Fehlversuche beim Login werden gebremst.
- Jede gespeicherte Änderung schreibt eine Log-Zeile mit Konto, Zeit und Slug. Mehr Protokoll gibt es nicht (Abschnitt 3).

### 6. Eine Wahrheit für `stations.json`

Sobald der Produktionsmodus auf einer Application aktiv ist, ist die Volume-Fassung die Wahrheit für deren Stationsinhalte. `app/data/stations.json` in Git ist ab dann Startwert und Fallback.

- **Redaktionelle Änderungen** (Inhaltsfelder wie in ADR-030 Abschnitt 2 definiert) passieren nur noch im Produktionsmodus. Redaktionelle Commits an `stations.json` sind verboten, außer dem Export unten.
- **Export:** Ein Export holt die Volume-Fassung als Commit in Git. Er ist Pflicht vor jedem Verschieben von `release/39-gs` und vor Schema-Änderungen. Damit bleibt der Fallback aktuell, und Git ist die Versionsgeschichte, die das Admin selbst nicht hat.
- **Schema-Änderungen:** Eine Migration, die `stations.json` umbaut, muss auch die Volume-Fassung umbauen. Ohne diesen Schritt fällt die App nach dem Deploy auf das Image zurück.
- **Lokales Studio:** arbeitet nach Aktivierung auf einem exportierten Stand und nicht parallel zum Live-Admin an denselben Stationen.

### 7. Stufen

- **Stufe 1, MPZ live:** Produktionsmodus mit admin-Konten auf `39-gs.mpz.schule`, Volume im Backup T5 mit Restore-Test, Export-Weg, Security-Review vor Go-Live.
- **Stufe 2, Lehrkräfte:** redaktion-Konten mit Slug-Liste. Voraussetzungen: benannte Personen und Pflegefrequenz ([#249](https://github.com/flxln/schulnavigator/issues/249)), VVT und Datenschutzerklärung um Lehrkräfte-Konten ergänzt und mit dem AVV abgeglichen, Anleitung in `anleitungen/fuer-lehrkraefte.md`, Pilot mit zwei Lehrkräften ([#261](https://github.com/flxln/schulnavigator/issues/261)).

## Begründung

- Die Masken, die Validierung und die Upload-Regeln existieren. Es fehlen Konten pro Person, ein Speicher, der einen Redeploy überlebt, und der Lesepfad zur Request-Zeit. Das ist der kleinste Bau, der Live-Pflege ermöglicht.
- Kein zweiter Dienst, keine zweite Datenbank, kein Lizenzschlüssel und kein Phone-Home. Der VPS trägt eine App wie heute.
- Medien bleiben hinter dem bestehenden Cookie-Gate. Jedes fremde CMS hätte dieses Gate neu aufmachen müssen (ADR-031, Bericht).
- Das MPZ profitiert sofort: Pflege ohne Commit, `deploy:content` und Redeploy. Darum wird nicht gewartet, bis Lehrkräfte benannt sind.
- Das Argument aus ADR-003 gegen ein eigenes Admin („Mini-CMS mit hohem Wartungsaufwand“) bleibt richtig für den Umfang aus Abschnitt 3 „Ausgeschlossen“. Dieses ADR baut genau diesen Umfang nicht und hält ihn schriftlich fest.

Aufwand laut Bericht, als Schätzung und nicht als Messung: Konten, Speicher und Lesepfad 4 bis 6 Personenwochen, Uploads auf die Volumes hinter dem Gate 2 bis 4 Personenwochen. Wartung danach ist nicht enthalten.

## Verworfene Alternativen

- **Directus 12 ohne Schlüssel (Core):** drei Sitze, eigene Policy-Regeln werden ignoriert. Für mehr als zwei Lehrkräfte plus MPZ unbrauchbar.
- **Directus 12 mit Open Innovation Grant:** Vertrag nicht einsehbar; Prüfung alle 12 Stunden gegen einen fremden Server, Rückfall auf Core mit möglicher Sperre. Zweimal Relizenzierung in drei Jahren.
- **Directus v9.26.0 (GPL) oder d9:** keine belegte Sicherheitspflege für v9 upstream; d9 ist ein Fork einer alten Linie mit kleiner Basis.
- **Payload (MIT):** saubere Lizenz, aber zweite Next.js-App plus Datenbank auf dem kleinen VPS; Stationsmasken neu bauen.
- **Strapi Community (MIT):** Empfehlung 4 GB RAM und mehr für Strapi allein; Uploads standardmäßig unter `public/uploads/`.
- **PocketBase (MIT):** Oberfläche ist das Superuser-Dashboard; die Lehrkräfte-Maske bliebe selbst zu bauen.
- **NocoDB:** seit 9. Januar 2026 Sustainable Use License; Anhänge standardmäßig ohne Zugriffskontrolle.
- **Baserow OSS:** Member darf Tabellen anlegen und löschen; die Editor-Rolle sitzt in der Enterprise-Lizenz.
- **Git-CMS (Decap, Tina, Keystatic, Pages CMS):** jeder Speichervorgang bleibt ein Commit, Lehrkräfte arbeiten nicht mit Git.
- **Nur JSON, warten bis Lehrkräfte benannt sind (Empfehlung des Berichts):** verworfen, weil das MPZ den Commit- und Deploy-Zyklus selbst loswerden will.
- **`NODE_ENV=production` für das bestehende Studio:** würde den gesamten Dev-Umfang samt Deploy-Tab, Raumbild-Upload und gemeinsamem Secret auf den Live-Server bringen.

## Konsequenzen

- **ADR-003:** Hinweis „Directus-Zielbild und Verbot eines eigenen Admins ersetzt durch ADR-032“. JSON-MVP und Begründung gegen ein großes Custom-CMS bleiben.
- **ADR-022:** Hinweis „ergänzt durch ADR-032 (Produktionsmodus)“. Die Konsequenz „Studio wird nie auf Coolify aktiviert“ gilt für den Dev-Modus weiter, für den Produktionsmodus gilt ADR-032.
- **ADR-029, ADR-030, ADR-031:** Status „ersetzt durch ADR-032“, soweit Directus betroffen ist. Übernommen werden der Fallback-Gedanke (029), die Definition redaktioneller und technischer Commits (030) und das Cookie-Gate für alle Medien (031).
- **Issues:** Epic [#47](https://github.com/flxln/schulnavigator/issues/47) und die offenen Directus-Issues #255 bis #263 werden einem neuen Epic zugeordnet oder geschlossen. Das ist ein eigener Schritt nach diesem ADR. Inhaltlich übertragbar sind #256 (Schema und kein Schüler-PII erzwingen), #257 (Lesepfad), #258 (Backup und Restore-Test), #249 und #261 (Stufe 2).
- **Betrieb:** neues Volume auf der Coolify-Application, Aufnahme in Backup T5 ([dsgvo.md](../dsgvo.md)) mit Restore-Test, Skript für Konten, Export-Weg nach Git. Doku in `anleitungen/fuer-entwickler.md`.
- **Sicherheit:** Der Live-Server bekommt erstmals schreibende Routen mit Login und Upload. Vor Go-Live von Stufe 1 läuft ein Security-Review dieser Routen.
- **Datenschutz:** Stufe 1 speichert Konten von MPZ-Mitarbeitenden; VVT-Eintrag ergänzen. Lehrkräfte-Konten erst nach den Voraussetzungen aus Abschnitt 7.
- **Weitere Schulen:** eine Application mit eigenem Volume und eigenen Konten pro Schule, wie heute. Mandanten in einer Instanz sind nicht vorgesehen.
- **Offen für die Umsetzung:** Name der Freischalt-Variable, Volume-Pfad, Anzahl der Sicherungen, Cache-Strategie beim Lesen, ob admin-Konten einen zweiten Faktor brauchen.
