# Directus-Lizenz, Stand 3. November 2026

Quellenstand dieser Notiz: 3. November 2026. Keine Produktempfehlung und keine Rechtsberatung. Zwei Wechsel nicht vermischen: 2023 von GPL-3.0 auf Business Source License 1.1, 2026 von BSL 1.1 auf MSCL-1.0-GPL. Der „Additional Use Grant“ ist ein Begriff der BSL, nicht der aktuellen MSCL.

## Welche Lizenz galt vor dem Wechsel, welche gilt für das aktuelle Release?

### Takeaway

Bis einschließlich v9.26.0 (veröffentlicht 24. April 2023) liegt im Tag die GNU General Public License, Version 3, 29 June 2007. Ab v10.0.0 gilt die Business Source License 1.1. Das aktuelle Release v12.6.0 (27. Oktober 2026) steht unter der Monospace Sustainable Core License, Version 1.0, Kürzel MSCL-1.0-GPL. GPL-3.0 war die OSI-offene Phase. BSL und MSCL sind nach dem Lizenztext bzw. nach Aussage des Herstellers nicht OSI-Open-Source.

### Cited Findings

- Tag `v9.26.0`, veröffentlicht 2023-04-24T20:41:32Z. Die Datei `license` in diesem Tag beginnt mit „GNU GENERAL PUBLIC LICENSE / Version 3, 29 June 2007“. — [GitHub-Release v9.26.0](https://github.com/directus/directus/releases/tag/v9.26.0); [license @ v9.26.0](https://github.com/directus/directus/blob/v9.26.0/license)
- Hersteller, historisch: „Directus was released as open source under GPLv3 back in 2011.“ Und: „Directus was open sourced in 2011 under GPLv3.“ — [Community-Ankündigung, 2. April 2026](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125); [Artikel, 22. Juni 2026](https://directus.com/resources/1000-license-keys-granted)
- v10.0.0, veröffentlicht 2023-04-26T18:12:44Z: „In v10.0.0, Directus is adopting BSL 1.1“. Paket `directus` neu „BSL 1.1“. Mehrere Pakete blieben MIT, darunter `@directus/composables`, `@directus/constants`, `@directus/types`, `@directus/utils`, `@directus/extensions-sdk`. — [Release v10.0.0](https://github.com/directus/directus/releases/tag/v10.0.0)
- Ankündigung gleichen Tags: „Today Directus is adopting BSL 1.1“, Datum der Blogseite 26. April 2023. — [Sustainable Open Source: Why We're Relicensing Directus](https://directus.com/resources/why-we-are-relicensing-directus)
- Rückblick, 14. Juni 2024: „we changed the license of the main Directus project from GPL3 to the BSL 1.1.“ „Directus 10.0.0, released on April 26 2023“ und diese Version habe nur die LICENSE-Datei geändert. — [Changing Our License: One Year Later](https://directus.com/resources/changing-our-license-one-year-later)
- Exakter Name in den Tags v11.16.0 und v11.17.4: Überschrift „Business Source License 1.1“. Parameter: Change License „GNU General Public License (GPL) v3“. Der BSL-Text selbst: „The Business Source License (this document, or the "License") is not an Open Source license.“ — [license @ v11.17.4](https://github.com/directus/directus/blob/v11.17.4/license)
- Maintainer Rijk van Zanten, 27. April 2023, zu v9: 9.x bleibt GPLv3, keine rückwirkende Relizenzierung. — [GitHub Discussion #17977](https://github.com/directus/directus/discussions/17977)
- Aktuelles Release laut `GET /repos/directus/directus/releases/latest` am 3. November 2026: Tag `v12.6.0`, `published_at` 2026-10-27T16:59:02Z. — [Release v12.6.0](https://github.com/directus/directus/releases/tag/v12.6.0)
- Datei `license` auf `main`, abgerufen 3. November 2026, erste Zeilen: „# Monospace Sustainable Core License, Version 1.0“ und „## Abbreviation / MSCL-1.0-GPL“. Copyright-Zeile: „Copyright 2026 Monospace Inc.“ — [license @ main](https://github.com/directus/directus/blob/main/license)
- v12.0.0, veröffentlicht 2026-06-10T17:15:01Z: „Breaking Change: Relicensed from BUSL-1.1 to MSCL-1.0-GPL (Monospace Sustainable Core License, Version 1.0).“ — [Release v12.0.0](https://github.com/directus/directus/releases/tag/v12.0.0)
- Docs, aktuell: „Directus is licensed under the Monospace Sustainable Core License (MSCL).“ — [Licensing overview](https://directus.io/docs/licensing/overview)
- Benjamin Haynes, 22. Juni 2026: „we're not going to pretend we're OSI-certified open source. We have not been for three years now since the shift to BSL.“ — [1000 license keys](https://directus.com/resources/1000-license-keys-granted)
- Blog zur v12-Lizenz, 22. April 2026: SDKs und genannte Nebenprojekte bleiben MIT. — [Evolving Our License](https://directus.io/blog/directus-v12-license-change)

### Inferences

- „Vor dem Wechsel“ hat zwei Antworten. Die OSI-offene Lizenz vor BSL ist GPL Version 3 (im Tag ohne SPDX-Zeile, im Herstellertext „GPLv3“ / „GPL3“). Die Lizenz unmittelbar vor dem aktuellen Modell ist „Business Source License 1.1“; das Release v12 schreibt dafür das SPDX-ähnliche Kürzel BUSL-1.1.
- OSI-Status, aus den Primärquellen und ohne erneuten Abruf der OSI-Lizenzliste: GPL-3.0 ist die Lizenz, die Directus selbst als Open Source bezeichnet hat. BSL erklärt sich im eigenen Text als nicht Open Source. MSCL wird vom Hersteller ausdrücklich nicht als OSI-zertifiziertes Open Source bezeichnet. Ob MSCL bei SPDX geführt wird, wurde nicht geprüft.

### Gaps

- Die SPDX-Felder aller Workspace-Pakete in v12.6.0 wurden nicht einzeln gelesen. Belegt ist die Root-`license` auf `main` und die Herstelleraussage, dass SDKs MIT bleiben.
- Es wurde nicht geprüft, ob `v9.26.0` einen „or any later version“-Hinweis außerhalb des GPL-Volltexts trägt. Im abgerufenen Dateikopf steht Version 3, 29 June 2007.

## Wann galt der Wechsel, ab welcher Version, welche Primärquelle?

### Takeaway

BSL 1.1 gilt ab v10.0.0, veröffentlicht 26. April 2023, Ankündigung gleichen Datums. MSCL-1.0-GPL ist im Release v12.0.0 enthalten, GitHub-Zeitstempel 10. Juni 2026. Der CEO nennt nachträglich den 1. Juni 2026 als Launch. Der April-Blog kündigte den Launch für Mai an. Diese drei Daten stehen nebeneinander und sind nicht dasselbe.

### Cited Findings

- BSL-Ankündigung, Seite datiert 26. April 2023. — [directus.com/resources/why-we-are-relicensing-directus](https://directus.com/resources/why-we-are-relicensing-directus)
- Dieselbe Aussage im Release v10.0.0, published 2023-04-26. — [github.com/directus/directus/releases/tag/v10.0.0](https://github.com/directus/directus/releases/tag/v10.0.0)
- MSCL-Ankündigung, Seite datiert 22. April 2026: „With the launch of v12 in May“. — [directus.io/blog/directus-v12-license-change](https://directus.io/blog/directus-v12-license-change) (Spiegel unter [directus.com/resources/directus-v12-license-change](https://directus.com/resources/directus-v12-license-change))
- Community-Vorabinfo, 2. April 2026: Wechsel „in the next month or so“. — [Forum-Thread](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)
- Haynes, 22. Juni 2026: „We launched this new license on June 1st“. — [1000 license keys](https://directus.com/resources/1000-license-keys-granted)
- Erster Release mit dem Breaking Change: v12.0.0, published 2026-06-10, PR #27417. — [Release v12.0.0](https://github.com/directus/directus/releases/tag/v12.0.0)
- Letzter geprüfter 11.x-Tag mit noch BSL-1.1-Datei: v11.17.4, published 2026-04-30. — [Release v11.17.4](https://github.com/directus/directus/releases/tag/v11.17.4); [license @ v11.17.4](https://github.com/directus/directus/blob/v11.17.4/license)
- Aktuelle Docs-Lizenzseite und Self-Hosting-Seite nennen MSCL, ohne ein anderes Datum. — [Licensing overview](https://directus.io/docs/licensing/overview); [Self-hosting overview](https://directus.io/docs/self-hosting/overview)

### Inferences

- Für „ab welcher Version liegt der neue Lizenztext im Artefakt“ ist v12.0.0 vom 10. Juni 2026 die belegbare Grenze. „1. Juni 2026“ ist eine spätere Herstellerformulierung und kein Git-Tag, der hier geprüft wurde.
- v11.17.4 ist der jüngste 11.17-Tag, den die Tags-Seite und das Release in dieser Recherche zeigen. Ein späterer 11.x-Patch nach v12.0.0 wurde nicht gefunden. `releases/latest` ist v12.6.0.

### Gaps

- Es gibt keinen einzelnen Changelog-Eintrag, der „1. Juni“ und den Tag v12.0.0 zusammenführt. Welches Datum ein Gericht als „make the Software available“ für die Vier-Jahres-Frist nimmt, steht nicht fest. Siehe nächste Frage.

## Was erlaubt und verbietet der Additional Use Grant, und was gilt stattdessen unter MSCL?

### Takeaway

Der Additional Use Grant existiert in der BSL-1.1-Datei und erlaubt Produktion, solange „Total Finances“ in den letzten 12 Monaten 5.000.000 US-Dollar nicht übersteigen. Die MSCL hat diesen Grant nicht. Sie erlaubt jeden Zweck außer „Competing Use“ und nennt internes Nutzen, non-commercial education, non-commercial research und Hosting für einen Lizenznehmer ausdrücklich. Feature-Freischaltung (SSO, Limits) ist ein zweites Regime und folgt nicht automatisch aus dem Urheberrechts-Grant.

### Cited Findings

BSL 1.1, Zitat aus `license` von v11.17.4 (gleichlautend in v11.16.0, Copyright-Zeile dort 2025):

> Additional Use Grant: You may use the Licensed Work in production as long as your Total Finances do not exceed US $5,000,000 for the most recent 12-month period, provided that Monospace, Inc. will not be liable to you in any way, including for any damages, including general, special, incidental or consequential damages, arising out of such use.
>
> References to: “Total Finances” mean the largest of your aggregate gross revenues, entire budget, and/or funding (no matter the source); “you” and “your” include (without limitation) any individual or entity agreeing to these terms and any affiliates of such individual or entity; and “production” mean any use other than (i) development of (including evaluation of the Licensed Work), debugging, or testing your offerings, or (ii) making the Licensed Work available standalone in unmodified object code form.

Dazu der BSL-Grundsatz: Recht zum Kopieren, Ändern, zu abgeleiteten Werken, zur Weitergabe und zu „non-production use“. Produktion darüber hinaus nur über den Additional Use Grant oder eine kommerzielle Lizenz. — [license @ v11.17.4](https://github.com/directus/directus/blob/v11.17.4/license)

MSCL-1.0-GPL, Zitat aus `license` auf `main`:

> A Permitted Purpose is any purpose other than a Competing Use.
>
> A Competing Use means making the Software available to any party (on a stand alone basis or together with your products or services) that competes with the Licensor's commercial offerings of the Software itself, where Licensor imposes a license fee, royalty, or other charge for exercise of any rights to the Software.
>
> Permitted Purposes specifically include using the Software, subject to the Limitations below:
>
> 1. for your internal use and access;
> 2. for non-commercial education;
> 3. for non-commercial research; and
> 4. in connection with professional services that you provide to a licensee using the Software in accordance with these Terms and Conditions, including professional services to deploy the Software or host the Software for the licensee.

Grenze am Lizenzschlüssel:

> You must not move, change, disable or circumvent the license key functionality of the Software or modify any portion of the Software protected by the license key to: enable access to the protected functionality without a valid license key or remove the protected functionality.

Weitergabe: Bedingungen beilegen, keine zusätzlichen Beschränkungen, „you may not impose a license fee, royalty, or other charge for exercise of rights granted under this License.“ Marken: kein Recht an Marken außer zur Anzeige der Lizenzdetails und zur Herkunftsangabe. — [license @ main](https://github.com/directus/directus/blob/main/license)

Hersteller-Gloss zum Competing-Use-Satz, 22. April 2026: „The only restriction is competing use… meaning you can’t build and sell a product whose primary purpose is to directly compete with Directus. This does not restrict hosting Directus, building products on top of it, or offering services around it.“ — [Blog](https://directus.io/blog/directus-v12-license-change)

Haynes im Forum, 5. April 2026, warum MSCL statt BSL: unter anderem „Allow non-competitive forks to be used/resold“ und „it blocks making the software available to others in a commercial product/service“ als Grund, die Fair Core License nicht zu nehmen. Das ist Entwurfssprache vor dem Release. — [Forum](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)

Open Innovation Grant, Docs: „Free commercial use is available through the Open Innovation Grant for entities with less than $5M in annual revenue and fewer than 50 employees. Eligibility is assessed based on the legal entities whose representatives log into the Directus Studio. Full terms are set out in the grant usage agreement.“ — [Licensing overview](https://directus.io/docs/licensing/overview)

OIG-Landingpage, andere Formulierung: „Under $5M annual recurring revenue and fewer than 50 employees.“ Dieselbe Seite: „For individuals, non-profits, hobbyists, and any team under 50 people + $5M in revenue.“ Den vollständigen Grant-Vertrag gibt die Seite nicht wieder. — [directus.io/oig](https://directus.io/oig)

Pricing-FAQ: „Organizations under $5M in annual revenue and fewer than 50 employees“. — [Pricing](https://directus.io/pricing)

Haynes, 22. Juni 2026: Schwelle „fewer than 50 employees and under $5 million in annual revenue“. „The 50-employee threshold, by the way, started at 25. We raised it to 50 based on community feedback in the weeks before launch.“ — [1000 license keys](https://directus.com/resources/1000-license-keys-granted)

Forum, 2. April 2026, damaliger Entwurf: „under $5M in annual revenue and under 25 headcount.“ Haynes, 5. April 2026, noch zum Entwurf: Headcount sei „the formal employee/team“ und schließe „volunteers or students of EDUs“ sowie „external clients or end users“ aus. Große Nonprofits und Universitäten (Beispiele MIT, Harvard) sollten aus seiner damaligen Sicht eher Rabatt als pauschal kostenlos bekommen. — [Forum](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)

### Inferences

Vier angefragte Fälle, getrennt nach Lizenztext. Das ist Lesart, nicht ein anwaltliches Ergebnis.

- Produktion, self-hosted, eigene Nutzer, aktuelle MSCL: „internal use and access“ ist als Permitted Purpose aufgezählt. Non-commercial education ebenfalls. Das Urheberrecht an der Software verbietet diesen Betrieb nicht. Ab v12 entscheiden Sitz- und Feature-Limits plus ggf. OIG-Schlüssel, welche Funktionen laufen. Unter der historischen BSL wäre derselbe Betrieb Produktion und damit nur vom Additional Use Grant gedeckt, wenn „Total Finances“ (der größte Wert aus Umsatz, gesamtem Budget und Funding, inklusive Affiliates) 5.000.000 US-Dollar nicht übersteigt. Für eine öffentliche Stelle ist „entire budget“ weiter als „annual revenue“.
- MPZ betreibt die Instanz, Lehrkräfte einer Schule loggen sich ein: MSCL-Punkt 4 erlaubt ausdrücklich, die Software für einen Lizenznehmer zu deployen oder zu hosten, sofern dieser Lizenznehmer die Software gemäß der Bedingungen nutzt. Der Blog sagt, Hosting und Dienstleistungen seien von der Competing-Use-Schranke nicht erfasst. Ein konkurrierendes Directus-as-a-Service ist das nach dem Wortlaut nicht, solange das Angebot nicht darin besteht, die Software Parteien bereitzustellen, die mit den kostenpflichtigen Directus-Angeboten der Software selbst konkurrieren. Die OIG-Docs prüfen die Schwelle an den juristischen Personen, deren Vertreter sich im Studio anmelden. Lehrkräfte mit Studio-Login sind danach Vertreter der Schule, nicht bloß API-Endnutzer. Ob dann Haushalt und Beschäftigte der Schule, des Betreibers oder beider zählen, sagt der abgerufene Docs-Satz nicht zu Ende. Haynes’ April-Satz, externe Kunden zählten nicht zum Headcount, betrifft den damaligen Grant-Entwurf und widerspricht nicht zwingend dem späteren Docs-Satz über Studio-Logins.
- Konkurrierendes Directus-as-a-Service: unter MSCL die definierte Competing Use, also nicht erlaubt, solange die MSCL gilt. Unter BSL ist „production“ jeder Nutzen außer Entwicklung, Debugging, Test und dem Bereitstellen der Software „standalone in unmodified object code form“. Ein gehostetes, betreutes Angebot wäre danach eher Produktion und ohne Grant oder Commercial License nicht gedeckt. Der Grant selbst hängt an Total Finances des Nutzers, nicht an einer eigenen DaaS-Ausnahme.
- Quelltext ändern: BSL gewährt „modify“ und „derivative works“ schon im Grundrecht, auch ohne Grant. MSCL gewährt „modify“ und „create derivative works“ für jeden Permitted Purpose. Verboten ist in der MSCL das Umgehen oder Entfernen der Lizenzschlüssel-Funktion bzw. das Freischalten geschützter Funktionen ohne gültigen Schlüssel. Markenrecht ist in beiden Lizenzen eng. Ein White-Label im Sinne von „Directus-Marken entfernen und als eigenes CMS verkaufen“ ist damit nicht schon durch das Änderungsrecht gedeckt.

### Gaps

- Der „grant usage agreement“ ist in den Docs erwähnt, der Volltext wurde nicht abgerufen. Damit fehlt die verbindliche Definition von „annual revenue“ für eine Körperschaft ohne Umsatz, aber mit öffentlichem Haushalt. Die OIG-Seite sagt an einer Stelle „annual recurring revenue“, an anderer „revenue“. Pricing und Haynes sagen „annual revenue“. Das ist nicht geglättet.
- Ob Affiliates im OIG noch wie im BSL-Grant mitzählen, steht im abgerufenen Material nicht.
- „Competing Use“ im MSCL-Text ist ein langer Satz mit dem Einschub „where Licensor imposes a license fee…“. Der Blog vereinfacht das zu „primary purpose is to directly compete“. Text und Gloss sind nicht wortgleich. Für einen Grenzfall (mehrere Schulen, produktisiertes Hosting) reicht das abgerufene Material nicht.

## Gibt es ein Change Date, nach dem die Lizenz in eine offene Lizenz umspringt?

### Takeaway

Ja, versionsweise, nicht für das ganze Produkt an einem Tag. BSL-Parameter: „Change Date: Three years from release date“, „Change License: GNU General Public License (GPL) v3“. MSCL: zusätzliche Lizenz unter GPL-3.0 ab dem vierten Jahrestag des Bereitstellens dieser Softwareversion. Ziel beider Strecken ist GPL v3, die Frist ist 3 Jahre (BSL) bzw. 4 Jahre (MSCL). Apache und MIT sind nicht die Ziellizenz.

### Cited Findings

- BSL-Parameter, v11.17.4: „Change Date: Three years from release date“. „Change License: GNU General Public License (GPL) v3“. Der MariaDB-Mustertext schaltet um „on the Change Date, or the fourth anniversary of the first publicly available distribution of a specific version … whichever comes first“. „This License applies separately for each version of the Licensed Work and the Change Date may vary for each version“. — [license @ v11.17.4](https://github.com/directus/directus/blob/v11.17.4/license)
- Ankündigung 2023: „Code released under this new license converts to GPLv3 (OSS) after 3 years“. — [Relicensing-Blog](https://directus.com/resources/why-we-are-relicensing-directus)
- MSCL, `main`: „We hereby irrevocably grant you an additional license to use the Software under the GNU General Public License version 3 (GPL-3.0), effective on the fourth anniversary of the date we make the Software available.“ Der danach zitierte GPL-Hinweis enthält „either version 3 of the License, or (at your option) any later version.“ — [license @ main](https://github.com/directus/directus/blob/main/license)
- Blog, 22. April 2026: „Every version automatically becomes fully open source (GPLv3) after 4 years.“ — [Blog](https://directus.io/blog/directus-v12-license-change)
- Haynes, 22. Juni 2026: „every version of Directus converts to GPL-3.0 four years after release.“ Begründung, die Fair Core License nicht zu nehmen: sie verlange MIT nach 2 Jahren. — [1000 keys](https://directus.com/resources/1000-license-keys-granted); [Forum, 5. April 2026](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)

### Inferences

- v10.0.0, published 26. April 2023, plus der Parameter „three years from release date“ ergibt den 26. April 2026. An diesem Stichtag wäre diese eine Version nach dem BSL-Text unter GPL v3 nutzbar, auch wenn die Datei im Tag weiter „Business Source License 1.1“ zeigt. Ob Directus den Tag nachträglich umetikettiert hat, wurde nicht geprüft. Die Umstellung ist im Lizenztext automatisch, nicht an einen neuen Commit gebunden.
- v11.17.4, published 30. April 2026, plus drei Jahre ergibt den 30. April 2029. Bis dahin bleibt diese Version nach dem abgerufenen Text BSL 1.1. Am 3. November 2026 ist sie nicht umgesprungen.
- v12.0.0, published 10. Juni 2026, plus vier Jahre ergibt den 10. Juni 2030, wenn man den GitHub-Zeitstempel als „date we make the Software available“ nimmt. Der Satz „launched this new license on June 1st“ würde auf den 1. Juni 2030 zeigen. Die Lizenz sagt nicht, welches der beiden Daten gilt. Jüngere Tags (v12.6.0 vom 27. Oktober 2026) haben ein eigenes Vier-Jahres-Datum.
- Die Grant-Formulierung nennt „GPL-3.0“. Der eingeklebte GPL-Standardabsatz nennt „or any later version“. Ob GPL-3.0-only oder GPL-3.0-or-later gemeint ist, ist im Text nicht aufgelöst. Apache und MIT stehen dort nicht.

### Gaps

- Kein Herstellerdokument listet berechnete Kalenderdaten pro Tag. Die Daten oben sind Rechnung aus „published_at“ plus Lizenzparameter.
- Ob v10.0.0 seit dem 26. April 2026 in der Praxis von Directus als GPL vertrieben wird (Docker-Tags, npm-Metadaten), wurde nicht nachgesehen.

## Welche Funktionen liegen nicht mehr in der kostenlosen Stufe, und welche Preise sind veröffentlicht?

### Takeaway

Unter BSL war der Funktionsumfang für Grant-Berechtigte nicht nach Features geschnitten. Ab v12 läuft eine Instanz ohne Lizenzschlüssel auf der Core-Stufe mit harten Limits. Ohne passende Lizenz nennt das Release v12.0.0 ausdrücklich SSO, eigene Permission-Regeln, eigene oder self-gehostete LLMs und AI Translations. Preise stehen in US-Dollar. Euro-Preise und ein MAU-Tarif wurden nicht gefunden. White-Label steht auf der Pricing-Seite nicht als eigene Zeile.

### Cited Findings

Release v12.0.0, was ohne Lizenz aufhört zu funktionieren:

- „SSO — SSO login will no longer work.“
- „Custom permission rules — custom rules on access policies will be ignored.“
- „Custom or self-hosted LLMs — connections to custom LLMs will no longer work.“
- „AI Translations — AI-powered translations are not available.“
- Neue Instanzen: sofort. Upgrade: 30 Tage Grace, danach Durchsetzung. — [Release v12.0.0](https://github.com/directus/directus/releases/tag/v12.0.0)

Docs zu Sitzen: Ein Seat ist ein aktiver Studio-Nutzer mit Policy „App Access“ oder „Admin Access“. API-only-Nutzer, die das Studio nie öffnen, zählen nicht, „regardless of how many exist“. Beispiel im Docs-Text: 2 Redakteure und 50.000 Anwendungsnutzer verbrauchen 2 Seats. — [Licensing overview](https://directus.io/docs/licensing/overview)

Collections, dieselbe Seite: gezählt werden User-Collections inklusive Translation-Collections und Junction-Tabellen. Nicht gezählt: `directus_`-Systemcollections, Ordner, reine Datenbanktabellen ohne Directus-Metadaten.

Pricing-Seite, abgerufen 3. November 2026, Karten:

- Core: „$89 / mo“, „Billed yearly, or $99 monthly“. Daneben: „3 user seats, 25 Collections, 5 Flows, AI Assistant, Advanced RBAC, Community Support“.
- Team: „$588 / mo“, „Billed yearly, or $698 monthly“. Daneben: „10 SSO seats, 50 Collections, 20 Flows, Granular RBAC, Basic Support“.
- Enterprise: „Custom“. Genannt: „Custom SSO seats, Custom Collections, Unlimited Flows, SSO (SAML / OIDC), Custom LLM, Offline Mode, AI Translations, Telemetry Opt-out“.

Dieselbe Seite, FAQ, andere Zahlen:

- „Self-hosting is available on every tier. Directus Cloud adds $89/mo billed yearly, or $99 monthly, on Core and Team. Enterprise cloud pricing is custom.“
- „Is SSO available on Core? No. SSO is not available on Core and cannot be added as an add-on. SSO is included on Team with additional seats available at $50/seat/mo. If SSO is a requirement, you need Team, Enterprise, or our Grant.“
- „Core includes 25 collections, Team includes 50 (expandable to 100), and Enterprise starts at 200+.“
- „Core includes 3 seats (hard limit). Team includes 10 SSO seats with additional seats at $50/seat/mo.“
- „Team is $499/mo with an annual commitment ($ 5,988/year) or $599/mo on a rolling monthly basis.“
- OIG: Self-hosted ohne Softwarekosten. „Cloud hosting is $99/mo.“ „or at $99/mo on cloud (hosting only).“ — [directus.io/pricing](https://directus.io/pricing)

OIG-Seite: „Unlimited seats, collections, and flows“, „SSO and custom access policies“, „Bring-your-own LLM and AI translations“, „Self-hosted: free, no caps“, „Cloud: pay only the hosting cost of $99/month“. — [directus.io/oig](https://directus.io/oig)

AWS Marketplace, von der Suche ausgewiesen, nicht als Vertragsangebot dieser Notiz: Team Software License „10 SSO Seats, 50 Collections, 20 Flows“ für 5.988,00 US-Dollar / 12 Monate. Seat (SSO) 600,00 US-Dollar. Collections, Pakete von 25 über dem Inklusivkontingent, 1.200,00 US-Dollar. Cloud Hosting 1.068,00 US-Dollar / 12 Monate. — [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-7p6kim2gis2vy)

Haynes, 5. April 2026, vor dem Release, engere Liste: Gating von „SCIM, Invoicing, Offline Mode“ und an anderer Stelle „SCIM, Offline Mode, Annual Invoicing, and Paid Support“. — [Forum](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)

Blog, 22. April 2026: bezahlte Stufen für „advanced, enterprise-focused features (like SCIM and offline mode)“. — [Blog](https://directus.io/blog/directus-v12-license-change)

Schlüsseltechnik, Docs: Ohne Schlüssel läuft Core. OIG-Schlüssel: bis zu 5 Aktivierungen, gedacht für Umgebungen eines Projekts. Online-Modus spricht `https://licensing.directus.com` an, Revalidierung mindestens alle 12 Stunden. Offline-Token nur Enterprise. Core „can be run air-gapped without a token“. Scheitert die Verlängerung bis zum genannten Datum, fällt die Instanz auf Core zurück. Über den Core-Limits wird sie gesperrt, Daten bleiben. — [Licensing overview](https://directus.io/docs/licensing/overview)

### Inferences

- Die Kartenpreise 89/588 US-Dollar und die FAQ 0 plus 499/599 US-Dollar widersprechen sich nur, wenn man sie für dasselbe Produkt hält. 499+89=588 und 599+99=698. Die FAQ sagt, Cloud komme auf Core und Team obendrauf. Die Karten sind damit verträglich als Cloud-Summen, die FAQ als Softwarepreis für Self-Hosting. Die Seite hat einen Umschalter „Cloud / Self-Hosted“. Der Abruf hat den Umschalter nicht isoliert. Deshalb sind 499 und 599 US-Dollar die ausdrücklich im FAQ-Satz stehenden Team-Preise, nicht eine aus den Karten errechnete Tatsache.
- „Advanced RBAC“ steht auf der Core-Karte, „Granular RBAC“ auf Team, und v12.0.0 sagt, custom rules auf Access Policies würden ohne Lizenz ignoriert. Was von RBAC in Core noch echt ist und was „custom permission rules“ genau abschaltet, ist aus den beiden Texten nicht deckungsgleich.
- Die April-Liste (SCIM, Offline, Invoicing) und die Release-Notes vom Juni (SSO, Custom Permissions, Custom LLM, AI Translations) beschreiben nicht dieselbe Menge. Für den ausgelieferten Stand sind Release-Notes plus Pricing-FAQ die jüngere Quelle. SSO ist danach auf Core nicht enthalten und nicht als Add-on kaufbar.
- Kein veröffentlichter Preis in Euro. Kein MAU-Preis. Endnutzer einer schuleigenen Oberfläche zählen nach der Seat-Definition nicht, solange sie keinen Studio-Zugang haben. Lehrkräfte im Studio zählen je Person.
- White-Label als bezahltes Feature: auf der abgerufenen Pricing-Seite keine Zeile. Die MSCL verbietet Markennutzung über die Herkunftsangabe hinaus. Das ist eine Markenklausel, kein bepreistes Modul.

### Gaps

- Vollständige Feature-Matrix als Tabelle (jede Zeile je Stufe) kam im Abruf nur zerstückelt an. Nicht belegt und hier nicht behauptet: ein konkreter Euro-Preis, ein MAU-Kontingent, ein White-Label-Aufpreis.
- Ob der AWS-Marketplace-Preis am 3. November 2026 noch dem Self-Hosting-FAQ entspricht, wurde nicht durch einen eigenen Seitenabruf bestätigt. Die 5.988 US-Dollar decken sich mit dem FAQ-Satz „$ 5,988/year“.

## Letzte Version unter der früheren offenen Lizenz, Pinning, Sicherheitsstützung

### Takeaway

Die letzte Version, deren `license`-Datei die GPL-3.0 ist, ist v9.26.0 vom 24. April 2023. Pinning dieser Version nutzt die Lizenz, unter der sie erschien. Directus hat 9.x nicht rückwirkend umlizenziert. Eine laufende Sicherheitszusage für v9 oder v11 ist zum 3. November 2026 nicht belegt. Die einzige gefundene Zusage betraf Directus 10 bis Ende 2024 und ist abgelaufen. Die letzte BSL-Version vor MSCL ist mindestens v11.17.4 vom 30. April 2026. Die bleibt bis zu ihrem Drei-Jahres-Datum BSL, nicht GPL.

### Cited Findings

- v9.26.0 published 2023-04-24, `license` ist GPL Version 3. v10.0.0 published 2023-04-26 ist der erste BSL-Release. — [v9.26.0](https://github.com/directus/directus/releases/tag/v9.26.0); [v10.0.0](https://github.com/directus/directus/releases/tag/v10.0.0)
- Rijk van Zanten, 27. April 2023: 9.x bleibt GPLv3, keine rückwirkende Relizenzierung, die alten Versionen bleiben auf den üblichen Kanälen. Forken sei technisch möglich, Upstream-Änderungen ließen sich nicht einfach nachziehen. — [Discussion #17977](https://github.com/directus/directus/discussions/17977)
- v11.17.4 published 2026-04-30, `license` ist Business Source License 1.1 mit dem Additional Use Grant. — [v11.17.4](https://github.com/directus/directus/releases/tag/v11.17.4)
- Changelog, Abschnitt Dezember 2024: „Earlier this year we committed to providing security updates to Directus 10 until the end of the year, make sure you upgrade to 10.13.4 if you’re still on the version 10 family.“ — [Changelog](https://directus.io/docs/releases/changelog)
- Aktuelle Linie: v12.6.0 vom 27. Oktober 2026. Der Docs-Changelog, der in dieser Recherche ankam, endet inhaltlich bei Juli 2026 / 12.2.0 und ist damit hinter GitHub zurück. — [Release v12.6.0](https://github.com/directus/directus/releases/tag/v12.6.0)

### Inferences

- Pinning von v9.26.0 ist lizenzrechtlich das Nutzen einer GPL-3.0-Fassung, nicht ein Umgehen der späteren Lizenz. Es ist keine vom Hersteller beschriebene unterstützte Linie. Der Changelog-Satz von Dezember 2024 bezog sich auf Version 10 und auf das Ende des Jahres 2024.
- Pinning von v11.17.4 ist das Nutzen der BSL 1.1 samt Additional Use Grant, bis der Change Date dieser Version greift (Parameter: drei Jahre ab Release, also rechnerisch 30. April 2029). Es ist nicht „die alte offene Lizenz“. Ob Sicherheitsfixes aus v12 auf 11.x zurückportiert werden, ist nicht belegt. v12.6.0 hebt die Node-Untergrenze auf Node 26. Das ist ein Betriebsfaktum der neuen Linie, kein Lizenzfaktum.

### Gaps

- Keine aktuelle Support- oder EOL-Richtlinie für v9, v10 oder v11 gefunden. „Nicht mehr mit Sicherheitsupdates versorgt“ wäre eine stärkere Aussage, als die Quellen hergeben.
- Nicht geprüft, ob nach v9.26.0 noch ein v9.26.x-Tag mit GPL erschienen ist. v9.26.0 ist der letzte Release unmittelbar vor v10.0.0, den diese Recherche geöffnet hat.

## Gepflegte Community-Forks unter der alten Lizenz?

### Takeaway

Es gibt keinen hier gefundenen, nennenswert gepflegten Fork der BSL- oder MSCL-Linie, der die alte GPL weiterführt. Der einzige Fork mit aktueller Aktivität und dreistelliger Sternzahl ist `LaWebcapsule/d9`, ein GPL-3.0-Fork der Directus-9-Linie. Kleinere v9-Forks existieren und wirken unbedeutend.

### Cited Findings

- `LaWebcapsule/d9`: Beschreibung „d9 - openSource maintenance of directus“. GitHub-API am 3. November 2026: `stargazers_count` 184, `forks_count` 29, `open_issues_count` 17, Lizenz `GPL-3.0`, `pushed_at` 2026-11-02T14:33:18Z, `archived` false. Homepage `https://d9.webcapsule.io`. README: Fork von Directus 9, „stays GPLv3“, nicht mit Monospace verbunden. API-Feld `fork` ist false. — [github.com/LaWebcapsule/d9](https://github.com/LaWebcapsule/d9)
- `pxslip/db-studio`: Suche zeigt 1 Stern, GPL-3.0, angelegt 2024-05-14, „fork of directus v9“. Aktivität nicht geprüft. — [github.com/pxslip/db-studio](https://github.com/pxslip/db-studio/)
- `outroll/directus-lts`: Suche zeigt 4 Sterne, GPL-3.0, angelegt 2023-10-31, „fork of Directus 9.25“. Aktivität nicht geprüft. — [github.com/outroll/directus-lts](https://github.com/outroll/directus-lts/)
- `digiogithub/brio`: Suche zeigt 1 Stern, angelegt 2026-02-19, README beansprucht Fork von v9.26.0 unter GPL-3.0. Das Lizenzfeld der Suche stand auf „Other“. Nicht weiter verifiziert. — [github.com/digiogithub/brio](https://github.com/digiogithub/brio)

### Inferences

- d9 ist der einzige Kandidat, den man am 3. November 2026 als gepflegt bezeichnen kann: Push am Vortag, 184 Sterne. Er führt die 9er-Codebasis weiter, nicht v11 oder v12. Ob die Commits seit 2023 Sicherheitsfixes oder nur Pflege sind, wurde nicht diffed.
- Ein Fork, der BSL-Code vor dem Change Date eigenmächtig auf GPL umstellt, wäre mit dem BSL-Text nicht gedeckt. Ein solcher Fork ist hier auch nicht aufgetaucht.

### Gaps

- Keine vollständige Fork-Liste, keine Commit-Statistik außer `pushed_at` von d9. Sterne-Zahlen der kleinen Repos stammen aus der Suche, nicht aus einem zweiten API-Abruf.

## Community-Reaktion, kurz

### Takeaway

Die Reaktion auf den GPL-Abschied 2023 war auf Hacker News und in GitHub Discussion #17977 gespalten: nachvollziehbares Finanzierungsproblem auf der einen Seite, Ablehnung einer umsatzabhängigen Nicht-OSS-Lizenz auf der anderen. Die Reaktion auf MSCL im April 2026 im Directus-Forum ist skeptischer und konkreter: eigene Lizenz statt bekannter BSL, zusätzliches Headcount-Kriterium, Registrierungsschlüssel. Der Hersteller hat die Beschäftigtenschwelle daraufhin von 25 auf 50 angehoben. Ein eigener HN-Thread nur zur MSCL ist in dieser Recherche nicht aufgetaucht.

### Cited Findings

- Discussion #17977, geschlossen mit dem Hinweis, BSL sei in v10.0.0 draußen. Darin die Zusage, 9.x bleibe GPL. — [Discussion #17977](https://github.com/directus/directus/discussions/17977)
- Hacker News, Thread „Directus – real-time REST and GraphQL API of any SQL database“, item 43150116. Die sichtbaren Kommentare diskutieren die BSL-Schwelle unter 5 Millionen und die spätere GPL-3-Umwandlung nach drei Jahren, nicht die MSCL von 2026. Eine Projektantwort in dem Thread beschreibt die Lizenz als verzögert quelloffen, gratis unter 5 Millionen „finances“, weil Spenden und reines Hosting-Geschäft nicht getragen hätten. Gegenrede im selben Umfeld: eine Umsatzschwelle sei nicht dasselbe wie „viel Geld verdienen“, und für Self-Hosting-Software sei das ein anderer Schnitt als bei Sentry oder Redis. Datum des Threads wurde nicht extra erhoben. Es ist die BSL-Debatte, nicht die MSCL-Debatte. — [news.ycombinator.com/item?id=43150116](https://news.ycombinator.com/item?id=43150116); Gegenrede [item 43164891](https://news.ycombinator.com/item?id=43164891)
- Forum ab 2. April 2026: @qntmplation nennt eine ungeprüfte Eigenlizenz ein „Huge red flag“ und schreibt, er könne Directus Kunden nicht mehr verantwortlich empfehlen, wenn sich die Bedingungen nach der Auslieferung verschieben. @icouto liest den Schritt als Beginn einer Paywall für kleine Self-Hoster. @filipe fragt nach der finanziellen Lage und nach VC-Druck. Haynes antwortet am 5. April: das Team sei nicht in Geldnot, Investoren entschieden nicht über die Lizenz, die Eigenlizenz solle Schlüssel-Durchsetzung rechtlich tragen und nach vier Jahren nach GPL v3 wechseln, nicht nach MIT. — [Forum-Thread](https://community.directus.com/t/directus-license-revision-community-feedback-requested/2125)
- Haynes, 22. Juni 2026, zur Konsequenz aus diesem Thread: Schwelle von 25 auf 50 Beschäftigte angehoben, „based on community feedback in the weeks before launch.“ Über 1.000 OIG-Schlüssel ausgegeben. — [1000 license keys](https://directus.com/resources/1000-license-keys-granted)

### Inferences

- Für eine kleine deutsche Stelle ist die relevante Verschiebung nicht ein plötzliches Verbot von Self-Hosting. Self-Hosting steht im MSCL-Text. Die Verschiebung ist die Kombination aus Eigenlizenz, Schlüssel, Studio-Seat-Limits und einer Schwelle, deren Wortlaut zwischen „budget“ (alte BSL), „annual revenue“ und „annual recurring revenue“ (OIG-Seiten) springt.
- Die Forumskritik vom April beschreibt die Richtung schärfer als das, was die Release-Notes im Juni dann abschalten. Beides zitieren, nicht das eine vom anderen glätten.

### Gaps

- Kein HN-Thread, der ausdrücklich MSCL oder v12 behandelt, in der verwendeten Suche. Keine Auswertung von Discord. Der Forum-Abruf umfasst die erste Seite, nicht jeden späteren Beitrag.
