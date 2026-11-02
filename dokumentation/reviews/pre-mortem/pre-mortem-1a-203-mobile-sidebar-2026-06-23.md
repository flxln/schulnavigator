---
tags:
  - pre-mortem
  - 01a-code-praxis
  - issue-203
erstellt: 2026-06-23
---
# Pre-Mortem 1a — Code-Praxis: Mobile Sidebar (#203)

Basierend auf Plan `.cursor/plans/mobile_sidebar_#203_09012142.plan.md` und Code-Basis (`studio-shell.tsx`).

### 1. Body-Scroll-Lock Leak beim Resize (State Leak)
- **Warum später teuer:** Der Plan definiert, dass bei offenem Drawer (`navOpen && below lg`) der Body-Scroll gesperrt wird. Wenn das Fenster skaliert wird (z. B. durch Drehen eines Tablets von Hoch- in Querformat), ändert sich die CSS-Darstellung (`lg:hidden` blendet den Overlay aus). Da das bloße Resizen aber keinen Re-Render in React triggert, bleibt `navOpen` weiterhin `true` und der Body bleibt dauerhaft gesperrt, obwohl kein Drawer mehr sichtbar ist.
- **Wann es beißt:** Ein Nutzer öffnet auf einem Tablet im Portrait-Modus die Navigation und dreht das Gerät ins Landscape-Format. Die Navigation klappt weg (wird zur Desktop-Sidebar), aber die Seite lässt sich nicht mehr scrollen.
- **Billige Gegenmaßnahme jetzt:** Im `useEffect` für den Drawer zusätzlich auf einen `matchMedia('(min-width: 1024px)')` Change-Listener horchen und bei Erreichen des `lg`-Breakpoints zwingend `setNavOpen(false)` aufrufen, um den State zu bereinigen und das Lock aufzuheben.

### 2. CSS-Layout-Overflow in der Icon-Rail (`NavLink` vs. `w-14`)
- **Warum später teuer:** Der Plan spezifiziert eine einklappbare Sidebar-Breite von `w-14` (56px) und gleichzeitig ein `size-10` (40px) Touch-Target für die Icons in `NavLink`. Die existierende `NavLink`-Komponente hat jedoch `px-3` (24px horizontales Padding) und `border-l-2` (2px). Zusammen benötigen Padding, Border und Icon `40 + 24 + 2 = 66px`. Das ist 10px breiter als die spezifizierte Rail (`56px`).
- **Wann es beißt:** Sofort beim ersten Rendern des Collapsed-States. Die Icons werden entweder durch Flexbox unschön gestaucht oder brechen visuell aus der dunklen Sidebar aus.
- **Billige Gegenmaßnahme jetzt:** In `NavLink` im `collapsed`-Zustand das Padding entfernen und das Icon zentrieren (z.B. `collapsed ? 'px-0 justify-center' : 'px-3'`) oder alternativ die Rail auf `w-16` (64px) verbreitern.

### 3. Race-Condition bei localStorage Hydration & Write-Effect
- **Warum später teuer:** Der Plan skizziert zwei `useEffect`-Hooks: Einen für das Lesen nach dem Mount und einen für das Schreiben bei Änderung von `navCollapsed`. Da der State zwingend mit `false` initialisiert werden muss (um Hydration-Mismatch mit dem Server zu vermeiden), feuert der Write-Effect ebenfalls direkt beim initialen Render mit dem Wert `false`. Dies kann dazu führen, dass der Default-Wert sofort in den `localStorage` geschrieben wird, bevor oder während der Read-Effect die tatsächliche Nutzerpräferenz lädt.
- **Wann es beißt:** Nutzer stellt die Sidebar auf "eingeklappt" und lädt die Seite neu. Wegen der Effektreihenfolge wird der gespeicherte Wert oft von einem sofortigen `false`-Schreibvorgang überschrieben; die Sidebar "vergisst" ihre eingeklappte Position.
- **Billige Gegenmaßnahme jetzt:** Das Schreiben in den `localStorage` *nicht* generisch in einen `useEffect` auslagern. Stattdessen das `setItem` explizit in die `onClick`-Handler-Funktion (`toggleCollapse`) des Header-Buttons legen, wo es 100% verlässlich nur auf Nutzerinteraktion feuert.
