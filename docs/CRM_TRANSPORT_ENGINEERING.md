# RouteSurvey CRM — Transport Engineering Discovery

## Scope

This CRM stream targets engineers and firms directly relevant to abnormal, heavy and project-cargo transport.

Included disciplines:

- heavy transport / heavy haul engineering
- oversize / overweight and superload engineering
- route feasibility and physical road surveys
- bridge and structure verification
- axle-load / load-distribution studies
- turning and swept-path analysis
- route modification / bypass design
- rigging and lift engineering
- load securement and stability
- special-load permit engineering
- rail dimensional / clearance engineering where relevant to industrial cargo

Generic urban traffic engineering is not the primary target unless the person or firm has industrial-freight, route-feasibility or abnormal-load relevance.

## USA

Primary scalable sources:

1. ASCE Transportation & Development Institute — Freight & Logistics Committee.
2. ASCE T&DI — Rail Transport Committee.
3. SC&RA engineering/heavy-haul ecosystem.
4. Specialist superload structural/route firms.
5. Heavy-lift and rigging companies with engineering departments.
6. Public PE/SE professional profiles tied to relevant project evidence.

Initial examples:
- Fuss & O'Neill — superload route and structural analysis.
- Barnhart Crane & Rigging — heavy-lift/heavy-transport engineering.
- Andrew L. Kauffman, PE/SE — public heavy lift/heavy transport engineering profile.
- Alexander Prior, PE — public project-engineering profile at Barnhart.
- Sushant Sharma — ASCE T&DI Freight & Logistics chair.
- C. Tyler Dick, PE — ASCE T&DI Rail Transport Committee chair.

## Europe

Primary scalable sources:

1. ESTA Europe and its national association/member ecosystem.
2. Breakbulk Europe engineering exhibitors/speakers.
3. Specialist engineering companies such as dteq.
4. Heavy-transport operators with internal engineering teams: Mammoet, LASO and others.
5. National abnormal-transport associations and public awards/technical working groups.

Local-language discovery should include English, German, Dutch, Spanish and Portuguese.

Portuguese examples:
- engenharia de transporte especial
- transportes especiais engenharia
- reconhecimento de itinerários
- estudo de viabilidade de transporte

Spanish examples:
- ingeniería de transporte especial
- transporte excepcional
- estudio de viabilidad de ruta
- ingeniería de elevación

## Brazil — Portuguese

Brazil has a formal professional title **Engenheiro de Transportes / Engenheira de Transportes** under the CONFEA/CREA system.

Discovery terms should also target the more specialized industrial movement disciplines:

- engenharia de transportes especiais
- transporte de carga indivisível
- estudo de rota
- verificação de pontes
- movimentação de cargas
- plano de rigging
- engenheiro rigger
- içamento
- estabilidade e amarração de carga
- AET

Primary sources:
- CONFEA/CREA for professional-title/credential validation.
- Sobratema and Instituto OPUS for rigging/cargo-handling specialists.
- M&T Expo and related technical programs.
- specialist company/team pages.

Initial people:
- Carlos Gabos — engineer and OPUS rigger-training specialist.
- Gustavo Cassiolato — Civil Engineer / Safety Engineer / Rigger at Rigging Brasil.

## Spanish-speaking LATAM

Primary search vocabulary:

- ingeniería de transporte especial
- carga sobredimensionada
- carga extradimensionada
- carga extrapesada
- estudio de ruta
- estudio de puentes
- verificación estructural
- ingeniería de izaje
- estabilidad y fijación de carga
- simulación de maniobras
- permisos de carga especial

### Chile

Chile is especially useful because current special-load permitting explicitly requires route studies by specialized road-safety engineers above defined dimensional/weight thresholds.

Initial firms:
- ESAP SpA
- Ingenvial
- TIEX
- ISVIALSA
- Calibra Consultores
- Cargas Especiales I+L

### Peru

Initial firms:
- TESCCHI
- Stierlift
- MUR
- TransArcali

### Colombia

Initial firms:
- Boom Logistics Colombia
- INDEPROS
- Construction Colombia / Road Survey engineering

### Mexico

Initial firms:
- Tradelossa
- Transportes Especializados Navarro

### Argentina / Mercosur

Initial discovery seed:
- Arbolasba
- cross-border Mercosur specialist carriers with documented route engineering

## CRM model

Keep transport-engineering relevance separate from ordinary CRM status.

Suggested fields:

```text
engineering_specialties[]
languages[]
professional_credentials[]
credential_authority
credential_verified_at
regions_served[]
project_sectors[]
route_engineering
bridge_engineering
rigging_engineering
swept_path
axle_load_analysis
permit_engineering
field_survey
source_evidence[]
```

## Engineer discovery workflow

```text
Association / event / specialist company
        ↓
Company engineering capability verified
        ↓
Named engineer / technical leader
        ↓
Role and credentials verified
        ↓
LinkedIn / company profile
        ↓
Business email evidence
        ↓
Email verification
        ↓
RouteSurvey CRM person + company relationship
```

Do not infer a professional credential or engineering specialization from a job title alone. Preserve the supporting source.
