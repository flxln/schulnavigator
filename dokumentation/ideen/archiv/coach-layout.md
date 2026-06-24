# Coach-Layout — Figur & Sprechblase pro Message

_Ergänzt [ADR-019](../../adr/019-coach-fortschritt-einblendung.md). Umgesetzt in [#192](https://github.com/flxln/schulnavigator/issues/192) (Epic [#191](../../planung/archiv/epics/epic-coach-erweiterungen.md))._

**Bezug:** [ADR-019](../../adr/019-coach-fortschritt-einblendung.md) · Coach-Editor [#177](https://github.com/flxln/schulnavigator/issues/177) · Epic [#191](../../planung/archiv/epics/epic-coach-erweiterungen.md) · Code: [`coach-layout.ts`](../../../app/lib/coach-layout.ts)

**Status:** ✅ umgesetzt (2026-06-20) · Post-Mortem: [post-mortem-192](../../reviews/post-mortem/post-mortem-192-2026-06-20.md)

**Produktentscheidung:** Sprechblasen-Versatz als **Delta zur CSS-Default-Position** (placement-abhängig); `placement` bleibt grober Anker. `bubbleMaxWidth` als **absoluter rem-Wert** (nicht Container-Anteil). `mascotSize` viewport-basiert (vh), **nicht** ADR-014.

---

## Schema (`CoachMessage.layout`, optional)

| Feld | Typ | Semantik |
|------|-----|----------|
| `mascotSize` | number | Anteil Viewport-Höhe (0.15–0.55, Default 0.42) |
| `mascotOffsetX` / `mascotOffsetY` | number | rem — Versatz Figur bzw. Duo-Row |
| `bubbleMaxWidth` | number | rem (12–32, Default 22) → `min(100%, n rem)` |
| `bubbleOffsetX` / `bubbleOffsetY` | number | rem — Delta zur CSS-Default-Blasenposition |
| `bubbleFontSize` | number | px (12–20, Default 15) |
| `mascotFlipX` / `mascotFlipY` | boolean | Horizontal/vertikal spiegeln (nur `true` persistiert) |

Beispiel:

```json
"layout": {
  "mascotSize": 0.38,
  "bubbleOffsetY": -0.25,
  "mascotFlipX": true
}
```

Fehlendes `layout` → identisches Rendering wie vor #192.

---

## Runtime & Studio

- `resolveCoachLayout()` → Inline-Styles (`height`, `maxWidth`) in [`mascot-peek-overlay.tsx`](../../../app/components/coach/mascot-peek-overlay.tsx); **keine** festen px/vh-Deckel mehr in `sn-theme.css` (Fix 2026-06-24)
- MPZ: `/mpz/studio/coach` — aufklappbarer Layout-Abschnitt, Reset „Auf Standard“ (`layout: null`)
- Validator: `validate:coach` + [`mpz-coach-messages-validation.ts`](../../../app/lib/mpz-coach-messages-validation.ts)

### `mascotSize` — Rendering

| Quelle | Wert |
|--------|------|
| JSON / MPZ | 0,15–0,55 (Default **0,42**) |
| Inline `height` | `{mascotSize × 100}vh` |
| Inline `maxWidth` | `min(45%, {mascotSize × 100}vh)` — skaliert mit der Figur, verhindert Überlauf bei `left`/`right` |

**Häufiger Fehler (behoben 2026-06-24):** Früher setzte `.sn-coach-peek__img` in CSS `height: min(42vh, 260px)` und `max-width: min(45%, 200px)` — damit wirkte `layout.mascotSize` ab ~0,3 oft **nicht sichtbar**. Größe kommt ausschließlich aus `resolveCoachLayout()`.

**Kalibrierung:** `localStorage` (`sn_coach_seen_heft` / `sn_coach_seen_fest`) leeren → `/` mit Heft-Cookie → `welcome-hub` erneut. Wert ändern → Seite hart neu laden (JSON wird beim Build/HMR eingebunden).
