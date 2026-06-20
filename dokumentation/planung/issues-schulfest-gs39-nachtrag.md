# Issues — GS39-Nachtrag: Schulfest, Schulhof-QR & Content-Governance

**Milestone:** Phase 3 (Vorbereitung) + Phase 4 (Live)  
**Fällig:** 26.06.2026 (Schulfest)  
**Status:** Auf GitHub angelegt (**#86–#91**); Stand-Sync **2026-06-15** (Playbook #87, QR-Druck #89/#130, 12-Raum-Set)

**Quellen:**

- Protokoll [`protokolle/analyse-schulnavigator-gs39-nachtrag.md`](../../protokolle/analyse-schulnavigator-gs39-nachtrag.md) (Gespräch 2026-06-03)
- Transkripte `auftraggeber/transkripte/39-grundschule-3.md`, `39-grundschule-4.md`
- Council of 5 (2026-06-05): schmaler Pilot, kein 11× Tür + 11× Hof, Content vor MPZ-Umsetzung

**Technik unverändert:** [ADR-005](../adr/005-zugangskontrolle-token.md) (`fest`/`heft`), Raum-QR → `/raum/[slug]`, Entry → `/eintritt?t=…`

**Betrifft bestehende Issues:** [#39](./issues-phase-4.md) (QR an Räumen) — Scope **ersetzen**, nicht parallel „11× Tür“ drucken.

---

## Übersicht

| Rolle | Nr. | Titel (kurz) | Labels | Status (2026-06-15) |
|-------|-----|--------------|--------|---------------------|
| **Epic (Parent)** | `#86` | GS39 Schulfest: QR-Strategie & Playbook (Nachtrag) | `org` | offen (#90, #91) |
| Unterissue | `#87` | Schulfest-Playbook dokumentieren | `org`, `content` | **geschlossen** |
| Unterissue | `#88` | Content-Checkliste: Idee steht → MPZ | `content`, `extern` | offen |
| Unterissue | `#89` | Outdoor-QR: Drucksubset + Spezifikation | `org`, `tech` | offen (Sonnentest) |
| Unterissue | `#90` | Abstimmung Schule: Playbook freigeben | `org`, `extern` | offen |
| Unterissue | `#91` | Mobilfunk-/WLAN-Test Schulhof | `org`, `tech` | offen |
| Erweiterung | `#130` | QR-Druck-PDFs (A4 2up + Grid 3 cm) | `tech` | **geschlossen** (PR #131) |

**Empfohlene Reihenfolge:** `#90` (Klärung) → `#87` (Playbook) → `#88` (Content-Status) → `#89` (Druck) → `#39`/`#40` anbringen → `#91` (Test).

---

## Epic `#86` — GS39 Schulfest: QR-Strategie & Playbook (Nachtrag)

**Labels:** `org`, `blocker`  
**Assignee:** Felix  
**Milestone:** Phase 4

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Nach dem Projektgespräch vom **2026-06-03** (Teil 3 + 4) gilt für das **Schulfest am 26.06.2026** eine andere QR-Logik als für den **Tag der offenen Tür**:

- Schulfest: nur ~**5 Räume** physisch offen (Turnhalle, Hof, Speiseraum, Werken, Mediathek, evtl. ein Klassenzimmer).
- Geschlossene Stationen: **QR auf dem Schulhof** (Schild/Baum/Station) → gleicher Slug `/raum/[slug]`, virtueller Inhalt ohne Raumbetreten.
- **Kein** Doppel-Setup: nicht 11× Tür-QR **und** 11× Hof-QR.
- Modus am Festtag: **`fest`** (Entry + Raum-QRs für Freischaltung im Hub) — [ADR-005](https://github.com/flxln/schulnavigator/blob/main/dokumentation/adr/005-zugangskontrolle-token.md).
- Content: **Schul-Idee vor MPZ-Umsetzung** (keine gemeinsame Ideenfindung unter Zeitdruck).

Protokoll: [`protokolle/analyse-schulnavigator-gs39-nachtrag.md`](https://github.com/flxln/schulnavigator/blob/main/protokolle/analyse-schulnavigator-gs39-nachtrag.md)

Spezifikation Issues: [`dokumentation/planung/issues-schulfest-gs39-nachtrag.md`](https://github.com/flxln/schulnavigator/blob/main/dokumentation/planung/issues-schulfest-gs39-nachtrag.md)

## Ziel

Verbindliches **Schulfest-Playbook** + abgestimmtes **QR-Drucksubset** + **Content-Status** pro Raum — damit [#39](https://github.com/flxln/schulnavigator/issues/39) und [#40](https://github.com/flxln/schulnavigator/issues/40) mit korrektem Scope umgesetzt werden.

## Unterissues

- [ ] `#87` — Playbook-Dokumentation (`anleitungen/`)
- [ ] `#88` — Content-Checkliste (Schule)
- [ ] `#89` — Outdoor-QR Drucksubset + Spec
- [ ] `#90` — Freigabe mit Schule (Sten/Tina/Thomas)
- [ ] `#91` — Mobilfunk-/WLAN-Test Hof

## Nicht im Scope

- Neuer Zugangsmodus (weiterhin `fest`/`heft`)
- 11 vollständige 360°-Virtualisierungen bis 26.06. (statischer Content reicht für Hof-Pilot)
- Tag der offenen Tür — separates Playbook-Kapitel, kein Schulfest-Blocker

## Epic erledigt wenn

- [ ] Playbook von Schule **schriftlich** bestätigt (Kommentar in `#90` oder Protokoll-PDF)
- [ ] Druckliste: Entry `fest` + **12** Raum-QRs (alle Stationen generiert; physische Platzierung Tür vs. Hof laut Playbook) — `manifest-schulfest.json` geprüft
- [ ] [#39](https://github.com/flxln/schulnavigator/issues/39) Body/Checkliste an Nachtrag angepasst
- [ ] Mobilfunk-Test (#91) dokumentiert (Datum, Ort, Gerät, Ergebnis)
```

---

## `#87` — Schulfest-Playbook dokumentieren

**GitHub:** https://github.com/flxln/schulnavigator/issues/87 — **geschlossen** (2026-06-15, PR #131)

**Labels:** `org`, `content`  
**Parent:** `#86`  
**Assignee:** Felix  
**Milestone:** Phase 3 (Fällig: **12.06.2026**)

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Parent: #86. Auswertung Nachtrag + Council-Empfehlung: **zwei Veranstaltungslogiken**, ein technisches System.

## Ziel

Neue Anleitung **`anleitungen/schulfest-gs39-playbook.md`** (Arbeitstitel), die Team und Schule am 26.06. abarbeiten können.

## Inhalt (Mindestumfang)

### 1. Schulfest (26.06.) — Modus `fest`

| Aspekt | Vorgabe |
|--------|---------|
| Entry-QR | **Ein** sichtbarer Entry am Schuleingang (`fest-2026`) |
| Physische Räume | Liste der **~5** offenen Bereiche + wer dort steht |
| Hof-Virtualisierung | **2–4** zusätzliche Slugs nur auf dem Hof (Beschriftung = Raumname) |
| QR-Platzierung | Hof-Station / Schild / Baum — **nicht** an geschlossenen Klassentüren |
| Begleitung | Optional 1 Buddy-Station am Hof (Scan-Hilfe) — ohne Buddy: niedrige Scan-Rate einplanen |
| Tablet-Fallback | Verweis [#41](https://github.com/flxln/schulnavigator/issues/41) |

### 2. Tag der offenen Tür (separates Datum)

- Menschen in (fast) allen Räumen; App **ergänzt**, ersetzt nicht.
- Raum-QR eher **an der Tür**; `heft`/`fest` je nach Material trennen.
- Kurzer Absatz „Textvariante mit Live-Gespräch“ vs. „nur virtuell“.

### 3. Glossar (Pflichtbegriffe)

Entry-QR, Raum-QR, `fest`, `heft`, DaZ (nicht „DATZ“), Slug.

### 4. Notfall

Mobilfunk schwach → Tablet; App down → MPZ-Kontakt [#42](https://github.com/flxln/schulnavigator/issues/42).

## Akzeptanzkriterien

- [ ] Datei im Repo, verlinkt in [`anleitungen/fuer-entwickler.md`](../../anleitungen/fuer-entwickler.md) (Abschnitt Schulfest)
- [ ] Verweis aus [`protokolle/analyse-schulnavigator-gs39-nachtrag.md`](../../protokolle/analyse-schulnavigator-gs39-nachtrag.md) (Abschnitt „Empfehlung“)
- [ ] Tabelle „Slug → physisch offen | Hof-QR | nur Hub“ ausgefüllt (**Platzhalter** bis `#90`)

## Verknüpfungen

- [#39](https://github.com/flxln/schulnavigator/issues/39) — QR befestigen (Scope-Anpassung)
- [`qr-codes-drucken.md`](../../anleitungen/qr-codes-drucken.md)
```

---

## `#88` — Content-Checkliste: Idee steht → dann MPZ

**Labels:** `content`, `extern`  
**Parent:** `#86`  
**Assignee:** Thomas / Sten / Tina (Schule) · MPZ: Felix  
**Milestone:** Phase 3 (Fällig: **12.06.2026**)

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Parent: #86. Thomas (Schule): **keine didaktische Ideenfindung mit MPZ unter Zeitdruck**. MPZ liefert **Umsetzung** (JSON, Medien, Hotspots), wenn die Raum-Idee steht.

Referenzlängen im Gespräch: **PC-Raum**, **DaZ-Raum** — Vorbild für Werken, Kunst, …

## Ziel

Für alle **11 Stationen** (Slugs laut [issues-phase-3.md](./issues-phase-3.md)) ist vor Start der MPZ-Produktion dokumentiert:

1. **Idee/Konzept** (1–3 Sätze, von Lehrkraft)
2. **Verantwortliche Lehrkraft**
3. **Status:** `idee-steht` | `in-arbeit` | `an-mpz` | `live`
4. **Schulfest-Relevanz:** `physisch-offen` | `hof-qr` | `nicht-am-fest` | `open-house-only`

## Lieferform (wählt Team)

- [ ] Tabelle in `auftraggeber/material/` oder
- [ ] Kommentar-Checkliste in diesem Issue (11 Zeilen)

### Vorlage (pro Zeile)

| Slug | Raum | Idee steht? | Verantwortlich | Schulfest-Rolle | MPZ-Status |
|------|------|-------------|----------------|-----------------|------------|
| `werken` | Werken | ☐ | | physisch-offen | |
| `musik` | Musik | ☐ | | hof-qr | |
| … | | | | | |

## Akzeptanzkriterien

- [ ] **Mindestens** alle Slugs mit Rolle `physisch-offen` oder `hof-qr` haben Status `idee-steht` bis **12.06.**
- [ ] MPZ beginnt Integration (#28–#37) nur für Zeilen mit `idee-steht`
- [ ] Grenzfall geklärt: formale Beratung (Länge, Format) ≠ „Ideenfindung“ — ein Satz in Playbook #87

## Risiko wenn offen

Engpass ist **Schule**, nicht URL-Logik (Council-Analyst). Ohne Ideen: leere Stationen am Festtag trotz funktionierender QR.
```

---

## `#89` — Outdoor-QR: Drucksubset & Spezifikation

**GitHub:** https://github.com/flxln/schulnavigator/issues/89 — offen (nur Sonnentest ausstehend)

**Labels:** `org`, `tech`  
**Parent:** `#86`  
**Assignee:** Felix / Sten  
**Milestone:** Phase 3 (Fällig: **20.06.2026**)

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Parent: #86. Hof-QRs: Wetter, Sonne, Lesbarkeit. Bestehend: [`anleitungen/qr-codes-drucken.md`](../../anleitungen/qr-codes-drucken.md) (innen/trocken).

Council/Research: Outdoor **Error Correction Level H**, **≥3–5 cm** (besser 5 cm), **matt laminiert**, Sonnentest; Sweet Spot **5–10** Stationen gesamt.

## Ziel

1. **Druckset** für Schulfest: alle **12** Slugs in `SCHULFEST_QR_SLUGS` (Räume auch ohne vollständigen Content nutzbar); physische Platzierung (Tür vs. Hof) unabhängig im Playbook #87.
2. **Outdoor-Abschnitt** in `qr-codes-drucken.md` oder Playbook #87.

## Technische Aufgaben

- [x] Liste `SCHULFEST_QR_SLUGS` in `app/scripts/qr-config.mjs` — alle 12 Räume (2026-06-15)
- [x] `npm run generate:qr -- --only=slug1,slug2` — Subset bei Bedarf
- [x] `manifest-schulfest.json` nach `generate:qr --preset=schulfest`
- [x] Druck-PDFs mit Label/Subtitle (`qr-schulfest-a5-2up.pdf`, `qr-schulfest-a4-grid-3cm.pdf`) — Issue **#130**

## Druck-Spezifikation (Outdoor)

| Parameter | Wert |
|-----------|------|
| Mindestgröße | **5 × 5 cm** (Hof, Erwachsene + Kinder) |
| Fehlerkorrektur | **Level H** (Generator prüfen / dokumentieren) |
| Material | Matt laminiert, kein Hochglanz |
| Beschriftung | Raumname + „Scannen → Station in der App“ |
| Test | Scan aus **1 m**, **Sonnenlicht** (Mittag), zwei Geräte (iOS + Android) |

## Akzeptanzkriterien

- [x] Druckset generiert (`generate:qr --preset=schulfest`: 12 Raum + Entry `fest`, PDFs #130)
- [ ] Sonnentest protokolliert (Datum, Foto optional, Scan ja/nein)
- [x] [#39](https://github.com/flxln/schulnavigator/issues/39) / Playbook referenzieren Outdoor-Spec (Abschnitt 4)

## Abhängigkeit

- Blockiert durch freigegebene Slug-Liste aus **#87** / **#90**
```

---

## `#90` — Abstimmung Schule: Schulfest-Playbook freigeben

**Labels:** `org`, `extern`  
**Parent:** `#86`  
**Assignee:** Sten / Tina / Thomas  
**Milestone:** Phase 3 (Fällig: **10.06.2026**)

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Parent: #86. Im Transkript **widersprüchlich**: Sten zunächst „nicht am Schulfesttag“, später Schulhof-QR „macht mehr Sinn“. **Organisatorisch klären**, nicht technisch blockiert.

## Ziel

Ein kurzes Abstimmungsgespräch (30–45 Min.) mit **festgelegter** Schulfest-Nutzung:

- [ ] App am **26.06.** ja/nein — wenn ja: nur Hof + offene Räume
- [ ] Welche **5** physischen Bereiche + welche **2–4** Hof-Virtualisierungen (Slugs)
- [ ] Wer steht wo (Lehrkraft / Schüler-Buddy)
- [ ] Entry-QR am Eingang: wer erklärt Besuchern den ersten Scan?

## Agenda (Vorschlag)

1. Demo Hub + Scanner (`fest-2026`) — 10 Min.
2. Durchgehen Entwurf Playbook #87 — 15 Min.
3. Content-Status #88 — 10 Min.
4. Termin Mobilfunk-Test #91 — 5 Min.

## Akzeptanzkriterien

- [ ] Kommentar in diesem Issue: „freigegeben am …“ + Namen
- [ ] Widerspruch Transkript in Playbook #87 als **entschiedene** Regel dokumentiert
- [ ] Slug-Tabelle in #87 ausgefüllt

## MPZ-Vorbereitung

Felix: Link `https://schulnavigator.mpz.schule`, Test-Entry, Ausdruck 1× Entry + 1× Hof-QR Probe.
```

---

## `#91` — Mobilfunk- und WLAN-Test Schulhof

**Labels:** `org`, `tech`  
**Parent:** `#86`  
**Assignee:** Felix / Sten  
**Milestone:** Phase 3 (Fällig: **20.06.2026**)

### GitHub-Issue-Body (Vorlage)

```markdown
## Kontext

Parent: #86. Projektplan: Mobilfunk primär, WLAN-Ausfall-Risiko. Council: DE **4G-Außenabdeckung hoch**; Engpass eher **Schulhof-WLAN-Kapazität** und **Video-Last**, nicht fehlendes Netz generell.

## Ziel

Vor dem 26.06. auf dem **Schulhof** (gleiche Tageszeit wie Fest, wenn möglich):

| Test | Gerät | Ergebnis |
|------|-------|----------|
| Entry-URL laden | | ☐ OK / ☐ langsam / ☐ fail |
| Raum mit Video | | ☐ OK / ☐ buffert |
| Raum nur Bild+Text | | ☐ OK |
| In-App-Scanner Raum-QR | | ☐ OK |

## Akzeptanzkriterien

- [ ] Protokoll in Issue-Kommentar oder `anleitungen/schulfest-gs39-playbook.md` (Abschnitt Test)
- [ ] Bei Video-Problemen: Entscheidung kürzere Clips / statischer Fallback für Hof-Stationen
- [ ] Bezug [#38](./issues-phase-3.md) (Abschlusstest) — Hof explizit, nicht nur Klassenraum-WLAN

## Hinweis

Gast-WLAN der Schule (falls vorhanden): SSID, Passwort, max. gleichzeitige Nutzer — mit Schulleitung klären (#90).
```

---

## Anpassung bestehender Issues (kein neues Issue)

### [#39 — QR-Codes an Räumen befestigen](./issues-phase-4.md) — Scope-Änderung

**Ersetzen** in `issues-phase-4.md` und auf GitHub:

| Alt (vor Nachtrag) | Neu (nach Nachtrag, 2026-06-15) |
|--------------------|-----------------------------------|
| 11 Raum-QRs an **Türen** | **12** Raum-QRs generiert; **physische** Platzierung laut Playbook (Tür/Innen oder Hof) |
| Alle 11 gleich behandeln | Geschlossene Räume: QR **nicht** an Klassentür, ggf. Hof-Virtualisierung (gleicher Slug) |

**Zusatz-Checkliste #39:**

- [ ] Parent/Epic #86 erledigt bzw. Playbook freigegeben (#90)
- [ ] Outdoor-QRs laminiert + beschriftet (#89)
- [ ] Kein QR in geschlossenen Klassenräumen „aus Gewohnheit“

### [#40 — Entry-QR am Schuleingang](./issues-phase-4.md)

Unverändert in der Idee; Hinweistext an Schulfest-Playbook #87 koppeln („danach Hof- oder Raum-Station scannen“).

---

## Sync-Regel

1. ~~Issues **#86–#91** auf GitHub anlegen~~ — erledigt.
2. Epic #86 als Parent im Body der Unterissues (`Parent: #86`).
3. **#39** Body an Nachtrag angepasst (2026-06-15).
4. Zeile **GitHub:** unter Abschnitten pflegen (siehe #87, #89).
5. [`README.md`](./README.md) Checkliste aktualisieren.
