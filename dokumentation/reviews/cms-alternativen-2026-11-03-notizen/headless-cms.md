# Headless-CMS als Directus-Ersatz für den Schulnavigator

Stand der Quellen: 3. November 2026. Kein Produkt wird empfohlen. RAM und Preise nur, wenn eine Primärquelle sie nennt, sonst „nicht belegt“. Stars stammen aus der GitHub-API am selben Tag.

Rahmen: kleines Team, Docker auf einem VPS mit etwa 2–4 GB RAM (Coolify), Redaktion durch nicht-technische Grundschullehrkräfte, festes Modell (Räume/Stationen, Medien, Hotspots, kurze Dialoge), keine Schüler-Personendaten, Mediendateien nicht weltlesbar. Die öffentliche App soll Dateien selbst freigeben.

OSI-Einordnung der Standardnamen (Liste nicht in dieser Session neu geöffnet): MIT, BSD-3-Clause, Apache-2.0, GPL-2.0, GPL-3.0 stehen auf der OSI-Lizenzliste, https://opensource.org/licenses.

## Payload CMS

### Takeaway
Payload bleibt nach dem Beitritt zu Figma (17. Juni 2025) unter dem MIT-Grant selbst hostbar. Das Admin entsteht aus Code, Dateien hängen an der `read`-Zugriffskontrolle, ein fertiges Vendor-Image und ein RAM-Wert sind in den gelesenen Docs nicht belegt.

