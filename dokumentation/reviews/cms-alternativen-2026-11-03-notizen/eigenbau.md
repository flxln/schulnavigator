# Eigenbau: schmales Lehrkräfte-Admin (Schulnavigator)

Stand der Repo-Lesung: 3. November 2026. Arbeitsbaum unter `schulnavigator/`, keine Codeänderung. Die Personenwochen weiter unten sind eine begründete Schätzung, keine Messung und kein Angebot.

Annahme der Schätzung: eine Person, die dieses Repo schon kennt (Stationen-Schema, MPZ-Studio-Formulare, `validateStationsFile`, Cookie-Gate, Coolify-Volumen). Wiederverwendung der vorhandenen Studio-Domain, kein neues CMS. Zwei bis fünf Lehrkräfte, eine Schule, zwölf feste Slugs. Kein SSO, kein Transcoding, kein Entwurfssystem. Wartung nach dem Erstbau ist in den Wochen nicht enthalten.

## Welche CMS-Teile dieses schmale Admin nicht braucht

### Takeaway

Der erlaubte Auftrag ist ein festes Formular über zwölf Stationen plus Datei-Upload hinter dem bestehenden Besucher-Cookie. Ein Collection-Designer, GraphQL, Flows, eine Revisionsoberfläche, SSO und White-Label liegen außerhalb dieses Auftrags. Öffentliche Quellen beschreiben genau diese Bausteine als den Teil, der aus einem Formular ein dauerhaftes CMS macht.

### Cited Findings

