# Kosten-Allokationsmatrix (F&E vs. Umsetzung) – Förderfähigkeits-Abgrenzung

Ziel: Eindeutige Zuordnung der Kosten zu Work Packages (WP) und Förderprogrammen, um Doppelförderungen zuverlässig auszuschließen.

## Matrix (Beispiel)

| Kostenkategorie           | WP  | Programm(e)                         | Art       | Förderfähigkeit | Hinweise |
|---------------------------|-----|-------------------------------------|-----------|-----------------|----------|
| AI/Controls Entwicklung   | WP3 | FFG Basisprogramm                    | F&E       | hoch            | TRL 3→6, Stunden-/Overhead-Sätze lt. Richtlinien |
| Safety/Compliance Tests   | WP4 | FFG Basisprogramm                    | F&E       | hoch            | Normen, Testprotokolle, Auditfähigkeit |
| Architektur/SDK           | WP2 | WAW Digitalisierung, aws Digitalisierung | Umsetzung | mittel/hoch     | sauber abgrenzen ggü. F&E, Implementierungsfokus |
| CI/CD & Observability     | WP3 | aws Digitalisierung                   | Umsetzung | mittel          | Infrastruktur, Tooling, Nachweise |
| Rollout/Training/Enablemt | WP5 | KMU.DIGITAL                           | Umsetzung | mittel          | Implementierungsnahe Leistungen |
| Forschungsleistungen ext. | WP2 | FFG Innovationsscheck                 | F&E       | hoch            | Angebot/Scope der Forschungseinrichtung |
| Hardware/Roboter/Tools    | WP2/3| abhängig vom Programm                | gemischt  | programmspez.   | förderfähige Anteile, Angebote, Abschreibung |

## Grundsätze
- __Keine Doppelförderung__: Jede Leistung/Kostenstelle exakt einem Programm zuordnen.
- __WP-Mapping__: Deliverables an Meilensteine koppeln; Querverweise in Anträgen beilegen.
- __Nachweise__: Angebote, Stundennachweise, Protokolle, Rechnungen; Audit‑ready.

## Artefakte / Deliverables
- Architektur v1.0, SDK TP
- Perception/Decision Module (TRL‑Reports)
- Safety Eval Report / Testpläne
- CI/CD Pipeline Nachweis, Observability Dashboards
- Trainingsmaterial, Enablement‑Guides