### Cited Findings
- Figma hat am 17. Juni 2025 bekannt gegeben, dass das Payload-Team zu Figma stößt. Payload bleibe Open Source, am Self-Hosting ändere sich unmittelbar nichts. — [Figma Blog](https://www.figma.com/blog/payload-joins-figma/); [Payload Blog](https://payloadcms.com/posts/blog/payload-is-joining-figma); [GitHub-Diskussion #12843](https://github.com/payloadcms/payload/discussions/12843)
- `LICENSE.md` auf `main`, abgerufen 3. November 2026, ist ein MIT-Grant. Copyright: „2018-2026 Payload CMS, LLC“. Die GitHub-Dateiliste zeigt den letzten Commit an dieser Datei am 1. Juli 2026 (`chore: update LICENSE.md (#17178)`). — [LICENSE.md raw](https://raw.githubusercontent.com/payloadcms/payload/main/LICENSE.md); [Repo-Dateiliste](https://github.com/payloadcms/payload)
- GitHub-API am 3. November 2026: 45.639 Stars, SPDX `MIT`, letzter Push 2026-11-03, nicht archiviert. Letztes Release: `v3.92.1`, veröffentlicht 2026-10-27. — GitHub-API `repos/payloadcms/payload` und `releases/latest`
- Release `v3.92.0` (2026-10-22) nennt als Bugfix ein Anheben der Mindest-Node-Version auf 22.23.4. — [GitHub Releases](https://github.com/payloadcms/payload/releases)
- Offizielle Datenbank-Adapter: MongoDB (Mongoose), Postgres (Drizzle), SQLite (Drizzle). Der Adapter ist ein separates Paket. — [Database](https://payloadcms.com/docs/database/overview)
- REST wird aus Collections und Globals erzeugt, Default-Präfix `/api`. GraphQL liegt zusätzlich unter `/api/graphql`. Datei-Uploads über GraphQL sind ausgenommen, die Doku nennt Uploads REST-only. — [REST API](https://payloadcms.com/docs/rest-api/overview); [GraphQL](https://payloadcms.com/docs/graphql/overview)
- Admin: „Payload dynamically generates a … Admin Panel to manage your users and data.“ Zugang nur über eine auth-fähige Collection. Rollen sind möglich, indem ein Rollenfeld die Funktion `access.admin` steuert. Das Panel blendet Collections aus, wenn die Zugriffskontrolle sie dem Nutzer verweigert. — [Admin Panel](https://payloadcms.com/docs/admin/overview); [Access Control](https://payloadcms.com/docs/access-control/overview)
- Uploads: eine Collection mit Upload wird zur Dateiverwaltung. „All files that are uploaded to each Collection automatically support the `read` Access Control function.“ `staticDir` speichert lokal, Default ist der Collection-Slug, relativ zum Config-Verzeichnis. Produktion: Default der Access-Control-Funktionen verlangt einen eingeloggten Nutzer. Die Deployment-Doku zeigt ein Multi-Stage-Docker-Beispiel und verlangt dauerhaften Speicher für Dateien. Ein fertiges Image und ein RAM-Wert stehen dort nicht. — [Uploads](https://payloadcms.com/docs/upload/overview); [Production Deployment](https://payloadcms.com/docs/production/deployment)
- Ein Drittartikel (16. September 2026) behauptet, der LICENSE-Commit vom 1. Juli 2026 habe nur die Copyright-Zeile von „Payload CMS, Inc.“ auf „Payload CMS, LLC“ geändert, und Payload Cloud nehme keine neuen Deployments an. Das ist keine Vendor-Quelle. — [idealabz.ae](https://idealabz.ae/blog/payload-cms-acquired-by-figma)

### Inferences
- Lehrkräfte legen keine Collections an. Das Modell steht in der TypeScript-Konfiguration. Das trifft das feste Raum-/Medien-Schema, setzt aber Entwickler für jede Modelländerung voraus.
- Ob eine Datei ohne Payload-Route direkt vom Webserver lesbar ist, hängt davon ab, ob `staticDir` zusätzlich als statischer Pfad veröffentlicht wird. Die Doku bindet den Lesezugriff an die Collection-`read`-Funktion, nicht an „Security by obscure URL“.
- Ein zweiter Next.js-Prozess plus Datenbank auf 2–4 GB ist möglich oder zu eng. Dazu gibt es keine belegte Zahl.

### Gaps
- Diff des LICENSE-Commits vom 1. Juli 2026 nicht selbst geprüft. Der aktuelle Text ist MIT.
- Payload-Cloud-Status und Preise nicht an einer Vendor-Seite gelesen.
- RAM: nicht belegt.
- Keine unabhängige Beschreibung, wie sich das Admin für Grundschullehrkräfte anfühlt. Die UX-Sätze stammen aus der Vendor-Doku.

### Ausschluss für diesen Einsatz
Keiner aus den belegten Fakten. Offene Punkte sind RAM, fehlendes Vendor-Image und der Betrieb als eigene Next.js-App neben der öffentlichen App.

## Strapi 5, Community und Enterprise

### Takeaway
Die Community Edition ist in der aktuellen LICENSE als MIT beschrieben, solange kein `ee/`-Code genutzt wird. Enterprise ist ein eigener, nicht OSI-konformer Lizenztext. Strapi nennt 2 GB als Minimum und 4 GB+ als Empfehlung, liefert kein offizielles Image, und der Default-Speicher legt Dateien unter `public/uploads/`.

### Cited Findings
- LICENSE auf `main`: Code unter `ee/` ist nicht „MIT Expat“, sondern die Lizenz in `packages/core/admin/ee/LICENSE`. Community-MIT gilt laut demselben Text nur, wenn (a) kein `ee/`-Code genutzt wird und (b) kein registrierter Account des Cloud-Angebots besteht. — [LICENSE](https://github.com/strapi/strapi/blob/main/LICENSE)
- Der Anfang der EE-LICENSE ist ein Vertragstext für schriftliche Enterprise-Vereinbarung oder Cloud-Abo, kein OSI-Grant. — [ee/LICENSE raw](https://raw.githubusercontent.com/strapi/strapi/main/packages/core/admin/ee/LICENSE)
- Maintainer-Kommentar vom 18. April 2025 in Issue #23242: Code in `ee/` unter Enterprise-Lizenz, übriger Code MIT. Der Issue behandelt die Uneindeutigkeit des LICENSE-Wortlauts, nicht eine neu angekündigte Umstellung. — [strapi/strapi#23242](https://github.com/strapi/strapi/issues/23242)
- Doku und Pricing nennen Community „free and open-source“ unter MIT, inklusive Admin, Content Manager, Content-Type Builder, Media Library, RBAC, REST und GraphQL. Growth kostet dort 45 US-Dollar pro Monat und ergänzt unter anderem Live Preview, Releases und Content History. SSO als Growth-Add-on: 150 US-Dollar pro Monat plus 50 US-Dollar pro Nutzer und Monat. Zusätzliche CMS-Nutzer im Growth-Plan: 15 US-Dollar pro Nutzer. Enterprise (SSO, Review Workflows, Audit Logs) ohne öffentlichen Pauschalpreis, Vertrieb. — [Features](https://docs.strapi.io/cms/features); [Pricing](https://strapi.io/pricing-cms); [Self-host-Seite](https://strapi.io/hosting)
- GitHub-API: 73.425 Stars, SPDX `NOASSERTION` (passt zur Doppellizenz), Push 2026-11-03. Letztes Release `v5.60.0`, 2026-10-28. — GitHub-API
- Hardware in der Deployment-Doku: Minimum 1 CPU, 2 GB RAM, 8 GB Platte. Empfohlen 2+ Kerne, 4 GB+ RAM, 32 GB+ Platte. Node nur Active oder Maintenance LTS, genannt v22, v24, v26. Datenbanken: MySQL, MariaDB, PostgreSQL, SQLite. MongoDB wird ausgeschlossen. — [Deployment](https://docs.strapi.io/cms/deployment)
- Docker: „Strapi does not build any official container images.“ Die Doku liefert Dockerfiles als Vorlage. — [Docker](https://docs.strapi.io/cms/installation/docker)
- Content-Type Builder liegt im Admin, Recht mindestens „Read“, und ist „Available in Development environment only.“ — [Content-type Builder](https://docs.strapi.io/cms/features/content-type-builder)
- RBAC für Admin-Nutzer. Drei Default-Rollen: Author („create and manage their own content“), Editor („create content, and manage and publish any content“), Super Admin (alles). Pro Collection Type lassen sich create, read, update, delete und publish, auch pro Feld, setzen. Content-Type Builder hat als Paketrecht ein allgemeines „Read“. Upload hat „Access the Media Library“. — [RBAC](https://docs.strapi.io/cms/features/rbac)
- Users & Permissions ist ein anderes System für Endnutzer der API, nicht für das Admin. Default-Rollen dort: Authenticated und Public. — [Users & Permissions](https://docs.strapi.io/cms/features/users-permissions)
- Media Library, Default-Provider: Dateien lokal in `public/uploads/`. Private Provider signieren URLs (`isPrivate()`, `getSignedUrl`). „The content API will not provide any signed URLs.“ Bei privatem S3 setzt `ACL: 'private'` signierte URLs, Default-Ablauf 15 Minuten. — [Media Library](https://docs.strapi.io/cms/features/media-library); [Providers](https://docs.strapi.io/cms/configurations/media-library-providers); [S3](https://docs.strapi.io/cms/configurations/media-library-providers/amazon-s3)

### Inferences
- In Production ist das Schema fest, weil der Content-Type Builder nur in Development läuft. Lehrkräfte mit Rolle Author oder Editor können Inhalte pflegen, ohne neue Typen anzulegen, wenn das Content-Type-Builder-Recht fehlt.
- Der lokale Default widerspricht der Vorgabe „Medien nicht weltlesbar“. Ein privater Provider ist möglich, die Content API gibt die signierten URLs aber nicht mit. Die öffentliche App müsste URLs selbst signieren oder die Dateien über einen eigenen Gate ausliefern.
- 4 GB+ sind die Empfehlung für Strapi allein. Auf einem 2–4-GB-VPS, der zusätzlich Datenbank und die öffentliche App trägt, liegt das am oberen Rand oder darüber. Das ist ein Fit-Hinweis, keine gemessene Aussage für diesen Stack.

### Gaps
- Git-Historie der LICENSE vor 2025 nicht verglichen. Ob sich der Cloud-Account-Satz 2024–2026 geändert hat, ist hier nicht belegt.
- Ob Dateien unter `public/uploads/` bei entzogenem Public-`find` trotzdem per direkter URL lesbar sind, steht so nicht in einem eigenen Satz. Der Pfad `public/uploads/` ist belegt.
- Keine unabhängige Lehrkräfte-Review. Die Rollenbeschreibung ist Vendor-Doku.
- Verhalten von Growth-Lizenzschlüsseln auf einem rein selbst gehosteten Server über die Feature-Tabelle hinaus nicht geprüft.

### Ausschluss für diesen Einsatz
Default-Speicher ist `public/uploads/`. Ohne privaten Provider sind Dateien über die URL erreichbar. Die empfohlene RAM-Größe (4 GB+) gilt schon für Strapi, nicht für Strapi plus Schul-App.

## KeystoneJS

### Takeaway
Keystone 6 ist MIT, GraphQL-first, Schema nur im Code, und wird weiter veröffentlicht (letztes GitHub-Release am 3. November 2026). Die gelesene Storage-Doku zeigt öffentliche Datei-URLs. Ein offizielles Image und RAM sind nicht belegt.

### Cited Findings
- LICENSE auf `main`: MIT, Copyright 2024 Thinkmill Labs Pty Ltd. — [LICENSE](https://github.com/keystonejs/keystone/blob/main/LICENSE)
- GitHub-API: 9.986 Stars, SPDX `MIT`, Push 2026-11-03. `releases/latest`: Tag `2026-11-03`, veröffentlicht 2026-11-03T00:13:03Z. npm listet `@keystone-6/core` 8.3.0, Update-Zeitstempel 2026-11-03. Die Release-Seite zeigte zuvor Paketstände vom 27. Oktober 2026 (`@keystone-6/core` 8.2.0). — GitHub-API; [npm](https://www.npmjs.com/package/@keystone-6/core); [Releases](https://github.com/keystonejs/keystone/releases)
- Listen und Felder stehen in `keystone.ts` unter `lists`. Datenbanken: PostgreSQL, MySQL, SQLite über Prisma. SQLite ist „not intended to be used in production“. Admin ist eingebaut (`ui.isAccessAllowed`, Default: Session vorhanden). GraphQL-Pfad Default `/api/graphql`. REST erzeugt Keystone nicht. `server.extendExpressApp` kann eigene Routen anlegen, mit derselben Zugriffskontrolle. — [System Configuration](https://keystonejs.com/docs/config/config)
- Feld-Zugriff `read`, `create`, `update` gilt für GraphQL-Ausgaben. `ui.itemView.fieldMode` steuert nur die Anzeige. Die Doku sagt ausdrücklich: fieldMode schützt den Wert nicht, dafür ist Access Control da. — [Access Control](https://keystonejs.com/docs/config/access-control); [Fields](https://keystonejs.com/docs/fields/overview)
- `file`-Beispiel schreibt nach `public/files/` und setzt `url(key)` auf eine öffentliche HTTP-URL. Die Image/File-Anleitung zeigt öffentliche und private S3-Buckets als mögliches Muster, sie liefert kein fertiges Gate. `server.maxFileSize` Default 200 MiB. — [File](https://keystonejs.com/docs/fields/file); [Images and Files](https://keystonejs.com/docs/guides/images-and-files); [Config](https://keystonejs.com/docs/config/config)
- Admin-UI ab `@keystone-6/core` 8.0.0 nutzt `@keystar/ui` statt `@keystone-ui/*`. — [Migrate to 8](https://keystonejs.com/docs/guides/migrate-to-8)

### Inferences
- Lehrkräfte sehen nur Listen, die Entwickler im Code angelegt haben. Ein „Collection anlegen“-Dialog ist in der gelesenen Config nicht beschrieben. Das passt zum festen Schema.
- Zugriffskontrolle auf dem GraphQL-Feld verhindert nicht, dass eine bekannt gemachte Datei-URL die Bytes ausliefert. Dafür bräuchte es eine eigene Route. Die Doku zeigt das nicht als Default.
- Kein Lizenzwechsel 2024–2026 in den gelesenen Quellen. Der Copyright-Satz nennt 2024.

### Gaps
- Docker Hub und ein offizielles Image nicht geprüft. In Access-, File- und Config-Docs kein Image.
- RAM: nicht belegt.
- Keine unabhängige Admin-Review für Nicht-Entwickler. Belegt ist, dass Labels, fieldMode und `isAccessAllowed` die Oberfläche steuern.
- Changelog von 8.3.0 gegenüber dem Release-Tag `2026-11-03` nicht gelesen.

### Ausschluss für diesen Einsatz
Das dokumentierte Datei-Storage veröffentlicht URLs. Access Control gilt für GraphQL-Felder, nicht automatisch für die Datei. REST gibt es nur als selbst gebaute Route.

## Squidex

### Takeaway
Squidex ist MIT, hat ein offizielles Image, Rollen bis auf Schema-Ebene und ein Protected-Flag pro Asset. Assets sind laut Konzept-Doku standardmäßig öffentlich. RAM ist nicht belegt.

### Cited Findings
- LICENSE: MIT, Copyright 2017 Qaisar Ahmad & Sebastian Stehle. — [LICENSE](https://github.com/Squidex/squidex/blob/master/LICENSE)
- GitHub-API: 2.515 Stars, SPDX `MIT`, Push 2026-11-03. Release `7.24.0`, veröffentlicht 2026-09-28. Docker-Hub-Repository `squidex/squidex` existiert. — GitHub-API; [Release 7.24.0](https://github.com/Squidex/squidex/releases); [Docker Hub](https://hub.docker.com/r/squidex/squidex)
- Pricing-Seite: Self-Hosting „Free and open source forever under MIT license“ und „All Features included.“ Cloud und Managed Server sind separate Angebote (Preise dort ab 29 Euro bzw. 80 Euro pro Monat). Für den selbst gehosteten Betrieb nennt die Seite keine Lizenzgebühr. — [Pricing](https://squidex.io/pricing)
- Docker-Compose-Doku: Squidex plus MongoDB, optional Caddy oder NGINX. Daten unter `/etc/squidex`. Kein RAM-Wert. — [Install on Docker](https://docs.squidex.io/id-01-getting-started/installation/platforms/install-on-docker)
- Release 7.24.0 ergänzt GraphQL-Tiefen- und Komplexitätslimits, Asset-Optionen und einen Hinweis auf SQL/EF-Core-Migrationen. Geschützte Assets sollen nicht mehr von öffentlichen Caches gecacht werden. — [Release 7.24.0](https://github.com/Squidex/squidex/releases); [Q3-2026-Beitrag](https://www.squidex.io/post/squidex-update-2026-q3)
- Rollen: Developer darf Schemas, Regeln, Workflows, Assets und Inhalte. Editor darf Assets und Inhalte, Workflows nur sehen, keine Schema-Verwaltung. Reader liest Inhalte. Permissions sind feingranular, inklusive `squidex.apps.{app}.schemas` und `assets`. — [permissions.md](https://github.com/Squidex/squidex-docs2/blob/master/02-documentation/concepts/permissions.md)
- Assets: „All assets uploaded are public by default.“ Häkchen Protected sperrt den anonymen Download, dann braucht es einen Token. Die API-Übersicht schreibt gleichzeitig: „All assets are publicly available and not secured“, IDs seien 128-Bit-GUIDs. Der Controller liefert 403, wenn `asset.IsProtected` und der Aufrufer Assets nicht lesen darf. Der Endpunkt erlaubt Anonymzugriff, sofern das Asset nicht geschützt ist. — [Assets-Konzept](https://docs.squidex.io/id-02-documentation/concepts/assets); [Assets-API](https://docs.squidex.io/id-02-documentation/developer-guides/api-overview/assets-api); [AssetContentController.cs](https://github.com/Squidex/squidex/blob/master/backend/src/Squidex/Areas/Api/Controllers/Assets/AssetContentController.cs)

### Inferences
- Ein festes Schema ist über die Editor-Rolle erreichbar: Schema-Recht bleibt beim Entwickler, Lehrkräfte bearbeiten Inhalte und Assets.
- Für den Schulfall müsste jedes Medium Protected sein. Der Default ist das Gegenteil. Slug-URLs sind zusätzlich vorhersagbarer als GUIDs, wenn ein Slug gesetzt ist (API-Doku).
- MongoDB ist der belegte Compose-Weg. Dass 7.24.0 SQL-Migrationen erwähnt, zeigt einen SQL-Pfad. Welche Engines produktiv unterstützt sind, ist aus den gelesenen Seiten nicht als Tabelle belegt.

### Gaps
- RAM: nicht belegt.
- Keine unabhängige Admin-Review. Belegt sind Rollen und der Q3-2026-Hinweis auf ein Dark Theme in der Vendor-Mitteilung.
- Lizenzwechsel 2024–2026 nicht in der Git-Historie geprüft. Der aktuelle Text ist MIT mit Copyright 2017.
- API-Übersicht und Konzept-Seite widersprechen sich zum Default-Schutz. Der Quellcode stützt „öffentlich, außer Protected“.

### Ausschluss für diesen Einsatz
Assets sind standardmäßig öffentlich. Schutz ist ein Häkchen pro Datei, kein Default. Zusätzlich ein .NET-Prozess plus MongoDB neben der Next-App. RAM dafür: nicht belegt.

## Cockpit CMS (agentejo) und Nachfolger

### Takeaway
`agentejo/cockpit` ist nicht gelöscht, die Weiterentwicklung ist aber seit dem Hinweis im README bei `Cockpit-HQ/Cockpit`. Core bleibt MIT, Pro ist eine kommerzielle Lizenz. Das letzte Core-Release ist 2.14.1 vom 26. August 2026. Die gelesene Asset-Doku behandelt Dateien als öffentlich weblesbar.

### Cited Findings
- `agentejo/cockpit`: GitHub-API 5.393 Stars, SPDX `MIT`, letzter Push 2024-04-28, nicht archiviert. README: „Cockpits next iteration development moved“ nach https://github.com/Cockpit-HQ/Cockpit. — [agentejo/cockpit](https://github.com/agentejo/cockpit/)
- Nachfolger `Cockpit-HQ/Cockpit`: 758 Stars, SPDX `NOASSERTION`, Push 2026-10-13, nicht archiviert. README nennt Collections, Singletons und Trees, GraphQL und REST, MongoDB oder SQLite, Copyright seit 2015 unter MIT. Die Datei `LICENSE` beginnt mit „MIT License“, Copyright 2022 Agentejo. — GitHub-API; [LICENSE raw](https://raw.githubusercontent.com/Cockpit-HQ/Cockpit/HEAD/LICENSE); [Repo](https://github.com/Cockpit-HQ/Cockpit)
- Vendor-Lizenzseite: Core ist MIT. Pro ist ein eigener Vertrag: eine Lizenz pro Produktionsinstanz, kein Weitergeben, kein OSI-Grant. Pro-Addons sind laut Doku nicht Open Source. Ein Pro-Preis steht in den gelesenen Seiten nicht. — [getcockpit.com/license](https://getcockpit.com/license); [Cockpit Pro](https://getcockpit.com/documentation/pro)
- Release 2.14.1, veröffentlicht 2026-08-26, unter anderem XSS-Härtung, JWT-Schlüssellänge, Path-Traversal-Fix. — GitHub-API `releases/latest`; [getcockpit.com/releases](https://getcockpit.com/releases)
- Docker: Vendor-Doku nennt `cockpithq/cockpit`, Volume `/var/www/html/storage`, SQLite im Quickstart. Tags in der Doku: `core-latest`, `core-{version}`, `pro-latest`, `pro-{version}`. Docker Hub zeigte am Recherchetag `core-2.14.1` und `pro-2.14.1`. — [Installation](https://getcockpit.com/documentation/core/quickstart/installation/); [Docker Hub Tags](https://hub.docker.com/r/cockpithq/cockpit/tags)
- CLI `assets:files:fixvisibility`: „Ensures all asset files have correct public permissions“ und „Fixes file permissions for web access“. — [CLI](https://getcockpit.com/documentation/core/concepts/cli)
- Ältere Release-Notes (2.6.0, 2023-06-21, und 2.1.2) erwähnen Rollenrechte, Asset-Ordner-Checks und Populate nur für erlaubte Modelle. Eine aktuelle Tabelle „Rolle darf keine Collections anlegen“ wurde nicht gelesen. — [Releases](https://getcockpit.com/releases)

### Inferences
- Für den Schulbetrieb reicht lizenzrechtlich Core. Pro ist nicht nötig, um MIT-Self-Hosting zu behaupten, und wäre kein OSI-Baustein.
- Das SPDX-Feld `NOASSERTION` am Nachfolger-Repo widerspricht dem LICENSE-Text. Maßgeblich ist der abgerufene MIT-Text, nicht das leere SPDX-Feld.
- `agentejo/cockpit` ist seit dem 28. April 2024 ohne Push. Tot im Sinne von gelöscht oder archiviert ist es nicht. Der gepflegte Strang ist Cockpit-HQ.

### Gaps
- RAM: nicht belegt.
- Ob eine Rolle das Anlegen von Collections verbieten kann, ist aus den gelesenen Seiten nicht als aktuelle Admin-Funktion belegt. Modelle werden in der Admin-Oberfläche beschrieben (README: Collections, Singletons, Trees).
- Kein Satz in der gelesenen Asset-Doku beschreibt ein nicht-öffentliches Gate, bei dem die Next-App Dateien serverseitig freigibt. Das Fehlen ist kein Beweis, dass es das Feature nicht gibt.
- Pro-Preis: nicht belegt.
- Keine unabhängige Lehrkräfte-Review.

### Ausschluss für diesen Einsatz
Die CLI setzt Asset-Dateien auf öffentliche Web-Rechte. Ein Default, bei dem Medien nur über die öffentliche App lesbar sind, ist in den gelesenen Docs nicht beschrieben.

## Weitere aktiv gepflegte, selbst gehostete Systeme

Nur Produkte mit Admin-Oberfläche und, soweit gelesen, OSI- oder klar permisiver Lizenz. Sanity, Contentful und Storyblok sind ausgelassen. Es gibt keine Empfehlung.

### Takeaway
Wagtail, Gentics Mesh, Ghost, TinaCMS und Decap CMS sind belegt aktiv und OSI-lizenziert, scheitern aber am Modell, am Speicher oder am Medienpfad dieses Einsatzes. Webiny ist an AWS-Serverless gebunden. Orchard Core, Umbraco, Twill und Sulu sind aktiv und permisiv lizenziert, ihre Medien-Gates wurden hier nicht an der Doku geprüft. NocoBase und ApostropheCMS sind aktiv, ihre Lizenz war in den geprüften Dateien nicht belegbar und fällt damit aus dem Filter.

### Cited Findings
- Wagtail: SPDX `BSD-3-Clause` (OSI), 20.602 Stars, Push 2026-11-03, Release `v8.1` am 2026-11-02. Vendor: REST-API im Produkt, GraphQL über `wagtail-grapple` (von Core-Mitgliedern gepflegt), Betrieb „in containers“ ohne Image-Namen in dem gelesenen Absatz. Die Image-Doku hat eigene Abschnitte „Making images private“, „Serving images outside Wagtail“ und „API access“. Der Mechanismus dieser Abschnitte wurde nicht ausgelesen. RAM: nicht belegt. — GitHub-API; [Headless](https://wagtail.org/headless/); [Images](https://docs.wagtail.org/en/stable/advanced_topics/images/index.html); [Headless-Support](https://docs.wagtail.org/en/stable/advanced_topics/headless.html)
- Gentics Mesh: SPDX `Apache-2.0`, 593 Stars, Push 2026-11-03, Release `3.3.2` am 2026-10-22. Die API-Intro zeigt `docker run … gentics/mesh-demo:0.33.1` und Basis `/api/v2`. Der Demo-Tag in der Doku und das GitHub-Release 3.3.2 sind nicht dasselbe. Admin-UX und RAM: in der gelesenen Intro nicht belegt. — GitHub-API; [API-Intro](https://www.gentics.com/mesh/docs/guides/mesh-api-intro/)
- Ghost: SPDX `MIT`, 55.663 Stars, Push 2026-11-03, Release `v6.73.0` am 2026-10-27. Repo-Beschreibung: Publishing, Memberships, Newsletter. — GitHub-API
- TinaCMS: SPDX `Apache-2.0`, 13.864 Stars, Push 2026-11-02. Inhalt in Markdown, MDX, JSON, YAML im eigenen Git-Repo, GraphQL darüber. Letztes Release-Tag wegen GitHub-Rate-Limit nicht gelesen. — GitHub-API; [Repo](https://github.com/tinacms/tinacms/)
- Decap CMS: SPDX `MIT`, 19.460 Stars, Push 2026-11-01. Repo-Beschreibung: „A Git-based CMS for Static Site Generators“. Release-Tag nicht gelesen (Rate-Limit). — GitHub-API
- Webiny: 8.050 Stars, SPDX `NOASSERTION`, Push 2026-11-03, Release `v6.5.1` am 2026-10-28. Repo-Beschreibung: „self-hosted CMS platform on AWS serverless (Lambda, DynamoDB, S3)“. Die erste Zeile von `LICENSE` ist ein Copyright von Webiny Inc., kein sichtbarer MIT-Grant im abgerufenen Anfang. — GitHub-API; [LICENSE raw, Anfang](https://raw.githubusercontent.com/webiny/webiny-js/HEAD/LICENSE)
- Twill: SPDX `Apache-2.0`, 3.972 Stars, Push 2026-09-09, Release `3.6.0` am 2026-07-19. Beschreibung: „open source CMS toolkit for Laravel“. — GitHub-API
- Orchard Core: SPDX `BSD-3-Clause`, 8.223 Stars, Push 2026-11-03, Release `v3.0.1` am 2026-07-09. Beschreibung: modulares, mehrmandantenfähiges .NET-Framework. Admin, Medien-ACL, Docker, RAM: nicht in einer Doku-Seite gelesen. — GitHub-API
- Umbraco: SPDX `MIT`, 5.280 Stars, Push 2026-11-03, Release `release-18.3.0` am 2026-10-29. Delivery API und Medienpfad nicht an der Doku gelesen. — GitHub-API
- Sulu: SPDX `MIT`, 1.363 Stars, Push 2026-11-03, Release `3.0.11` am 2026-10-29. Headless- und Medienverhalten nicht gelesen. — GitHub-API
- Concrete CMS: SPDX `MIT`, 854 Stars, Push 2026-10-31. Release-Tag nicht gelesen (Rate-Limit). — GitHub-API
- Bolt (`bolt/core`): SPDX `MIT`, 592 Stars, Push 2026-10-26. Release-Tag nicht gelesen (Rate-Limit). — GitHub-API
- CrafterCMS: SPDX `GPL-3.0`, 343 Stars, Push 2026-11-03. Release-Tag nicht gelesen (Rate-Limit). RAM: nicht belegt. — GitHub-API
- Pimcore: 3.888 Stars, SPDX `NOASSERTION`, Push 2026-11-03. `LICENSE.md` beginnt mit „# License“. Der konkrete Lizenzname wurde nicht ausgelesen. Deshalb hier nicht als OSI gewertet. — GitHub-API
- NocoBase: 24.826 Stars, Push 2026-11-03, Release `v2.2.37` am 2026-10-31. GitHub-License-Feld leer, `LICENSE` und `LICENSE.md` im Root 404. README beschreibt eine No-Code-Plattform mit visuellem Datenmodell, nicht die Lizenz. — GitHub-API; [README](https://raw.githubusercontent.com/nocobase/nocobase/main/README.md)
- ApostropheCMS: 4.658 Stars, Push 2026-11-03. License-Feld leer, `LICENSE` im Root 404, Root-`package.json` ohne `license`. Kein Release unter `releases/latest` (404). Lizenz damit nicht belegt. Testdatenbanken im Root-Skript: Postgres, MongoDB, SQLite. — GitHub-API; [package.json](https://raw.githubusercontent.com/apostrophecms/apostrophe/main/package.json)
- ChiliCMS: eine Self-Host-Seite behauptet Apache-2.0 und ein Container-Setup. `Chili-Labs/chili` antwortete 404. Nicht als belegtes Produkt geführt. — [Self-host-Seite](https://chilicms.com/docs/self-host)
- Drupal: `drupal/core` ist ein Subtree-Split, SPDX `GPL-2.0`, 195 Stars, Push 2026-11-03. Die 195 Stars sind nicht die Popularität von Drupal. JSON:API und Medienrechte nicht gelesen.
- WordPress-Mirror `WordPress/WordPress`: 21.520 Stars, SPDX `NOASSERTION`, Push 2026-11-03. Die GPL-2.0-or-later des Projekts wurde hier nicht an wordpress.org gegengeprüft. Medienpfad nicht gelesen.

### Inferences
- Git-CMS (Tina, Decap) legen Dateien im Repository ab. Ein serverseitiges Gate, das die öffentliche App vor weltlesbarem Medien-URLs setzt, ist dort nicht das Modell.
- Ghosts Publishing-Modell (Posts, Pages, Newsletter) deckt Räume, Hotspots und kurze Dialoge als feste Collections nicht ab. Das folgt aus der Produktbeschreibung, nicht aus einem Feature-Vergleich der Feldtypen.
- Wagtail kann Bilder laut Inhaltsverzeichnis privat ausliefern. Ob das für Audio, Video und Embeds derselben Schule reicht, ist nicht gelesen. Das Admin ist ein Seiten- und StreamField-CMS. Entwickler definieren Seitentypen. Lehrkräfte füllen Blöcke, sie legen keine freien Collections an. Das ist ein Fit beim festen Schema und ein zweiter Python-Prozess neben Next.js.
- NocoBase und Apostrophe bleiben draußen, bis eine LICENSE-Datei gelesen ist. Aktivität allein erfüllt den Lizenzfilter nicht.

### Gaps
- RAM für alle Produkte in diesem Abschnitt: nicht belegt.
- Wagtail: Wortlaut von „Making images private“ nicht ausgelesen. Offizielles Docker-Image nicht belegt.
- Gentics Mesh: aktuelle Admin-UX, Rollen, ob Medien anonym lesbar sind, und welches Image zu 3.3.2 gehört.
- Orchard, Umbraco, Sulu, Concrete, Bolt, Crafter: keine Doku-Seiten zu Medien-ACL, festem Schema und Docker gelesen. Release-Tags von Concrete, Bolt und Crafter fehlen wegen Rate-Limit.
- Pimcore-, NocoBase- und Apostrophe-Lizenztext nicht gefunden oder nicht zu Ende gelesen.
- WordPress-Lizenz und öffentlicher `wp-content/uploads`-Pfad nicht an der Vendor-Doku gegengeprüft.
- Directus selbst war nicht Gegenstand dieser Notiz.

### Ausschluss, je eine Zeile
- Wagtail: eigener Django-Prozess und Seiten-/StreamField-Admin. Privates Bild-Serving ist nur über das Inhaltsverzeichnis belegt, nicht für den gesamten Medientyp-Satz der Schule.
- Gentics Mesh: die gelesene Schnellstart-Zeile zeigt Image-Tag 0.33.1, das Release ist 3.3.2. Admin-UX und Medien-Gate sind unbelegt. Java-Stack, RAM nicht belegt.
- Ghost: Publishing-Produkt, kein festes Collection-Modell für Räume, Hotspots und Dialoge.
- TinaCMS: Git als Speicher, kein Server-Gate für Mediendateien.
- Decap CMS: Git-CMS für Static-Site-Generatoren, gleiches Medienproblem.
- Webiny: offiziell AWS-Serverless (Lambda, DynamoDB, S3), SPDX nicht als OSI ausgewiesen. Passt nicht auf ein kleines Coolify-VPS.
- Twill: Laravel-Toolkit, kein fertiges Headless-Produkt mit eigener Content-API in der Repo-Beschreibung.
- Orchard Core, Umbraco, Sulu: permisiv und aktiv, aber Medien-Gate und Eignung für nicht-technische Redakteure hier nicht belegt. Kein Ausschluss aus Fakten, nur aus fehlender Prüfung.
- NocoBase, ApostropheCMS: Lizenz am 3. November 2026 in den geprüften Dateien nicht belegt.
- CrafterCMS: GPL-3.0 und aktiv, Release-Tag und RAM nicht gelesen. Java-Gesamtstack auf 2–4 GB ist nicht belegt.
