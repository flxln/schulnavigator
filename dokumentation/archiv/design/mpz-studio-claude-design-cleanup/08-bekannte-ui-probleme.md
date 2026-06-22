# Bekannte UI-Probleme (Ist-Zustand)

**Stand:** 2026-06-22 — nach Abschluss Epic v2/v2.1  
**Zweck:** Konkrete Ausgangspunkte für IA-Cleanup in Claude Design

Quellcode: `app/components/mpz-studio/studio-shell.tsx`, `station-detail-shell.tsx`

---

## 1. Flache Navigation ohne Gruppierung

**Problem:** 9 gleichwertige Sidebar-Einträge auf einer Ebene — keine visuelle Trennung zwischen Station-Arbeit, globalem Content und Betrieb.

**Aktuell:**

```
Dashboard | Stationen | Medien hochladen | Dialog-Audio | Coach | Embeds | Hub | Brand | Deploy
```

**Erwartung im Redesign:** Gruppen z. B. „Inhalt“, „Stationen“, „Global“, „Betrieb“ — oder vergleichbare IA mit max. 2 Ebenen.

---

## 2. Dialog-Audio doppelt

**Problem:** Gleiche Funktion an zwei Stellen:

| Ort | Route / UI |
|-----|------------|
| Sidebar | `/mpz/studio/dialog-audio` (global) |
| Station Detail | Tab `?tab=dialog-audio` (nur Dialog-Stationen) |

Nutzer wissen nicht, welcher Einstieg „richtig“ ist.

**Design-Aufgabe:** Ein primärer Ort + optional Kontext-Link (z. B. von Dialog-Tab aus).

---

## 3. Medien hochladen — zwei Einstiege

**Problem:**

- Sidebar-Button öffnet **Modal** (keine eigene Seite)
- Route `/mpz/studio/ingest` existiert als Deep-Link zum gleichen Modal
- Tab Medien hat zusätzlich „Medien hinzufügen“

Drei Wege, ein Flow — uneinheitlich in der Navigation.

---

## 4. Brand vs. Hub — aufgeteilte Design-Konfiguration

**Problem:** Spec nennt „Brand & Design“ als Modul mit Tokens, Akzenten, Icons. Implementierung:

- **Hub-Karte:** Slug-Map, Akzentfarben, Lucide-Icons
- **Brand:** nur Asset-Uploads (Logos, Maskottchen)

Schwer zu finden, was wo gehört.

---

## 5. Veralteter Sidebar-Block „v1 / v2“

**Problem:** Leerer Platzhalter-Bereich in der Sidebar (`DISABLED_V1` ist leer) — wirkt unfertig.

---

## 6. Station Detail — überladene Tabs

**Problem:** Bis zu 5 Tabs (Stammdaten, Medien, Hotspots, Dialog, Dialog-Audio). Tab **Dialog** enthält viele Subformulare (Segmente, Gruppen, Bubble) ohne eigene Unter-Navigation.

**Besonders schwer:** Dialog-Editor für `daz` / `pc-raum`.

---

## 7. Vorschau nicht als Tab

**Problem:** Spec listet „Vorschau“ unter Station Detail. Implementierung: nur externer Link `↗ /raum/{slug}` im Header.

Kein Fehler per se — aber uneinheitlich zur Spec und leicht zu übersehen.

---

## 8. Save & Validate — global, Kontext unklar

**Problem:** Ein Button in der Top-Bar für alle Bereiche. Nutzer unsicher, ob Änderungen in Coach/Deploy/Station bereits „gespeichert“ sind oder erst nach Klick.

**Design-Aufgabe:** Klarer Dirty-State, ggf. Bereichs-Feedback oder Bestätigung vor Verlassen.

---

## 9. Uneinheitliche Formular-Muster

**Problem:** Mix aus Tabellen + Inline-Formularen + Modals + separaten Kalibrier-Seiten. Kein durchgängiges Muster für:

- Primäraktion (Speichern/Abbrechen)
- Sekundäraktionen (Löschen, Kalibrieren)
- Fehleranzeige

---

## 10. Mobile Sidebar

**Problem:** Horizontal scrollbare Nav auf schmalen Viewports — 9 Items schwer scanbar.

---

## Was gut funktioniert (beibehalten)

- GS39-Farben und Papier-Look
- Dev-Badge „Nur lokal · development“
- Plan-A-Banner als Fallback-Hinweis
- Stationen-Grid mit Ampel und Hub-Nr
- Flat-Kalibrierung als Vollbild-Seite
- Save & Validate mit Rollback-Feedback (rot/grün Panel)

---

## Offene Fragen für Claude Design (max. 3)

1. Dialog-Audio: globaler Hub oder nur pro Station?
2. Medien-Upload: immer Modal oder eigene Seite bei komplexen Flows (link/embed)?
3. Dialog-Editor: Sub-Tabs, Accordion oder Stepper?

Diese Fragen explizit im Konzept beantworten — nicht offen lassen.
