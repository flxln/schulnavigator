# Coach-Layout — Figur & Sprechblase pro Message

_Ergänzt [ADR-019](../../adr/019-coach-fortschritt-einblendung.md). Umgesetzt in [#192](https://github.com/flxln/schulnavigator/issues/192) (Epic [#191](../../planung/epic-coach-erweiterungen.md))._

**Bezug:** [ADR-019](../../adr/019-coach-fortschritt-einblendung.md) · Coach-Editor [#177](https://github.com/flxln/schulnavigator/issues/177) · Epic [#191](../../planung/epic-coach-erweiterungen.md) · Code: [`coach-layout.ts`](../../../app/lib/coach-layout.ts)

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

- `resolveCoachLayout()` → Inline-Styles in [`mascot-peek-overlay.tsx`](../../../app/components/coach/mascot-peek-overlay.tsx)
- MPZ: `/mpz/studio/coach` — aufklappbarer Layout-Abschnitt, Reset „Auf Standard“ (`layout: null`)
- Validator: `validate:coach` + [`mpz-coach-messages-validation.ts`](../../../app/lib/mpz-coach-messages-validation.ts)

---

_Erfasst: 2026-06-20 · Archiviert nach Umsetzung #192_
