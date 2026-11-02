# ADR-004 — Video-Hosting: MPZ-Server (YouTube optional später)

**Datum:** 2026-05-21  
**Status:** entschieden

## Kontext

Stationen können kurze Videos (max. 60 Sekunden) enthalten. Videos mit Kinderstimmen oder -bildern unterliegen DSGVO und dem Auftragsverarbeitungsverhältnis MPZ ↔ Schule (ADR-001: Daten in Deutschland). Im Gespräch wurde YouTube als einfache Alternative diskutiert; rechtlich ist unklar, ob Embed unter Schul-DSGVO und ohne US-Transfer zulässig ist.

## Entscheidung

**Vorerst (MVP bis Schulfest und initialer Dauerbetrieb):**

- Videos werden auf dem **MPZ-Server** gehostet (gleiche Infrastruktur wie die App, Coolify/Docker).
- Auslieferung über direkte URLs oder App-Storage-Pfad (z. B. `/public` oder Object Storage auf dem IONOS-VPS).
- Kein YouTube-Embed im produktiven MVP.

**Im Kopf behalten (nicht für 26.06. planen):**

- **YouTube-Embed** als spätere Option, wenn die Schule/der Datenschutzbeauftragte die rechtliche Klärung abgeschlossen hat (Einwilligungen, AVV mit Google, nocookie-Domain, Informationspflichten).
- Das Datenmodell und der Video-Player sollen **beide Quellen** vorbereiten können (`source: "upload" | "youtube"`), ohne YouTube im MVP zu aktivieren.

## Begründung

- **Datenschutz:** Daten und Streams bleiben auf MPZ-Infrastruktur in DE — passt zu AVV und Schulanforderungen.
- **Betrieb am Schulfest:** Keine Abhängigkeit von Google/CDN oder Schul-WLAN-Filtern, die YouTube sporadisch blockieren.
- **YouTube offen halten:** Deutlich weniger Speicher- und Encode-Aufwand für Lehrkräfte; rechtliche Hürde ist real, darf die Architektur aber nicht verbauen.

## Verworfene Alternativen

- **Nur YouTube ab Start:** Schneller für Redaktion, aber DSGVO ungeklärt und WLAN-Risiko an der Schule.
- **Vimeo o. ä. Drittanbieter:** Zusätzlicher AVV-Aufwand; für MVP kein Vorteil gegenüber MPZ-Upload.
- **Videos nur im Schul-WLAN:** Nicht skalierbar für Eltern mit Mobilfunk und Schulstartheft außerhalb des Festes.

## Konsequenzen

- Phase 2: Video-Player für **selbst gehostete** Dateien (HTML5 `<video>`, max. Länge/Größe prüfen).
- JSON-/Directus-Feld für Medientyp und URL; optional `youtubeId` für spätere Nutzung dokumentieren, nicht befüllen.
- Upload-Workflow: MVP manuell durch MPZ; mit Directus später Medienbibliothek auf MPZ.
- **Offener Punkt (Org/Recht):** YouTube-Embed — Klärung durch Schule/DSB vor Aktivierung; ggf. eigener ADR oder Ergänzung dieses ADR mit Status `youtube: freigegeben`.
