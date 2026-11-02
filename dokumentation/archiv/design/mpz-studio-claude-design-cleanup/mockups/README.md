# Mockups — Google Stitch (HTML-Export)

**Stand:** 2026-06-22 · Issue [#196](https://github.com/flxln/schulnavigator/issues/196)  
**Quelle:** Google Stitch, Prompts aus [`18-mockup-prompts.md`](../18-mockup-prompts.md)  
**Ablage:** [`stitch_mpz_studio_shell_dashboard/`](./stitch_mpz_studio_shell_dashboard/) — 52× `code.html` + [`studio_precision/DESIGN.md`](./stitch_mpz_studio_shell_dashboard/studio_precision/DESIGN.md)

---

## Verwendung

| Zweck | Vorgehen |
|-------|----------|
| Screen ansehen | `screen.png` (Vorschau) oder `code.html` im Browser |
| Abgleich Spec ↔ Mockup ↔ Code | [`SCREEN-MATRIX.md`](./SCREEN-MATRIX.md) |
| Neue Mockups erzeugen | Prompt aus `18-mockup-prompts.md`; Regenerierung: `node build-mockup-prompts.mjs` |
| Verbindliche IA | [`NAVIGATION-SOLL.md`](../NAVIGATION-SOLL.md) — **gewinnt bei Widersprüchen** |

**Format:** Pro Screen ein Ordner mit `screen.png` + `code.html` (Stitch-Export). Der frühere Plan reiner PNG-Namen (`s1-shell-default.png`) ist durch diese Ordnerstruktur ersetzt.

---

## Lieferumfang

| Kategorie | Anzahl | Hinweis |
|-----------|--------|---------|
| Screens S1–S21 | 51 Varianten | siehe Matrix |
| S24 optional | 1 | `s24_unlock_optional` |
| **Fehlt** | S8 `empty` | Prompt existiert, kein Stitch-Export |
| Design-Tokens | 1 | `studio_precision/DESIGN.md` |

---

## Bekannte Inkonsistenzen (nicht blockierend)

Stitch liefert **zwei visuelle Familien**. Bei Implementierung gilt **GS39** (`app/app/gs39-tokens.css`), nicht die MD3-Stitch-Palette.

### 1. Zwei Token-Familien

| Familie | Sidebar | Beispiel-Ordner |
|---------|---------|-----------------|
| **GS39-nah** | `bg-brand-navy` (#082a50) | `s1_studio_shell_default`, `s11_hotspots_empty`, `s4_dashboard_ok` |
| **MD3-Stitch** | `bg-secondary` (#045faf) | `s19_design_hub_tab_*`, `s17_coach_*`, `s15_dialog_*` |

**Leitplanke:** Navy `#082a50`, Grün `#4b9a23`, Paper `#fcfbf7` — siehe `studio_precision/DESIGN.md` und GS39-Tokens.

### 2. Sidebar-IA

| Problem | Betroffen | Soll (NAVIGATION-SOLL) |
|---------|-----------|------------------------|
| Coach unter **Stationen** statt Globaler Inhalt | `s1_studio_shell_default` | Coach → Gruppe „Globaler Inhalt“ |
| Keine Gruppenlabels (flache Liste) | v. a. `s19_*`, `s17_*`, `s15_*` | 4 Gruppen, 6 Einträge |
| **Gold-Referenz Shell** | `s11_hotspots_empty` | Gruppen korrekt, GS39-Navy |

### 3. Design-Route S19/S20

| Aspekt | Mockup | Soll / Code (#197) |
|--------|--------|---------------------|
| Tab-Labels | „Hub“ / „Brand“ | „Hub-Karte“ / „Brand & Design“ |
| Hub-Inhalt | Karten-Grid | Tabelle (`HubPanel`, breit) |
| Top-Bar S19 | Zusatz-Nav „Dashboard \| Stationen“ | Nur Breadcrumb in `studio-shell` |

### 4. Ist-Code vs. Mockup (bewusst)

- **RoomRoster** + Readiness-Zähler in Sidebar — in Mockups meist fehlend, im Code vorhanden
- **Plan-A-Banner** — nur S2 explizit
- Shell-Navigation **#197 umgesetzt** — Mockups waren teils Vor-Issue-Stand

---

## Abnahme #196

Mockups sind **vorhanden und brauchbar**, aber **nicht pixel- oder IA-homogen**. Design-Freeze gilt als erfüllt über:

1. [`NAVIGATION-SOLL.md`](../NAVIGATION-SOLL.md) (verbindlich)
2. [`17-komponenteninventar-soll.md`](../17-komponenteninventar-soll.md)
3. [`studio_precision/DESIGN.md`](./stitch_mpz_studio_shell_dashboard/studio_precision/DESIGN.md) (Spacing, Komponenten)
4. Diese Mockups als **visuelle Inspiration** pro Screen (Matrix-Spalte „Referenz“)

Post-Mortem: [`post-mortem-196-2026-06-22.md`](../../../reviews/post-mortem-196-2026-06-22.md)
