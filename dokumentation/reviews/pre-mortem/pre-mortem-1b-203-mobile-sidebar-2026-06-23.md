# Pre-Mortem 1b — Logik, Spec-Konsistenz & API-Vertrag: Issue #203 (Mobile Sidebar)

**Geprüfte Dokumente:**
- Plan: `.cursor/plans/mobile_sidebar_#203_09012142.plan.md`
- Code: `app/components/mpz-studio/studio-shell.tsx`

---

### [localStorage Race-Condition] — Write-Effect überschreibt Read-Effect bei Hydration
- **Warum später teuer:** Der Plan definiert zwei separate `useEffect` für `localStorage`: einen zum Lesen beim Mount und einen zum Schreiben bei Änderung von `navCollapsed`. Da der Default-State `false` ist, feuert der Write-Effect beim initialen Rendern (da `navCollapsed` in den Dependencies liegt) und schreibt sofort `false` in den Store, bevor oder während der Read-Effect den eigentlich gespeicherten Wert (z.B. `true`) ausliest.
- **Wann es beißt:** Bei jedem Reload (F5) verliert der Nutzer sofort seinen "Collapsed"-Zustand. Die Persistenz funktioniert nicht zuverlässig.
- **Billige Gegenmaßnahme jetzt:** Kein `useEffect` zum Schreiben nutzen. Stattdessen den Schreibvorgang direkt in eine Handler-Funktion `toggleNavCollapsed` packen, die vom Collapse-Button aufgerufen wird. Alternativ ein `isHydrated`-Flag nutzen, um initiale Writes zu blockieren.

### [Orphaned Body-Lock] — Resize verwaist den `navOpen`-State
- **Warum später teuer:** Wenn der Drawer auf Tablet (Portrait, `< lg`) geöffnet wird (`navOpen = true`) und der Nutzer das Tablet ins Querformat (`>= lg`) dreht, verschwindet der Drawer per CSS (`lg:hidden` Scrim, `lg:translate-x-0` Sidebar). Der React-State `navOpen` bleibt aber `true`. Der im Plan beschriebene `useEffect` für den Body-Scroll-Lock (`overflow-hidden`) registriert diesen Breakpoint-Wechsel nicht automatisch, es sei denn, er hängt an einem `resize`-Event.
- **Wann es beißt:** Ein Nutzer öffnet das Menü im Portrait-Modus, dreht das iPad und kann die Anwendung plötzlich nicht mehr scrollen, weil der Body gelockt bleibt, ohne dass ein Overlay sichtbar ist.
- **Billige Gegenmaßnahme jetzt:** Im `useEffect` für den Breakpoint-Wechsel (`window.matchMedia('(min-width: 1024px)')`) einen Event-Listener registrieren, der bei einem Wechsel auf `>= lg` zwingend `setNavOpen(false)` ausführt.

### [UI-Bruch durch GroupLabels] — Unvollständiges Ausblenden im Collapsed-Modus
- **Warum später teuer:** Der Plan erwähnt: *"RoomRoster und Gruppenlabels nur im expandierten Zustand"*. Im Code wird die interne Komponente `<GroupLabel>` verwendet. Wenn diese im Collapsed-Modus (`w-14`, 56px) unverändert gerendert wird, bricht der Text ("Erscheinungsbild") unleserlich um oder ragt über den Rand hinaus.
- **Wann es beißt:** Die Icons werden im Collapsed-State sauber dargestellt, aber dazwischen stehen unverständlich abgehackte Textfragmente der Überschriften, was das Layout zerschießt.
- **Billige Gegenmaßnahme jetzt:** Explizit definieren, dass `<GroupLabel>` ein Prop `collapsed={navCollapsed}` erhält (oder den State per Context liest) und in diesem Fall entweder nichts oder einen Trennstrich (`<hr>`) rendert.
