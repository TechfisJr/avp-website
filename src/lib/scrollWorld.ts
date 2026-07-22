import type { SectionCopy } from "./copy";

export type MediaSource = {
  mp4?: string;
  webm?: string;
};

export type ScrollWorldScene = SectionCopy & {
  scene: string;
  sceneLabel: string;
  accent: string;
  flow: string[];
  visualFocus: string;
  chapterIntro?: boolean;
  valueInterlude?: boolean;
  poster: string;
  mobilePoster?: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  emphasis?: boolean;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export type ScrollWorldConnector = {
  id: string;
  from: string;
  to: string;
  poster: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export type ScrollWorldEnvironment = {
  id: string;
  label: string;
  sceneLabel: string;
  firstStage: string;
  poster: string;
  mobilePoster?: string;
  video?: MediaSource;
  mobileVideo?: MediaSource;
  scrollWeight: number;
  accent: string;
  assetStatus:
    | "available"
    | "needs-improvement"
    | "missing"
    | "optional";
};

export const SCROLL_WORLD_SCENES: ScrollWorldScene[] = [
  {
    id: "sustainable-forest",
    scene: "forest-origin",
    sceneLabel: "Scene 01",
    eyebrow: "01 Sustainable Forest",
    headline: ["It begins", "with nature"],
    body: "Renewable energy begins with responsibly sourced biomass.",
    data: "Nature provides the resource. Technology creates the value.",
    tags: ["Responsible Origin", "Plantation Wood"],
    align: "left",
    accent: "#8bb56a",
    flow: ["Forest", "Renewable Biomass", "Energy Resource"],
    visualFocus: "Living forest evolves toward renewable biomass origin.",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.05,
    assetStatus: "needs-improvement",
  },
  {
    id: "raw-wood",
    scene: "forest-origin",
    sceneLabel: "Scene 01",
    eyebrow: "02 Raw Wood",
    headline: ["The raw", "material"],
    body: "Selected wood resources enter the production journey.",
    data: "Sustainable forest -> raw wood",
    tags: ["Acacia", "Wood Resources"],
    align: "right",
    accent: "#c98a42",
    flow: ["Sustainable Forest", "Raw Wood"],
    visualFocus: "Harvested and transported logs move toward processing.",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 0.95,
    assetStatus: "available",
  },
  {
    id: "wood-chips",
    scene: "wood-processing",
    sceneLabel: "Scene 02",
    eyebrow: "03 Wood Chips",
    headline: ["Reducing size.", "Preparing the material."],
    body: "Wood is reduced into consistent chips, preparing the material for further processing.",
    data: "Raw wood -> chipping -> wood chips",
    tags: ["Industrial Chipping", "Uniform Feedstock"],
    align: "left",
    accent: "#e0a85c",
    flow: ["Raw Wood", "Chipping", "Wood Chips"],
    visualFocus: "Logs enter chipping machinery and become visible chip material.",
    poster: "/backgrounds/03-production/factory-interior-01.webp",
    scrollWeight: 1,
    assetStatus: "available",
  },
  {
    id: "wood-particles",
    scene: "wood-processing",
    sceneLabel: "Scene 02",
    eyebrow: "04 Wood Particles",
    headline: ["Refined", "for consistency."],
    body: "The biomass is further refined into smaller and more uniform particles.",
    data: "Wood chips -> grinding -> particles",
    tags: ["Hammer Mill", "Consistent Particle Size"],
    align: "right",
    accent: "#dfb273",
    flow: ["Wood Chips", "Grinding", "Wood Particles"],
    visualFocus: "Chips move through refining and become smaller particles.",
    poster: "/backgrounds/03-production/factory-interior-02.webp",
    scrollWeight: 1,
    assetStatus: "available",
  },
  {
    id: "dry-biomass",
    scene: "dry-biomass",
    sceneLabel: "Scene 03",
    eyebrow: "05 Dry Biomass",
    headline: ["Moisture", "under control"],
    body: "Controlled drying prepares the biomass for efficient densification.",
    data: "Precision begins before pelletization.",
    tags: ["Rotary Dryer", "Controlled Moisture"],
    align: "left",
    accent: "#d98f47",
    flow: ["Wet Biomass", "Drying", "Dry Biomass"],
    visualFocus: "Biomass moves through dryer, cyclone and controlled heat atmosphere.",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    scrollWeight: 1.05,
    assetStatus: "available",
  },
  {
    id: "pelletization",
    scene: "pelletization",
    sceneLabel: "Scene 04",
    eyebrow: "06 Pelletization",
    headline: ["Pressure", "creates form"],
    body: "Under controlled pressure, prepared biomass is transformed into a compact and consistent solid fuel.",
    data: "Compression -> densification -> pellet",
    tags: ["Pellet Mill", "Cooling & Screening"],
    align: "right",
    accent: "#e85d26",
    flow: ["Dry Biomass", "Compression", "Densification", "Pellet"],
    visualFocus: "Dry biomass moves closer to press, compression and pellet output.",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    scrollWeight: 1.15,
    assetStatus: "available",
  },
  {
    id: "white-wood-pellet",
    scene: "white-wood-pellet",
    sceneLabel: "Scene 05",
    eyebrow: "07 Wood Pellet",
    headline: ["Renewable energy.", "Densified."],
    body: "Natural biomass transformed into a compact, consistent and transportable renewable fuel.",
    data: "The result of the first transformation",
    tags: ["White Wood Pellet", "Transportable Fuel"],
    align: "left",
    accent: "#f0c982",
    flow: ["Wood Particles", "Pelletization", "Wood Pellet"],
    visualFocus: "Finished white wood pellet becomes the first major product climax.",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    scrollWeight: 1.35,
    chapterIntro: true,
    assetStatus: "needs-improvement",
  },
  {
    id: "thermal-upgrading",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "08 Thermal Upgrading",
    headline: ["Advanced thermal", "upgrading"],
    body: "Upgrading what biomass can become. Conventional wood pellets enter a carefully controlled thermal environment.",
    data: "Value is no longer created by form alone.",
    tags: ["Controlled Heat", "Sealed Treatment"],
    align: "right",
    accent: "#f26a2e",
    flow: ["Wood Pellet", "Controlled Heat", "Controlled Environment", "Thermal Transformation"],
    visualFocus: "White pellets enter controlled thermal processing equipment.",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    scrollWeight: 1.35,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "torrefaction",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "09 Torrefaction",
    headline: ["Torrefaction"],
    body: "The technology behind the transformation. The color changes because the material changes.",
    data: "This is not simply a change in color. It is a change in the material.",
    tags: ["Torrefaction Reactor", "Material Upgrade"],
    align: "left",
    accent: "#c85b35",
    flow: ["White Wood Pellet", "Thermal Treatment", "Transformed Pellet", "Black Wood Pellet"],
    visualFocus: "Scroll-controlled material darkening through three realistic pellet states.",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    scrollWeight: 1.45,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "black-wood-pellet",
    scene: "value-upgrading",
    sceneLabel: "Scene 06",
    eyebrow: "10 Black Wood Pellet",
    headline: ["Black wood pellet"],
    body: "Biomass. Upgraded. The result of manufacturing plus technology and the second transformation.",
    data: "A new layer of value creation.",
    tags: ["Black Wood Pellet", "Higher-Value Energy"],
    align: "right",
    accent: "#d8a15a",
    flow: ["Wood", "Pelletization", "Wood Pellet", "Thermal Upgrading", "Torrefaction", "Black Wood Pellet"],
    visualFocus: "Black Wood Pellet becomes the second major product reveal.",
    valueInterlude: true,
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.35,
    emphasis: true,
    assetStatus: "missing",
  },
  {
    id: "advanced-bioenergy",
    scene: "advanced-bioenergy",
    sceneLabel: "Scene 07",
    eyebrow: "11 Advanced Bioenergy",
    headline: ["From natural resources", "to advanced bioenergy"],
    body: "Built from responsible resources. Shaped by technology. Created for higher-value advanced bioenergy.",
    data: "From wood. To pellet. To higher value.",
    tags: ["Industrial Scale", "Global Energy Value"],
    align: "center",
    accent: "#86b869",
    flow: ["Black Wood Pellet", "AVP Industrial Scale", "Logistics", "Global Energy Value"],
    visualFocus: "Black pellet connects to AVP scale, logistics and renewable energy value.",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    scrollWeight: 1.2,
    assetStatus: "missing",
  },
];

export const SCROLL_WORLD_CONNECTORS: ScrollWorldConnector[] = [
  {
    id: "forest-origin-to-wood-processing",
    from: "forest-origin",
    to: "wood-processing",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-01-02.mp4",
      webm: "/scroll-world/videos/desktop/connector-01-02.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-01-02.mp4",
      webm: "/scroll-world/videos/mobile/connector-01-02.webm",
    },
    scrollWeight: 0.45,
    assetStatus: "missing",
  },
  {
    id: "wood-processing-to-dry-biomass",
    from: "wood-processing",
    to: "dry-biomass",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-02-03.mp4",
      webm: "/scroll-world/videos/desktop/connector-02-03.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-02-03.mp4",
      webm: "/scroll-world/videos/mobile/connector-02-03.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "dry-biomass-to-pelletization",
    from: "dry-biomass",
    to: "pelletization",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-03-04.mp4",
      webm: "/scroll-world/videos/desktop/connector-03-04.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-03-04.mp4",
      webm: "/scroll-world/videos/mobile/connector-03-04.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "pelletization-to-white-wood-pellet",
    from: "pelletization",
    to: "white-wood-pellet",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-04-05.mp4",
      webm: "/scroll-world/videos/desktop/connector-04-05.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-04-05.mp4",
      webm: "/scroll-world/videos/mobile/connector-04-05.webm",
    },
    scrollWeight: 0.38,
    assetStatus: "missing",
  },
  {
    id: "white-wood-pellet-to-value-upgrading",
    from: "white-wood-pellet",
    to: "value-upgrading",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-05-06.mp4",
      webm: "/scroll-world/videos/desktop/connector-05-06.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-05-06.mp4",
      webm: "/scroll-world/videos/mobile/connector-05-06.webm",
    },
    scrollWeight: 0.5,
    assetStatus: "missing",
  },
  {
    id: "value-upgrading-to-advanced-bioenergy",
    from: "value-upgrading",
    to: "advanced-bioenergy",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/connector-06-07.mp4",
      webm: "/scroll-world/videos/desktop/connector-06-07.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/connector-06-07.mp4",
      webm: "/scroll-world/videos/mobile/connector-06-07.webm",
    },
    scrollWeight: 0.5,
    assetStatus: "missing",
  },
];

