# Council of 5 — Planung Directus (#47)

**Datum:** 2026-07-06  
**Status:** Grundlage (nicht beschlossen)  
**Issue:** [#47](https://github.com/flxln/schulnavigator/issues/47)  
**Auslöser:** Planung des Directus-Vorhabens nach Schulfest (26.06.2026)

## Brief

Schulnavigator, Post-Schulfest. [ADR-003](../adr/003-content-mvp-json-directus.md) ist entschieden: JSON-MVP → Directus für Lehrkräfte-Pflege, kein Custom-Admin. [MPZ Studio (ADR-022)](../adr/022-mpz-studio-internes-ingest-tool.md) deckt internes Ingest ab. Issue #47: Deploy, Collections aus JSON-Schema, Migration GS39. Acht Hard Gates vor erstem Lehrkräfte-Login — drei erledigt (AVV, DSB, Media-Gate), fünf offen. Milestone Phase 5: 31.10.2026, Prioritäten nach Auswertung #44. Offen: Rollenmodell, Mandantenfähigkeit, wer pflegt wirklich.

**Projektquellen:**

- [ADR-003](../adr/003-content-mvp-json-directus.md)
- [directus-auth-konzept.md](../spezifikationen/directus-auth-konzept.md)
- [audit-phase-5-2026-07-04.md](./pre-mortem/audit-phase-5-2026-07-04.md) (Abhängigkeiten vor #47)
- [offen.md](../planung/offen.md) — Issue #47

---

## Phase 1 — Unabhängige Analyse

### Contrarian Skeptic

**Urteil:** Directus ist architektonisch „richtig“, aber die Planung unterschätzt, dass Lehrkräfte-Pflege ein Organisationsproblem ist, kein CMS-Problem. Wahrscheinlich landet ihr Herbst 2026 mit einem technisch lauffähigen Directus, den niemand nutzt — während MPZ Studio die eigentliche Pflege weiter über Felix laufen lässt. Die acht Gates schützen vor DSGVO-Fehlern, nicht vor Nutzlosigkeit.

**Stärkste Argumente:**

- Schulfest-Frage aus dem Audit (#44) ist noch unbeantwortet: *Wer aus dem Kollegium würde pflegen, und wie viel Zeit ist realistisch?*
- Das Datenmodell ist längst komplexer als der Minimalvorschlag in [technische-fragen.md](../technische-fragen.md) (Hotspots, Coach, Dialog, Embed-Allowlist, Sphere-Viewer) — Migration + verständliche Directus-UI für Nicht-Techniker ist kein Wochenprojekt.
- MPZ Studio v2 ist fertig und funktioniert — es schafft einen bequemen Pfad, Directus auf „irgendwann“ zu schieben, ohne dass die Schule es merkt.

**Größte Risiken & blinde Flecken:**

1. **Scheitern durch Nicht-Nutzung:** Directus live, Content-Stagnation, Schule wartet weiter auf MPZ.
2. **Scheitern durch Scope-Creep:** Issue #47 listet „neue Stationen anlegen“ — ohne klares Rollenmodell wird das entweder zu mächtig (Chaos) oder zu restriktiv (Frust).
3. **Branch-/Compliance-Schulden:** Pre-Mortem warnt vor Entwicklung auf `feature/mpz-studio` mit veralteten Tokens und fehlendem Legal-Stand — Directus-Entwicklung auf wackeligem Fundament.

**Konfidenz:** 55 % — worin unsicher: ob die Schule nach dem Fest echte Pflege-Motivation signalisiert.

**Was ich nicht weiß:** Ergebnis des Schulfest-Debriefings, tatsächliche Lehrkräfte-Kapazität, ob Thomas/MPZ Directus-Betrieb dauerhaft tragen will.

---

### First-Principles Engineer

**Urteil:** Ignoriere CMS-Hype. Das Grundproblem: *Nicht-Techniker müssen strukturierte Raumdaten ändern, ohne die App zu deployen.* Directus löst das, wenn drei fundamentale Schichten stimmen: (1) stabiles Schema = heutiges JSON, (2) Lese-Pfad in Next.js = API statt Datei-Import, (3) Medien = ein konsistenter Storage-Pfad. Alles andere — 2FA, Mandantenfeld, schöne Rollen — ist zweitrangig bis (1)–(3) bewiesen sind.

**Stärkste Argumente:**

- JSON-Schema als Single Source of Truth für Collections ist der richtige Ansatz; wegwerfen wäre Verschwendung.
- Self-hosted auf gleichem VPS ist sinnvoll: eine Datenquelle, ein Backup-Kontext, kein zweiter Cloud-Vendor.
- Gates 3 (Media-Gate) und 7 (Backup DB) sind technisch zwingend — ohne sie ist Directus ein Upload-Vektor ohne Recovery.

**Größte Risiken & blinde Flecken:**

- **Build-Zeit vs. ISR/SSG:** Wenn Next.js weiterhin zur Build-Zeit JSON einliest, bringt Directus nur eine zweite Schreibquelle — es braucht einen klaren Runtime-Fetch-Pfad (oder Webhook-Rebuild), der noch nicht spezifiziert ist.
- **Schema-Drift:** MPZ Studio schreibt JSON-Dateien; Directus schreibt DB — ohne Migrations- und Sync-Strategie gibt es zwei Wahrheiten.
- Object Storage vs. `public/` ist unentschieden; Directus-Medienbibliothek ohne Entscheidung wird teuer im Nacharbeiten.

**Konfidenz:** 70 % — worin unsicher: aktueller Stand des Next.js-Datenladers (Build-time vs. runtime).

**Was ich nicht weiß:** Ob ein Spike „Directus → eine Station → Live“ schon existiert; geplante Cache-Invalidierung.

---

### Outsider Big-Picture Thinker

**Urteil:** Directus ist nicht nur Technik — es verschiebt die Machtverteilung zwischen MPZ und Schule. Bisher war MPZ Gatekeeper (Git, Deploy, Qualität). Mit Directus wird die Schule Co-Produzentin — das verändert Verantwortung, Fehlerkultur und langfristig die Skalierungsstory („weitere Schulen“). Die Planung behandelt Directus als Issue #47 unter Phase 5, obwohl es ein institutioneller Wendepunkt ist.

**Stärkste Argumente:**

- Mandantenfähigkeit (Instanz pro Schule vs. `school_id`) ist strategisch, aber bewusst vertagt — richtig für eine Schule, riskant wenn das zweite Schulprojekt 2027 kommt und das Schema nicht passt.
- DSGVO-Gates (AVV, DSB, VVT) signalisieren Reife — Schulen und Behörden nehmen das ernster als „wir haben ein CMS“.
- Lehrkräfte-Anleitung ist Platzhalter — das ist kein Detail, sondern der eigentliche Rollout.

**Größte Risiken & blinde Flecken:**

- **Langfristig:** Wenn eine Lehrkraft Schülerfotos mit Namen in Beschreibungsfelder tippt, ist „kein Schüler-PII im Schema“ wertlos — organisatorische Schulung fehlt in der Planung.
- **Kulturell:** Schulen gewöhnen sich an „MPZ macht das“; Directus ohne Champions im Kollegium verstärkt Abhängigkeit statt sie zu lösen.
- **Systemisch:** Jedes weitere Feature (Englisch #48, neue Stationen #49) konkurriert um dieselbe Felix-Kapazität — Directus gewinnt nur, wenn es explizit Priorität 1 nach Bugs (#45) bekommt.

**Konfidenz:** 60 % — worin unsicher: politische Lage MPZ–Schule nach dem Fest.

**Was ich nicht weiß:** Ob die Schule Directus als Eigenverantwortung will oder als „schöneres Ticket an Felix“.

---

### Data-Driven Analyst

**Urteil:** Die Planung ist gate-getrieben (gut), aber zeitlich unter-spezifiziert (schlecht). Milestone 31.10.2026 ohne harten Nutzen-Horizont ist ein weicher Commitment-Anker. Realistische Größenordnung für #47 allein (Deploy, Schema, Migration 11+ Stationen, Next.js-Anbindung, Lehrkräfte-Onboarding, Tests): **4–8 Entwicklerwochen** für eine Person — plus 2–4 Wochen organisatorische Vorlaufzeit für Gates 4–8. Das passt in Q3/Q4 nur, wenn Directus Top-2-Priorität bleibt und keine größeren #45-Bugwellen kommen.

**Stärkste Argumente:**

- Gate-Stand 3/8: AVV und DSB erledigt reduzieren den größten organisatorischen Blocker — das ist messbarer Fortschritt.
- 11 Stationen, komplexes Medienmodell: Migrationsaufwand skaliert linear mit Stationen, superlinear mit Hotspot/Coach/Dialog — nicht mit „einfachem Raum-JSON“ aus der frühen Spezifikation verwechseln.
- MPZ Studio v0–v2.1 ist abgeschlossen — das interne Tool hat die erwartete Zeit gefressen; Directus hat noch **null** Implementierungskilometer.

**Größte Risiken & blinde Flecken:**

- Fehlende Baseline: keine geschätzten Story Points, kein Spike-Ergebnis, kein „Definition of Done“ für #47.
- Keine Metrik für Erfolg: „Directus live“ ≠ „≥2 Lehrkräfte haben ohne MPZ-Hilfe eine Änderung veröffentlicht“.
- Backup T5 mit DB ist Gate 7, aber NAS/Headscale-Planung hat eigene offene ACL-Themen (Pre-Mortem) — Zeit unsicher.

**Konfidenz:** 50 % — worin unsicher: tatsächliche Felix-Kapazität Q3, Umfang Post-Fest-Bugs.

**Was ich nicht weiß:** Velocity seit Schulfest; ob Coolify-Directus-Template schon getestet wurde; RAM/CPU-Headroom auf VPS mit zweitem Container.

---

### Empathetic Practitioner

**Urteil:** Felix jongliert MPZ-Alltag, Schule, Compliance und ein wachsendes Produkt. Die Directus-Planung liest sich wie ein perfekter Prozess auf Papier — im Alltag wird er an Gate 8 (Branch-Konsolidierung) und an der Frage hängen, ob Lehrkräfte überhaupt Lust haben, etwas Neues zu lernen, während das Fest noch frisch ist. Empfehlung aus Menschensicht: **erst klären, ob die Schule will — dann bauen**, nicht umgekehrt.

**Stärkste Argumente:**

- [fuer-lehrkraefte.md](../../anleitungen/fuer-lehrkraefte.md) ist bewusst Platzhalter — ehrlicher als halbfertige Anleitung; zeigt aber, dass der menschliche Pfad noch nicht designed ist.
- Passwort-Reset, 2FA, „was passiert wenn ich aus Versehen alles lösche“ — das sind Support-Anrufe an Felix, nicht Directus-Features.
- Nach Schulfest ist Erschöpfung und Auswertung normal; Directus in Q3 zu erzwingen ohne Pause riskiert Burnout und halbfertige Compliance.

**Größte Risiken & blinde Flecken:**

- Eine engagierte Lehrkraft mit 30 Minuten pro Monat reicht nicht — ohne Redaktions-Routine verrottet Directus.
- Felix als einziger Admin + Entwickler + First-Level-Support ist eine Single Point of Failure.
- Schule könnte MPZ Studio indirekt erleben („Felix pflegt schnell ein“) und Directus als unnötig empfinden.

**Konfidenz:** 65 % — worin unsicher: echte Energie der Schule nach dem Fest.

**Was ich nicht weiß:** Ob es eine benannte „Content-Verantwortliche“ an der GS39 gibt.

---

## Phase 2 — Peer-Review

| Kritik | Von → An | Kern |
|--------|----------|------|
| Gates schützen Recht, nicht Adoption | Skeptic → Engineer | Engineer fokussiert Schema/API, übersieht dass technische Korrektheit ohne Nutzer wertlos ist. |
| „4–8 Wochen“ ohne Spike-Beweis | Analyst → Engineer | Runtime-Fetch und Webhook-Strategie fehlen im Aufwand — eher 6–10 Wochen. |
| MPZ Studio ≠ Konkurrenz, sondern Brücke | Practitioner → Skeptic | Studio ist Dev-Tool; Skeptic übertreibt Ersatzgefahr, **wenn** Studio nach Directus-Go klar abgeschaltet wird. |
| Organisatorisches Risiko unterschätzt | Outsider → Analyst | Analyst zählt Wochen, aber kein Gate „Schule hat Champion + Schulungstermin“. |
| Branch-Schulden zu pessimistisch? | Engineer → Skeptic | Wenn Legal bereits auf `main` konsolidiert ist, ist Gate 8 kleiner — Stand muss verifiziert werden. |
| Burnout-Warnung vs. Q4-Deadline | Skeptic → Practitioner | 31.10. ist weich; Practitioner sollte zwischen „Pause“ und „gar nicht“ differenzieren. |

**Auffällige blinde Flecken im Rat:** Keiner hat Directus-Lizenz/Community-Risiko vertieft (irrelevant bei self-hosted). Alle ignorieren teilweise **Content-Freeze** während Migration (paralleles JSON + Directus). **Erfolgsmetrik** fehlt überall in der Ist-Planung — das ist Konsenslücke.

---

## Phase 3 — Chairman

**Empfehlung:** Directus **beibehalten** (ADR-003 bleibt gültig), aber die Planung **umstellen von „Technik-First“ auf „Adoption-First mit technischem Spike“**:

1. **Vor Implementierung:** Auswertung #44 beantworten — mindestens eine Lehrkraft als Champion, realistische Pflegefrequenz.
2. **Gates 4–8 sequenziell abschließen** (VVT, Auth-Konzept beschließen, DSE live, Backup DB, Branch-Sync) — kein Lehrkräfte-Login vorher.
3. **Technischer Spike (1–2 Wochen):** Eine Station end-to-end — Directus → Next.js Runtime → Prod-Deploy — um Schema-Drift und Build-Frage zu klären.
4. **Erst danach** vollständige Migration + `fuer-lehrkraefte.md` + Pilot mit 1–2 Räumen, nicht Big-Bang für alle 11+ Stationen.
5. **MPZ Studio:** Rolle nach Directus-Go explizit auf „Dev/Notfall-Ingest“ begrenzen, nicht als stille Ersatz-Pflege.

**Konfidenz:** **62 %**

**Konsens:**

- Directus ist die richtige Wahl gegen Custom-Admin.
- Die acht Gates sind sinnvoll; 3/8 erledigt ist echter Fortschritt.
- JSON-Schema als Directus-Vorlage nicht verwerfen.
- Größtes Risiko ist **Nicht-Nutzung + Kapazität**, nicht die CMS-Wahl.

**Größter Dissens:**

- **Skeptic/Practitioner:** Directus 2026 verschieben oder stark verkleinern (Pilot only), bis Schule committed ist.
- **Engineer/Analyst:** Technischen Pfad zuerst mit Spike validieren — Timeline Q4 ist machbar, wenn priorisiert.

**Schwächste Argumente im Rat:**

- Analysts Wochenschätzung ohne VPS-Sizing-Daten.
- Skeptics Annahme, dass MPZ Studio die Schule dauerhaft zufriedenstellt (Studio ist per ADR-022 nicht für Lehrkräfte).

**Nächster Schritt (konkret):**

1. Kurzes **Directus-Planungs-ADR oder Issue-Update #47** mit: Runtime-Datenpfad, Migrationsstrategie, DoD („2 Lehrkräfte, 1 Raum, ohne Felix“), Gate 9 optional: *„Champion benannt“*.
2. **Branch-Status prüfen** (Gate 8) — blockiert sonst jede Entwicklung.
3. **Spike planen**, nicht Full-Migration.

---

## Offene Folgearbeit (aus Chairman)

- [ ] Auswertung #44: Champion + Pflegefrequenz klären
- [ ] Gates 4–8 abschließen (VVT, Auth beschließen, DSE, Backup DB, Branch)
- [ ] Spike: eine Station Directus → Next.js Runtime → Deploy
- [ ] DoD für #47 definieren (messbar, nicht nur „live“)
- [ ] Optional Gate 9: Schule committed

---

*Erstellt via Council of 5 (2026-07-06). Früheres Council zum Projektstart: [protokolle/2026-05-08-council-analyse-39-grundschule.md](../../protokolle/2026-05-08-council-analyse-39-grundschule.md).*