- Das Stationsdokument ist geschlossen: genau zwölf Einträge (`minItems`/`maxItems`: 12), Slug nur aus einem Enum von zwölf Werten (`klassenzimmer` bis `schulhof`), `additionalProperties: false`. Pflichtfelder einer Station sind `slug`, `titel`, `beschreibung`, `medien`. — [stations.schema.json](../../../app/data/stations.schema.json)
- Medientypen sind fest: `audio`, `video`, `foto`, `text`, `link`, `embed`. Hotspots sind entweder Fläche (`x`/`y` 0–1) oder Kugel (`yaw`/`pitch`). Dialogzeilen haben `id`, `rolle`, `quelle` (Muster `^/api/dialog/`) und `text`. — [stations.schema.json](../../../app/data/stations.schema.json)
- ADR-003 verwirft ein eigenes Admin, weil es ein Mini-CMS wäre (Medien, Rollen, Workflows). ADR-022 wiederholt die Grenze: MPZ Studio hat keine Rollen, keine Workflows und keine Mehrbenutzer-Funktionen. — [ADR-003](../../../dokumentation/adr/003-content-mvp-json-directus.md), [ADR-022](../../../dokumentation/adr/022-mpz-studio-internes-ingest-tool.md)
- ADR-029 hält fest: keine Preview-Route im MVP. Lehrkräfte sähen Änderungen live über den Data-Cache. Eine echte Entwurfs-Preview ist Follow-up ohne Issue-Nummer und nicht Teil von #252. Der Validator-Vertrag gilt für das gemergte Gesamtdokument aller Stationen, nicht pro Station. — [ADR-029](../../../dokumentation/adr/029-runtime-datenpfad-directus.md)
- UnfoldCMS (2. August 2026, Hersteller eines CMS, Bias im Text offengelegt) nennt als aufschiebbar: Zeitplanung, Freigabe-Workflows, Lokalisierung, versioniertes Rücksetzen, API-Tokens für Dritte, Suche jenseits von SQL `LIKE`. Als frühe Falle nennt derselbe Text Rollen und ein Audit, weil man sie später nicht rekonstruiert. — [UnfoldCMS, CMS vs Custom Build](https://unfoldcms.com/blog/cms-vs-custom-build)
- Sanity (14. Dezember 2025, Hersteller, Antwort auf den Abgang von cursor.com) zählt als CMS-Funktionen, die auch ein „einfaches“ Markdown-Setup wieder erfindet: Asset-Oberfläche, Nutzerrechte, Versionsstand, Lokalisierung, Inhaltsmodell. Dieselbe Quelle nennt Vorschau-Modi und getrennte Logins (CMS, Git, Hosting) als Reibung, die ein schmales Admin für diese App nicht lösen muss. — [Sanity, You should never build a CMS](https://www.sanity.io/blog/you-should-never-build-a-cms)

### Inferences

- Ein Collection-Designer entfällt, weil Typen, Slugs und Feldgrenzen im JSON-Schema stehen. Lehrkräfte legen keine neuen Inhaltstypen und keine neuen Stationen an.
- GraphQL entfällt. Die Besucher-App braucht ein Stationsdokument, keine freie Abfrage über beliebige Typen.
- Flows entfallen. Der Auftrag kennt keinen Freigabe-, Zeitplan- oder Benachrichtigungsschritt.
- Eine Revisionsoberfläche, SSO und White-Label entfallen im engen Schnitt. Es gibt eine Schule, zwei bis fünf Konten, deutsche Oberfläche, vorhandene GS39-Tokens. SSO wäre ein IdP neben dem Entry-Cookie. White-Label wäre ein zweites Theme.
- Dieselbe Liste ist der Umfang, den Korb C wieder hineinholt, sobald die Grenze weich wird.

### Gaps

- Öffentliche Texte beziffern diese Bausteine für allgemeine CMS, nicht für ein Schema mit zwölf Slugs. Die Übertragung ist eine Einordnung, kein Benchmark.
- Ob die Schule später doch einen IdP (etwa Schul-Login) verlangt, steht in den gelesenen ADRs nicht.

## Was MPZ Studio schon kann und was dev-only fest verdrahtet ist

### Takeaway

Die Stationspflege (Texte, Medien, Hotspots, Dialog) existiert als Formulare und Domain-Funktionen über `stations.json`. Produktiv ist das Werkzeug abgeschaltet: `NODE_ENV === 'development'`, ein gemeinsames Secret, und ADR-022 verbietet HTTP-Schreiben auf Coolify. Für Lehrkräfte fehlt ein Benutzerkonto und ein Schreibziel, das einen Redeploy überlebt.

### Cited Findings

- Dev-Schalter und Auth sitzen in `isMpzStudioEnabled()` (`process.env.NODE_ENV === 'development'`). `assertMpzStudioAccess` antwortet sonst mit HTTP 404. Erlaubt ist Header `x-mpz-studio-key` oder httpOnly-Cookie `sn-mpz-studio`, beide müssen exakt `SN_MPZ_STUDIO_SECRET` sein. Das ist ein gemeinsames Geheimnis, kein Konto pro Person. Cookie-Lebensdauer 8 Stunden. — [mpz-studio-guard.ts](../../../app/lib/mpz-studio-guard.ts)
- Seiten unter `/mpz` laufen durch `mpzStudioPageGuard` in der Middleware. `/mpz/unlock` ist ohne Cookie erreichbar, aber nur bei `development`, sonst 404. Die Middleware matcht `/api/*` nicht. API-Routen müssen `withMpzStudioAccess` selbst aufrufen. ADR-022 nennt das ausdrücklich. — [middleware.ts](../../../app/middleware.ts), [ADR-022](../../../dokumentation/adr/022-mpz-studio-internes-ingest-tool.md)
- Die Stationsseite hat vier Tabs: Stammdaten, Medien, Hotspots, Dialog. Vorschau-Link zeigt auf `/raum/{slug}`, also die echte Besucherroute, keinen Entwurf. — [station-detail-shell.tsx](../../../app/components/mpz-studio/station-detail-shell.tsx)
- Stammdaten-Formular speichert Titel, Beschreibung, Viewer. Viewer-Wechsel ist gesperrt, solange Hotspots existieren. Nach dem Speichern steht im UI, der Dev-Server müsse neu starten, weil der Modul-Cache `/raum/{slug}` sonst nicht aktualisiert. — [station-stammdaten-form.tsx](../../../app/components/mpz-studio/station-stammdaten-form.tsx)
- Medien, Hotspots und Dialog haben eigene Formulare und Tabellen, plus Anlegen und Entfernen von Medien und Hotspots. Stationen anlegen oder löschen gibt es in diesen Modulen nicht (`addStation`/`deleteStation` nicht vorhanden; vorhanden sind `addStationMedium`, `removeStationMedium`, `addStationHotspot`, `removeStationHotspot`). Hotspot-Koordinaten gibt es zusätzlich als Kalibrierseiten `/mpz/calib/flat/[slug]` und `/mpz/calib/sphere/[slug]`. — [station-medien-table.tsx](../../../app/components/mpz-studio/station-medien-table.tsx), [station-hotspots-table.tsx](../../../app/components/mpz-studio/station-hotspots-table.tsx), [station-dialog-panel.tsx](../../../app/components/mpz-studio/station-dialog-panel.tsx), [mpz-station-medien.ts](../../../app/lib/mpz-station-medien.ts), [mpz-station-hotspots.ts](../../../app/lib/mpz-station-hotspots.ts)
- `writeStations` schreibt `data/stations.json`, prüft bei `strict` (Default) das ganze Dokument mit `validateStationsFile`, legt standardmäßig ein Backup an und benennt erst danach um. Asset-Prüfung läuft nur, wenn `validateAssets` gesetzt ist. — [mpz-content-io.ts](../../../app/lib/mpz-content-io.ts)
- Upload-Regeln (Magic-Bytes via `file-type`, nicht der Originalname): Audio mp3/wav/m4a bis 25 MB, Video mp4 bis 150 MB, Foto jpg/jpeg/webp bis 8 MB, Text md/txt bis 512 KB. Dateiname wird slugifiziert. HEIC wird nicht durchgereicht. Dialog-WAV separat bis 15 MB. Ingest-Route nimmt multipart bis zur Video-Größe, Kommentar in der Route: nur Dev-Studio. Dateien landen unter `public/media/{slug}/{ordner}`. — [mpz-upload-rules.ts](../../../app/lib/mpz-upload-rules.ts), [mpz-medium-ingest.ts](../../../app/lib/mpz-medium-ingest.ts), [media/ingest/route.ts](../../../app/app/api/mpz/media/ingest/route.ts), [use-dialog-segment-audio-upload.ts](../../../app/components/mpz-studio/use-dialog-segment-audio-upload.ts)
- Schüler-Medien unter `/media/` liefert die Middleware ohne gültiges Entry-Cookie mit 403 und `Cache-Control: no-store` (kein Redirect, damit `video`/`img` nicht auf die Eintrittsseite laufen). `/stations/`, `/demo/`, `/qr/`, `/brand/` sind öffentliche Asset-Pfade und liegen außerhalb dieses Gates. `public/media/*` ist gitignored. Dialog-Audio liegt in `content/dialog-audio/` und wird nur über `/api/dialog/{slug}/{clip}` ausgeliefert. Diese Route prüft das Entry-Cookie selbst, weil `/api` nicht im Middleware-Matcher steht. — [middleware.ts](../../../app/middleware.ts), [app/.gitignore](../../../app/.gitignore), [validate-station-assets.ts](../../../app/scripts/validate-station-assets.ts), [api/dialog route](../../../app/app/api/dialog/[slug]/[clip]/route.ts)
- Der Deploy-Tab nennt den heutigen Medienweg: nach Studio-Upload rsync auf VPS-Volumes (`DEPLOY_SSH` in `.env.local`), davor `validate:stations` und `validate:coach` im Skript. Git-Push ist ein anderer Modus. ADR-022 verwirft Studio auf Coolify, weil HTTP-Schreiben auf `public/` zur Laufzeit ein Risiko ist, und sagt, das Prod-Image habe kein beschreibbares `data/`/`public/` für den Laufzeit-User. — [deploy-tab.tsx](../../../app/components/mpz-studio/deploy-tab.tsx), [ADR-022](../../../dokumentation/adr/022-mpz-studio-internes-ingest-tool.md)
- Neben den Stations-Tabs gibt es Studio-Flächen, die nicht zum Lehrerauftrag gehören: Hub, Design, Brand, Embeds, Coach, Deploy (unter anderem Token-Rotation, QR, Env). — [app/app/mpz/studio/](../../../app/app/mpz/studio)
- Zwei Validator-Skripte: `validate:stations` prüft Assets auf der Platte (`scripts/validate-station-assets.ts`). `validate:stations:structure` läuft im `build`. `validateStationsFile` ist die Strukturfunktion, die `writeStations` im Strict-Modus auf dem ganzen Dokument aufruft. — [package.json](../../../app/package.json), [validate-stations.ts](../../../app/lib/validate-stations.ts)

### Inferences

- Wiederverwendbar für ein Lehrer-UI sind die vier Tabs, die Kalibrierseiten, die Domain-Module (`mpz-station-*`, `mpz-content-io`, `mpz-upload-rules`, `mpz-medium-ingest`) und der Strict-Schreibpfad mit `validateStationsFile` auf dem Gesamtdokument.
- Nicht wiederverwendbar als Auth ist das Shared Secret. Nicht mit ausliefern sind Deploy, Token-Rotation, QR, Brand, Hub, Embed-Allowlist und Coach.
- Der Dev-only-Schalter ist kein Konfigurationsflag, das man in Produktion umlegt. Middleware und API antworten mit 404, und das Image soll `data/` und `public/` nicht beschreiben. Ein Lehrer-Upload muss ein Volume treffen, das weiterhin nur über `/media/` oder `/api/dialog/` erreichbar ist.
- Raumbilder unter `/stations/` sind absichtlich öffentlich. Wer den Raumbild-Upload für Schülerfotos mitbenutzt, umgeht den Cookie.

### Gaps

- Es wurde nicht jede `/api/mpz`-Route einzeln auf `withMpzStudioAccess` geprüft. Der Vertrag steht im Guard und in ADR-022. Ein vergessener Wrapper wäre ein Loch, kein Beleg, dass alle Routen dicht sind.
- Ob die Middleware in Produktion vor dem statischen `public/`-File von Next greift, wurde am 3. November 2026 nicht erneut gemessen. Der Code matcht `/media/:path*` und kommentiert den 403. Ein Audit „S1“ ist nur als Kommentar referenziert, der Audit-Text wurde nicht gelesen.
- Die Coolify-Volume-Mounts am Host wurden in dieser Lesung nicht im Server nachgesehen. Belegt ist der rsync-Weg im Deploy-Tab und die Projektregel, dass Schüler-Medien an der GS39-Application als Volumes plus rsync liegen, unabhängig vom Branch. — [release-39-gs.mdc](../../../.cursor/rules/release-39-gs.mdc)

## Aufwand in drei Körben (Personenwochen)

### Takeaway

Begründete Schätzung für eine repo-kundige Person, enger Schnitt, Stand 3. November 2026: Korb A 4 bis 6 Personenwochen, Korb B 2 bis 4, Summe A+B 6 bis 10. Korb C ist kein Pflichtumfang. Nimmt man ihn mit, kommen grob 9 bis 19 weitere Wochen dazu und der Auftrag wird zum CMS. Die externen Spannen „3 bis 12 Entwicklermonate“ beschreiben ein produktionsreifes CMS mit Medienbibliothek, Rollen, Entwürfen und SEO, nicht diesen Schnitt.

### Cited Findings

- UnfoldCMS setzt den Erstbau eines produktionsreifen eigenen CMS auf 3 bis 12 und mehr Entwicklermonate, einen Blog-Prototyp auf Tage. Dieselbe Quelle sagt, das sichtbare Fünftel (Tabelle, Formular) verdecke den Rest (Medien, Rollen, Entwürfe, SEO, Suche, Migrationen, eine Oberfläche, die Nicht-Entwickler akzeptieren), und jede nachziehende Anfrage sei oft eine Woche. Den eigenen CMS-Bau beziffern sie mit über 18 Monaten. Ein vorhandenes CMS setzen sie dagegen auf Stunden zur Installation und Tage fürs Theme. Methodik: eigene Produktentwicklung plus öffentliche Build-in-Public-Berichte, Stand Lizenzpreise Juli 2026. Sie schreiben, dass „bau keins“ für einen CMS-Hersteller bequem ist. — [UnfoldCMS, CMS vs Custom Build](https://unfoldcms.com/blog/cms-vs-custom-build)
- Sanity beschreibt kein Personenwochen-Maß. Die Quelle sagt, ein selbstgebautes Werkzeug wachse innerhalb von sechs Monaten nach (Planen, mobile Vorschau, Zurücksetzen, für das `git reflog` nicht reiche). Die Asset-Oberfläche von cursor.com wird mit „3–4 Prompts“ zitiert, die Migration dorthin mit 344 Agent-Anfragen und etwa 260 US-Dollar. Das ist die Gegenrichtung (CMS verlassen, Redaktion sind Entwickler, ein Marketing-Auftritt) und stammt aus der Hersteller-Antwort, nicht aus Lee Robinsons Originaltext. — [Sanity, You should never build a CMS](https://www.sanity.io/blog/you-should-never-build-a-cms)
- Im Repo ist der Formular- und Validierungskern da (siehe vorige Frage). Es fehlt Laufzeit-Schreiben, das einen Coolify-Redeploy überlebt, und eine Anmeldung für mehrere Personen. `stations.json` wird heute so gelesen, dass das Stammdaten-Formular einen Neustart des Dev-Servers verlangt. ADR-029 legt den Build weiter auf die JSON-Datei im Image, auch wenn die Redaktionsquelle woanders liegt. — [station-stammdaten-form.tsx](../../../app/components/mpz-studio/station-stammdaten-form.tsx), [ADR-029](../../../dokumentation/adr/029-runtime-datenpfad-directus.md)

### Inferences

Schätzung, keine Messung. Annahme wie oben: repo-kundige Person, vorhandene Formulare bleiben, kein SSO, kein Transcoding, keine Entwürfe in A und B.

**A. Formulare über das bestehende Schema plus Auth für 2 bis 5 Lehrkräfte: 4 bis 6 Personenwochen.**

- Etwa 1 bis 1,5 Wochen: Anmeldung mit eigenem Konto (Passwort oder Einmal-Link, httpOnly-Session). Das Shared Secret und `NODE_ENV` tragen das nicht.
- Etwa 1 Woche: nur die vier Stations-Tabs und die Kalibrierung erreichbar machen. Deploy, Token, QR, Brand, Hub, Coach bleiben aus.
- Etwa 2 bis 3 Wochen: Speicher, den ein Redeploy nicht wegwirft, und Lesen zur Request-Zeit statt Modul-Import. `validateStationsFile` auf allen zwölf Stationen vor dem Übernehmen, Fallback auf die JSON im Image wie in ADR-029 beschrieben. Das Schema sperrt neue und gelöschte Stationen bereits (`minItems`/`maxItems` 12, Slug-Enum).
- Etwa 0,5 Woche: Fehlertexte für Leute, die das Schema nicht kennen.

Ein bloßes Umschalten von `NODE_ENV` ist in diesen Wochen nicht enthalten. Es würde das Deploy-Tab und die Token-Rotation mit öffnen und schriebe in ein Image, das dafür nicht gedacht ist.

**B. Medien-Upload, der den Cookie-Gate nicht umgeht: 2 bis 4 Personenwochen.**

- Die Prüfregeln und der Ingest existieren. Neu ist das Ziel: beschreibbares GS39-Volumen, ausgeliefert nur als `/media/…` (Middleware-403 ohne Entry-Cookie) oder als `/api/dialog/…` (Cookie in der Route, Datei unter `content/dialog-audio/`, nicht unter `public/`).
- Der heutige Weg ist Laptop-rsync mit `DEPLOY_SSH`. Den können Lehrkräfte auf dem Server nicht benutzen.
- Enthalten ist die Trennung zum öffentlichen `/stations/`-Pfad (Raumbilder). Nicht enthalten: Virenscan, Vorschaubilder neu rechnen, mehrere Auflösungen.

**C. Was den Umfang sprengt, wenn die Grenze nicht hält. Zusätzlich zu A+B, nur wenn gebaut wird.**

- Rückgängig und Revisionsliste: 2 bis 4 Wochen. `writeStations` legt eine Backup-Datei an. Eine Oberfläche mit verständlichem Diff ist neu. Sanity nennt „Stand von vor drei Wochen“ als typischen Nachzügler.
- Entwurfs-Preview, getrennt von der Live-Route `/raum/{slug}`: 2 bis 4 Wochen. ADR-029 sagt, diese Route gibt es nicht und sie ist kein Teil von #252. Unfold nennt Entwürfe als etwas, das man nicht nachrüsten will, wenn schon live geschrieben wird.
- Rollen über Redaktion und Admin hinaus, dazu Freigaben: 2 bis 4 Wochen für ein kleines Rollenmodell, deutlich mehr sobald Workflows dazukommen. Unfold rechnet einzelne Folgebitten oft mit einer Woche.
- Audit-Log: 1 bis 2 Wochen für „wer, wann, welche Station“. 3 Wochen und mehr, wenn Feld-Diffs und Aufbewahrung dazukommen. Unfold sagt, ein Audit lasse sich im Ernstfall nicht nachträglich rekonstruieren.
- Mehrsprachigkeit: 2 bis 5 Wochen, sobald Inhaltsfelder zweisprachig werden (Schema, Validator, beide Oberflächen). Reine UI-Strings auf Deutsch sind schon der Ist-Stand und zählen hier nicht als eigene Woche.
- Summe C, wenn alles mitgebaut wird: grob 9 bis 19 Personenwochen oben drauf. Überlappung ist möglich. Die Spanne ist eine Obergrenze der Einzelposten, kein Paketpreis.

A+B bleiben unter der Unfold-Untergrenze von drei Monaten, weil Entwürfe, Rollenfeinheit, Audit, SEO und eine allgemeine Medienbibliothek in C liegen und der Formular-Kern im Repo schon steht. Sobald C hineinrutscht, liegt die Summe im unteren Bereich der veröffentlichten CMS-Spanne (drei Monate sind etwa 13 Wochen). Das ist die inhaltliche Pointe der beiden Quellen, kein Preisvergleich.

### Gaps

- Keine Quelle nennt Personenwochen für genau diesen Schnitt (zwölf Slugs, Cookie-Gate, ein Next-Image). Die 6 bis 10 Wochen sind aus dem vorhandenen Code abgeleitet, nicht aus einem Angebot oder aus Git-Historie von MPZ Studio. Die Bauzeit von Studio wurde nicht aus Commits gemessen.
- Lee Robinsons Originalbeitrag zu den 344 Agent-Anfragen und 260 US-Dollar wurde nicht gelesen. Die Zahl steht nur in der Sanity-Antwort.
- Appwrk und ähnliche Kostenführer (Dollarspannen 5.000 bis 80.000) wurden nicht als Beleg genommen. Die Trefferseite mischt WordPress, Baukasten und Individualbau und ist Agenturwerbung. Sie wurde nicht als zweite seriöse Quelle ausgezählt.
- Wartung nach dem Erstbau (Schema-Drift, Security-Patches, Volume-Betrieb) ist in A bis C nicht in Wochen übersetzt. Unfold nennt sie ein dauerhaftes zweites Produkt, ohne eine Jahreszahl für einen so kleinen Umfang.

## Risiken, die an diesem Repo hängen

### Takeaway

Ein Lehrer-Admin schreibt leicht eine zweite Wahrheit neben `stations.json` im Image. Coolify ersetzt beim Deploy nur die Next-App. Medien liegen auf Volumes und kommen per rsync. Jeder Save muss das Gesamtdokument durch `validateStationsFile` schicken. Der Cookie gilt für `/media/` und für die Dialog-API, nicht für `/stations/`.

### Cited Findings

- Heute ist `app/data/stations.json` die Datei, die der Build und `generateStaticParams` lesen. ADR-029 lässt eine spätere Redaktionsquelle per Fetch zu und behält die JSON im Image als Fallback. Jede Inhaltsänderung soll nicht automatisch einen Coolify-Deploy auslösen. Option „validiertes JSON zurück nach Git“ ist für den MVP verworfen. — [ADR-029](../../../dokumentation/adr/029-runtime-datenpfad-directus.md)
- Der Docker-Build-Kontext ist nur `app/`. Submodule gehören nicht ins Image. Prod für die 39. Grundschule ist die Coolify-Application auf Branch `release/39-gs`, Auto-Deploy aus. Schüler-Medien hängen an Volumes dieser Application plus rsync, unabhängig vom Branch. — [build-kontext-submodule-regeln.md](../../../dokumentation/build-kontext-submodule-regeln.md), [release-39-gs.mdc](../../../.cursor/rules/release-39-gs.mdc)
- `validateStationsFile` muss das gemergte Dokument aller zwölf Stationen prüfen. Der Ein-Stations-Workaround aus dem Spike ist kein Vorbild. — [ADR-029](../../../dokumentation/adr/029-runtime-datenpfad-directus.md)
- `writeStations` ruft `validateStationsFile` nur im Strict-Modus auf das ganze übergebene Dokument auf. Asset-Checks sind optional. Der Build ruft `validate:stations:structure` auf, nicht den vollen Asset-Lauf, weil `public/media` nicht im Git liegt. — [mpz-content-io.ts](../../../app/lib/mpz-content-io.ts), [package.json](../../../app/package.json), [app/.gitignore](../../../app/.gitignore)
- Öffentliche Pfade ohne Entry-Cookie: `/stations/`, `/demo/`, `/qr/`, `/brand/`. Gated: `/media/:path*` in der Middleware, Dialog-Clips in der API-Route. Studio-Ingest schreibt Schülerdateien nach `public/media/{slug}/…`. — [middleware.ts](../../../app/middleware.ts), [mpz-medium-ingest.ts](../../../app/lib/mpz-medium-ingest.ts)
- ADR-003 gilt weiter: ein Lehrkräfte-Admin ist dort verworfen. ADR-022 ist die Ausnahme nur für MPZ, dev-only, befristet gedacht. Diese Notiz schätzt den Umfang, sie hebt die Entscheidung nicht auf. — [ADR-003](../../../dokumentation/adr/003-content-mvp-json-directus.md), [ADR-022](../../../dokumentation/adr/022-mpz-studio-internes-ingest-tool.md)
- Das Schema erlaubt `videoSource` `youtube` sowie `link` und `embed` mit https-URL. — [stations.schema.json](../../../app/data/stations.schema.json)

### Inferences

- Zwei Wahrheiten: Schreibt das Admin in eine Datenbank oder eine Volume-JSON, bleibt die Datei im Image Fallback und Build-Quelle. Ohne denselben Merge- und Revalidate-Schritt, den ADR-029 für eine externe Quelle beschreibt, sehen Besucher alte Stationen, oder ein Redeploy überschreibt die Lehrerfassung mit der Git-Datei. Ein dritter Schreibweg neben Git und einer späteren externen Redaktion verschärft das.
- Coolify deployt das Next-Image. Eine Änderung an `stations.json` im laufenden Container ist beim nächsten Image weg. Schülerdateien überleben nur auf dem Volume, das der rsync heute aus dem Dev-Rechner füllt. Ein Lehrer-Upload muss dieses Volume beschreiben und darf keine zweite, öffentliche URL daneben bekommen.
- `validate:stations` (Assets) und `validateStationsFile` (Struktur, ganzes Dokument) müssen beide im Save-Pfad bleiben, sobald Dateien und JSON zusammen geändert werden. Nur die Struktur zu prüfen lässt tote Pfade zu. Nur eine Station zu prüfen verletzt den ADR-029-Vertrag.
- Ein Admin, das den `NODE_ENV`-Riegel entfernt und das Studio im Ganzen freigibt, legt Token-Rotation und Env-Aktionen auf dieselbe Fläche wie Textpflege.
- YouTube und Embeds sind Felder im Schema. Sie in die Lehrerformulare zu nehmen erweitert den Auftrag um externe URLs. Der Rechtsstatus dazu wurde hier nicht geprüft.

### Gaps

- Nicht geprüft: ob `generateStaticParams` und der Modul-Import von `stations.ts` am 3. November 2026 noch exakt so aussehen, wie der Spike in ADR-029 sie beschreibt. Belegt ist der Neustart-Hinweis im Stammdaten-Formular und der ADR-Text. Der Quelltext von `lib/stations.ts` wurde nicht Zeile für Zeile gelesen.
- Nicht geprüft: konkrete Volume-Pfade und Rechte des Container-Users auf dem IONOS-Host.
- Nicht geprüft: ob YouTube-Embeds inzwischen freigegeben sind. `CLAUDE.md` führt die Freigabe als offen. Das kann veraltet sein.
