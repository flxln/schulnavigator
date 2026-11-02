# Pre-Mortem 1a — Code-Praxis: Issue #197 (Studio-Shell & Design-Route)

Basierend auf dem Implementierungsplan `mpz_shell_#197_f2be92b1.plan.md` und der Methodik aus `1a_pre-mortem-codepraxis.md`.

### [Next.js 15+] `searchParams` als asynchrones Promise
- **Warum später teuer:** Das Projekt nutzt Next.js 16.2.6 (siehe `app/package.json`), in dem `searchParams` für Server-Komponenten zwingend asynchron ist. Ein synchroner Zugriff führt sofort zu einem Build- oder Laufzeitfehler.
- **Wann es beißt:** Sobald der Entwickler in der neuen `design/page.tsx` versucht, den Tab synchron mit `const tab = searchParams.tab` zu lesen. Die Seite stürzt beim ersten Rendering ab.
- **Billige Gegenmaßnahme jetzt:** Im Plan unter `design/page.tsx` explizit ergänzen, dass `searchParams` asynchron aufgelöst werden muss (`const { tab } = await searchParams;`).

### [Layout-Deopt] Tab-spezifischer Breadcrumb mit `useSearchParams`
- **Warum später teuer:** Der Plan verlangt einen tab-spezifischen Breadcrumb ("Hub-Karte" / "Brand & Design") für die `StudioShell`. Da `pathname` allein den Tab nicht kennt, greift der Entwickler zwangsläufig zu `useSearchParams()`. Da `StudioShell` im globalen Layout verankert ist, wirft `useSearchParams` ohne umgebendes `<Suspense>` Next.js-Build-Fehler oder erzwingt ungeplantes dynamisches (Client-side) Rendering für weite Teile der Anwendung.
- **Wann es beißt:** Sofort beim Einbauen von `useSearchParams` in `studio-shell.tsx` zur Tab-Erkennung, sichtbar als Next.js-Konsolenwarnung (`Missing Suspense boundary...`).
- **Billige Gegenmaßnahme jetzt:** Im Plan festlegen, dass der Breadcrumb für die Design-Route rein statisch `Design & Hub` lautet. Die nutzerspezifische Orientierung wird ohnehin durch die Tab-Leiste (`DesignPageShell`) abgedeckt.

### [Komponenten-Struktur] `NAV_GROUPS`-Abstraktion vs. `RoomRoster`
- **Warum später teuer:** Der Plan skizziert eine simple Array-Struktur für `NAV_GROUPS` (Z. 153-162), über die iteriert werden soll. Die Gruppe "Stationen" ist jedoch nicht statisch; sie enthält hochspezifische React-Komponenten (`<ReadinessCount>`, `<RoomRoster>`), die dynamische Laufzeit-Props (`summaries`, `loading`, `locked`) benötigen. Ein simples `.map()` über das Array verkompliziert das Einbinden dieser Komponenten massiv und erfordert unsaubere Workarounds.
- **Wann es beißt:** Beim Umschreiben der `studio-shell.tsx`, wenn der Entwickler versucht, die `RoomRoster`-Komponente in die `.map()`-Schleife für das statische `NAV_GROUPS`-Array zu quetschen.
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten, dass die Gruppen im JSX manuell ausgeschrieben bleiben sollten (oder `NAV_GROUPS` *innerhalb* der Komponente definiert wird, wo es Zugriff auf `summaries` etc. hat). Bei nur 5 Gruppen ist das manuelle Auscodieren robuster.