export const SCROLL_WORLD_ENVIRONMENTS: ScrollWorldEnvironment[] = [
  {
    id: "forest-origin",
    label: "Forest Origin",
    sceneLabel: "Scene 01",
    firstStage: "sustainable-forest",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/01-forest-origin.mp4",
      webm: "/scroll-world/videos/desktop/01-forest-origin.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/01-forest-origin.mp4",
      webm: "/scroll-world/videos/mobile/01-forest-origin.webm",
    },
    scrollWeight: 2,
    accent: "#8bb56a",
    assetStatus: "needs-improvement",
  },
  {
    id: "wood-processing",
    label: "Wood Processing",
    sceneLabel: "Scene 02",
    firstStage: "wood-chips",
    poster: "/backgrounds/03-production/factory-interior-01.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/02-wood-processing.mp4",
      webm: "/scroll-world/videos/desktop/02-wood-processing.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/02-wood-processing.mp4",
      webm: "/scroll-world/videos/mobile/02-wood-processing.webm",
    },
    scrollWeight: 2,
    accent: "#e0a85c",
    assetStatus: "needs-improvement",
  },
  {
    id: "dry-biomass",
    label: "Dry Biomass",
    sceneLabel: "Scene 03",
    firstStage: "dry-biomass",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/03-dry-biomass.mp4",
      webm: "/scroll-world/videos/desktop/03-dry-biomass.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/03-dry-biomass.mp4",
      webm: "/scroll-world/videos/mobile/03-dry-biomass.webm",
    },
    scrollWeight: 1.2,
    accent: "#d98f47",
    assetStatus: "needs-improvement",
  },
  {
    id: "pelletization",
    label: "Pelletization",
    sceneLabel: "Scene 04",
    firstStage: "pelletization",
    poster: "/backgrounds/03-production/factory-interior-03.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/04-pelletization.mp4",
      webm: "/scroll-world/videos/desktop/04-pelletization.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/04-pelletization.mp4",
      webm: "/scroll-world/videos/mobile/04-pelletization.webm",
    },
    scrollWeight: 1.25,
    accent: "#e85d26",
    assetStatus: "needs-improvement",
  },
  {
    id: "white-wood-pellet",
    label: "White Pellet",
    sceneLabel: "Scene 05",
    firstStage: "white-wood-pellet",
    poster: "/backgrounds/03-production/factory-interior-05.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/05-white-wood-pellet.mp4",
      webm: "/scroll-world/videos/desktop/05-white-wood-pellet.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/05-white-wood-pellet.mp4",
      webm: "/scroll-world/videos/mobile/05-white-wood-pellet.webm",
    },
    scrollWeight: 1.1,
    accent: "#f0c982",
    assetStatus: "missing",
  },
  {
    id: "value-upgrading",
    label: "Value Upgrading",
    sceneLabel: "Scene 06",
    firstStage: "thermal-upgrading",
    poster: "/backgrounds/03-production/factory-interior-04.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/06-value-upgrading.mp4",
      webm: "/scroll-world/videos/desktop/06-value-upgrading.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/06-value-upgrading.mp4",
      webm: "/scroll-world/videos/mobile/06-value-upgrading.webm",
    },
    scrollWeight: 4.15,
    accent: "#f26a2e",
    assetStatus: "missing",
  },
  {
    id: "advanced-bioenergy",
    label: "Bioenergy",
    sceneLabel: "Scene 07",
    firstStage: "advanced-bioenergy",
    poster: "/backgrounds/02-factory-entry/factory-aerial.webp",
    video: {
      mp4: "/scroll-world/videos/desktop/07-advanced-bioenergy.mp4",
      webm: "/scroll-world/videos/desktop/07-advanced-bioenergy.webm",
    },
    mobileVideo: {
      mp4: "/scroll-world/videos/mobile/07-advanced-bioenergy.mp4",
      webm: "/scroll-world/videos/mobile/07-advanced-bioenergy.webm",
    },
    scrollWeight: 1.35,
    accent: "#86b869",
    assetStatus: "missing",
  },
];
