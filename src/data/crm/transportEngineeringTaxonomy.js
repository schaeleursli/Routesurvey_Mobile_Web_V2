export const TRANSPORT_ENGINEERING_DISCOVERY = {
  scope: {
    include: [
      "heavy haul engineering",
      "heavy transport engineering",
      "oversize / overweight transport engineering",
      "superload route and bridge analysis",
      "route feasibility and road survey engineering",
      "bridge / structure verification for special loads",
      "axle-load and load-distribution engineering",
      "swept-path / turning simulation",
      "rigging and lifting engineering",
      "load securement / stability engineering",
      "special transport permitting engineering"
    ],
    excludeByDefault: [
      "generic urban traffic engineering",
      "public-transit planning with no freight/industrial relevance",
      "generic logistics sales without technical engineering evidence"
    ]
  },

  regions: {
    usa: {
      languages: ["en"],
      terms: [
        "heavy haul engineer",
        "heavy transport engineer",
        "superload engineer",
        "oversize overweight engineering",
        "route survey engineer",
        "route feasibility engineer",
        "bridge analysis superload",
        "structural engineer heavy haul",
        "rigging engineer",
        "lift engineer",
        "load securement engineer",
        "axle load analysis",
        "swept path heavy haul"
      ]
    },

    europe: {
      languages: ["en", "de", "nl", "es", "pt"],
      terms: [
        "abnormal transport engineering",
        "heavy transport engineering",
        "special transport engineering",
        "exceptional transport engineering",
        "Schwertransport Ingenieur",
        "Schwerlasttransport Engineering",
        "Sondertransport Ingenieur",
        "ingeniería transporte especial",
        "transporte excepcional ingeniería",
        "engenharia transporte especial",
        "transportes especiais engenharia",
        "reconhecimento de itinerários transporte",
        "road survey heavy transport"
      ]
    },

    brazil: {
      languages: ["pt-BR"],
      terms: [
        "engenheiro de transportes",
        "engenharia de transportes especiais",
        "engenharia de transporte pesado",
        "carga indivisível engenharia",
        "carga superdimensionada engenharia",
        "estudo de rota carga indivisível",
        "estudo de viabilidade de rota",
        "verificação de pontes carga especial",
        "plano de rigging",
        "engenheiro rigger",
        "movimentação de cargas engenharia",
        "içamento de cargas engenharia",
        "amarração e estabilidade de carga",
        "AET carga indivisível engenharia"
      ]
    },

    latamSpanish: {
      languages: ["es"],
      terms: [
        "ingeniero de transporte",
        "ingeniería de transporte especial",
        "ingeniería de transporte pesado",
        "carga sobredimensionada ingeniería",
        "carga extradimensionada ingeniería",
        "carga extrapesada ingeniería",
        "estudio de ruta carga especial",
        "estudio de factibilidad de transporte",
        "estudio de puentes carga especial",
        "verificación de puentes transporte especial",
        "ingeniería de izaje",
        "plan de izaje",
        "plan de rigging",
        "estabilidad y fijación de carga",
        "simulación de maniobras transporte especial",
        "permisos carga sobredimensionada ingeniero"
      ]
    }
  },

  roleTitles: [
    "Transport Engineer",
    "Heavy Transport Engineer",
    "Heavy Haul Engineer",
    "Project Engineer",
    "Structural Engineer",
    "Superload Engineer",
    "Rigging Engineer",
    "Lift Engineer",
    "Transportation Engineer",
    "Engenheiro de Transportes",
    "Engenheiro de Movimentação de Cargas",
    "Engenheiro Rigger",
    "Ingeniero de Transporte",
    "Ingeniero de Transportes Especiales",
    "Ingeniero Estructural",
    "Ingeniero de Izaje"
  ],

  evidenceRules: {
    person: [
      "public company team page",
      "professional association committee/board page",
      "public conference speaker page",
      "public professional profile with employer and engineering role"
    ],
    company: [
      "company service page explicitly describing route/bridge/heavy transport/rigging engineering",
      "industry association membership",
      "public project case showing technical engineering scope"
    ],
    credential: [
      "official professional-engineering register or licensing body",
      "public professional credential listed by authoritative body"
    ]
  }
};
