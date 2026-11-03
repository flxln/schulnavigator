# Leichte Backends und Git-CMS

Stand der Abrufe: 3. November 2026. Keine Empfehlung. Versionsnummern nur, wo eine Primärquelle sie nennt. Keines der hier geprüften Produkte steht heute unter der AGPL. Die AGPL-Notiz gilt nur für NocoDB-Versionen vor dem Lizenzwechsel.

## PocketBase

### Takeaway

PocketBase ist ein einzelnes Go-Programm mit SQLite, MIT-Lizenz und Superuser-Dashboard. Lehrkräfte bekommen damit keine eigene, eingeschränkte Redaktionsoberfläche. Die API-Regeln schützen Datensätze, sie ersetzen kein Rollen-UI.

### Cited Findings

- Lizenztext: MIT License, Copyright 2022 bis heute, Gani Georgiev. Erlaubnis zu Nutzung, Änderung, Vertrieb und Verkauf, mit Pflicht, den Copyright-Hinweis zu behalten. — [LICENSE.md](https://github.com/pocketbase/pocketbase/blob/HEAD/LICENSE.md)
- Die Einführung nennt Downloads für v0.41.1 (Linux, Windows, macOS, jeweils x64 und ARM64, Zip-Größen etwa 12 MB bzw. 11 MB) und beschreibt PocketBase als Open-Source-Backend mit eingebettetem SQLite, Realtime, Auth, Dashboard und REST-artiger API, nutzbar als Go-Framework oder als alleinstehende Anwendung. Dieselbe Seite warnt, vor v1.0.0 sei keine volle Rückwärtskompatibilität garantiert und PocketBase sei für produktionskritische Anwendungen nur geeignet, wenn Changelog und manuelle Migrationen akzeptabel sind. — [Introduction](https://pocketbase.io/docs/)
- Die Produktionsdoku enthält ein Beispiel-Dockerfile mit `ARG PB_VERSION=0.41.1`. Der Download kommt von `ganigeorgiev.com`, nicht von GitHub. Es gibt kein offizielles Docker-Image. Daten liegen unter `/pb/pb_data`. — [Going to production](https://pocketbase.io/docs/going-to-production/)
- pkg.go.dev führt für das Modul `github.com/pocketbase/pocketbase` die Version v0.40.6, Lizenz MIT, und im README den Hinweis, das Repo sei nach `https://ganigeorgiev.com/pocketbase/pocketbase` umgezogen. — [pkg.go.dev](https://pkg.go.dev/github.com/pocketbase/pocketbase)
- GitHub Releases zeigt in dem gelesenen Ausschnitt v0.40.5 vom 8. Oktober, ohne dass v0.41.1 dort als Release auftaucht. — [GitHub Releases](https://github.com/pocketbase/pocketbase/releases/)
- Standardrouten: `http://127.0.0.1:8090/_/` ist das Superuser-Dashboard, `/api/` die API. `pb_data` hält Anwendungsdaten und Uploads, `pb_migrations` die Collection-Änderungen. — [Introduction](https://pocketbase.io/docs/)
- Superuser (`_superusers`) ignorieren die API-Regeln und können alles lesen und ändern. OAuth2 ist für `_superusers` nicht vorgesehen. — [Authentication](https://pocketbase.io/docs/authentication/)
- Jede Collection hat `listRule`, `viewRule`, `createRule`, `updateRule`, `deleteRule`. `null` (locked) ist der Default und erlaubt die Aktion nur Superusern. Ein leerer String erlaubt sie jedem, auch Gästen. Ein Filterausdruck lässt nur passende Anfragen durch. Auth-Collections haben zusätzlich `manageRule`. — [API rules and filters](https://pocketbase.io/docs/api-rules-and-filters/)
- Dateien liegen standardmäßig in `pb_data/storage`. S3-kompatibler Speicher ist im Dashboard unter Settings, Files storage schaltbar. Dateien sind öffentlich, wenn die volle URL bekannt ist. Ein Feld kann als Protected markiert werden. Dann gilt die View-Regel der Collection, der Zugriff läuft über ein kurzlebiges File-Token. — [Files upload and handling](https://pocketbase.io/docs/files-handling/)
- Ab v0.38.0 lässt sich eine IP-Allowlist für Superuser im Dashboard setzen (Settings, Application, Superuser IPs). — [Going to production](https://pocketbase.io/docs/going-to-production/)

### Inferences

- Deployment ist ein Binary oder ein selbst gebautes Image. Der RAM-Fußabdruck ist der eines Go-Prozesses plus SQLite. Eine offizielle Untergrenze in GB gibt es in den gelesenen Seiten nicht.
- Die mitgelieferte Oberfläche ist ein Admin-Werkzeug für Personen, die Schema, Regeln und alle Datensätze ändern dürfen. Eine Lehrkraft mit diesem Login ist kein Redakteur mit eingeschränkten Rechten.
- Für die bestehende Next.js-App bleibt zu bauen: die Redaktionsseiten, die Abbildung „wenige Lehrkräfte dürfen Datensätze und Medien, nicht das Schema“, und die API-Regeln dazu. Datei-ACL gibt es als Protected-Feld plus View-Regel, die Regeln schreibt das Team.
- MIT ist eine OSI-Lizenz ohne Netzwerkkopieleft. Eine AGPL-Pflicht entsteht hier nicht.

### Gaps

- Ob das GitHub-Repository archiviert ist, wurde nicht durch Öffnen von github.com/pocketbase/pocketbase bestätigt. Der Umzug steht im README auf pkg.go.dev und im offiziellen Dockerfile-Downloadhost.
- Keine offizielle RAM-Mindestangabe.
- Ein Drittportal (OpenSourceSwap) nennt v0.41.1 vom 28. Oktober 2026 und eine Archivierung Ende Oktober 2026. Das wurde nicht als Primärquelle gewertet.

## Appwrite

### Takeaway

Appwrite ist BSD-3-Clause, aktiv (2.6.2) und bringt eine Console mit einer Editor-Rolle für Zeilen und Dateien. Der Preis dafür ist ein Docker-Stack mit offiziell mindestens 4 GB RAM und 2 GB Swap. Die Console bleibt ein Entwickler-Backend, keine schmale Inhaltsmaske.

### Cited Findings

- GitHub nennt die Lizenz BSD 3-Clause „New“ or „Revised“. Der Lizenztext verlangt Beibehaltung des Copyright-Hinweises, den Haftungsausschluss in Binärverteilungen und verbietet, den Namen Appwrite ohne schriftliche Erlaubnis zur Werbung abgeleiteter Produkte zu nutzen. Copyright 2019 Appwrite und Mitwirkende. — [Repository](https://github.com/appwrite/appwrite/), [LICENSE](https://github.com/appwrite/appwrite/blob/main/LICENSE)
- GitHub Release 2.6.2, veröffentlicht am 24. Oktober, beschrieben als Security-Release für Self-Hosting auf der 2.6-Linie, ohne Schema-Änderung gegenüber 2.6.1. Die Upgrade-Doku spricht von einem Upgrade ab `1.9.6` mit Image-Tag `2.6.2`. — [Releases](https://github.com/appwrite/appwrite/releases), [Upgrading to 2.6.2](https://appwrite.io/docs/advanced/self-hosting/production/updates.md)
- Mindestvoraussetzungen Self-Hosting: 2 CPU-Kerne, 4 GB RAM, 2 GB Swap, ein Docker-fähiges OS, Docker Compose Version 2. Installation über Docker. — [Installation](https://appwrite.io/docs/advanced/self-hosting/installation)
- Eine Self-Host-Instanz erlaubt eine Organisation. Der erste Account wird Administrator. Weitere Personen brauchen eine Einladung. Zusätzliche Registrierung über `_APP_CONSOLE_WHITELIST_ROOT=disabled` erzeugt kein eigenes Projekt. — [Installation](https://appwrite.io/docs/advanced/self-hosting/installation)
- Console-Rollen, ohne Custom Roles (die sind als künftiges Scale-/Enterprise-Feature angekündigt): Owner (voll, inklusive neue Projekte), Developer (wie Owner, ohne Team- und Billing-Schreibrechte), Editor (darf die meisten Ressourcen ändern, nicht aber Tabellen, Buckets, Topics und ähnliche Infrastruktur schreiben; ausdrücklich genannt: Zeilen aktualisieren, Nachrichten anlegen, Dateien hochladen), Analyst (nur lesen), Billing (nur Billing). Die Seite grenzt das von Auth-Rollen des Teams-Dienstes ab. — [Roles](https://appwrite.io/docs/advanced/security/roles)
- Der Blog zu Appwrite 2.0 beschreibt Console IV, PostgreSQL als Default (MariaDB und MongoDB weiter möglich, die Wahl gilt für die Lebensdauer der Instanz) und eine Combined-Topologie mit 16 Containern bei einer PostgreSQL-Default-Installation, gegenüber 33 in der getrennten Topologie. — [A rebuilt Console](https://appwrite.io/blog/post/appwrite-2-self-hosted.md)

### Inferences

- Die Editor-Rolle deckt „Datensätze und Dateien, nicht das Schema“ in der Console ab. Die Oberfläche dazu ist die Console: Tabellen, Buckets, Funktionen, API-Schlüssel. Eine fachliche Maske für Schulstationen gibt es nicht.
- Zu bauen bleibt die Anbindung der Next.js-App an die Appwrite-API, Bucket-Rechte für öffentliche und interne Medien, und vermutlich eine schlichtere Eingabe, wenn die Console für Lehrkräfte zu technisch ist.
- 4 GB RAM plus Swap und ein vielteiliger Container-Stack liegen über dem, was „wenig RAM“ bei einem einzelnen Binary meint. BSD-3-Clause ist OSI-permissiv. Keine AGPL-Pflicht.
- Ob die Containerzahl 16 in 2.6.2 unverändert gilt, sagt der 2.0-Blog nicht. Die RAM-Untergrenze steht in der aktuellen Installationsdoku.

### Gaps

- Die genaue Bucket-Permission-Doku (Datei-ACL jenseits der Console-Rolle) wurde nicht seitenweise gelesen.
- Kein Beleg, dass 2.6.2 die Combined-Topologie geändert hat.

## NocoDB

### Takeaway

NocoDB liefert eine Tabellenoberfläche mit Editor-Rolle und Anhängen und läuft als ein Docker-Container. Seit dem 9. Januar 2026 ist die Lizenz die Sustainable Use License, nicht mehr AGPL und nicht OSI. Interne und schulische Eigennutzung beschreibt der Anbieter als kostenfrei. NocoDB als Dienst für fremde Kunden nicht.

### Cited Findings

- Die Lizenzseite, zuletzt aktualisiert am 3. Oktober 2026: ab dem 9. Januar 2026 Wechsel von AGPL-3.0 zur Sustainable Use License nach Fair-Code. SUL erlaube kostenlose Nutzung für Personen und Organisationen, Quellcode, Self-Hosting und Änderung für interne oder Produktnutzung. Untersagt sei, NocoDB selbst als bezahlten oder verwalteten Dienst anzubieten und es ohne Lizenz als Teil einer kommerziellen Plattform weiterzugeben. Bildung, Forschung und nicht-kommerzielle Zwecke sowie Self-Hosting für interne Werkzeuge stehen auf der Liste der kostenlosen Nutzung. Dieselbe Seite sagt, SUL sei nicht OSI-approved und der Code bleibe source-available. — [License](https://nocodb.com/docs/self-hosting/license)
- `LICENSE.md`, Kopfzeile „Updated on: January 29, 2026“: `master` und `develop` unter der Sustainable Use License Version 1.0. Die Lizenz ist nicht ausschließlich, nicht unterlizenzierbar, nicht übertragbar. Nutzung und Änderung nur für eigene interne Geschäftszwecke oder für nicht-kommerzielle oder persönliche Nutzung. Weitergabe nur unentgeltlich und für nicht-kommerzielle Zwecke. — [LICENSE.md](https://github.com/nocodb/nocodb/blob/HEAD/LICENSE.md)
- GitHub Release 2026.10.1 vom 29. Oktober, Bugfix-Release. Docker-Tags `nocodb/nocodb:2026.10.1` und `:latest` zeigen dasselbe Image. Das README zeigt einen Ein-Container-Start mit SQLite, Port 8080, Volume für `/usr/app/data/`. Die GitHub-Lizenzkategorie lautet „Other“, das README nennt die Sustainable Use License. — [Releases](https://github.com/nocodb/nocodb/releases), [README](https://github.com/nocodb/nocodb), [Docker Hub](https://hub.docker.com/r/nocodb/nocodb/tags)
- Rollen auf Workspace- und Projekt-Ebene: Owner, Creator, Editor, Commenter, Viewer, No Access, plus Inherit. Editor darf Datensätze anlegen, ändern und löschen, nicht das Schema (Tabellen, Felder, Beziehungen). Schema liegt bei Creator und Owner. Eine Projektrolle überschreibt die Workspace-Rolle. Organisationsebene ist Enterprise. — [Roles & Permissions](https://nocodb.com/docs/product/collaboration/roles-and-permissions)
- Attachment-Felder speichern beliebige Dateitypen am Datensatz. Self-Host-Defaults: `NC_ATTACHMENT_FIELD_SIZE` 20 MiB, `NC_MAX_ATTACHMENTS_ALLOWED` 10, `NC_ATTACHMENT_ACCESS_CONTROL_ENABLED` standardmäßig aus (Legacy-Name `NC_SECURE_ATTACHMENTS`). Eingeschaltet liefern Anhänge Pre-Signed-URLs, bestehende Links funktionieren dann nicht mehr. Ablauf über `NC_ATTACHMENT_EXPIRE_SECONDS`, Default 7200 Sekunden. S3 über `NC_S3_*`. — [Attachment](https://nocodb.com/docs/product/tables/fields/field-types/custom-types/attachment), [Environment Variables](https://nocodb.com/docs/self-hosting/environment-variables)
- Release-Notes 2026.10.1: nur `NC_ATTACHMENT_ACCESS_CONTROL_ENABLED=true` schaltet sichere Anhänge scharf, `/download` und `/dl` liefern dann keine Dateien mehr. — [Releases](https://github.com/nocodb/nocodb/releases)

### Inferences

- Die Tabellen-UI plus Editor-Rolle ist eine fertige Oberfläche für strukturierte Datensätze und Uploads, ohne eigenes Schema-UI bauen zu müssen. Feinarbeit bleibt: Attachment-ACL ist standardmäßig aus, öffentliche Links sind dann der Normalfall. Rollen müssen pro Workspace oder Base gesetzt werden. Die Next.js-App liest weiter über die API.
- Für eine Schule, die NocoDB nur für die eigenen Lehrkräfte selbst betreibt, deckt sich das mit der kostenlosen Kategorie auf der Lizenzseite (Bildung, interne Werkzeuge). Das ist die Darstellung des Anbieters, keine Rechtsberatung. Sobald NocoDB selbst externen Kunden als Oberfläche oder Dienst bereitgestellt würde, verlangt dieselbe Seite eine kommerzielle Lizenz.
- AGPL, nur für Stände vor dem 9. Januar 2026: Eine Schule, die eine damals AGPL-lizenzierte Fassung für die eigenen Lehrkräfte selbst betreibt, erfüllt die Netzwerklausel im üblichen Fall. Wer eine veränderte Fassung als Netzdienst an viele externe Kunden gibt, kann zur Angebotspflicht für den Quellcode kommen. Ab dem Wechsel gilt dieser Satz nicht mehr. Es gilt die SUL.

### Gaps

- Keine offizielle RAM-Untergrenze in den gelesenen Seiten.
- Ob die SUL-Formulierung „internal business purposes“ eine öffentliche Schule rechtlich deckt, wurde nicht juristisch geprüft. Die Marketing-Lizenzseite nennt Bildung ausdrücklich.

## Baserow

### Takeaway

Der Kern ist weiter MIT Expat. Premium und Enterprise sind proprietär und liegen im selben Repository. Die Default-Docker-Image startet diese Teile mit, solange `BASEROW_OSS_ONLY` leer ist. Eine Rolle „Datensätze ja, Schema nein“ gibt es in der MIT-Fassung nicht. Die gibt es self-hosted erst mit Enterprise-RBAC.

### Cited Findings

- Root-`LICENSE` auf `develop`: `docs/` unter CC BY-SA 4.0. `premium/` unter `premium/LICENSE`, `enterprise/` unter `enterprise/LICENSE`. Client-seitiges JavaScript unter MIT Expat. Alles übrige ist Baserow Open Source Edition unter MIT Expat, Copyright 2019 bis heute, Baserow B.V. — [LICENSE](https://github.com/baserow/baserow/blob/develop/LICENSE)
- Premium-Lizenz (PE License): Produktion nur mit gültigem Premium-Abo für die richtige Nutzerzahl. Ändern und Patches veröffentlichen ist daran gebunden. Baserow behält Rechte an Änderungen und Patches. Kopieren und Ändern zum Entwickeln und Testen ist ohne Abo erlaubt. Kopieren, Zusammenführen, Veröffentlichen, Weitergeben, Unterlizenzieren und Verkaufen sind sonst untersagt. Die PE-Lizenz gilt nicht für den OSE-Teil und nicht für client-seitiges JavaScript, das unter MIT Expat steht. — [premium/LICENSE](https://gitlab.com/baserow/baserow/-/blob/develop/premium/LICENSE)
- Der Blog zum Geschäftsmodell beschreibt Open-Core: Hauptcode MIT, Premium-Plugin proprietär und einsehbar im selben Repo. Zusagen des Anbieters: was einmal in der freien Fassung ist, bleibt frei und Open Source. Der Hauptcode bleibt frei und Open Source. Self-Hosting ohne Limits bei Speicher, Daten oder Nutzung. — [Understanding Baserow's business model](https://baserow.io/blog/baserow-business-model)
- Konfiguration: `BASEROW_OSS_ONLY`, Default leerer String. Jeder nicht-leere Wert startet nur die MIT-Fassung, ohne Premium und Enterprise. — [Configuring Baserow](https://baserow.io/docs/installation/configuration)
- Ein Community-Thread von Baserow bestätigt `BASEROW_OSS_ONLY=true` zum Ausblenden der Premium-Funktionen und merkt an, die Variable sei schlecht dokumentiert gewesen. — [Forum](https://community.baserow.io/t/is-there-a-way-to-hide-premium-features/6601)
- isitreallyfoss, Review-Datum 3. September 2025, sekundär: das damals genannte Image `baserow/baserow:1.35.1` enthalte Non-FOSS-Code, `BASEROW_OSS_ONLY` sei per Default inaktiv. Die Seite ist keine Rechtsquelle. — [isitreallyfoss](https://isitreallyfoss.com/projects/baserow/)
- Release 2.4.1 vom 13. Oktober, Autor bram2w. Die Docker-Doku verwendet das Image `baserow/baserow:2.4.1`. Ein Container enthält per Default Postgres, Redis und Caddy und speichert unter `/baserow/data`. Für Produktion empfiehlt dieselbe Seite eine externe Postgres. — [Releases](https://github.com/baserow/baserow/releases), [Install with Docker](https://baserow.io/docs/installation/install-with-docker)
- Unterstützte Laufzeit für 2.4.1 nennt Software-Versionen (Docker ab 19.03, PostgreSQL ab 14, empfohlen 15+, Redis ab 6.2.7, Python ab 3.14, Node ab 24). Keine RAM- oder CPU-Zeile. — [Supported runtime](https://baserow.io/docs/installation/supported)
- Rollen: Free und Premium haben auf Workspace-Ebene Admin und Member, ohne Tabellen-Granularität. Member darf Datenbanken, Tabellen und Views anlegen, ändern und löschen und hat vollen Datenzugriff. Granulares RBAC (Builder, Editor, Commenter, Viewer und weitere) liegt bei Advanced und Enterprise. Die Doku sagt, RBAC brauche Cloud Advanced oder self-hosted eine Enterprise-Lizenz. Läuft die Lizenz ab, werden alle zu Members mit vollem Workspace-Zugriff. — [Permissions overview](https://baserow.io/user-docs/permissions-overview)

### Inferences

- Eine „Lizenzänderung“ weg von MIT für den Kern ist in den Primärquellen nicht belegt. Die relevante Geschichte ist die Aufteilung: OSE bleibt MIT, bezahlte Verzeichnisse sind proprietär, das Default-Image enthält sie, und die Rolle, die Lehrkräfte vom Schema fernhält, sitzt in der proprietären Enterprise-Linie.
- Mit `BASEROW_OSS_ONLY` gesetzt bleibt eine Tabellen-UI unter MIT. Jede eingeladene Lehrkraft als Member kann Struktur und Daten ändern. Eine Editor-Rolle nur für Zellen ist dann nicht da.
- Zu bauen oder zu kaufen: entweder das Schema-Risiko bei Members akzeptieren, oder Enterprise für RBAC, oder die Next.js-Oberfläche selbst und Baserow nur als Speicher nutzen. Medien und feine ACLs wurden in diesem Durchgang nicht als OSE-Feature verifiziert.
- MIT-Kern ist OSI-permissiv. Die Premium-Lizenz ist keine OSI-Lizenz und keine AGPL. Keine AGPL-Pflicht für die OSE.

### Gaps

- Der Zeitpunkt, an dem `premium/` zuerst ins Repository kam, wurde nicht auf einen Commit datiert.
- Keine offizielle RAM-Zahl. Ein Drittartikel (serverroom.net) bestätigt nur, dass die Supported-Seite keine Hardware nennt.
- Ob `BASEROW_OSS_ONLY` in 2.4.1 jede Premium-Codepfad sauber abschaltet, wurde nicht getestet. Der Forumshinweis, die Option sei zeitweise kaputt gewesen, ist alt und unspezifisch.

## Supabase self-hosted

### Takeaway

Studio ist ein Dashboard für Datenbank und Dienste, geschützt durch ein gemeinsames HTTP-Basic-Login. Es ist keine Redaktionsoberfläche mit Rollen für Lehrkräfte. Dateirechte sind Postgres-RLS, die das Team selbst schreibt. Der volle Docker-Stack verlangt offiziell mindestens 4 GB RAM.

### Cited Findings

- Das Monorepo `supabase/supabase` steht unter der Apache License 2.0. — [LICENSE](https://github.com/supabase/supabase/blob/master/LICENSE)
- Architektur: Studio ist „an open source Dashboard for managing your database and services“, Lizenz Apache 2, Quellcode im Monorepo. Postgres selbst steht unter der PostgreSQL License. Die Seite sagt, Supabase nutze vorhandene Werkzeuge mit MIT, Apache 2, PostgreSQL License oder gleichwertig, und baue fehlende Teile selbst offen. — [Architecture](https://supabase.com/docs/guides/getting-started/architecture)
- Self-Hosting ist ein einzelnes Projekt. Studio unterstützt dort keine mehreren Organisationen oder Projekte. Die meisten Einstellungen kommen aus Umgebungsvariablen. Die CLI-Local-Stack ist ausdrücklich kein produktionsgehärtetes Self-Hosting. — [Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- Docker-Doku, Systemvoraussetzungen für alle Komponenten, geeignet für Entwicklung und kleine bis mittlere Produktion: mindestens 4 GB RAM, 2 Kerne, 40 GB SSD. Empfohlen 8 GB RAM und mehr, 4 Kerne und mehr, 80 GB SSD und mehr. Ungenutzte Dienste (Realtime, Storage, imgproxy, Edge Runtime) dürfen aus der Compose-Datei entfernt werden, um den Bedarf zu senken. Logs und Analytics sind im Default aus, weil sie Speicher kosten. — [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)
- Dieselbe Anleitung pinnt die manuellen Clone-Befehle auf den Branch `self-hosted/v0.8.3` und schreibt, für ein neueres Release den latest Tag zu nehmen. — [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)
- Studio-Zugang: HTTP Basic Authentication über `DASHBOARD_USERNAME` und `DASHBOARD_PASSWORD`. Ein Passwort ist Pflicht, mindestens ein Buchstabe, keine Sonderzeichen. — [Self-Hosting with Docker](https://supabase.com/docs/guides/self-hosting/docker)
- Storage-Zugriff läuft über Postgres RLS auf `storage.objects`. Ohne Policy sind Uploads verboten. Beispiele beschränken Insert auf `authenticated` und einen Bucket. Der Service-Key umgeht RLS und darf nicht öffentlich sein. — [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- Der Storage-Dienst allein hat am 2. November 2026 v1.89.2 veröffentlicht. Das ist die Version dieses einen Dienstes, nicht der ganzen Self-Host-Compose-Zeile. — [supabase/storage releases](https://github.com/supabase/storage/releases)
- Ein Advisory vom 14. Oktober 2026 (GHSA-8rrf-w776-x75g) beschreibt einen Auth-Bypass bei signierten Resumable-Uploads in Storage bis einschließlich 1.80.1, behoben ab 1.80.2. — [Advisory](https://github.com/supabase/storage/security/advisories/GHSA-8rrf-w776-x75g)

### Inferences

- Lehrkräfte mit dem Studio-Passwort sehen dasselbe Admin-Werkzeug: Tabellen, SQL, Auth, Storage. Es gibt in der Self-Host-Doku genau ein Basic-Auth-Paar für das ganze Dashboard, keine Redakteursrolle. Die Frage „ist das Admin ein CMS für Lehrkräfte?“ beantwortet die Doku mit der Funktion „Dashboard zum Verwalten von Datenbank und Diensten“.
- Zu bauen: die Lehrer-UI in Next.js, RLS für Zeilen und für `storage.objects`, Auth-User oder eine andere Tür als Studio. Schema-UI ist Studio, und das will man Lehrkräften nicht geben.
- Apache 2.0 für das Monorepo ist OSI-permissiv. Postgres bringt die eigene Lizenz mit. Keine AGPL-Pflicht. 4 GB Minimum für den vollen Stack ist der Gegenpol zu einem einzelnen Binary.
- Ein Blog (selfhost.dev) behauptet, self-hosted Studio habe kein RBAC, und verweist auf eine GitHub-Diskussion. Das wurde hier nicht als Primärbeleg verwendet. Die offizielle Doku zeigt ein gemeinsames Basic-Auth-Login.

### Gaps

- Ein einzelner Release-Tag neuer als `self-hosted/v0.8.3` wurde auf der Releases-Seite von `supabase/supabase` nicht geprüft. Die Docker-Anleitung selbst sagt, für Neueres den latest Tag zu nehmen.
- Ob Studio im Self-Host eine Table-Editor-Ansicht hat, die eine Lehrkraft ohne SQL bedienen könnte, wurde nicht in der Studio-Oberfläche geprüft. Die Zugangsart bleibt ein gemeinsames Admin-Passwort.

## Directus-Community-Forks

### Takeaway

Der aktuelle Directus-Code ist MSCL, nicht OSI, und wird vier Jahre nach dem jeweiligen Release zu GPL-3.0. Forks, die heute unter GPL laufen, setzen auf der alten Directus-9-Linie auf. Davon ist d9 von La Webcapsule der einzige Fork mit einem Release Ende Oktober 2026. Ein Fork des MSCL-Stands als GPL ist vor dem Vier-Jahres-Termin lizenzrechtlich nicht der angebotene Weg.

### Cited Findings

- Directus v12.0.0, veröffentlicht am 10. Juni 2026: Lizenzwechsel von BUSL-1.1 zu MSCL-1.0-GPL. Self-Host startet auf dem Core-Tier. Ohne passende Lizenz entfallen unter anderem SSO und eigene Permission-Regeln auf Access Policies. Bestandsupgrades haben 30 Tage Karenz. — [v12.0.0](https://github.com/directus/directus/releases/tag/v12.0.0)
- MSCL-1.0-GPL, Copyright 2026 Monospace Inc.: Quellcode einsehbar. Zusätzliche Lizenz unter GPL-3.0 wird unwiderruflich am vierten Jahrestag der Veröffentlichung dieser Softwarefassung wirksam. — [license](https://github.com/directus/directus/blob/main/license), [Lizenzübersicht](https://directus.com/license)
- Ankündigung zum v12-Wechsel: vorher drei Jahre BSL. Innovation Grant für Organisationen unter 5 Millionen US-Dollar Jahresumsatz und 50 Beschäftigten, kostenloser Vollzugang. Darüber ein begrenzter kostenloser Core-Tier. SDKs bleiben MIT. Die einzige genannte Nutzungsschranke ist ein Produkt, dessen Hauptzweck direkt mit Directus konkurriert. Hosting, Produkte darauf und Dienstleistungen seien nicht gemeint. — [Evolving Our License](https://directus.com/resources/directus-v12-license-change)
- Ein späterer Directus-Text datiert den Start der neuen Lizenz auf den 1. Juni und bestätigt die Schwelle 50 Beschäftigte. Die Schwelle sei vor dem Launch von 25 auf 50 angehoben worden. Directus bezeichnet sich dort ausdrücklich nicht als OSI-zertifiziertes Open Source, seit dem BSL-Wechsel vor drei Jahren. — [1,000+ Free License Keys](https://directus.com/resources/1000-license-keys-granted)
- d9, `LaWebcapsule/d9`: README nennt einen unabhängig gepflegten Fork von Directus 9 unter GPLv3, gleiches Datenbankschema wie Directus 9, Docker-Beispiel `lawebcapsule/d9:latest` auf Port 8055, „No-code Data Studio“ als Vue-Dashboard. Nicht mit Monospace verbunden. GitHub-Lizenzfeld GPL-3.0. Release v12.0.26 am 29. Oktober. Nahe Tags tragen das Jahr 2026, etwa v12.0.15 am 5. Oktober 2026. Das npm-Paket in den Notes heißt `@wbce-d9/directus9`. — [Repository](https://github.com/LaWebcapsule/d9), [Releases](https://github.com/LaWebcapsule/d9/releases), [Tags](https://github.com/LaWebcapsule/d9/tags)
- `pxslip/db-studio`: Fork von Directus v9, GPL-3.0, 1 Star, letztes Update laut Fork-Liste 24. Februar 2026, 27 offene Issues. — [Repository](https://github.com/pxslip/db-studio/)
- `digiogithub/brio`: angelegt am 19. Februar 2026, README sagt Fork von Directus v9.26.0, der letzten GPL-3.0-Fassung, und GPL-3.0 für eigene Änderungen. Das GitHub-Lizenzfeld der Suche lautete „Other“. 1 Star. — [Repository](https://github.com/digiogithub/brio)
- `outroll/directus-lts`: angelegt am 31. Oktober 2023, README sagt Fork von Directus 9.25 unter GPLv3 für Fälle ohne bezahlte Lizenz. 4 Stars. — [Repository](https://github.com/outroll/directus-lts/)

### Inferences

- d9s Versionsnummer v12 ist die eigene Zähllinie. Das README und der Paketname `directus9` ordnen das Projekt der GPL-9-Generation zu, nicht dem MSCL-Directus 12 vom 10. Juni 2026.
- Wer ein Data-Studio wie beim alten Directus will und bei OSI-Copyleft bleiben will, findet mit d9 einen gepflegten Kandidaten dieser Altlinie. Ob Rollen, Datei-ACL und der Ressourcenbedarf noch dem Directus-9-Stand entsprechen, ist aus dem README allein nicht belegt. Zu prüfen bliebe das konkret im Fork.
- GPL-3.0 ist nicht die AGPL. Die Pflicht, den Quellcode mitzuliefern, hängt am Weitergeben des Programms. Eine Schule, die einen unveränderten GPL-Fork nur für die eigenen Lehrkräfte betreibt, löst damit nicht die AGPL-Netzwerkklausel aus. Die AGPL-Formulierung wird hier bewusst nicht auf d9, Brio oder directus-lts angewandt.
- MSCL ist source-available mit späterer GPL-Wandlung und Wettbewerbsklausel. Sie ist keine permissive OSI-Lizenz. Ein Community-Fork, der den heutigen Directus-Code sofort unter GPL stellt, widerspricht dem Zeitplan der Future-License.

### Gaps

- Letzter Commit von `outroll/directus-lts` und `digiogithub/brio` nach dem Anlegen wurde nicht geprüft. Aktiv belegt ist d9.
- Der Widerspruch „Other“ gegen README-GPL bei Brio wurde nicht durch Öffnen der LICENSE-Datei aufgelöst.
- RAM und der genaue Rollenstand von d9 wurden nicht in der d9-Doku gelesen.

## Git-basierte CMS

### Takeaway

Keystatic, Decap, Tina und Pages liefern eine Formularoberfläche auf Dateien in Git, fast immer auf GitHub. Manche verstecken den GitHub-Login vor der Lehrkraft. Der Schreibvorgang bleibt ein Commit in ein Repository, und die Inhalte sind Markdown, JSON oder YAML, nicht Zeilen einer Datenbank, die die laufende Next.js-App sofort liest.

### Cited Findings

- Keystatic, MIT, Copyright 2023 Thinkmill Labs. GitHub-Modus verlangt ein bestehendes GitHub-Repository und Schreibrecht der Mitarbeitenden. Login ist GitHub, über eine eigene GitHub App. Local-Modus schreibt ins Dateisystem. Cloud-Modus ist ein eigener Storage-Kind. — [Repository](https://github.com/Thinkmill/keystatic/), [GitHub mode](https://keystatic.com/docs/github-mode), [Configuration](https://keystatic.com/docs/configuration)
- Keystatic Cloud übernimmt die GitHub-Authentifizierung und erlaubt Teammitglieder ohne GitHub-Konto. Zugriff gilt pro Team für alle Projekte des Teams. Kostenlos bis 3 Nutzer pro Team. Pro ab 10 US-Dollar im Monat, jeder weitere Nutzer über drei kostet 5 US-Dollar im Monat. — [Keystatic Cloud](https://keystatic.com/docs/cloud)
- npm führt `@keystatic/core` 0.6.9 und zeigt beim Abruf „Published 2 months ago“. Das GitHub-Changelog enthält den Eintrag 0.6.9 ohne Datum im gelesenen Auszug. GitHub Releases sind keine Quelle, die Seite veröffentlicht keine Releases. ReleaseJam, ein Drittverzeichnis, datiert 0.6.9 auf den 26. August 2026. — [npm](https://www.npmjs.com/package/@keystatic/core), [CHANGELOG](https://github.com/Thinkmill/keystatic/blob/main/packages/keystatic/CHANGELOG.md)
- Decap CMS, MIT, ehemals Netlify CMS seit Februar 2023. Eine Single-Page-App unter `/admin` bearbeitet Inhalte in einem Git-Repository. — [Repository](https://github.com/decaporg/decap-cms/)
- Release `decap-cms@3.17.3` am 26. Oktober durch martinjagodic. npm zeigt 3.17.3. Die Security-Übersicht stuft 3.x als unterstützt ein, 1.x und 2.x nicht. — [Releases](https://github.com/decaporg/decap-cms/releases), [Security](https://github.com/decaporg/decap-cms/security)
- Decap-Backend `github` nutzt das GitHub-Konto. Git Gateway soll Redakteure ohne Konto und ohne Schreibrecht am Git-Host zulassen, klassisch mit Netlify Identity. Netlify kennzeichnet Git Gateway als deprecated: bestehende Einrichtungen laufen weiter, neue Konfigurationen werden nicht empfohlen, Funktionsfehler werden nicht mehr behoben, nur noch große Sicherheitsprobleme. Ein eigener Gateway plus GoTrue oder ein anderer JWT-Aussteller ist in der Decap-Doku beschrieben. Decap Turbo ist ein gehosteter, kostenpflichtiger Backend-Dienst mit Free-Tier, der den Git-Host ebenfalls proxy’t. — [Git Gateway](https://decapcms.org/docs/git-gateway-backend/), [Choosing a Backend](https://decapcms.org/docs/choosing-a-backend/), [Netlify Git Gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)
- Editorial Workflow in Decap übersetzt Speichern in Commits auf einem Branch plus Pull Request, Veröffentlichen in einen Merge. Das funktioniert mit GitHub und weiteren Hosts, nicht mit dem `gitea`-Backend. — [Editorial Workflows](https://decapcms.org/docs/editorial-workflows/)
- TinaCMS, Apache License 2.0 laut GitHub-Lizenzfeld. Release `tinacms@3.15.1` am 1. November 2026. Inhalte sind Markdown, MDX, JSON, YAML im eigenen Repository, dazu eine GraphQL-API. — [Repository](https://github.com/tinacms/tinacms), [Releases](https://github.com/tinacms/tinacms/releases), [What’s New](https://tina.io/whats-new/tinacms)
- Self-Hosting von Tina ist ein API-Endpunkt mit austauschbarem Auth-Provider, Database-Adapter und Git-Provider. Die Datenbank ist ein Cache. Quelle der Wahrheit sind die Markdown- und JSON-Dateien. Die Übersicht wurde zuletzt am 20. Oktober 2025 bearbeitet. Ein Blog vom 20. November 2023 stellt das Self-Host-Backend unter Apache 2.0 und schreibt, Repo-Medien seien damals im Self-Hosting nicht verfügbar, Cloudinary, S3 oder DigitalOcean seien die Empfehlung. Derselbe Blog warnt, der Ausblick könne veralten. — [Self-hosting](https://tina.io/docs/self-hosted/overview), [Blog](https://tina.io/blog/Tinacms-is-now-fully-open-source)
- Pages CMS, MIT, Copyright 2025 Ronan Berder. Die Projektseite sagt, gehostete Fassung, Vercel und Self-Hosting seien kostenlos, und GitHub sei der einzige Host. — [pagescms.org](https://pagescms.org/), [LICENSE](https://github.com/pagescms/pagescms/blob/main/LICENSE)
- Self-Hosting braucht PostgreSQL (`DATABASE_URL`), eine GitHub App, Better-Auth-Secret und einen HTTPS-Zugang. Inhalte bleiben in GitHub. Postgres hält Auth, Collaborators, geparste Config und Cache. — [Self-host](https://pagescms.org/docs/guides/installing/self-host/), [Database](https://pagescms.org/docs/development/database/)
- Collaborators werden per E-Mail eingeladen, ausdrücklich für Personen ohne GitHub-Konto. Sie dürfen eingeladene Repositories, Inhalte und Medien bearbeiten, nicht aber `.pages.yml`, Collaborators oder Cache-Admin. Schreibvorgänge laufen mit dem Installation-Token der GitHub App. Default-Commit-Identität ist die App, optional der Nutzername. — [Collaborators](https://pagescms.org/docs/configuration/collaborators/), [Authentication](https://pagescms.org/docs/development/authentication/)
- GitHub Releases von Pages CMS: 2.1.8 als latest, Datum 8. Juni, Inhalt unter anderem Fix für Collaborator-Zugang. 2.1.7 vom 4. Juni vereinfacht die Einladungsanmeldung mit OTP. Tag 2.0.0 ist auf den 21. März 2026 datiert. Die Releases-URL lautet `pages-cms/pages-cms`, der Seitentitel noch `hunvreus/pagescms`. — [Releases](https://github.com/pages-cms/pages-cms/releases), [2.0.0](https://github.com/pagescms/pagescms/releases/tag/2.0.0)

### Inferences

- Lehrkräfte, die GitHub nicht öffnen, scheitern am Default von Keystatic-GitHub-Modus und am Decap-Backend `github`, weil der Login das GitHub-Konto ist und Schreibrecht am Repository braucht.
- Die Umgehungen verstecken nur das Konto. Keystatic Cloud ist ein gehosteter Dienst, Free-Tier bei 3 Nutzern, und die Dateien liegen weiter in GitHub. Decap Git Gateway auf Netlify ist für Neueinrichtungen abgekündigt. Ein selbst betriebenes Gateway ist zusätzliche Infrastruktur um Git herum. Pages CMS ist der klarste Fall einer E-Mail-Einladung ohne GitHub-Konto, und trotzdem erzeugt jeder Speichervorgang einen Commit über die GitHub App. Tina kann Auth selbst stellen, der Git-Provider schreibt trotzdem ins Repository.
- Für eine laufende Next.js-App mit strukturierten Datensätzen und Medien heißt das: Änderung wird erst Inhalt, wenn Commit, eventuell Review und ein Deploy oder ein Laufzeit-Lesen von GitHub geklappt haben. Konflikte, Branch-Schutz und abgelaufene Tokens werden zu Redaktionsfehlern. Eine Zeilen-ACL und eine Datei-ACL unabhängig vom Repository gibt es in diesem Modell nicht. Die vorhandene Dev-only-Ingest-UI schreibt heute nicht über Git für Lehrkräfte. Ein Git-CMS würde genau diesen Weg für sie öffnen.
- Lizenzen MIT (Keystatic, Decap, Pages) und Apache 2.0 (Tina) sind OSI-permissiv. Keine AGPL-Pflicht. Die Falle ist der Zwang zu GitHub als Speicher und, bei Cloud und Turbo, ein zweiter Anbieter.

### Gaps

- Ob self-hosted Tina im November 2026 Medien im Repository speichert, steht in der Doku vom 20. Oktober 2025 nicht aktuell beantwortet. Der Blog von 2023 verneint es und markiert sich selbst als möglicherweise veraltet.
- Das genaue Veröffentlichungsdatum von `@keystatic/core` 0.6.9 steht nicht im gelesenen Changelog. npm und ReleaseJam werden deshalb beide genannt.
- Ob der Pages-Release „8. Juni“ ohne Jahreszahl 2026 ist, folgt aus der Lage nach dem Tag 2.0.0 vom 21. März 2026 und aus GitHubs Gewohnheit, das laufende Jahr wegzulassen. Ein ISO-Datum für 2.1.8 wurde nicht separat gelesen.

## WordPress

### Takeaway

WordPress ist ein eigenes PHP-CMS mit Themes, Plugins und eigener Website. Es ist die falsche Form, wenn die Schule schon eine Next.js-App hat und nur wenige strukturierte Datensätze plus Medien pflegen will.

### Cited Findings

- Die offizielle Lizenzseite: WordPress steht unter der GPLv2 (oder später) der Free Software Foundation. Derivative Works, aus Sicht des Projekts auch Plugins und Themes, erben die GPL. — [License](https://wordpress.org/about/license/)
- GPL-2.0-or-later ist eine OSI-Copyleft-Lizenz für das Weitergeben von Programm und Ableitungen. Sie ist nicht die AGPL. Die Netzwerkklausel der AGPL steht in diesem Lizenztext nicht.

### Inferences

- Ein WordPress neben der Next.js-App wäre eine zweite Anwendung, ein zweites Inhaltsmodell (Beiträge, Seiten, Blöcke) und eine eigene Update-Fläche aus Core, Themes und Plugins. Die Lehrkräfte bekämen ein volles Website-CMS, nicht eine schmale Maske für Stationsdatensätze, die der Schulnavigator schon rendert.
- Eine Schule, die ein unverändertes WordPress nur selbst betreibt, löst damit nicht die AGPL-Angebotspflicht aus, weil WordPress nicht unter der AGPL steht. Pflichten der GPL werden praktisch, wenn veränderte Programmteile weitergegeben werden. Das ist hier nur die Abgrenzung, keine GPL-Schulung.

### Gaps

- RAM, aktuelle WordPress-Version und der Aufwand eines Headless-WordPress wurden bewusst nicht erhoben. Die Notiz sollte nur die Form klären.
