---
tags:
  - pre-mortem
  - 1a-code-praxis
erstellt: 2026-06-22
---

# Pre-Mortem 1a — Code-Praxis: Issue #198 (Redundanzen)

Basierend auf dem Implementierungsplan `mpz_redundanzen_#198_ac3fbffd.plan.md` und der Vorlage `1a_pre-mortem-codepraxis.md`.

## Funde für die Code-Praxis

### 1. `searchParams` Typisierung in Next.js Server Components (`[slug]/page.tsx` & `ingest/page.tsx`)
- **Warum später teuer:** Next.js 15 erfordert, dass `searchParams` in Server Components asynchron (als `Promise`) behandelt wird. Im aktuellen Code von `app/mpz/studio/stationen/[slug]/page.tsx` fehlt `searchParams` in den `PageProps` gänzlich. Wenn der Entwickler `searchParams` hinzufügt, es aber nicht als Promise typisiert (oder synchron darauf zugreift), schlägt der TypeScript-Compiler fehl oder Next.js gibt zur Laufzeit Warnungen/Fehler aus.
- **Wann es beißt:** Zur Compile-Zeit oder bei CI/CD-Checks beim Bauen der App (`npm run build`).
- **Billige Gegenmaßnahme jetzt:** Im Plan explizit den Typ für `PageProps` spezifizieren: `searchParams: Promise<{ [key: string]: string | string[] | undefined }>`. Der Zugriff muss zwingend über `const sp = await searchParams` erfolgen.

### 2. URL-Encoding beim Ersetzen von `openMediaIngest()` durch Links (`station-grid.tsx` & `station-hotspot-add-form.tsx`)
- **Warum später teuer:** Die Funktion `openMediaIngest({ slug: st.slug })` wird an mehreren Stellen durch eine statische `<Link>` Komponente ersetzt. Wenn bei der Erstellung des Links das Encoding des Slugs vergessen wird, können fehlerhafte Routing-URLs entstehen.
- **Wann es beißt:** Wenn ein Benutzer auf den "Medien hochladen" Link in `station-grid` oder `station-hotspot-add-form` bei einer Station klickt, die einen Slug mit potenziell problematischen Zeichen hat. Dies würde in einem 404-Fehler enden.
- **Billige Gegenmaßnahme jetzt:** Die Anweisung im Plan präzisieren, dass das Link-Ziel zwingend als ``/mpz/studio/stationen/${encodeURIComponent(slug)}?tab=medien`` aufgebaut werden muss (analog zum bereits existierenden "Bearbeiten"-Link im Grid).

### 3. Logik-Spezifikation für `resolveTab` Fallback (`station-detail-shell.tsx`)
- **Warum später teuer:** Der Plan besagt: „`resolveTab` mappt `dialog-audio` → `dialog` als Client-Fallback“. Aktuell prüft `resolveTab` nur, ob der Parameter in `VALID_TABS` ist und fällt sonst stumpf auf `stammdaten` zurück. Wenn `dialog-audio` aus `VALID_TABS` gelöscht wird, greift standardmäßig der Fallback auf `stammdaten`. Der Entwickler muss den expliziten Sonderfall `if (raw === 'dialog-audio') return 'dialog'` implementieren, bevor der Standard-Fallback zuschlägt.
- **Wann es beißt:** Wenn ein Nutzer durch Lesezeichen, gecachte Links oder aus der History auf `?tab=dialog-audio` navigiert und der Server-Redirect verzögert oder durch Client-Navigation nicht ausgeführt wird, landet er unerwartet auf dem "Stammdaten"-Tab.
- **Billige Gegenmaßnahme jetzt:** Im Plan festhalten, dass in `resolveTab` explizit die Bedingung `if (raw === 'dialog-audio') return 'dialog'` als erste Regel ergänzt werden muss, bevor gegen `VALID_TABS` geprüft wird.

---
**Fazit:** Der Plan ist sehr solide. Die oben genannten Punkte sind Low-Level-Details, die einem Entwickler während der Implementierung die Arbeit erleichtern und unnötige TypeScript- oder Routing-Fehler direkt im Vorfeld vermeiden. Die Architektur und Routing-Entscheidungen (inkl. Redirects) sind schlüssig und gut integrierbar.
