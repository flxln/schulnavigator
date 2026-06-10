# ADR-017 — Externe Medien, iframe-Embed und Hotspot-Marker

**Datum:** 2026-06-10  
**Status:** entschieden  
**Ergänzt:** [ADR-006](./006-raum-viewer-gyro-hotspots.md) (Hotspots), [ADR-004](./004-video-hosting-mpz.md) (Drittanbieter-Medien), [ADR-003](./003-content-mvp-json-directus.md) (Content-Schema)  
**Umsetzungsplan:** [`../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md`](../projektmanagement/2026-06-10-externe-medien-hotspot-marker-plan.md)

## Kontext

Die Schule wünscht drei Erweiterungen (Gespräch 07.05., Nachtrag PC-Raum/Delightex):

1. **iframe** — Einbettung von Delightex-Inhalten (ehem. CoSpaces Edu) und ähnlichen Web-Apps
2. **Links** — externe URLs als Medium und per Hotspot erreichbar
3. **Hotspot-Marker** — Icons oder Vorschaubilder statt des gelben Punkts (`bg-brand-sun`)

Bisher unterstützt `MediumTyp` nur `audio | video | foto | text` mit Pfaden unter `/public/`. Hotspots für Medien rendern einen 16×16-px-Kreis ([`hotspot-overlay.tsx`](../../app/components/raum-viewer/hotspot-overlay.tsx)); Dialog-Hotspots nutzen bereits Bild-Marker (Maskottchen, ADR-011).

Fürs **Schulfest (26.06.)** war bewusst kein eingebettetes Lernspiel geplant ([`auftraggeber/schriftverkehr/antwort-mail.md`](../../auftraggeber/schriftverkehr/antwort-mail.md)). Diese ADR legt die **Post-Fest-Architektur** fest und die **sukzessive Umsetzungsreihenfolge**.

## Entscheidung

### 1. Hotspot-Marker (Stufe 1 — zuerst)

Optionale Felder am Medien-Hotspot (`action` fehlt oder `medium`):

| Feld | Typ | Semantik |
|------|-----|----------|
| `icon` | `string` | Pfad mit `/` unter `app/public/` (PNG/SVG/WebP) |
| `iconSize` | `number` | 0,05–0,25 — Anteil von `effectiveDisplayH` (wie `mascotSize`, ADR-014) |

**Fallback-Kette** (wenn `icon` fehlt):

1. `medien[].thumbnail` des verknüpften Mediums (falls gesetzt)
2. Typ-Preset-Icon (Audio/Video/Foto/Text/Link/Embed)
3. Gelber Punkt (heutiges Verhalten — Abwärtskompatibilität)

Touch-Ziel: mindestens **44×44 px** (`min-h-11 min-w-11`), auch wenn das Icon kleiner ist. Aktiv-Zustand: Ring/Scale, nicht Farbwechsel des Kreises.

`icon` / `iconSize` sind bei `action: dialog` **verboten** (Maskottchen bleiben ADR-011).

### 2. Externe Links (Stufe 2)

Neuer Medientyp `link`:

```json
{
  "id": "pc-delightex",
  "typ": "link",
  "quelle": "https://edu.delightex.com/…",
  "untertitel": "Unsere 3D-Welt",
  "openIn": "external"
}
```

| Feld | Pflicht | Werte |
|------|---------|--------|
| `quelle` | ja | `https://` URL (kein `javascript:`, kein `http://`) |
| `openIn` | nein | `external` (Default) — neuer Tab / `window.open` mit `noopener,noreferrer` |

Hotspot-Anbindung unverändert über `mediumId`. Medienliste zeigt Link-Karte mit Hinweis „Öffnet extern“.

**Kein** separates `action: link` am Hotspot — Medienmodell bleibt Single Source of Truth.

### 3. iframe-Embed (Stufe 3)

Neuer Medientyp `embed` für vertrauenswürdige Drittanbieter (primär Delightex):

```json
{
  "id": "pc-welt",
  "typ": "embed",
  "quelle": "https://edu.delightex.com/…",
  "untertitel": "Virtuelle PC-Welt",
  "embedAllow": ["delightex.com"]
}
```

| Feld | Pflicht | Werte |
|------|---------|--------|
| `quelle` | ja | HTTPS-URL der Einbettungsseite (Share-/Embed-URL des Anbieters) |
| `embedAllow` | nein | Domain-Suffix-Allowlist; Default im Code: `delightex.com` |

