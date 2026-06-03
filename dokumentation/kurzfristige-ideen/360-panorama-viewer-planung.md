# 360°-Panorama-Viewer — Planung

**Stand:** 2026-06-03  
**Status:** Planung (noch kein ADR)  
**Bezug:** [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md) (Gyro-Viewer MVP) · Issue [#50](../github-project/issues-phase-5.md) (Wunschliste Post-Fest) · [`projektplan.md`](../projektplan.md) (Langfrist 2027+)

Die Schule bzw. das MPZ will das Feature mit **360°-Kamera-Aufnahmen** (equirectangular / Kugelpanorama) wieder aufnehmen. Dieses Dokument bündelt den bisherigen Stand, offene Entscheidungen, einen Spike-Vorschlag und eine grobe Umsetzungsphasen — Grundlage für **ADR-014** und GitHub-Issues, sobald die Klärungsfragen beantwortet sind.

---

## Kurz: Was sich von heute unterscheidet

| | **Heute (ADR-006)** | **Geplant (360°)** |
|---|---------------------|-------------------|
| Bild | Flaches Quer-/Panorama-Foto (2:1 bis 2,5:1) | **Equirectangular** (2:1, typ. 4096×2048 oder höher) |
| Bewegung | Gyro mappt auf **horizontalen** `translateX` | Blickrichtung in der **Kugel** (Yaw/Pitch), meist Gyro + Touch-Drag |
| Rundumblick | Nur Ausschnitt des breiten Fotos | Voller **360° horizontal**, oft auch vertikal |
| Hotspots | `x`, `y` ∈ [0,1] auf der Bildebene | **Yaw/Pitch** (Sphäre) oder Library-eigene Koordinaten |
| Library | Eigenbau (`room-image-pane`, keine 3D-Lib) | z. B. Photo Sphere Viewer, Pannellum, Marzipano |
| Content | Handy-Stitch / breites JPEG | **360°-Kamera** oder spezielle App |

ADR-006 schließt 360° **bewusst aus dem MVP** aus — nicht weil es unerwünscht ist, sondern wegen Aufwand, anderem Material und fehlender Library. Ein neues Feature **ersetzt ADR-006 nicht automatisch**; es braucht einen Folge-ADR, der Koexistenz oder Migration regelt.

---

## Zielbild (Entwurf — mit Auftraggebern bestätigen)

**Nutzererlebnis:** Auf `/raum/[slug]` steht man „in“ dem Raum, dreht das Handy oder wischt, sieht den vollen Rundumblick und tippt auf Hotspots (Medien, ggf. weiterhin Maskottchen-Dialog).

**Nicht-Ziele (v1, Vorschlag):**

- Kein WebXR / Kamera-AR (bleibt separates Post-Fest-Thema, [#50](../github-project/issues-phase-5.md))
- Kein Multi-Room-Tour innerhalb einer Kugel (ein Panorama = eine Station)
- Kein Custom-Admin — Content weiter JSON / später Directus ([ADR-003](../adr/003-content-mvp-json-directus.md))

---

## Offene Klärungsfragen (vor Technik-Spike)

Diese Punkte sollten **MPZ + Schule** in einem kurzen Termin (30–45 min) klären; ohne Antworten bleibt der Spike spekulativ.

### Content & Hardware

1. **Welche 360°-Kamera** (Modell, schon vorhanden?) — Ricoh Theta, Insta360, Klassen-iPad-App, externer Dienstleister?
2. **Exportformat:** JPEG equirectangular 2:1? Dual-Fisheye-Rohdaten? Braucht die Schule ein Stitching-Tool?
3. **Umfang:** Alle **11** Stationen neu aufnehmen oder **Pilot** (1–2 Räume, z. B. `musik`, `daz`)?
4. **Zeitplan:** Noch vor nächstem Schulfest / Tag der offenen Tür oder bewusst **nach** dem 26.06.-MVP?
5. **Qualität vs. Dateigröße:** Zielgröße pro Raum (z. B. max. 2–4 MB WebP nach Export)? WLAN am Fest ([`projektplan.md`](../projektplan.md) Risiko WLAN)?

### Produkt & UX

6. **Ersetzen oder ergänzen?** Nur 360°, oder **Fallback** auf heutigen Gyro-Viewer, wenn `bild` alt / `viewer: flat`?
7. **Dialog-Maskottchen** ([ADR-011](../adr/011-dialog-mascot-hotspots.md)): Weiter in der Szene (PNG auf Kugel) oder Cutscene / HUD — 360° macht „Figuren im Raum“ deutlich aufwendiger?
8. **Tablet** ([ADR-012](../adr/012-tablet-ipad-responsive-layout.md)): Primär iPad am Stand — reicht Touch-Drag ohne Gyro?

### Recht & Betrieb

9. **Persönlichkeitsrechte / DSGVO** in 360°-Aufnahmen (Gesichter, Namen an Tafeln) — Freigabe-Prozess?
10. **Hosting:** Weiter `public/stations/` im Repo ([ADR-004](../adr/004-video-hosting-mpz.md)-Logik) oder größere Dateien auf MPZ-CDN?

---

## Technische Optionen (für Spike)

Kriterien: **Mobile Safari**, Bundle-Größe, React/Next.js **Client Component**, Hotspot-API, Lizenz, Wartung.

| Option | Kurz | Pro | Contra |
|--------|------|-----|--------|
| **[Photo Sphere Viewer](https://photo-sphere-viewer.js.org/)** v5 + `@photo-sphere-viewer/core` | Aktiv, WebGL/Canvas | Marker-Plugin, Gyro-Plugin, gute Doku, Touch | Neue Dependency, Lernkurve Sphären-Koordinaten |
| **Pannellum** | Leicht, etabliert | Einfach, klein | Weniger „React-native“, Hotspots manueller |
| **Marzipano** | Google-heritage | Performant | Weniger Community als PSV |
| **A-Frame** | Full VR-Stack | Mächtig | Overkill, großes Bundle |
| **Eigenbau WebGL** | — | Volle Kontrolle | Unverhältnismäßig teuer |

**Spike-Empfehlung:** Eine Station (`musik` oder Test-Panorama) mit **Photo Sphere Viewer** + Gyro-Plugin + einem Marker — auf realem iPhone unter HTTPS messen (FPS, Ladezeit, Speicher).

**Build-Kontext:** Alles unter `app/` ([`build-kontext-submodule-regeln.md`](../build-kontext-submodule-regeln.md)); Panorama-Dateien in `app/public/stations/360/` o. ä.

---

## Architektur (Vorschlag)

### Viewer-Strategie

```
RaumStationClient
  └─ wenn station.viewer === 'equirectangular' (oder panorama360 gesetzt)
        └─ SphereRaumViewer (neu, Client-only, dynamic import ssr:false)
     sonst
        └─ RaumViewer (bestehend, ADR-006)
```

- **Kein** Big-Bang: Bestehende 11 Stationen laufen weiter auf `bild` + Gyro, bis Content da ist.
- Gemeinsame **Shell** beibehalten: TopBar, Chip, Medien-Panel, Besuch-Badge, Dialog-Steuerung (#72).

### Datenmodell (Entwurf)

Erweiterung in `stations.json` / `Station` ([`app/lib/types.ts`](../../app/lib/types.ts)) — exakte Felder im ADR festnageln:

```ts
/** Default: 'flat' — heutiges Verhalten (ADR-006). */
viewer?: 'flat' | 'equirectangular'

/** Pfad zu equirectangular 2:1 (z. B. /stations/360/musik.webp). */
panorama360?: string

/** Sphärische Hotspots; bei viewer flat weiter hotspots mit x/y. */
hotspots360?: Array<{
  id: string
  label?: string
  yaw: number   // Grad oder rad — Spike festlegen
  pitch: number
  action?: 'medium' | 'dialog'
  mediumId?: string
  mascot?: 'frieda' | 'otto'
}>
```

- `validate-stations` / `validate-station-assets.mjs`: Aspect 2:1, Max-Größe, Pflichtfelder pro `viewer`.
- **Directus später:** gleiche Felder in Collection „Station“.

### Betroffene Code-Bereiche

| Bereich | Änderung |
|---------|----------|
| `components/raum-viewer/` | Neu: `sphere-raum-viewer.tsx` oder Unterordner `sphere/` |
| `components/raum-station-client.tsx` | Verzweigung `viewer`, `recenter` ggf. „Blick nach vorne“ |
| `lib/raum-viewer/hit-test-hotspot.ts` | Nur flat; neues `hit-test-hotspot-sphere.ts` oder Library-Callbacks |
| `hotspot-overlay.tsx` | Flat; Marker über PSV-Plugin |
| Dialog ([ADR-011](../adr/011-dialog-mascot-hotspots.md), [013](../adr/013-dialog-blase-mitpan.md)) | **Eigene Phase** — `onPanChange` existiert nur für flat |
| `auftraggeber/material/stationen/zuordnung-stationen-bilder.md` | Abschnitt 360°-Lieferformat |
| `anleitungen/fuer-entwickler.md` | Aufnahme, Export, Hotspot-Setzen |

---

## Abhängigkeiten & Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
|--------|------------|---------------|
| Große Dateien (4–8 MB/Raum) | Langsamer Erstbesuch, Repo-Bloat | WebP, Auflösungs-Cap, optional CDN |
| Maskottchen auf Kugel | Hoher UI-Aufwand, schlechte Lesbarkeit | v1: Dialog nur Cutscene oder 2D-Overlay fix |
| Zwei Viewer pflegen | Doppelte Tests | Klare `viewer`-Flag, gemeinsame Shell-Tests |
| iOS ohne Gyro-Erlaubnis | Nur Wischen | PSV Touch standardmäßig |
| [#76](https://github.com/flxln/schulnavigator/issues/76) Tablet-Hero | Andere Container-Höhe | Spike auf iPad 768×1024 |
| Scope vs. Schulfest | Verzug andere Features | Pilot + Flag, kein Zwang alle 11 |

---

## Phasen & grobe Aufwände

| Phase | Inhalt | Ergebnis | Grob |
|-------|--------|----------|------|
| **0 — Klärung** | Workshop Fragen oben | Go/No-Go, Pilot-Räume, Kamera-Workflow | 0,5–1 PT org |
| **1 — Spike** | 1 Panorama, PSV, Gyro, 1 Marker, iPhone | Spike-Notiz + Library-Entscheid | 1–2 PT dev |
| **2 — ADR-014** | Ersetzen/Coexistenz, Felder, Library | ADR `entschieden`, `entscheidungen.md` | 0,5 PT |
| **3 — Viewer MVP** | `SphereRaumViewer`, `viewer`-Flag, Fallback flat | 1 Pilot-Station in JSON | 3–5 PT |
| **4 — Hotspots & Medien** | `hotspots360`, Panel-Anbindung wie heute | `musik` voll nutzbar | 2–3 PT |
| **5 — Dialog-Strategie** | Maskottchen in 360° (oder bewusst aus) | ADR-Nachtrag oder ADR-015 | 2–8 PT (stark abhängig) |
| **6 — Content-Rollout** | MPZ liefert 11 Panoramen, Validierung | `zuordnung-stationen-bilder.md` | parallel MPZ |
| **7 — Aufräumen** | Deprecation flat? Metriken, Doku | nur wenn alle Stationen 360° | optional |

**Gesamt (ohne Dialog-Komplexität):** ca. **8–12 PT** Entwicklung + Content parallel.

---

## GitHub-Issues (Vorschlag nach Klärung)

| Issue | Titel |
|-------|--------|
| Epic | 360°-Panorama-Viewer (ADR-014) |
| Spike | PSV + Gyro + 1 Marker, iPhone HTTPS |
| Feature | `viewer` / `panorama360` Schema + Validierung |
| Feature | `SphereRaumViewer` + Integration `RaumStationClient` |
| Feature | Sphärische Hotspots + Medien-Panel |
| Content | #17-Erweiterung: 360°-Lieferformat & Pilot-Aufnahmen |
| Follow-up | Dialog/Maskottchen in 360° (eigener Issue) |
| Doku | Entwickler-Anleitung Aufnahme/Export |

Issue **#50** ([`issues-phase-5.md`](../github-project/issues-phase-5.md)): Checkbox „360°-Panorama-Viewer“ nach Epic-Anlage abhaken oder durch Epic ersetzen.

---

## Nächste konkrete Schritte

1. **Termin MPZ/Schule:** Offene Klärungsfragen (oben) — insbesondere Kamera, Pilot-Räume, Zeitplan.
2. **Test-Panorama beschaffen:** Eine equirectangular-Datei (2:1) nach MPZ-Standard in `app/public/` (Spike, nicht ins Submodule `auftraggeber/` als Laufzeit-Abhängigkeit).
3. **Spike-Branch:** `SphereRaumViewer` hinter Feature-Flag, Route nur `/raum/musik?sphere=1` oder Test-Slug — **ohne** Produktions-Umschaltung aller Stationen.
4. **ADR-014 anlegen** (Status `offen` → nach Spike `entschieden`), ADR-006 um Zeile „360°: siehe ADR-014“ in Konsequenzen ergänzen (nicht Status ändern).
5. **`architektur.md`:** Verweis auf Planungsdokument bis ADR-014 entschieden.

---

## Referenzen im Repo

- Entscheidung MVP: [ADR-006](../adr/006-raum-viewer-gyro-hotspots.md)
- Implementierung flat: [`architektur.md`](../architektur.md) (Raum-Viewer), Issues **#55**, **#56**
- Content-Briefing flat: [`zuordnung-stationen-bilder.md`](../../auftraggeber/material/stationen/zuordnung-stationen-bilder.md)
- Wunschliste: [`issues-phase-5.md`](../github-project/issues-phase-5.md) **#50**
- UI-Prototyp (flat „Panorama“-Platzhalter, nicht 360°): `auftraggeber/Virtueller Schulrundgang/`
