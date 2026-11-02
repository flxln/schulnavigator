# Komponenten-Inventar — Soll (nach Design-Freeze IA)

**Datum:** 2026-06-22  
**Status:** IA-verbindlich; visuelle Details aus Claude Design (Mockups) noch ausstehend  
**Ist-Referenz:** [12-komponenten-inventar-ist.md](./12-komponenten-inventar-ist.md)  
**Navigation:** [NAVIGATION-SOLL.md](./NAVIGATION-SOLL.md)

Mapping **Soll-Komponente → Screen → Änderungstyp** für Phase 4 (#197–#204).

---

## Legende Änderungstyp

| Typ | Bedeutung |
|-----|-----------|
| **BEHALTEN** | Komponente bleibt, ggf. Styling |
| **MODIFY** | Struktur/Props/Layout anpassen |
| **NEU** | Noch nicht im Repo |
| **ENTFÄLLT** | Route/UI entfernen oder in andere Komponente integrieren |
| **REDIRECT** | Page bleibt temporär, leitet um |

---

## Shell & Querschnitt

| Komponente | Screen | Typ | Soll-Änderung |
|------------|--------|-----|---------------|
| `studio-shell.tsx` | S1 | **MODIFY** | Gruppierte Sidebar (4 Gruppen, 6 Einträge); kein Sidebar-CTA „Medien hochladen“; kein Dialog-Audio; Dirty-Badge in Top-Bar (#202) |
| `plan-a-banner.tsx` | S2 | BEHALTEN | — |
| `save-validate-panel.tsx` | S3 | BEHALTEN | — |
| `studio-validation-context.tsx` | S3/S4 | **MODIFY** | Dirty-State für Top-Bar (#202) |
| `studio-dashboard.tsx` | S4 | BEHALTEN | — |
| `design-page-shell.tsx` (Arbeitsname) | S19/S20 | **NEU** | Container `/mpz/studio/design` mit Tab-Umschaltung `hub` \| `brand` (#197) |

---

## Stationen

| Komponente | Screen | Typ | Soll-Änderung |
|------------|--------|-----|---------------|
| `station-grid.tsx` | S5 | BEHALTEN | — |
| `station-detail-shell.tsx` | S6 | **MODIFY** | Tab Dialog immer sichtbar; `dialog-audio`-Tab entfernen; Empty-State „Dialog hinzufügen“ (#199) |
| `station-stammdaten-form.tsx` | S7 | BEHALTEN | — |
| `station-raumbild-upload.tsx` | S7 | BEHALTEN | — |
| `station-medien-table.tsx` | S8 | BEHALTEN | einziger Einstieg zum Medien-Modal |
| `station-medium-edit-form.tsx` | S10 | BEHALTEN | `videoSource` optional, Default `upload` |
| `medium-link-embed-fields.tsx` | S9/S10 | BEHALTEN | — |
| `medium-asset-upload-field.tsx` | S10 | BEHALTEN | — |
| `media-ingest-modal.tsx` | S9 | BEHALTEN | nur von Tab Medien |
| `media-ingest-modal-context.tsx` | S9 | **MODIFY** | kein globaler Sidebar-Opener |
| `media-ingest-form.tsx` | S9 | BEHALTEN | — |
| `mpz-studio-ingest-opener.tsx` | S23 | **REDIRECT** | Route → Stationen; Komponente entfällt (#198) |
| `media-link-embed-form.tsx` | S9 | BEHALTEN | — |
| `station-hotspots-table.tsx` | S11 | **MODIFY** | Sphere-Link intern `/mpz/calib/sphere/{slug}`; kein `target="_blank"` (#201) |
| `station-hotspot-add-form.tsx` | S12 | BEHALTEN | — |
| `station-hotspot-edit-form.tsx` | S12 | BEHALTEN | — |
| `hotspot-icon-upload.tsx` | S12 | BEHALTEN | — |
| `flat-calib-shell.tsx` | S13 | BEHALTEN | — |
| `flat-hotspot-calib.tsx` | S13 | BEHALTEN | — |
| `flat-startpan-calib.tsx` | S13 | BEHALTEN | — |
| `sphere-calib-shell.tsx` | S14 | **NEU** | analog `flat-calib-shell` (#201) |
| `sphere-hotspot-calib.tsx` | S14 | **NEU** | eingebettetes Panel (#201) |
| `sphere-hotspot-calib-overlay.tsx` | S14 | **ENTFÄLLT** | Logik nach `sphere-hotspot-calib` migrieren |
| `station-dialog-panel.tsx` | S15 | **MODIFY** | Segment-Zeile mit Audio Upload/Play/Löschen; Gruppen/Bubble einklappbar (#200) |
| `station-dialog-segment-form.tsx` | S15 | **MODIFY** | Expandable Row / Popover für Audio |
| `station-dialog-gruppe-form.tsx` | S15 | **MODIFY** | einklappbarer Bereich |
| `station-dialog-bubble-form.tsx` | S15 | **MODIFY** | einklappbarer Bereich |
| `dialog-audio-panel.tsx` | — | **ENTFÄLLT** | Logik in Segment-Zeile (#198) |
| `dialog-audio-status-badges.tsx` | S15 | **MODIFY** | in Segment-Zeile integriert |

---

## Globale Module

| Komponente | Screen | Typ | Soll-Änderung |
|------------|--------|-----|---------------|
| `coach-panel.tsx` | S17 | BEHALTEN | — |
| `coach-message-form.tsx` | S17 | BEHALTEN | — |
| `coach-audio-status-badges.tsx` | S17 | BEHALTEN | — |
| `embeds-panel.tsx` | S18 | BEHALTEN | — |
| `hub-panel.tsx` | S19 | **MODIFY** | eingebettet in `design-page-shell` Tab `hub` |
| `brand-panel.tsx` | S20 | **MODIFY** | eingebettet in `design-page-shell` Tab `brand` |
| `deploy-tab.tsx` | S21 | BEHALTEN | — |

---

## Routen (Pages) — Soll

| Route | Datei (Ist) | Typ | Soll |
|-------|-------------|-----|------|
| `/mpz/studio` | `studio/page.tsx` | BEHALTEN | — |
| `/mpz/studio/stationen` | `stationen/page.tsx` | BEHALTEN | — |
| `/mpz/studio/stationen/[slug]` | `stationen/[slug]/page.tsx` | BEHALTEN | — |
| `/mpz/studio/design` | — | **NEU** | `design/page.tsx` (#197) |
| `/mpz/studio/coach` | `coach/page.tsx` | BEHALTEN | — |
| `/mpz/studio/embeds` | `embeds/page.tsx` | BEHALTEN | — |
| `/mpz/studio/hub` | `hub/page.tsx` | **REDIRECT** | → `/design?tab=hub` |
| `/mpz/studio/brand` | `brand/page.tsx` | **REDIRECT** | → `/design?tab=brand` |
| `/mpz/studio/deploy` | `deploy/page.tsx` | BEHALTEN | — |
| `/mpz/studio/dialog-audio` | `dialog-audio/page.tsx` | **REDIRECT** | → `/stationen` (#198) |
| `/mpz/studio/ingest` | `ingest/page.tsx` | **REDIRECT** | → `/stationen` (#198) |
| `/mpz/calib/flat/[slug]` | `calib/flat/[slug]/page.tsx` | BEHALTEN | — |
| `/mpz/calib/sphere/[slug]` | — | **NEU** | `calib/sphere/[slug]/page.tsx` (#201) |

---

## Zusammenfassung

| Typ | Anzahl (ca.) |
|-----|--------------|
| BEHALTEN | 22 |
| MODIFY | 14 |
| NEU | 4 (+ 1 Page-Route) |
| ENTFÄLLT / REDIRECT | 5 |

**Mockup-Lücke:** Visuelle Zustände (Empty/Filled/Error) für geänderte Komponenten warten auf Claude Design — siehe [ROADMAP.md](./ROADMAP.md) Phase 2.4.