Rendering: `<iframe>` im bestehenden `StationMediaPanel`; optionaler Vollbild-Button. CSP `frame-src` in Next.js auf erlaubte Domains beschränken.

**Abgrenzung zu `link`:** `embed` = In-App-Panel; `link` + `external` = Tab verlassen. Kein `openIn: iframe` an `link` — zwei Typen vermeiden Validator-Zweideutigkeit.

### 4. Gemeinsames Feld `thumbnail` (ab Stufe 1)

Optionales Feld an **jedem** `Medium`:

- Pfad unter `/public/` — Vorschau in Medienliste und als Hotspot-Fallback
- Validator: nur relativer Pfad; bei `typ: link` / `embed` optional (kein Asset-Check auf `quelle`)

### 5. Recht & Betrieb

- **Delightex / Drittanbieter:** Datenschutzhinweis und ggf. AVV **vor** produktiver Nutzung mit Schule/DSB klären (Analog offener Punkt YouTube, ADR-004).
- **Schulfest-MVP:** keine `embed`-Stationen ohne explizite Freigabe; `link` + `external` als pragmatischer PC-Raum-Workaround möglich.
- **Login-Pflicht** beim Anbieter (z. B. Delightex-Klassencode): nicht durch die App lösen — nur öffentliche Share-URLs einbetten oder `typ: link` nutzen.

### 6. Umsetzungsreihenfolge

| Stufe | Inhalt | Abhängigkeit |
|-------|--------|--------------|
| **1** | Hotspot-Marker + `thumbnail` | keine |
| **2** | `typ: link` | Stufe 1 optional (Icons) |
| **3** | `typ: embed` + CSP | Stufe 2; DSB-Freigabe Delightex |

Details, Dateiliste und Tests: Umsetzungsplan (siehe Kopfzeile).

## Begründung

- **Ein Medienobjekt pro Ressource** — Hotspot, Liste und Panel teilen dieselbe `mediumId`-Kette; kein paralleles Hotspot-URL-Feld.
- **Marker vor Embed** — sichtbarer UX-Gewinn ohne Drittanbieter-Risiko; Redaktion kann Icons sofort nutzen.
- **`link` vor `embed`** — externer Tab funktioniert auch bei Login-Wänden und ohne `X-Frame-Options`-Probleme; Delightex-PC-Raum ist so schon nutzbar.
- **Getrennte Typen `link` / `embed`** — klare Redaktionssprache, unterschiedliche Validator- und CSP-Regeln.
- **Fallback gelber Punkt** — bestehende Stationen (`klassenzimmer`, `musik`) unverändert gültig.

## Verworfene Alternativen

- **`action: link` am Hotspot mit `url`:** dupliziert `medien[]`, erscheint nicht in der Medienliste.
- **Nur `typ: link` mit `openIn: iframe | external`:** ein Typ, aber uneinheitliche Validierung (Pfad vs. URL) und verwirrende Redaktion.
- **iframe ohne Domain-Allowlist:** XSS-/Clickjacking-Risiko bei beliebigen URLs in JSON.
- **Sofort alle drei Stufen fürs Schulfest:** zu hohes Risiko (CSP, Mobile-iframe, DSGVO, Delightex-Login).

## Konsequenzen

- **Code (Stufe 1–3):** `types.ts`, `validate-stations.ts`, `hotspot-overlay.tsx`, `media-player-by-typ.tsx`, neue Viewer `link-viewer` / `embed-viewer`, `media-slot.tsx`, `next.config` CSP, Tests.
- **Doku:** `content-einpflegen.md`, `architektur.md`, Phase-5-Issues.
- **Content:** Icons unter `public/media/{slug}/icons/`; PC-Raum zuerst `typ: link`, später `typ: embed` bei Freigabe.
- **Directus (Phase 5):** Collections um `link`, `embed`, `thumbnail`, Hotspot-`icon` erweitern — Schema an ADR-017 angleichen.
- **Issue #50:** Punkte „Verlinkung externe Lernspiele“, iframe und Hotspot-Icons → Epic **#97**, Unterissues **#98–#100** ([epic-externe-medien-hotspot-marker.md](../github-project/epic-externe-medien-hotspot-marker.md)).
